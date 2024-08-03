'use client'
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, query, onSnapshot, deleteDoc, doc, where } from "firebase/firestore"; 
import { db } from './firebase';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';

export default function Home() {

  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', type: '' });
  const [searchItem, setSearchItem] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const columns = [
    { id: 'name', label: 'Item Name', minWidth: 100 },
    { id: 'quantity', label: 'Quantity', minWidth: 100 },
    { id: 'type', label: 'Type', minWidth: 100 },
    { id: 'dateAdded', label: 'Date Added', minWidth: 150 },
  ];

  // Add items to database
  const addItem = async (e) => {
    e.preventDefault();

    if (newItem.name !== '' && newItem.quantity !== '' && newItem.type !== '') {
        const itemsCollection = collection(db, 'items');
        const q = query(itemsCollection, where('name', '==', newItem.name.trim()));

        const querySnapshot = await getDocs(q);

        const currentDate = new Date();

        if (!querySnapshot.empty) {
            // Item already exists, update the quantity
            querySnapshot.forEach(async (itemDoc) => {
                const updatedQuantity = parseInt(itemDoc.data().quantity) + parseInt(newItem.quantity);
                await updateDoc(doc(db, 'items', itemDoc.id), {
                    quantity: updatedQuantity.toString(),
                    dateAdded: currentDate.toISOString(),
                });
            });
        } else {
            // Item doesn't exist, add it as a new item
            await addDoc(itemsCollection, {
                name: newItem.name.trim(),
                quantity: newItem.quantity,
                type: newItem.type,
                dateAdded: currentDate.toISOString(),
            });
        }

        setNewItem({ name: '', quantity: '', type: '' });
    }
  };

  // Delete quantity or item
  const deleteQuantity = async (e) => {
    e.preventDefault();

    if (newItem.name !== '' && newItem.quantity !== '') {
        const itemsCollection = collection(db, 'items');
        const q = query(itemsCollection, where('name', '==', newItem.name.trim()));

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            querySnapshot.forEach(async (itemDoc) => {
                const currentQuantity = parseInt(itemDoc.data().quantity);
                const quantityToRemove = parseInt(newItem.quantity);
                const updatedQuantity = currentQuantity - quantityToRemove;

                if (updatedQuantity > 0) {
                    // Update the quantity
                    await updateDoc(doc(db, 'items', itemDoc.id), {
                        quantity: updatedQuantity.toString(),
                    });
                } else {
                    // Delete the item if the resulting quantity is 0 or less
                    await deleteDoc(doc(db, 'items', itemDoc.id));
                }
            });
        }

        setNewItem({ name: '', quantity: '', type: '' });
    }
  };

  // Read items from database
  useEffect(() => {
    const q = query(collection(db, 'items'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let itemsArr = [];

      querySnapshot.forEach((doc) => {
        itemsArr.push({ ...doc.data(), id: doc.id });
      });
      setItems(itemsArr);

      return () => unsubscribe();
    });
  }, []);

  // Handle search functionality
  const handleSearch = async (e) => {
    e.preventDefault();
    const itemsCollection = collection(db, 'items');
    const q = query(itemsCollection, where('name', '>=', searchItem.trim()), where('name', '<=', searchItem.trim() + '\uf8ff'));
    const querySnapshot = await getDocs(q);
    let searchResults = [];
    querySnapshot.forEach((doc) => {
      searchResults.push({ ...doc.data(), id: doc.id });
    });
    setItems(searchResults);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <main className="w-full flex min-h-screen flex-col items-center justify-between sm:p-24 p-24">
      <div className="z-10 max-w-7xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl text-center p-4 ">Pantry Tracker</h1>

        <div className="bg-slate-800 p-4 rounded-lg w-full">
          <form className="grid grid-cols-12 items-center text-black">
            <input 
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className='col-span-3 p-3 border rounded-lg' type="text" placeholder="Enter Item"/>
            <input 
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              className='col-span-2 p-3 border mx-3 rounded-lg' type="number" placeholder="Enter Quantity"/>
            <input 
              value={newItem.type}
              onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
              className='col-span-3 p-3 border rounded-lg' type="text" placeholder="Enter Type"/>
            <button 
              onClick={addItem}
              className="text-white col-span-2 mx-3 my-3 border-slate-900 border-2 hover:bg-slate-700 p-2 text-xl rounded-lg" type="submit">Add</button>
            <button 
              onClick={deleteQuantity}
              className="text-white col-span-2 border-slate-900 border-2 hover:bg-slate-700 p-2 text-xl rounded-lg" type="submit">Delete</button>
          </form>

          <form onSubmit={handleSearch} className="mt-4 p-4 grid grid-cols-12 items-center text-black">
            <input 
              value={searchItem}
              onChange={(e) => setSearchItem(e.target.value)}
              className='col-span-9 mx-3 p-3 border rounded-lg' type="text" placeholder="Search"/>
            <button 
              className="text-white col-span-3 border-slate-900 border-2 hover:bg-slate-700 p-2 text-xl rounded-lg" type="submit">Search</button>
          </form>

          <Paper  sx={{ width: '100%', overflow: 'hidden', textAlign: 'center' }}>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align="center"
                        style={{ minWidth: column.minWidth }}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    return (
                      <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                        {columns.map((column) => {
                          const value = row[column.id];
                          return (
                            <TableCell key={column.id} align="center">
                              {column.id === 'dateAdded' ? new Date(value).toLocaleString() : value}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              component="div"
              count={items.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </div>
      </div>

      <footer>
        <p className='text-xl'>Made by <a className='text-blue-600 ' href='https://www.tanmaydabhade.com'>Tanmay Dabhade</a></p>
      </footer>
    </main>
  );
}

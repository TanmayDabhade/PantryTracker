'use client'
import React, {useState, useEffect} from 'react';
import { collection, addDoc, getDocs, getDoc, updateDoc, querySnapshot, query, onSnapshot, deleteDoc, doc, where } from "firebase/firestore"; 
import { db } from './firebase';

export default function Home() {

  const [items, setItems] = useState([])
  
  const [newItem, setNewItem] = useState({name: '', quantity: '', type: ''})


  const [searchItem, setSearchItem] = useState('')

  // Add items to database
  const addItem = async (e) => {
    e.preventDefault();

    if (newItem.name !== '' && newItem.quantity !== '' && newItem.type !== '') {
        const itemsCollection = collection(db, 'items');
        const q = query(itemsCollection, where('name', '==', newItem.name.trim()));

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // Item already exists, update the quantity
            querySnapshot.forEach(async (itemDoc) => {
                const updatedQuantity = parseInt(itemDoc.data().quantity) + parseInt(newItem.quantity);
                await updateDoc(doc(db, 'items', itemDoc.id), {
                    quantity: updatedQuantity.toString()
                });
            });
        } else {
            // Item doesn't exist, add it as a new item
            await addDoc(itemsCollection, {
                name: newItem.name.trim(),
                quantity: newItem.quantity,
                type: newItem.type
            });
        }

        setNewItem({ name: '', quantity: '', type: '' });
    }
};

  // Add DeleteQuantity with icon
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
                        quantity: updatedQuantity.toString()
                    });
                } else {
                    // Delete the item if the resulting quantity is 0 or less
                    await deleteDoc(doc(db, 'items', itemDoc.id));
                }
            });
        }

        setNewItem({ name: '', quantity: '', type: ''});
    }
};

  

  // Read items from database
  useEffect(()=>{
    const q = query(collection(db, 'items'))
    const unsubscribe = onSnapshot(q, (querySnapshot)=>{
      let itemsArr = [];

      querySnapshot.forEach((doc)=>{
        itemsArr.push({ ...doc.data(), id: doc.id});
      });
      setItems(itemsArr);

      // read total from itemsArray
      // const calculateTotal = () => {
      //   const totalquantity = itemsArr.reduce((sum, item)=> sum + parseFloat(item.quantity), 0);
      //   setTotal(totalquantity);
      // };

      calculateTotal();
      return () => unsubscribe();
    });
  }, [])

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


  return (
    <main className="w-full flex min-h-screen flex-col items-center justify-between sm:p-24 p-24">
      <div className="z-10 max-w-7xl items-center justify-between font-mono  text-sm">
        <h1 className="text-4xl text-center p-4 ">Pantry Tracker</h1>

        <div className="bg-slate-800 p-4 rounded-lg w-full">
          <form className=" grid grid-cols-12 items-center text-black">
            <input 
            value={newItem.name}
            onChange={(e) => setNewItem({...newItem, name: e.target.value})}
            className='col-span-3 p-3 border' type="text" placeholder="Enter Item"/>
            <input 
            value={newItem.quantity}
            onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
            className='col-span-2 p-3 border mx-3' type="number" placeholder="Enter Quantity"/>
            <input 
            value={newItem.type}
            onChange={(e) => setNewItem({...newItem, type: e.target.value})}
            className='col-span-3 p-3 border' type="text" placeholder="Enter Type"/>
            
            <button 
            onClick={addItem}
            className="text-white col-span-2 mx-3 my-3 border-slate-900 border-2 hover:bg-slate-700 p-3 text-xl" type="submit">Add</button>
            <button 
            onClick={deleteQuantity}
            className="text-white col-span-2 border-slate-900 border-2 hover:bg-slate-700 p-3 text-xl" type="submit">Delete</button>
  
          </form>

          <form onSubmit={handleSearch} className="mt-4 grid grid-cols-12 items-center text-black">
            <input 
              value={searchItem}
              onChange={(e) => setSearchItem(e.target.value)}
              className='col-span-9 p-3 border' type="text" placeholder="Search"/>
            <button 
              className="text-white col-span-3 border-slate-900 border-2 hover:bg-slate-700 p-3 text-xl" type="submit">Search</button>
          </form>
          <ul>

          <div className='grid grid-cols-3 p-4 w-full text-center justify-between bg-slate-900 text-white'>
            <span className='capitalize col-span-1'>Item Name</span>
              <span className='text-center col-span-1'>Quantity</span>
              <span className='capitalize col-span-1'>Type</span>
            </div>
            {items.map((item, id) => (
              <>
              
              <li key = {id} className='text-white my-4 w-full flex justify-between bg-slate-950'>
                
                <div className='grid grid-cols-3 p-4 w-full justify-between text-center'>
                  <span className='capitalize col-span-1'>{item.name}</span>
                  <span className='text-center col-span-1'>{item.quantity}</span>
                  <span className='capitalize col-span-1'>{item.type}</span>
                </div>
                {/* <button onClick={()=>deleteItem(item.id)} className='ml-8 p-4 border-l-2 border-slate-900 hover:bg-slate-900 w-16'>X</button> */}
              </li>
              </>
              
            ))}
          </ul>
          
        </div>
        
      </div>

      <footer>
        <p className='text-xl'>Made by <a className='text-blue-600 ' href = 'https://www.tanmaydabhade.com'>Tanmay Dabhade</a></p>
      </footer>
    </main>
  )
}

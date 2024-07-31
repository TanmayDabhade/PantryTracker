'use client'
import React, {useState, useEffect} from 'react';
import { collection, addDoc, getDocs, getDoc, updateDoc, querySnapshot, query, onSnapshot, deleteDoc, doc, where } from "firebase/firestore"; 
import { db } from './firebase';

export default function Home() {

  const [items, setItems] = useState([
    
  ])
  
  const [newItem, setNewItem] = useState({name: '', quantity: ''})

  const [total, setTotal] = useState(0)

  // Add items to database
  const addItem = async (e) => {
    e.preventDefault()
    
    if(newItem.name !== '' && newItem.quantity !== ''){
      // setItems([...items, newItem])
      await addDoc(collection(db, 'items'), {
        name: newItem.name.trim(),
        quantity: newItem.quantity,
      })
      setNewItem({name: '', quantity: ''})
    }
  }

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

        setNewItem({ name: '', quantity: '' });
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
      const calculateTotal = () => {
        const totalquantity = itemsArr.reduce((sum, item)=> sum + parseFloat(item.quantity), 0);
        setTotal(totalquantity);
      };

      calculateTotal();
      return () => unsubscribe();
    });
  }, [])

  // Delete items from database
  const deleteItem = async (id) => {
    await deleteDoc(doc(db, 'items', id));
  };


  return (
    <main className="flex min-h-screen flex-col items-center justify-between sm:p-24 p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono  text-sm">
        <h1 className="text-4xl text-center p-4 ">Pantry Tracker</h1>

        <div className="bg-slate-800 p-4 rounded-lg">
          <form className=" grid grid-cols-6 items-center text-black">
            <input 
            value={newItem.name}
            onChange={(e) => setNewItem({...newItem, name: e.target.value})}
            className='col-span-2 p-3 border' type="text" placeholder="Enter Item"/>
            <input 
            value={newItem.quantity}
            onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
            className='col-span-2 p-3 border mx-3' type="number" placeholder="Enter Quantity"/>
            
            <button 
            onClick={addItem}
            className="text-white border-slate-900 border-2 hover:bg-slate-700 p-3 text-xl" type="submit">Add</button>
            <button 
            onClick={deleteQuantity}
            className="text-white border-slate-900 border-2 hover:bg-slate-700 p-3 text-xl" type="submit">Update</button>
  
          </form>
          <ul>
            {items.map((item, id) => (
              <li key = {id} className='text-white my-4 w-full flex justify-between bg-slate-950'>
                <div className='flex p-4 w-full justify-between'>
                  <span className='capitalize'>{item.name}</span>
                  <span>{item.quantity}</span>
                </div>
                <button onClick={()=>deleteItem(item.id)} className='ml-8 p-4 border-l-2 border-slate-900 hover:bg-slate-900 w-16'>X</button>
              </li>
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

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "firebase/firestore"

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBzinIDiTD7mkz7MuXV_j9ale-uoXxQgn0",
  authDomain: "pantry-tracker-8bfc7.firebaseapp.com",
  projectId: "pantry-tracker-8bfc7",
  storageBucket: "pantry-tracker-8bfc7.appspot.com",
  messagingSenderId: "972075286803",
  appId: "1:972075286803:web:87bc9359be3a1000e01ae6",
  measurementId: "G-NTXZ07R1CM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


export const db = getFirestore(app);

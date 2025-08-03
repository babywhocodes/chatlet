
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDEZZiiWuYBmXupQOH49779SCsOT5PgFMc",
  authDomain: "chatlet-1.firebaseapp.com",
  projectId: "chatlet-1",
  storageBucket: "chatlet-1.firebasestorage.app",
  messagingSenderId: "887550999279",
  appId: "1:887550999279:web:3c1e078717e58ddf19391a",
  measurementId: "G-2MSXV0FPMS"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, doc, getDoc };

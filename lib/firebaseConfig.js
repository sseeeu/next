// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Add this line

const firebaseConfig = {
  apiKey: "AIzaSyDR5uxsH0QE2k0Etri3oaiNag2IT4MlRQ8",
  authDomain: "wordpress-e4aaf.firebaseapp.com",
  projectId: "wordpress-e4aaf",
  storageBucket: "wordpress-e4aaf.appspot.com",
  messagingSenderId: "1085678791434",
  appId: "1:1085678791434:web:61e8d1a3c937ea9d45e8f3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
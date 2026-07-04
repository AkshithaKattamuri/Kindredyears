// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAdULFwx1h8vn5yWz_sEaoAdHYTBD1WYNs",
  authDomain: "kindred-years-78a9c.firebaseapp.com",
  projectId: "kindred-years-78a9c",
  storageBucket: "kindred-years-78a9c.firebasestorage.app",
  messagingSenderId: "711880803321",
  appId: "1:711880803321:web:7df63e58ec8f6572943328",
  measurementId: "G-31NRL683GJ"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD7o-oEAuPD09raHoixQ4r3r5jMNPJUNOQ",
  authDomain: "ai-interview-283b9.firebaseapp.com",
  projectId: "ai-interview-283b9",
  storageBucket: "ai-interview-283b9.firebasestorage.app",
  messagingSenderId: "475208450518",
  appId: "1:475208450518:web:6e52c9116605c5bec6a477",
  measurementId: "G-LQ2JLBYLTD"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);

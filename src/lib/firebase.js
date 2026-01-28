import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics"; 

const firebaseConfig = {
    apiKey: "AIzaSyAjORywWhkMxKKyqujEd5f0FwqZ1vzf0Uo",
    authDomain: "aishas-shop.firebaseapp.com",
    projectId: "aishas-shop",
    storageBucket: "aishas-shop.firebasestorage.app",
    messagingSenderId: "173170237758",
    appId: "1:173170237758:web:253cc977e277f0925e4c6f",
    measurementId: "G-DNSQJB045P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

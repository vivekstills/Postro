// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDXdZwTlrHVJFtSfuxLUoO6n7qprJna13w",
    authDomain: "postro-b3503.firebaseapp.com",
    projectId: "postro-b3503",
    storageBucket: "postro-b3503.firebasestorage.app",
    messagingSenderId: "249555334306",
    appId: "1:249555334306:web:c279c563697845b66e93fb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;

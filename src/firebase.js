import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import Firestore

const firebaseConfig = {
  apiKey: "AIzaSyBlge266DrOrY1celFXNvGnmW0suWbiCHI",
  authDomain: "online-vote-system.firebaseapp.com",
  projectId: "online-vote-system",
  storageBucket: "online-vote-system.appspot.com",
  messagingSenderId: "1026517689493",
  appId: "1:1026517689493:web:22858100d3527f0f4ca79c",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app); // Initialize Firestore

export { auth, provider, signInWithPopup, signInWithEmailAndPassword, onAuthStateChanged, db };

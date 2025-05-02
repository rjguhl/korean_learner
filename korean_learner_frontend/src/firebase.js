import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBkpUrAjBnz35kMwUULGXkHAlMHtEg-IqY",
  authDomain: "korean-learner.firebaseapp.com",
  projectId: "korean-learner",
  storageBucket: "korean-learner.appspot.com",
  messagingSenderId: "395445195923",
  appId: "1:395445195923:web:4523b74dd7fc83bd23a966",
  measurementId: "G-7MFVYHBRYF"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
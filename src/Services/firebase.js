// firebase.js (initialize Firebase here)
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAPhRvEyZmAiAnXBig85WXhNjhLb6wYjt0",
    authDomain: "task-dashboard-44f60.firebaseapp.com",
    projectId: "task-dashboard-44f60",
    storageBucket: "task-dashboard-44f60.appspot.com",
    messagingSenderId: "1074575638282",
    appId: "1:1074575638282:web:0086c3af1b936559fbc4f3",
    measurementId: "G-1MW3J9EJK4"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };
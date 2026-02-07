import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { getFirestore } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyD3uazQqMH25YqRFV0BKfln0S3qLXgHJEY",
    authDomain: "perricos-739ed.firebaseapp.com",
    projectId: "perricos-739ed",
    storageBucket: "perricos-739ed.firebasestorage.app",
    messagingSenderId: "1019662114782",
    appId: "1:1019662114782:web:d8fba6830dba71b6db874f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log("Firebase inicializado");
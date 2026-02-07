import { db } from "./firebase_init.js";
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  deleteDoc,
  collection,
  query,
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
  limit,
  writeBatch
} from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js';

async function addUser(user)
{
    console.log("db is:", db);
    console.log("Lo intentaré supongo");
    try
    {
        await setDoc(doc(db, "Usuarios", user.uid),
        {
            Email: user.email,
        },{ merge: true });
        window.location.href = '../html/main.html';
        console.log('✅ Perfil de usuario creado');
    }
    catch (error)
    {
        console.error('❌ Error creando perfil:', error);
        throw error;
    }
}

export { addUser }
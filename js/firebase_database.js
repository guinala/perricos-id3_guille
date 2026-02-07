// import { db } from "./firebase_init.js";
// import { 
//   doc, 
//   setDoc, 
//   getDoc, 
//   updateDoc,
//   deleteDoc,
//   collection,
//   query,
//   getDocs,
//   addDoc,
//   serverTimestamp,
//   orderBy,
//   limit,
//   writeBatch
// } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js';

// async function addUser(user)
// {
//     console.log("db is:", db);
//     console.log("Lo intentaré supongo");
//     try
//     {
//         await setDoc(doc(db, "Usuarios", user.uid),
//         {
//             Email: user.email,
//         },{ merge: true });
//         console.log('✅ Perfil de usuario creado');
//     }
//     catch (error)
//     {
//         console.error('❌ Error creando perfil:', error);
//         throw error;
//     }
// }

// export { addUser }

import { db } from "./firebase_init.js";
import { 
  doc, setDoc, getDoc, updateDoc, collection, 
  query, getDocs, where, deleteDoc, writeBatch 
} from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js';

// --- USUARIOS ---
export async function getUserData(uid) {
    const docRef = doc(db, "Usuarios", uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
}

export async function updateUserStats(uid, stats) {
    await updateDoc(doc(db, "Usuarios", uid), {
        stats: stats,
        lastActive: new Date()
    });
}

// --- PERROS (Colección por usuario) ---
export async function savePerrico(uid, dog) {
    // Usamos el ID del perro como nombre del documento para evitar duplicados
    const dogId = dog.id || dog.img.split('/').pop(); 
    await setDoc(doc(db, "Usuarios", uid, "Perros", dogId), dog);
}

export async function getPerricos(uid) {
    const q = query(collection(db, "Usuarios", uid, "Perros"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
}

// --- LOGROS ---
export async function updateAchievement(uid, achievementId, data) {
    await setDoc(doc(db, "Usuarios", uid, "Logros", achievementId), data, { merge: true });
}

export async function getAchievements(uid) {
    const q = query(collection(db, "Usuarios", uid, "Logros"));
    const querySnapshot = await getDocs(q);
    const logros = {};
    querySnapshot.forEach(doc => { logros[doc.id] = doc.data(); });
    return logros;
}
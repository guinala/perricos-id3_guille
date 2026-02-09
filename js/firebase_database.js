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
  writeBatch,
  where,
  increment
} from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js';

async function addUser(user) 
{
  console.log("Creando usuario en Firestore...");
  try 
  {
    await setDoc(doc(db, "Usuarios", user.uid), {
      email: user.email,
      createdAt: serverTimestamp(),
      totalFavorites: 0,
      totalLikes: 0,
      totalDislikes: 0,
      totalDogs: 0,
      history: [], 
      achievementsProgress: {} 
    }, { merge: true });
    
    console.log('✅ Perfil de usuario creado');
    return true;
  } 
  catch (error) 
  {
    console.error('❌ Error creando perfil:', error);
    throw error;
  }
}

async function getUserData(userId) 
{
  try 
  {
    const userDoc = await getDoc(doc(db, "Usuarios", userId));
    if (userDoc.exists()) 
    {
      return userDoc.data();
    }
    return null;
  } 
  catch (error) 
  {
    console.error('Error obteniendo datos de usuario:', error);
    throw error;
  }
}

async function updateUserStats(userId, stats) 
{
  try 
  {
    const userRef = doc(db, "Usuarios", userId);
    await updateDoc(userRef, stats);
    console.log('Estadísticas actualizadas');
  } 
  catch (error) 
  {
    console.error('Error actualizando estadísticas:', error);
    throw error;
  }
}

async function addToUserHistory(userId, historyEntry) 
{
  try 
  {
    const userRef = doc(db, "Usuarios", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) 
    {
      let history = userDoc.data().history || [];
      
      history.unshift(historyEntry);
      
      if (history.length > 100) 
      {
        history = history.slice(0, 100);
      }
      
      await updateDoc(userRef, { history });
      console.log('Acción añadida al historial');
    }
  } 
  catch (error) 
  {
    console.error('Error añadiendo al historial:', error);
    throw error;
  }
}

async function updateAchievementProgress(userId, achievementId, progressData) 
{
  try 
  {
    const userRef = doc(db, "Usuarios", userId);
    await updateDoc(userRef, {
      [`achievementsProgress.${achievementId}`]: progressData
    });
    console.log('Progreso de logro actualizado');
  } 
  catch (error) 
  {
    console.error('Error actualizando progreso de logro:', error);
    throw error;
  }
}

async function addDog(userId, dogData) 
{
  try 
  {
    const dogRef = await addDoc(collection(db, "Perros"), {
      userId: userId,
      ...dogData,
      createdAt: serverTimestamp()
    });
    
    await updateDoc(doc(db, "Usuarios", userId), {
      totalDogs: increment(1)
    });
    
    console.log('Perro añadido:', dogRef.id);
    return dogRef.id;
  } 
  catch (error) 
  {
    console.error('Error añadiendo perro:', error);
    throw error;
  }
}

async function getUserDogs(userId) 
{
  try 
  {
    const q = query(
      collection(db, "Perros"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const dogs = [];
    
    querySnapshot.forEach((doc) => {
      dogs.push({
        firestoreId: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`${dogs.length} perros cargados`);
    return dogs;
  } 
  catch (error) 
  {
    console.error('Error obteniendo perros:', error);
    throw error;
  }
}

async function updateDog(dogFirestoreId, updates) 
{
  try 
  {
    const dogRef = doc(db, "Perros", dogFirestoreId);
    await updateDoc(dogRef, updates);
    console.log('Perro actualizado');
  } 
  catch (error) 
  {
    console.error('Error actualizando perro:', error);
    throw error;
  }
}

async function deleteDog(userId, dogFirestoreId) 
{
  try 
  {
    await deleteDoc(doc(db, "Perros", dogFirestoreId));
    await updateDoc(doc(db, "Usuarios", userId), {
      totalDogs: increment(-1)
    });
    
    console.log('Perro eliminado');
  } 
  catch (error) 
  {
    console.error('Error eliminando perro:', error);
    throw error;
  }
}

async function deleteAllUserDogs(userId) 
{
  try 
  {
    const q = query(
      collection(db, "Perros"),
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    await updateDoc(doc(db, "Usuarios", userId), {
      totalDogs: 0
    });
    
    console.log('Todos los perros eliminados');
  } 
  catch (error) 
  {
    console.error('Error eliminando perros:', error);
    throw error;
  }
}

async function toggleDogFavorite(userId, dogFirestoreId, isFavorite) 
{
  try 
  {
    await updateDog(dogFirestoreId, { isFavorite });
    await updateDoc(doc(db, "Usuarios", userId), {
      totalFavorites: increment(isFavorite ? 1 : -1)
    });
    
    console.log('Favorito actualizado');
  } 
  catch (error) 
  {
    console.error('Error actualizando favorito:', error);
    throw error;
  }
}

async function toggleDogLike(userId, dogFirestoreId, isLiked, currentLikes) 
{
  try 
  {
    const newLikes = isLiked ? currentLikes + 1 : currentLikes - 1;
    
    await updateDog(dogFirestoreId, { 
      likes: newLikes,
      isLiked: isLiked
    });

    await updateDoc(doc(db, "Usuarios", userId), {
      totalLikes: increment(isLiked ? 1 : -1)
    });
    
    console.log('Like actualizado');
  } 
  catch (error) 
  {
    console.error('Error actualizando like:', error);
    throw error;
  }
}

async function toggleDogDislike(userId, dogFirestoreId, isDisliked, currentDislikes) 
{
  try 
  {
    const newDislikes = isDisliked ? currentDislikes + 1 : currentDislikes - 1;
    
    await updateDog(dogFirestoreId, { 
      dislikes: newDislikes,
      isDisliked: isDisliked
    });
    
    await updateDoc(doc(db, "Usuarios", userId), {
      totalDislikes: increment(isDisliked ? 1 : -1)
    });
    
    console.log('Dislike actualizado');
  } 
  catch (error) 
  {
    console.error('Error actualizando dislike:', error);
    throw error;
  }
}

async function getAllAchievements() 
{
  try 
  {
    const querySnapshot = await getDocs(collection(db, "Logros"));
    const achievements = [];
    
    querySnapshot.forEach((doc) => {
      achievements.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return achievements;
  } 
  catch (error) 
  {
    console.error('Error obteniendo logros:', error);
    throw error;
  }
}

async function checkAndUnlockAchievements(userId) 
{
  try 
  {
    const userData = await getUserData(userId);
    const allAchievements = await getAllAchievements();
    const userDogs = await getUserDogs(userId);
    
    const newUnlocks = [];
    
    const favorites = userDogs.filter(dog => dog.isFavorite);
    const allFavoritesLiked = favorites.length > 0 && favorites.every(dog => dog.isLiked);
    
    for (const achievement of allAchievements) 
    {
      let progress = 0;
      
      switch (achievement.category) 
      {
        case 'likes':
          progress = userData.totalLikes || 0;
          break;
        case 'favorites':
          progress = userData.totalFavorites || 0;
          break;
        case 'dislikes':
          progress = userData.totalDislikes || 0;
          break;
        case 'dogs':
          progress = userData.totalDogs || 0;
          break;
        case 'special':
          if (achievement.id === 'balanced_voter') {
            const likes = userData.totalLikes || 0;
            const dislikes = userData.totalDislikes || 0;
            progress = (likes >= 10 && dislikes >= 10 && likes === dislikes) ? 1 : 0;
          } else if (achievement.id === 'all_favorites_liked') {
            progress = (userData.totalFavorites >= 5 && allFavoritesLiked) ? 1 : 0;
          }
          break;
      }
      
      const isCompleted = progress >= achievement.requirement;
      const currentProgress = userData.achievementsProgress?.[achievement.id];
      
      if (isCompleted && !currentProgress?.unlockedAt) 
      {
        const progressData = {
          progress: progress,
          requirement: achievement.requirement,
          unlockedAt: new Date().toISOString()
        };
        
        await updateAchievementProgress(userId, achievement.id, progressData);
        newUnlocks.push({
          ...achievement,
          ...progressData
        });
      }
    }
    
    return newUnlocks;
  } 
  catch (error) 
  {
    console.error('Error verificando logros:', error);
    throw error;
  }
}

export { 
  addUser,
  getUserData,
  updateUserStats,
  addToUserHistory,
  updateAchievementProgress,
  addDog,
  getUserDogs,
  updateDog,
  deleteDog,
  deleteAllUserDogs,
  toggleDogFavorite,
  toggleDogLike,
  toggleDogDislike,
  getAllAchievements,
  checkAndUnlockAchievements
};

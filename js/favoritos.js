import { auth } from "./firebase_init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { addUser, getUserData, getUserDogs } from './firebase_database.js';
import Swiper from 'swiper';
import { EffectCards } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';

let swiper;
let currentUser = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) 
  {
    window.location.href = '../index.html';
  } 
  else 
  {
    currentUser = user;
    
    const userData = await getUserData(user.uid);
    if (!userData) 
    {
      console.log('Usuario no encontrado en Firestore, creando perfil...');
      try 
      {
        await addUser(user);
        console.log('Perfil de usuario creado');
      } 
      catch (error) 
      {
        console.error('Error creando perfil:', error);
      }
    }
    
    await loadFavorites();
  }
});

async function loadFavorites() 
{
  if (!currentUser) return;
  
  try 
  {
    const userDogs = await getUserDogs(currentUser.uid);
    
    const favorites = userDogs.filter(dog => dog.isFavorite);
    
    const swiperContainer = document.getElementById('swiper-container');
    
    if (favorites.length === 0) {
      swiperContainer.innerHTML = `
        <div class="empty-message">
          <p>¡Todavía no tienes favoritos!</p>
          <p style="margin-top: 10px; font-size: 14px;">Ve a la página principal y marca algunos perricos con la estrella ⭐</p>
          <a href="main.html" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #fdf4be; border: 2px solid #000; border-radius: 5px; text-decoration: none; color: #000;">
            Ir a la página principal
          </a>
        </div>
      `;
      return;
    }
    
    let swiperHTML = `
      <div class="swiper perricoSwiper">
        <div class="swiper-wrapper">
    `;
    
    favorites.forEach(dog => {
      swiperHTML += `
        <div class="swiper-slide">
          <div class="card">
            <img src="${dog.img}" alt="${dog.name}">
            <div class="card-info">
              <p class="name">${dog.name}</p>
              <p class="breed">${dog.breedName}</p>
              <p class="stats">${dog.likes}❤️ ${dog.dislikes}💔</p>
            </div>
          </div>
        </div>
      `;
    });
    
    swiperHTML += `
        </div>
      </div>
    `;
    
    swiperContainer.innerHTML = swiperHTML;
    
    swiper = new Swiper('.perricoSwiper', {
      modules: [EffectCards],
      effect: 'cards',
      grabCursor: true,
      cardsEffect: {
        perSlideOffset: 8,
        perSlideRotate: 2,
        rotate: true,
        slideShadows: true,
      },
    });
    
    console.log(`✅ ${favorites.length} favoritos cargados`);
  } 
  catch (error) 
  {
    console.error('Error cargando favoritos:', error);
    const swiperContainer = document.getElementById('swiper-container');
    swiperContainer.innerHTML = `
      <div class="empty-message">
        <p>Error cargando tus favoritos</p>
        <p style="margin-top: 10px; font-size: 14px;">Por favor recarga la página</p>
      </div>
    `;
  }
}

//await loadFavorites();
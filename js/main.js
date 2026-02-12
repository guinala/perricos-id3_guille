import { getAllBreeds, getRandomDogImage, getBreedDogImage } from "../js/api.js";
import { auth } from "./firebase_init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { 
  addDog, 
  getUserDogs, 
  deleteAllUserDogs,
  toggleDogFavorite,
  toggleDogLike,
  toggleDogDislike,
  addToUserHistory,
  checkAndUnlockAchievements 
} from './firebase_database.js';
import * as dateFns from 'date-fns';
import { es } from 'date-fns/locale';
import Swiper from 'swiper';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

let searchedContentBreed = '';
let currentStatusFilter = '';
let currentUser = null;
let perricosArray = [];
let breedsObject;
let chosenBreed = '';
const perricosNames = ['Firulais', 'Luna', 'Thor', 'Pastelito de Fresa', 'Rocky', 'Duke', 'Buddy', 'Loki', 'Nara'];
// let selectedDogsName = [];
// let selectedDogsBreeds = [];
let idDogCounter = 0;
let searchedContentName = '';
let swiperInstance = null;

const max_dogs_per_page = 20;

onAuthStateChanged(auth, async (user) => {
  if (!user) 
  {
    window.location.href = '../index.html';
  } 
  else 
  {
    currentUser = user;
    await loadData();
  }
});

async function loadData() 
{
  // if (!currentUser) return;
  
  // try 
  // {
  //   const dogs = await getUserDogs(currentUser.uid);
    
  //   perricosArray = dogs.map(dog => ({
  //     id: dog.id,
  //     firestoreId: dog.firestoreId,
  //     img: dog.img,
  //     name: dog.name,
  //     likes: dog.likes,
  //     isLiked: dog.isLiked,
  //     dislikes: dog.dislikes,
  //     isDisliked: dog.isDisliked,
  //     breedName: dog.breedName,
  //     isFavorite: dog.isFavorite
  //   }));
    
  //   if (perricosArray.length > 0) 
  //   {
  //     idDogCounter = Math.max(...perricosArray.map(dog => dog.id)) + 1;
  //   }
    
  //   renderPerricoArray();
  // } 
  // catch (error) 
  // {
  //   console.error('Error cargando datos:', error);
  //   alert('Error cargando tus perros. Por favor recarga la página.');
  // }
  if (!currentUser) return;
  
  try {
    const dogs = await getUserDogs(currentUser.uid);
    
    perricosArray = dogs.map(dog => ({
      id: dog.id,
      firestoreId: dog.firestoreId,
      img: dog.img,
      name: dog.name,
      likes: dog.likes,
      isLiked: dog.isLiked,
      dislikes: dog.dislikes,
      isDisliked: dog.isDisliked,
      breedName: dog.breedName,
      isFavorite: dog.isFavorite
    }));
    
    if (perricosArray.length > 0) {
      idDogCounter = Math.max(...perricosArray.map(dog => dog.id)) + 1;
    }
    
    updateFilterCounts();  // ← AÑADIR
    updateBreedFilterSelect();  // ← AÑADIR
    renderPerricoArray();
  } catch (error) {
    console.error('Error cargando datos:', error);
    alert('Error cargando tus perros. Por favor recarga la página.');
  }
}

function renderPerricoArray() 
{
  const dogList = document.querySelector('#dog-list');
  dogList.innerHTML = '';

  // const filteredPerricosArray = perricosArray.filter((dog) => {
  //   const matchBreed = searchedContentBreed === '' || dog.breedName.toLowerCase().startsWith(searchedContentBreed.toLowerCase());
  //   const matchName = searchedContentName === '' || dog.name.toLowerCase().startsWith(searchedContentName.toLowerCase());
  //   const matchSelectedName = selectedDogsName.length === 0 || selectedDogsName.includes(dog.name.toLowerCase());
  //   const matchSelectedBreed = selectedDogsBreeds.length === 0 || selectedDogsBreeds.includes(dog.breedName.toLowerCase());
    
  //   return matchBreed && matchName && matchSelectedName && matchSelectedBreed;
  // });
  const filteredPerricosArray = perricosArray.filter((dog) => {
    // Filtro por nombre (búsqueda)
    const matchName = searchedContentName === '' || 
                      dog.name.toLowerCase().startsWith(searchedContentName.toLowerCase());
    
    // Filtro por raza (select)
    const matchBreed = searchedContentBreed === '' || 
                       dog.breedName.toLowerCase() === searchedContentBreed.toLowerCase();
    
    // Filtro por estado (botones de filtro)
    let matchStatus = true;
    if (currentStatusFilter === 'liked') {
      matchStatus = dog.isLiked;
    } else if (currentStatusFilter === 'disliked') {
      matchStatus = dog.isDisliked;
    } else if (currentStatusFilter === 'favorites') {
      matchStatus = dog.isFavorite;
    }
    
    return matchName && matchBreed && matchStatus;
  });

  if(filteredPerricosArray.length <= max_dogs_per_page)
  {
    dogList.innerHTML = '<div id="cards-container"></div>';
    const cardsContainer = document.getElementById('cards-container');
    cardsContainer.innerHTML = '';

    filteredPerricosArray.forEach((dog) => {
      cardsContainer.innerHTML += createCardHTML(dog);
    });


    // renderPerricosNameButtons();
    // renderPerricosBreedButtons();
    addListeners();
    renderBreeds();

    return;
  }

  const pages = [];
  for (let i = 0; i < filteredPerricosArray.length; i += max_dogs_per_page) 
  {
    pages.push(filteredPerricosArray.slice(i, i + max_dogs_per_page));
  }

  let swiperHTML = `
    <div class="swiper perros-swiper">
      <div class="swiper-wrapper">
  `;

  pages.forEach((page, index) => {
    swiperHTML += '<div class="swiper-slide"><div class="cards-grid">';
    
    page.forEach((dog) => {
      swiperHTML += createCardHTML(dog);
    });
    
    swiperHTML += '</div></div>';
  });

  swiperHTML += `
      </div>
      <div class="swiper-pagination"></div>
      <div class="swiper-button-prev"></div>
      <div class="swiper-button-next"></div>
    </div>
  `;

  dogList.innerHTML = swiperHTML;

  if (swiperInstance) 
  {
    swiperInstance.destroy(true, true);
  }

  // Inicializar Swiper
  swiperInstance = new Swiper('.perros-swiper', {
    modules: [Pagination, Navigation],
    slidesPerView: 1,
    spaceBetween: 0,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      renderBullet: function (index, className) {
        return `<span class="${className}" style="background: #000000; width: 12px; height: 12px; margin: 0 5px;"></span>`;
      },
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    observer: true, // Observar cambios en el DOM
    observeParents: true,
    observeSlideChildren: true,
  });

  // renderPerricosNameButtons();
  // renderPerricosBreedButtons();
  addListeners();
  renderBreeds();
}

function updateFilterCounts() {
  const likedCount = perricosArray.filter(dog => dog.isLiked).length;
  const dislikedCount = perricosArray.filter(dog => dog.isDisliked).length;
  const favoritesCount = perricosArray.filter(dog => dog.isFavorite).length;
  
  document.querySelector('#filter-liked .count').textContent = likedCount;
  document.querySelector('#filter-disliked .count').textContent = dislikedCount;
  document.querySelector('#filter-favorites .count').textContent = favoritesCount;
}

function updateBreedFilterSelect() {
  const breedFilterSelect = document.querySelector('#breed-filter-select');
  const currentValue = breedFilterSelect.value;
  
  // Obtener razas únicas de los perros actuales
  const uniqueBreeds = [...new Set(perricosArray.map(dog => dog.breedName))].sort();
  
  // Limpiar y repoblar
  breedFilterSelect.innerHTML = '<option value="">Todas las razas</option>';
  uniqueBreeds.forEach(breed => {
    const option = document.createElement('option');
    option.value = breed;
    option.textContent = breed.charAt(0).toUpperCase() + breed.slice(1);
    breedFilterSelect.appendChild(option);
  });
  
  // Restaurar valor si aún existe
  if (uniqueBreeds.includes(currentValue)) {
    breedFilterSelect.value = currentValue;
  }
}

// function renderPerricosNameButtons() 
// {
//   const nameCounts = {};

//   perricosArray.forEach(dog => {
//     nameCounts[dog.name] = nameCounts[dog.name] === undefined ? 1 : nameCounts[dog.name] + 1;
//   });

//   const nameButtonsDiv = document.querySelector('#name-buttons');

//   nameButtonsDiv.innerHTML = '';
//   Object.keys(nameCounts).forEach(name => {
//     const count = nameCounts[name];
//     nameButtonsDiv.innerHTML += `<button class="filter-name-button ${selectedDogsName.includes(name.toLowerCase()) ? 'filter-name-button-selected' : ''}" filter-name="${name}">${name} (${count})</button>`
//   });
// }

// function renderPerricosBreedButtons() 
// {
//   const breedCounts = {};

//   perricosArray.forEach(dog => {
//     breedCounts[dog.breedName] = breedCounts[dog.breedName] === undefined ? 1 : breedCounts[dog.breedName] + 1;
//   });

//   const breedButtonsDiv = document.querySelector('#breeds-buttons');

//   breedButtonsDiv.innerHTML = '';
//   Object.keys(breedCounts).forEach(breedName => {
//     const count = breedCounts[breedName];
//     breedButtonsDiv.innerHTML += `<button class="filter-breed-button ${selectedDogsBreeds.includes(breedName.toLowerCase()) ? 'filter-breed-button-selected' : ''}" filter-name-breed="${breedName}">${breedName} (${count})</button>`
//   });
// }

function createCardHTML(dog) 
{
  // return `<div class="card" id="${dog.id}">
  //   <img src="${dog.img}" alt="Perro" />
  //   <p class="name-text">
  //     ${dog.name} 
  //     <span class="favorite-star" style="cursor: pointer; font-size: 24px;">${dog.isFavorite ? '⭐' : '☆'}</span>
  //   </p>
  //   <p name="${dog.name}" breed="${dog.breedName}">${dog.likes}❤️ ${dog.dislikes}🤮</p>
  //   <button class="precioso ${dog.isLiked ? 'precioso-selected' : ''}">Precioso</button> <button class="feo ${dog.isDisliked ? 'feo-selected' : ''}">Feo</button>
  // </div>`;
  return `<div class="card" id="${dog.id}">
    <img src="${dog.img}" alt="Perro" />
    <p class="name-text">
      ${dog.name} 
      <span class="favorite-star" style="cursor: pointer; font-size: 32px;">${dog.isFavorite ? '⭐' : '☆'}</span>
    </p>
    <p class="breed-text">${dog.breedName}</p>
    <p class="stats-text">${dog.likes}❤️ ${dog.dislikes}💔</p>
    <div class="action-buttons">
      <button class="btn-icon precioso ${dog.isLiked ? 'precioso-selected' : ''}">❤️</button>
      <button class="btn-icon feo ${dog.isDisliked ? 'feo-selected' : ''}">💔</button>
    </div>
  </div>`;
}

const addPerrico = async () => {
  let perricoImg;
  if(chosenBreed)
  {
    perricoImg = await getBreedDogImage(chosenBreed);
  }
  else
  {
    perricoImg = await getRandomDogImage();
  }
  const perricoName = getRandomPerricoName();
  const numbers = getRandomLikesAndDislikes();
  const breed = perricoImg.split("/")[4];

  const dogData = {
    id: idDogCounter++,
    img: perricoImg,
    name: perricoName,
    likes: numbers.likes,
    isLiked: false,
    dislikes: numbers.dislikes,
    isDisliked: false,
    breedName: breed,
    isFavorite: false
  };

  try 
  {
    const firestoreId = await addDog(currentUser.uid, dogData);
    
    perricosArray.push({
      ...dogData,
      firestoreId: firestoreId
    });
    
    renderPerricoArray();
    updateFilterCounts();
    updateBreedFilterSelect();
    
    await checkAndUnlockAchievements(currentUser.uid);
  } 
  catch (error) 
  {
    console.error('Error añadiendo perro:', error);
    alert('Error al añadir el perro. Por favor intenta de nuevo.');
  }
};

async function add5Perrico() 
{
  await Promise.all([addPerrico(), addPerrico(), addPerrico(), addPerrico(), addPerrico()]);
}

async function addLike(id, button, text) 
{
  if (!currentUser) return;
  
  const dog = perricosArray.find(p => p.id === id);
  if (!dog) return;
  
  const wasLiked = dog.isLiked;
  const newIsLiked = !wasLiked;
  
  try 
  {
    await toggleDogLike(currentUser.uid, dog.firestoreId, newIsLiked, dog.likes);
    
    if(newIsLiked) 
    {
      dog.likes++;
      button.classList.add('precioso-selected');

      const historyEntry = {
        id: Date.now() + Math.random(),
        timestamp: dateFns.formatISO(new Date()),
        action: 'like',
        dogId: dog.id,
        dogName: dog.name,
        dogImage: dog.img,
        dogBreed: dog.breedName
      };
      await addToUserHistory(currentUser.uid, historyEntry);
    } 
    else 
    {
      dog.likes--;
      button.classList.remove('precioso-selected');
    }
    
    dog.isLiked = newIsLiked;
    text.textContent = `${dog.likes}❤️ ${dog.dislikes}💔`;
    
    //renderPerricoArray();
    updateFilterCounts();
    //updateBreedFilterSelect();
    await checkAndUnlockAchievements(currentUser.uid);
  } 
  catch (error) 
  {
    console.error('Error actualizando like:', error);
    alert('Error al actualizar. Por favor intenta de nuevo.');
  }
}

async function addDislike(id, button, text) 
{
  if (!currentUser) return;
  
  const dog = perricosArray.find(p => p.id === id);
  if (!dog) return;
  
  const wasDisliked = dog.isDisliked;
  const newIsDisliked = !wasDisliked;
  
  try 
  {
    await toggleDogDislike(currentUser.uid, dog.firestoreId, newIsDisliked, dog.dislikes);
    
    if(newIsDisliked) 
    {
      dog.dislikes++;
      button.classList.add('feo-selected');
      
      const historyEntry = {
        id: Date.now() + Math.random(),
        timestamp: dateFns.formatISO(new Date()),
        action: 'dislike',
        dogId: dog.id,
        dogName: dog.name,
        dogImage: dog.img,
        dogBreed: dog.breedName
      };
      await addToUserHistory(currentUser.uid, historyEntry);
    } 
    else 
    {
      dog.dislikes--;
      button.classList.remove('feo-selected');
    }
    
    dog.isDisliked = newIsDisliked;
    text.textContent = `${dog.likes}❤️ ${dog.dislikes}💔`;
    
    //renderPerricoArray();
    updateFilterCounts();
    //updateBreedFilterSelect();
    await checkAndUnlockAchievements(currentUser.uid);
  } 
  catch (error) 
  {
    console.error('Error actualizando dislike:', error);
    alert('Error al actualizar. Por favor intenta de nuevo.');
  }
}

async function toggleFavorite(id) 
{
  if (!currentUser) return;
  
  const dog = perricosArray.find(p => p.id === id);
  if (!dog) return;
  
  const newIsFavorite = !dog.isFavorite;
  
  try 
  {
    await toggleDogFavorite(currentUser.uid, dog.firestoreId, newIsFavorite);
    
    dog.isFavorite = newIsFavorite;

    if (newIsFavorite) {
      const historyEntry = {
        id: Date.now() + Math.random(),
        timestamp: dateFns.formatISO(new Date()),
        action: 'favorite',
        dogId: dog.id,
        dogName: dog.name,
        dogImage: dog.img,
        dogBreed: dog.breedName
      };
      await addToUserHistory(currentUser.uid, historyEntry);
    }
    
    renderPerricoArray();
    updateFilterCounts();
    updateBreedFilterSelect();
    
    await checkAndUnlockAchievements(currentUser.uid);
  } 
  catch (error) 
  {
    console.error('Error actualizando favorito:', error);
    alert('Error al actualizar favorito. Por favor intenta de nuevo.');
  }
}

async function clearAllDogs()
{
  if (!currentUser) return;
  
  const confirmDelete = confirm('¿Estás seguro de que quieres eliminar todos tus perros? Esta acción no se puede deshacer.');
  
  if (!confirmDelete) return;
  
  try 
  {
    await deleteAllUserDogs(currentUser.uid);
    perricosArray = [];
    idDogCounter = 0;
    renderPerricoArray();
  } 
  catch (error) 
  {
    console.error('Error eliminando perros:', error);
    alert('Error al eliminar los perros. Por favor intenta de nuevo.');
  }
}

function getRandomPerricoName() {
  const randomIndex = Math.floor(Math.random() * perricosNames.length);
  return perricosNames[randomIndex];
}

function getRandomLikesAndDislikes() {
  const randomNumber = () => Math.floor(Math.random() * 1001);

  const numbers = {likes: randomNumber(), dislikes: randomNumber()};
  return numbers;
}

// function selectDogsName(name) 
// {
//   if(selectedDogsName.includes(name.toLowerCase()))
//   {
//     const index = selectedDogsName.indexOf(name.toLowerCase());
//     selectedDogsName.splice(index, 1);
//   }

//   else
//   {
//     selectedDogsName.push(name.toLowerCase());
//   }

//   renderPerricoArray();
// }

// function selectDogsBreed(nameBreed) 
// {
//   if(selectedDogsBreeds.includes(nameBreed.toLowerCase()))
//   {
//     const index = selectedDogsBreeds.indexOf(nameBreed.toLowerCase());
//     selectedDogsBreeds.splice(index, 1);
//   }

//   else
//   {
//     selectedDogsBreeds.push(nameBreed.toLowerCase());
//   }


//   renderPerricoArray();
// }

function openLightbox(imgSrc) 
{
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  lightboxImg.src = imgSrc;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() 
{
  const lightbox = document.getElementById('lightbox');
  lightbox.classList.remove('active');
  document.body.style.overflow = 'auto';
}

//Eventos
function addListeners()
{
  document.querySelectorAll('.precioso').forEach(btn => {
    // btn.addEventListener('click', async function () {
    //   const card = btn.closest('.card');
    //   const id = Number(card.getAttribute("id"));
    //   console.log(id)
    //   //const text = card.querySelector('p[name]');
    //   await addLike(id, btn);

    //   const disLikeBtn = card.querySelector('.feo');
    //   if(disLikeBtn.classList.contains('feo-selected'))
    //   {
    //     await addDislike(id, disLikeBtn);
    //   }
    // });
    btn.addEventListener('click', async function () {
      const card      = btn.closest('.card');           // ✅ closest, no parentElement
      const id        = Number(card.getAttribute('id'));
      const statsText = card.querySelector('.stats-text');

      btn.disabled = true;
      try {
        await addLike(id, btn, statsText);

        // Si había dislike activo, quitarlo
        const dislikeBtn = card.querySelector('.feo');
        if (dislikeBtn.classList.contains('feo-selected')) {
          await addDislike(id, dislikeBtn, statsText);
        }
      } catch (e) {
        console.error('Error en like:', e);
      } finally {
        btn.disabled = false;
      }
    });
  });

  document.querySelectorAll('.feo').forEach(btn => {
    // btn.addEventListener('click', async function () {
    //   const card = btn.parentElement;
    //   const id = Number(card.getAttribute("id"));
    //   //const text = card.querySelector('p[name]');
    //   await addDislike(id, btn);

    //   const likeBtn = card.querySelector('.precioso');
    //   if(likeBtn.classList.contains('precioso-selected'))
    //   {
    //     await addLike(id, likeBtn);
    //   }
    // });
    btn.addEventListener('click', async function () {
      const card      = btn.closest('.card');           // ✅ closest, no parentElement
      const id        = Number(card.getAttribute('id'));
      const statsText = card.querySelector('.stats-text');

      btn.disabled = true;
      try {
        await addDislike(id, btn, statsText);

        // Si había like activo, quitarlo
        const likeBtn = card.querySelector('.precioso');
        if (likeBtn.classList.contains('precioso-selected')) {
          await addLike(id, likeBtn, statsText);
        }
      } catch (e) {
        console.error('Error en dislike:', e);
      } finally {
        btn.disabled = false;
      }
    });
  });

  // document.querySelectorAll('.filter-name-button').forEach(btn => {
  //   btn.addEventListener('click', function () {
  //     const name = btn.getAttribute('filter-name');
  //     selectDogsName(name);
  //   });
  // });

  // document.querySelectorAll('.filter-breed-button').forEach(btn => {
  //   btn.addEventListener('click', function () {
  //     const nameBreed = btn.getAttribute('filter-name-breed');
  //     selectDogsBreed(nameBreed);
  //   });
  // });

  document.querySelectorAll('.favorite-star').forEach(star => {
    star.addEventListener('click', function(e) {
      e.stopPropagation();
      const card = star.closest('.card');
      const id = Number(card.getAttribute("id"));
      toggleFavorite(id);
    });
  });

  document.querySelectorAll('.card img').forEach(img => {
    img.addEventListener('click', function(e) {
      e.stopPropagation();
      openLightbox(img.src);
    });
    img.style.cursor = 'pointer'; 
  });
}

renderPerricoArray();

document.querySelector('#add-1-perrico').addEventListener('click', async function (event) 
{
  disableEnableButtons(event.target, document.querySelector('#add-5-perricos'));
  await addPerrico();
  disableEnableButtons(event.target, document.querySelector('#add-5-perricos'));
});

document.querySelector('#clear-perricos').addEventListener('click', async function (event) 
{
  await clearAllDogs();
});

document.querySelector('#add-5-perricos').addEventListener('click', async function (event) 
{
  disableEnableButtons(event.target, document.querySelector('#add-1-perrico'));
  await add5Perrico();
  disableEnableButtons(event.target, document.querySelector('#add-1-perrico'));
});

document.querySelector('#breed-list').addEventListener('change', function (event) 
{
  chosenBreed = event.target.value;
  // renderPerricoArray(); 
});

// document.querySelector('#show-names').addEventListener('change', function (event) 
// {
//   const div = document.querySelector("#name-buttons")
//   div.style.display = event.target.checked ? 'none' : 'flex'
// });

// document.querySelector('#show-breeds').addEventListener('change', function (event) 
// {
//   const div = document.querySelector("#breeds-buttons")
//   div.style.display = event.target.checked ? 'none' : 'flex'
// });

document.querySelector('#searcher-name').addEventListener('input', function (event) 
{
  searchedContentName = event.target.value;
  renderPerricoArray();
});

document.querySelector('#breed-filter-select').addEventListener('change', function (event) {
  searchedContentBreed = event.target.value;
  renderPerricoArray();
});

// document.querySelector('#searcher-breed').addEventListener('input', function (event) 
// {
//   searchedContentBreed = event.target.value;
//   renderPerricoArray();
// });

document.getElementById('lightbox').addEventListener('click', function(e) {
  if (e.target.id === 'lightbox' || e.target.id === 'lightbox-close') {
    closeLightbox();
  }
});

document.getElementById('user-profile-btn').addEventListener('click', () => {
    window.location.href = 'profile.html';
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeLightbox();
  }
});

document.querySelectorAll('.status-filter-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const filter = btn.dataset.filter;
    
    // Toggle del filtro
    if (currentStatusFilter === filter) {
      currentStatusFilter = '';
      btn.classList.remove('active');
    } else {
      // Desactivar todos
      document.querySelectorAll('.status-filter-btn').forEach(b => b.classList.remove('active'));
      // Activar el clickeado
      currentStatusFilter = filter;
      btn.classList.add('active');
    }
    
    renderPerricoArray();
  });
});

// document.querySelector('#filter-option-name').addEventListener('change', function (event) 
// {
//   const searcher = document.querySelector("#searcher-name");
//   const nameButtons = document.querySelector("#name-buttons");
//   const checkboxNames = document.querySelectorAll('.show-names-content');
  
//   if(event.target.value === 'filter-name-by-button')
//   {
//       searcher.style.display = 'none';
//       searcher.value = '';
//       searchedContentName = '';
//       nameButtons.style.display = 'flex';
//       checkboxNames.forEach(element => {
//         element.style.display = 'inline-block';
//       });
//   }
//   else
//   {
//       searcher.style.display = 'inline-block';
//       nameButtons.style.display = 'none';
//       selectedDogsName = [];
//       checkboxNames.forEach(element => {
//         element.style.display = 'none';
//       });
//   }
//   renderPerricoArray();
// });

// document.querySelector('#filter-option-breed').addEventListener('change', function (event) 
// {
//   const searcher = document.querySelector("#searcher-breed");
//   const nameButtons = document.querySelector("#breeds-buttons");
//   const checkboxNames = document.querySelectorAll('.show-breeds-content');
  
//   if(event.target.value === 'filter-breed-by-button')
//   {
//       searcher.style.display = 'none';
//       searcher.value = '';
//       searchedContentBreed = '';
//       nameButtons.style.display = 'flex';
//       checkboxNames.forEach(element => {
//         element.style.display = 'inline-block';
//       });
//   }
//   else
//   {
//       searcher.style.display = 'inline-block';
//       nameButtons.style.display = 'none';
//       selectedDogsBreeds = [];
//       checkboxNames.forEach(element => {
//         element.style.display = 'none';
//       });
//   }
//   renderPerricoArray();
// });

function disableEnableButtons(button1, button2)
{
  button1.disabled = !button1.disabled;
  button2.disabled = !button2.disabled;
}

async function renderBreeds()
{
  breedsObject = await getAllBreeds();
  const selectButton = document.querySelector("#breed-list");
  const breedsNames = Object.keys(breedsObject);

  for(let index = 0; index < breedsNames.length; index++)
  {
    const option = document.createElement("option");
    selectButton.appendChild(option);
    option.value = breedsNames[index];
    option.textContent = breedsNames[index].toUpperCase();
  }
}

// renderBreeds();

const filtersPanel = document.getElementById('filters-panel');
const filtersOverlay = document.getElementById('filters-overlay');
const mainWrapper = document.getElementById('main-wrapper');

// Abrir panel de filtros
document.getElementById('filters-toggle-btn').addEventListener('click', () => {
  filtersPanel.classList.add('active');
  filtersOverlay.classList.add('active');
  mainWrapper.classList.add('shift-right');
});

// Cerrar panel (botón X)
document.getElementById('close-filters').addEventListener('click', () => {
  filtersPanel.classList.remove('active');
  filtersOverlay.classList.remove('active');
  mainWrapper.classList.remove('shift-right');
});

// Cerrar panel (click fuera - overlay)
filtersOverlay.addEventListener('click', () => {
  filtersPanel.classList.remove('active');
  filtersOverlay.classList.remove('active');
  mainWrapper.classList.remove('shift-right');
});








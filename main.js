import { getAllBreeds, getRandomDogImage, getBreedDogImage } from "./api";
import * as dateFns from 'date-fns';
import Swiper from 'swiper';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

let perricosArray = [];
let breedsObject;
let chosenBreed = '';
const perricosNames = ['Firulais', 'Luna', 'Thor', 'Pastelito de Fresa', 'Rocky', 'Duke', 'Buddy', 'Loki', 'Nara'];
let selectedDogsName = [];
let selectedDogsBreeds = [];
let idDogCounter = 0;
let searchedContentName = '';
let searchedContentBreed = '';
let swiperInstance = null;

const max_dogs_per_page = 20;
// addPerrico(); 

function renderPerricoArray() {
  const dogList = document.querySelector('#dog-list');
  dogList.innerHTML = '';

  const filteredPerricosArray = perricosArray.filter((dog) => {
    const matchBreed = searchedContentBreed === '' || dog.breedName.toLowerCase().startsWith(searchedContentBreed.toLowerCase());
    const matchName = searchedContentName === '' || dog.name.toLowerCase().startsWith(searchedContentName.toLowerCase());
    const matchSelectedName = selectedDogsName.length === 0 || selectedDogsName.includes(dog.name.toLowerCase());
    const matchSelectedBreed = selectedDogsBreeds.length === 0 || selectedDogsBreeds.includes(dog.breedName.toLowerCase());
    
    return matchBreed && matchName && matchSelectedName && matchSelectedBreed;
  });

  if(filteredPerricosArray.length <= max_dogs_per_page)
  {
    dogList.innerHTML = '<div id="cards-container"></div>';
    const cardsContainer = document.getElementById('cards-container');
    cardsContainer.innerHTML = '';

    filteredPerricosArray.forEach((dog) => {
      cardsContainer.innerHTML += createCardHTML(dog);
    });

    addListeners();
    renderBreeds();

    return;

  }

  // Agrupar perros en páginas
  const pages = [];
  for (let i = 0; i < filteredPerricosArray.length; i += max_dogs_per_page) {
    pages.push(filteredPerricosArray.slice(i, i + max_dogs_per_page));
  }

  // Crear HTML del swiper
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

  // Destruir swiper anterior si existe
  if (swiperInstance) {
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

  // perricosArray.forEach((dog, index) => {
  //   const htmlAdd = ((searchedContentBreed === '' || dog.breedName.toLowerCase().startsWith(searchedContentBreed.toLowerCase())) && (searchedContentName === '' || dog.name.toLowerCase().startsWith(searchedContentName.toLowerCase())) && (selectedDogsName.length === 0 || selectedDogsName.includes(dog.name.toLowerCase())) && (selectedDogsBreeds.length === 0 || selectedDogsBreeds.includes(dog.breedName.toLowerCase())))  ? `<div class="card" id="${dog.id}">
  //     <img src="${dog.img}" alt="Perro" />
  //     <p class="name-text">
  //       ${dog.name} 
  //       <span class="favorite-star" style="cursor: pointer; font-size: 24px;">${dog.isFavorite ? '⭐' : '☆'}</span>
  //     </p>
  //     <p name="${dog.name}" breed="${dog.breedName}">${dog.likes}❤️ ${dog.dislikes}🤮</p>
  //     <button class="precioso ${dog.isLiked ? 'precioso-selected' : ''}">Precioso</button> <button class="feo ${dog.isDisliked ? 'feo-selected' : ''}">Feo</button>
  //   </div>` : '';

  //   console.log('innerHtml posición', index, dogList.innerHTML);

  //   dogList.innerHTML += htmlAdd;
  // });

  addListeners();
  renderBreeds();
}

function createCardHTML(dog) {
  return `<div class="card" id="${dog.id}">
    <img src="${dog.img}" alt="Perro" />
    <p class="name-text">
      ${dog.name} 
      <span class="favorite-star" style="cursor: pointer; font-size: 24px;">${dog.isFavorite ? '⭐' : '☆'}</span>
    </p>
    <p name="${dog.name}" breed="${dog.breedName}">${dog.likes}❤️ ${dog.dislikes}🤮</p>
    <button class="precioso ${dog.isLiked ? 'precioso-selected' : ''}">Precioso</button> <button class="feo ${dog.isDisliked ? 'feo-selected' : ''}">Feo</button>
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

  //Añadir perrito (objeto)
  perricosArray.push({ id: idDogCounter++, img: perricoImg, name: perricoName, 
    likes: numbers.likes, isLiked: false, dislikes: numbers.dislikes, isDisliked: false, breedName: breed, isFavorite: false});
  localStorage.setItem('perricosArray', JSON.stringify(perricosArray));
  renderPerricoArray();
};

//Añadir 5 perricos
async function add5Perrico() {
  await Promise.all([addPerrico(), addPerrico(), addPerrico(), addPerrico(), addPerrico()]);
}

//Añadir like a la votación
function addLike(id, button, text) 
{
  console.log(perricosArray)
  const dog = perricosArray.find(p => p.id === id);
  console.log(dog)
  if(!button.classList.contains('precioso-selected'))
  {
    dog.likes++;
    button.classList.add('precioso-selected');
    
  }
  else
  {
    dog.likes--;
    button.classList.remove('precioso-selected');
  }
  dog.isLiked = !dog.isLiked;
  text.textContent = `${dog.likes}❤️ ${dog.dislikes}🤮`;
  localStorage.setItem('perricosArray', JSON.stringify(perricosArray));
}

//Añadir dislike a la votación
function addDislike(id, button, text) 
{
  const dog = perricosArray.find(p => p.id === id)

  if(!button.classList.contains('feo-selected'))
  {
    dog.dislikes++;
    button.classList.add('feo-selected');
    
  }
  else
  {
    dog.dislikes--;
    button.classList.remove("feo-selected");

  }
  dog.isDisliked = !dog.isDisliked;
  text.textContent = `${dog.likes}❤️ ${dog.dislikes}🤮`;
  localStorage.setItem('perricosArray', JSON.stringify(perricosArray));
}

function toggleFavorite(id) 
{
  const dog = perricosArray.find(p => p.id === id);
  dog.isFavorite = !dog.isFavorite;
  localStorage.setItem('perricosArray', JSON.stringify(perricosArray));

  const sliderIndex = swiperInstance ? swiperInstance.activeIndex : 0;
  renderPerricoArray();
  if (swiperInstance && sliderIndex > 0) {
    swiperInstance.slideTo(sliderIndex, 0); // 0 = sin animación
  }
}

//Obtener nombre aleatorio de perrico
function getRandomPerricoName() {
  const randomIndex = Math.floor(Math.random() * perricosNames.length);
  return perricosNames[randomIndex];
}

function getRandomLikesAndDislikes() {
  const randomNumber = () => Math.floor(Math.random() * 1001);

  const numbers = {likes: randomNumber(), dislikes: randomNumber()};
  return numbers;
}

//Mostrar solo perros que tengan un nombre concreto
function selectDogsName(name) 
{
  if(selectedDogsName.includes(name.toLowerCase()))
  {
    const index = selectedDogsName.indexOf(name.toLowerCase());
    selectedDogsName.splice(index, 1);
  }

  else
  {
    selectedDogsName.push(name.toLowerCase());
  }

  renderPerricoArray();
}

function selectDogsBreed(nameBreed) 
{
  if(selectedDogsBreeds.includes(nameBreed.toLowerCase()))
  {
    const index = selectedDogsBreeds.indexOf(nameBreed.toLowerCase());
    selectedDogsBreeds.splice(index, 1);
  }

  else
  {
    selectedDogsBreeds.push(nameBreed.toLowerCase());
  }


  renderPerricoArray();
}

function openLightbox(imgSrc) {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  lightboxImg.src = imgSrc;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden'; // Evitar scroll
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  lightbox.classList.remove('active');
  document.body.style.overflow = 'auto'; // Restaurar scroll
}

//Eventos
function addListeners()
{
  document.querySelectorAll('.precioso').forEach(btn => {
    btn.addEventListener('click', function () {
      const card = btn.parentElement;
      const id = Number(card.getAttribute("id"));
      console.log(id)
      const text = card.querySelector('p[name]');
      addLike(id, btn, text);

      const disLikeBtn = card.querySelector('.feo');
      if(disLikeBtn.classList.contains('feo-selected'))
      {
        addDislike(id, disLikeBtn, text);
      }
    });
  });

  document.querySelectorAll('.feo').forEach(btn => {
    btn.addEventListener('click', function () {
      const card = btn.parentElement;
      const id = Number(card.getAttribute("id"));
      const text = card.querySelector('p[name]');
      addDislike(id, btn, text);

      const likeBtn = card.querySelector('.precioso');
      if(likeBtn.classList.contains('precioso-selected'))
      {
        addLike(id, likeBtn, text);
      }
    });
  });

  document.querySelectorAll('.filter-name-button').forEach(btn => {
    btn.addEventListener('click', function () {
      const name = btn.getAttribute('filter-name');
      selectDogsName(name);
    });
  });

  document.querySelectorAll('.filter-breed-button').forEach(btn => {
    btn.addEventListener('click', function () {
      const nameBreed = btn.getAttribute('filter-name-breed');
      selectDogsBreed(nameBreed);
    });
  });

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
    img.style.cursor = 'pointer'; // Indicar que es clickeable
  });
}

function loadData()
{
  const savedPerricos = localStorage.getItem('perricosArray');
  if (savedPerricos) {
    perricosArray = JSON.parse(savedPerricos);
    if (perricosArray.length > 0) {
      idDogCounter = Math.max(...perricosArray.map(dog => dog.id)) + 1;
    }
  }
}

loadData();
renderPerricoArray();

document.querySelector('#add-1-perrico').addEventListener('click', async function (event) 
{
  disableEnableButtons(event.target, document.querySelector('#add-5-perricos'));
  await addPerrico();
  disableEnableButtons(event.target, document.querySelector('#add-5-perricos'));
});

document.querySelector('#clear-perricos').addEventListener('click', async function (event) 
{
  perricosArray.length = 0;
  localStorage.setItem('perricosArray', JSON.stringify(perricosArray));
  renderPerricoArray();
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
  renderPerricoArray(); 
});

document.querySelector('#searcher-name').addEventListener('input', function (event) 
{
  searchedContentName = event.target.value;
  renderPerricoArray();
});

document.querySelector('#searcher-breed').addEventListener('input', function (event) 
{
  searchedContentBreed = event.target.value;
  renderPerricoArray();
});

document.getElementById('lightbox').addEventListener('click', function(e) {
  if (e.target.id === 'lightbox' || e.target.id === 'lightbox-close') {
    closeLightbox();
  }
});

// Cerrar con tecla ESC
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeLightbox();
  }
});

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

renderBreeds();








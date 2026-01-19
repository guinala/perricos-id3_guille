const perricosArray = [];
let breedsObject;
let chosenBreed = '';
const perricosNames = ['Firulais', 'Luna', 'Thor', 'Pastelito de Fresa', 'Rocky', 'Duke', 'Buddy', 'Loki', 'Nara'];
let selectedDogsName = [];
let selectedDogsBreeds = [];
let idDogCounter = 0;
let searchedContentName = '';
let searchedContentBreed = '';
// addPerrico();

function renderPerricoArray() {
  const dogList = document.querySelector('#dog-list');
  dogList.innerHTML = '';

  perricosArray.forEach((dog, index) => {
    const htmlAdd = ((searchedContentBreed === '' || dog.breedName.toLowerCase().startsWith(searchedContentBreed.toLowerCase())) && (searchedContentName === '' || dog.name.toLowerCase().startsWith(searchedContentName.toLowerCase())) && (selectedDogsName.length === 0 || selectedDogsName.includes(dog.name.toLowerCase())) && (selectedDogsBreeds.length === 0 || selectedDogsBreeds.includes(dog.breedName.toLowerCase())))  ? `<div class="card" id="${dog.id}">
      <img src="${dog.img}" alt="Perro" />
      <p class="name-text">${dog.name}</p>
      <p name="${dog.name}" breed="${dog.breedName}">${dog.likes}❤️ ${dog.dislikes}🤮</p>
      <button class="precioso ${dog.isLiked ? 'precioso-selected' : ''}">Precioso</button> <button class="feo ${dog.isDisliked ? 'feo-selected' : ''}">Feo</button>
    </div>` : '';

    console.log('innerHtml posición', index, dogList.innerHTML);

    dogList.innerHTML += htmlAdd;
  });

  renderPerricosNameButtons();
  renderPerricosBreedButtons();
  addListeners();
  renderBreeds();
}

function renderPerricosNameButtons() {
  const nameCounts = {};

  perricosArray.forEach(dog => {
    nameCounts[dog.name] = nameCounts[dog.name] === undefined ? 1 : nameCounts[dog.name] + 1;
  });

  const nameButtonsDiv = document.querySelector('#name-buttons');

  nameButtonsDiv.innerHTML = '';
  Object.keys(nameCounts).forEach(name => {
    const count = nameCounts[name];
    nameButtonsDiv.innerHTML += `<button class="filter-name-button ${selectedDogsName.includes(name.toLowerCase()) ? 'filter-name-button-selected' : ''}" filter-name="${name}">${name} (${count})</button>`
  });
}

function renderPerricosBreedButtons() {
  const breedCounts = {};

  perricosArray.forEach(dog => {
    breedCounts[dog.breedName] = breedCounts[dog.breedName] === undefined ? 1 : breedCounts[dog.breedName] + 1;
  });

  const breedButtonsDiv = document.querySelector('#breeds-buttons');

  breedButtonsDiv.innerHTML = '';
  Object.keys(breedCounts).forEach(breedName => {
    const count = breedCounts[breedName];
    breedButtonsDiv.innerHTML += `<button class="filter-breed-button ${selectedDogsBreeds.includes(breedName.toLowerCase()) ? 'filter-breed-button-selected' : ''}" filter-name-breed="${breedName}">${breedName} (${count})</button>`
  });
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
  perricosArray.push({ id: idDogCounter++, img: perricoImg, name: perricoName, likes: numbers.likes, isLiked: false, dislikes: numbers.dislikes, isDisliked: false, breedName: breed});
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
}

renderPerricoArray();

document.querySelector('#add-1-perrico').addEventListener('click', async function (event) 
{
  disableEnableButtons(event.target, document.querySelector('#add-5-perricos'));
  await addPerrico();
  disableEnableButtons(event.target, document.querySelector('#add-5-perricos'));
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

document.querySelector('#show-names').addEventListener('change', function (event) 
{
  const div = document.querySelector("#name-buttons")
  div.style.display = event.target.checked ? 'none' : 'flex'
});

document.querySelector('#show-breeds').addEventListener('change', function (event) 
{
  const div = document.querySelector("#breeds-buttons")
  div.style.display = event.target.checked ? 'none' : 'flex'
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

document.querySelector('#filter-option-name').addEventListener('change', function (event) 
{
   const searcher = document.querySelector("#searcher-name");
   const nameButtons = document.querySelector("#name-buttons");
   const checkboxNames = document.querySelectorAll('.show-names-content');
   
   if(event.target.value === 'filter-name-by-button')
   {
      searcher.style.display = 'none';
      searcher.value = '';
      nameButtons.style.display = 'flex';
      checkboxNames.forEach(element => {
        element.style.display = 'inline-block';
      });
   }
   else
   {
      searcher.style.display = 'inline-block';
      nameButtons.style.display = 'none';
      checkboxNames.forEach(element => {
        element.style.display = 'none';
      });
   }
});

document.querySelector('#filter-option-breed').addEventListener('change', function (event) 
{
   const searcher = document.querySelector("#searcher-breed");
   const nameButtons = document.querySelector("#breeds-buttons");
   const checkboxNames = document.querySelectorAll('.show-breeds-content');
   
   if(event.target.value === 'filter-breed-by-button')
   {
      searcher.style.display = 'none';
      searcher.value = '';
      nameButtons.style.display = 'flex';
      checkboxNames.forEach(element => {
        element.style.display = 'inline-block';
      });
   }
   else
   {
      searcher.style.display = 'inline-block';
      nameButtons.style.display = 'none';
      checkboxNames.forEach(element => {
        element.style.display = 'none';
      });
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








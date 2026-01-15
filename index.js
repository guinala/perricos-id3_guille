const perricosArray = [];
let breedsObject;
let chosenBreed = '';
const perricosNames = ['Firulais', 'Luna', 'Thor', 'Pastelito de Fresa', 'Rocky', 'Duke', 'Buddy', 'Loki', 'Nara'];
let selectedDogs = [];
let idDogCounter = 0;
// addPerrico();

function renderPerricoArray() {
  const dogList = document.querySelector('#dog-list');
  dogList.innerHTML = '';

  perricosArray.forEach((dog, index) => {
    const htmlAdd = (selectedDogs.length === 0 || selectedDogs.includes(dog.name.toLowerCase()))  ? `<div class="card" id="${dog.id}">
      <img src="${dog.img}" alt="Perro" />
      <p class="name-text">${dog.name}</p>
      <p name="${dog.name}">${dog.likes}❤️ ${dog.dislikes}🤮</p>
      <button class="precioso ${dog.isLiked ? 'precioso-selected' : ''}">Precioso</button> <button class="feo ${dog.isDisliked ? 'feo-selected' : ''}">Feo</button>
    </div>` : '';

    console.log('innerHtml posición', index, dogList.innerHTML);

    dogList.innerHTML += htmlAdd;
  });

  renderPerricosNameButtons();
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
    nameButtonsDiv.innerHTML += `<button class="filter-button ${selectedDogs.includes(name.toLowerCase()) ? 'filter-button-selected' : ''}" filter-name="${name}">${name} (${count})</button>`
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
  // perricosArray.push(perricoImg);

  //Añadir perrito (objeto)
  perricosArray.push({ id: idDogCounter++, img: perricoImg, name: perricoName, likes: numbers.likes, isLiked: false, dislikes: numbers.dislikes, isDisliked: false});
  renderPerricoArray();
};

//Añadir 5 perricos
const add5Perricos = async () => {
  await Promise.all(addPerrico(), addPerrico(), addPerrico(), addPerrico(), addPerrico());
};

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
function selectDogs(name) 
{
  if(selectedDogs.includes(name.toLowerCase()))
  {
    const index = selectedDogs.indexOf(name.toLowerCase());
    selectedDogs.splice(index, 1);
  }

  else
  {
    selectedDogs.push(name.toLowerCase());
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

  document.querySelectorAll('.filter-button').forEach(btn => {
    btn.addEventListener('click', function () {
      const name = btn.getAttribute('filter-name');
      selectDogs(name);
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
  await add5Perricos();
  disableEnableButtons(event.target, document.querySelector('#add-1-perrico'));
});

document.querySelector('#breed-list').addEventListener('change', function (event) 
{
  chosenBreed = event.target.value;
  renderPerricoArray(); 
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








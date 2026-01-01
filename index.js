const perricosArray = [];
const perricosNames = ['Firulais', 'Nomuerde', 'Luna', 'Thor', 'Pastelito de Fresa', 'Rocky', 'Duke', 'Buddy', 'Loki', 'Nara', 'Destructor de Mundos'];
let selected = null;
// addPerrico();

function renderPerricoArray() {
  const dogList = document.querySelector('#dog-list');
  dogList.innerHTML = '';

  perricosArray.forEach((dog, index) => {
    const htmlAdd = (selected === null || dog.name === selected)  ? `<div class="card">
      <img src="${dog.img}" alt="Perro" />
      <p class="name-text">${dog.name}</p>
      <p name="${dog.name}"></p>
      <button class="precioso">Precioso</button> <button class="feo">Feo</button>
    </div>` : '';

    console.log('innerHtml posición', index, dogList.innerHTML);

    dogList.innerHTML += htmlAdd;
  });

  renderPerricosNameButtons();
  addListeners();
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
    nameButtonsDiv.innerHTML += `<button class="filter-button ${selected === name ? 'selected' : ''}" data-name="${name}">${name} (${count})</button>`
  });
}

const addPerrico = async () => {
  const perricoImg = await getRandomDogImage();
  const perricoName = getRandomPerricoName();
  // perricosArray.push(perricoImg);

  //Añadir perrito (objeto)
  perricosArray.push({ img: perricoImg, name: perricoName });
  renderPerricoArray();
};

//Añadir 5 perricos
const add5Perricos = async () => {
  for (let i = 0; i < 5; i++) {
    await addPerrico();
  }
};

//Añadir like a la votación
function addLike(element) 
{
  if(element.textContent.trim() === "❤️")
  {
    element.textContent = "" ;
  }
  else
  {
    element.textContent = "❤️" ;
  }
  
}

//Añadir dislike a la votación
function addDislike(element) 
{
  if(element.textContent.trim() === "🤮")
  {
    element.textContent = "" ;
  }
  else
  {
    element.textContent = "🤮" ;
  }
}

//Obtener nombre aleatorio de perrico
function getRandomPerricoName() {
  const randomIndex = Math.floor(Math.random() * perricosNames.length);
  return perricosNames[randomIndex];
}

//Mostrar solo perros que tengan un nombre concreto
function selectDogs(name) {
  if(selected !== null && selected === name)
  {
    selected = null;
  }
  else
  {
    selected = name;
  }
  
  renderPerricoArray();
}

//Eventos
function addListeners()
{
  document.querySelectorAll('.precioso').forEach(btn => {
    btn.addEventListener('click', function () {
      const card = btn.parentElement;
      const element = card.querySelector('p[name]');
      addLike(element);
    });
  });

  document.querySelectorAll('.feo').forEach(btn => {
    btn.addEventListener('click', function () {
      const card = btn.parentElement;
      const element = card.querySelector('p[name]');
      addDislike(element);
    });
  });

  document.querySelectorAll('.filter-button').forEach(btn => {
    btn.addEventListener('click', function () {
      selectDogs(btn.dataset.name);
    });
  });
}

renderPerricoArray();

document.querySelector('#add-1-perrico').addEventListener('click', function () {
  addPerrico();
});

document.querySelector('#add-5-perricos').addEventListener('click', function () {
  add5Perricos();
});









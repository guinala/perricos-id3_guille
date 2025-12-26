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
      <button class="name-button ${dog.name === selected ? 'selected' : ''}">${dog.name}</button>
      <br />
      <p name="${dog.name}">❤️ 🤮</p>
      <button class="precioso">Preciosísimo</button> <button class="feo">Feísisimo</button>
    </div>` : '';

    console.log('innerHtml posición', index, dogList.innerHTML);

    dogList.innerHTML += htmlAdd;
  });

  addListeners();
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
  element.textContent = "❤️ " + element.textContent;
}

//Añadir dislike a la votación
function addDislike(element) 
{
  element.textContent =  element.textContent + "🤮";
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
      const element = card.querySelector('p');
      addLike(element);
    });
  });

  document.querySelectorAll('.feo').forEach(btn => {
    btn.addEventListener('click', function () {
      const card = btn.parentElement;
      const element = card.querySelector('p');
      addDislike(element);
    });
  });

  document.querySelectorAll('.name-button').forEach(p => {
    p.addEventListener('click', function () {
      selectDogs(p.textContent);
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









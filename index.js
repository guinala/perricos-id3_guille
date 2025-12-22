const perricosArray = [];
const perricosNames = ['Firulais', 'Rex', 'Nomuerde','Luna', 'Thor', 'Max', 'Bella', 'Pastelito de Fresa', 'Rocky', 'Molly', 'Duke', 'Lucy', 'Buddy', 'Loki', 'Nara', 'Destructor de Mundos'];
let selected = null;
// addPerrico();

function renderPerricoArray() {
  const dogList = document.querySelector('#dog-list');
  dogList.innerHTML = '';

  perricosArray.forEach((dog, index) => {
    const htmlAdd = (selected === null || dog.name === selected)  ? `<div class="card">
      <img src="${dog.img}" alt="Perro" />
      <button class="name-button">${dog.name}</button>
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
  perricosArray.push({ img: perricoImg, name: perricoName });
  renderPerricoArray();
};

const add5Perricos = async () => {
  for (let i = 0; i < 5; i++) {
    await addPerrico();
  }
};

function addLike(element) 
{
  element.textContent = "❤️ " + element.textContent;
}

function addDislike(element) 
{
  element.textContent =  element.textContent + "🤮";
}

function getRandomPerricoName() {
  const randomIndex = Math.floor(Math.random() * perricosNames.length);
  return perricosNames[randomIndex];
}

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

function addListeners()
{
  document.querySelectorAll('.precioso').forEach(btn => {
    btn.addEventListener('click', function () {
      console.log('Like añadido');
      const card = btn.parentElement;
      const element = card.querySelector('p');
      addLike(element);
    });
  });

  document.querySelectorAll('.feo').forEach(btn => {
    btn.addEventListener('click', function () {
      console.log('Dislike añadido');
      const card = btn.parentElement;
      const element = card.querySelector('p');
      addDislike(element);
    });
  });

  document.querySelectorAll('.name-button').forEach(p => {
    p.addEventListener('click', function () {
      console.log('Nombre del perro clicado:', p.textContent);
      selectDogs(p.textContent);
    });
  });
}

renderPerricoArray();

document.querySelector('#add-1-perrico').addEventListener('click', function () {
  addPerrico();
});

//Añadir 5 perricos
document.querySelector('#add-5-perricos').addEventListener('click', function () {
  add5Perricos();
});









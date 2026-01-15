async function getRandomDogImage() {
  const url = 'https://dog.ceo/api/breeds/image/random';
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();

    return json.message;
  } catch (error) {
    console.error(error.message);
  }
}

async function getBreedDogImage(breed) {
  console.log("cositas")
  const url = `https://dog.ceo/api/breed/${breed}/images/random`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();

    return json.message;
  } catch (error) {
    console.error(error.message);
  }
}

async function getAllBreeds()
{
  const url = 'https://dog.ceo/api/breeds/list/all';

  try 
  {
    const response = await fetch(url);
    if (!response.ok) 
    {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    console.log(json.message);
    return json.message;
  } 
  catch (error) 
  {
    console.error(error.message);
  }
}

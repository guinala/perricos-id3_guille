import axios from 'axios';

async function getRandomDogImage() {
  const url = 'https://dog.ceo/api/breeds/image/random';
  try {
    const response = await axios.get(url);
    if (response.status !== 200) {
      throw new Error(`Response status: ${response.status}`);
    }

    return response.data.message;
  } catch (error) {
    console.error(error.message);
  }
}

async function getBreedDogImage(breed) {
  console.log("cositas")
  const url = `https://dog.ceo/api/breed/${breed}/images/random`;
  try {
    const response = await axios.get(url);
    if (response.status !== 200) {
      throw new Error(`Response status: ${response.status}`);
    }

    return response.data.message;
  } catch (error) {
    console.error(error.message);
  }
}

async function getAllBreeds()
{
  const url = 'https://dog.ceo/api/breeds/list/all';

  try 
  {
    const response = await axios.get(url);
    if (response.status !== 200) 
    {
      throw new Error(`Response status: ${response.status}`);
    }

    return response.data.message;
  } 
  catch (error) 
  {
    console.error(error.message);
  }
}

export {getAllBreeds, getBreedDogImage, getRandomDogImage}
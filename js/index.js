import { auth } from "./firebase_init.js";

import {createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

import { getRandomDogImage } from "./api.js";
import { addUser } from "./firebase_database.js";

const NUM_IMAGES = 10;
let currentImageIndex = 0;
let images = [];

async function fetchRandomDogImages() {
    const promises = [];
    for (let i = 0; i < NUM_IMAGES; i++) {
        promises.push(getRandomDogImage());
    }
    return Promise.all(promises);
}

function preloadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = reject;
        img.src = src;
    });
}

async function initSlider() {
    try {
        const imageUrls = await fetchRandomDogImages();
        
        await Promise.all(imageUrls.map(url => preloadImage(url)));
        
        document.getElementById('loading').style.display = 'none';
        
        const slider = document.getElementById('background-slider');
        imageUrls.forEach((url, index) => {
            const img = document.createElement('img');
            img.src = url;
            img.alt = `Perro ${index + 1}`;
            if (index === 0) {
                img.classList.add('active');
            }
            slider.appendChild(img);
            images.push(img);
        });
        
        setInterval(rotateImages, 2000);
    } catch (error) {
        console.error('Error cargando imágenes:', error);
        document.getElementById('loading').textContent = 'Error cargando imágenes';
    }
}

function rotateImages() {
    if (images.length === 0) return;
    
    images[currentImageIndex].classList.remove('active');
    currentImageIndex = (currentImageIndex + 1) % images.length;
    images[currentImageIndex].classList.add('active');
}

//Autenticación
const mainContent = document.getElementById('main-content');
const authContainer = document.getElementById('auth-container');
const loginPanel = document.getElementById('login-panel');
const registerPanel = document.getElementById('register-panel');

document.getElementById('enter-button').addEventListener('click', () => {
    mainContent.classList.add('shift-left');
    authContainer.classList.add('active');
});

document.getElementById('close-auth').addEventListener('click', () => {
    mainContent.classList.remove('shift-left');
    authContainer.classList.remove('active');
});

document.getElementById('show-register').addEventListener('click', () => {
    loginPanel.classList.add('slide-up');
    loginPanel.classList.remove('active');
    registerPanel.classList.add('active');
    registerPanel.classList.remove('slide-from-bottom');
});

document.getElementById('show-login').addEventListener('click', () => {
    registerPanel.classList.remove('active');
    registerPanel.classList.add('slide-from-bottom');
    loginPanel.classList.add('active');
    loginPanel.classList.remove('slide-up');
});

// Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    
    try 
    {
        await signInWithEmailAndPassword(auth, email, password);
    } 
    catch (error) 
    {
        errorDiv.textContent = getErrorMessage(error.code);
    }
});

// Register
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-password-confirm').value;
    const errorDiv = document.getElementById('register-error');
    
    if (password !== confirmPassword) {
        errorDiv.textContent = 'Las contraseñas no coinciden';
        return;
    }
    
    try 
    {
       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
       const user = userCredential.user;
       await addUser(user);
    } 
    catch (error) 
    {
        errorDiv.textContent = getErrorMessage(error.code);
    }
});

// Google 
const provider = new GoogleAuthProvider();

document.getElementById('google-login').addEventListener('click', async () => {
    console.log('Intentando login con Google...');

    try 
    {
        const result = await signInWithPopup(auth, provider);
        console.log('Login exitoso:', result.user);
    } 
    catch (error) 
    {
        console.error('Error completo:', error);
        console.error('Código de error:', error.code);
        console.error('Mensaje:', error.message);
        document.getElementById('login-error').textContent = getErrorMessage(error.code);
    }
});

document.getElementById('google-register').addEventListener('click', async () => {
    console.log('Intentando registro con Google...');
    try 
    {
        const result = await signInWithPopup(auth, provider);
        console.log('Registro exitoso:', result.user);
    } 
    catch (error) 
    {
        console.error('Error completo:', error);
        console.error('Código de error:', error.code);
        console.error('Mensaje:', error.message);
        document.getElementById('register-error').textContent = getErrorMessage(error.code);
    }
});

function getErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return 'Este email ya está registrado';
        case 'auth/invalid-email':
            return 'Email inválido';
        case 'auth/weak-password':
            return 'La contraseña debe tener al menos 6 caracteres';
        case 'auth/user-not-found':
            return 'Usuario no encontrado';
        case 'auth/wrong-password':
            return 'Contraseña incorrecta';
        default:
            return 'Error en la autenticación';
    }
}

initSlider();

// onAuthStateChanged(auth, (user) => {
//     if (user) 
//     {
//         window.location.href = '../html/main.html';
//     }
// });
import Swiper from 'swiper';
import { EffectCards } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';

let swiper;

function loadFavorites() {
    const perricosArray = JSON.parse(localStorage.getItem('perricosArray') || '[]');
    const favorites = perricosArray.filter(dog => dog.isFavorite);
            
    const swiperContainer = document.getElementById('swiper-container');
            
    if (favorites.length === 0) 
    {
        swiperContainer.innerHTML = `
        <div class="empty-message">
            <p>¡Todavía no tienes favoritos!</p>
        </div>
        `;
        return;
    }
            
    let swiperHTML = `
        <div class="swiper perricoSwiper">
        <div class="swiper-wrapper">
    `;
            
    favorites.forEach(dog => {
        swiperHTML += `
            <div class="swiper-slide">
                <div class="card">
                    <img src="${dog.img}" alt="${dog.name}">
                        <div class="card-info">
                            <p class="name">${dog.name}</p>
                            <p class="breed">${dog.breedName}</p>
                            <p class="stats">${dog.likes}❤️ ${dog.dislikes}🤮</p>
                        </div>
                </div>
            </div>
        `;
    });
            
    swiperHTML += `
        </div>
        </div>
    `;
            
    swiperContainer.innerHTML = swiperHTML;
            
    
    swiper = new Swiper('.perricoSwiper', {
        modules: [EffectCards],
        effect: 'cards',
        grabCursor: true,
        cardsEffect: 
        {
            perSlideOffset: 8,
            perSlideRotate: 2,
            rotate: true,
            slideShadows: true,
        },
    });
    }

    loadFavorites();
import { auth } from "./firebase_init.js";
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getAchievementsStatus } from '../js/achievements.js';

let currentUser = null;
let currentFilter = 'all';
let achievementsFilter = 'all';

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'landing.html';
    } else {
        currentUser = user;
        loadProfile();
    }
});

function loadProfile() {
    document.getElementById('user-email').textContent = currentUser.email;

    const perricosArray = JSON.parse(localStorage.getItem('perricosArray') || '[]');

    const favorites = perricosArray.filter(dog => dog.isFavorite);
    const totalLikes = perricosArray.reduce((sum, dog) => sum + (dog.isLiked || 0), 0);
    const totalDislikes = perricosArray.reduce((sum, dog) => sum + (dog.isDisliked || 0), 0);

    document.getElementById('total-favorites').textContent = favorites.length;
    document.getElementById('total-likes').textContent = totalLikes;
    document.getElementById('total-dislikes').textContent = totalDislikes;
    document.getElementById('total-dogs').textContent = perricosArray.length;

    renderFavorites(favorites);
    renderHistory();
    renderAchievements();
}

function renderFavorites(favorites) {
    const favoritesList = document.getElementById('favorites-list');

    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p class="empty-message">No tienes favoritos todavía. ¡Ve a la página principal y marca algunos perricos con la estrella!</p>';
        return;
    }

    favoritesList.innerHTML = '';

    favorites.forEach(dog => {
        const card = document.createElement('div');
        card.className = 'favorite-card';
        card.innerHTML = `
            <img src="${dog.img}" alt="${dog.name}">
            <div class="favorite-card-name">${dog.name}</div>
            <div class="favorite-card-breed">${dog.breedName}</div>
            <div class="favorite-card-stats">${dog.likes}❤️ ${dog.dislikes}🤮</div>
        `;
        favoritesList.appendChild(card);
    });
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem('userHistory') || '[]');
    const tbody = document.getElementById('history-tbody');

    // Filtrar historial según selección
    let filteredHistory = history;
    if (currentFilter !== 'all') {
        filteredHistory = history.filter(entry => entry.action === currentFilter);
    }

    if (filteredHistory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-message">No hay acciones registradas todavía</td></tr>';
        return;
    }

    tbody.innerHTML = '';

    filteredHistory.forEach(entry => {
        const row = document.createElement('tr');
        
        //Date
        const date = new Date(entry.timestamp);
        const formattedDate = format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
        const formattedTime = format(date, 'HH:mm:ss', { locale: es });

        let actionText = '';
        let actionClass = '';
        switch (entry.action) {
            case 'favorite':
                actionText = '⭐ Favorito';
                actionClass = 'favorite';
                break;
            case 'like':
                actionText = '❤️ Me Gusta';
                actionClass = 'like';
                break;
            case 'dislike':
                actionText = '🤮 Dislike';
                actionClass = 'dislike';
                break;
        }

        row.innerHTML = `
            <td><img src="${entry.dogImage}" alt="${entry.dogName}" class="dog-thumbnail"></td>
            <td><strong>${entry.dogName}</strong></td>
            <td>${entry.dogBreed}</td>
            <td><span class="action-badge ${actionClass}">${actionText}</span></td>
            <td>
                <div class="timestamp">
                    <span class="date">${formattedDate}</span>
                    <span class="time">${formattedTime}</span>
                </div>
            </td>
        `;

        tbody.appendChild(row);
    });
}

function renderAchievements() {
    const achievements = getAchievementsStatus();
    const grid = document.getElementById('achievements-grid');
    
    // Filtrar logros
    let filteredAchievements = achievements;
    if (achievementsFilter === 'unlocked') {
        filteredAchievements = achievements.filter(a => a.isUnlocked);
    } else if (achievementsFilter === 'locked') {
        filteredAchievements = achievements.filter(a => !a.isUnlocked);
    }
    
    if (filteredAchievements.length === 0) {
        grid.innerHTML = '<p class="empty-message">No hay logros en esta categoría</p>';
        return;
    }
    
    grid.innerHTML = '';
    
    filteredAchievements.forEach(achievement => {
        const card = document.createElement('div');
        card.className = `achievement-card ${achievement.isUnlocked ? 'unlocked' : 'locked'}`;
        
        let progressHTML = '';
        let unlockedHTML = '';
        
        if (achievement.isUnlocked) {
            const unlockedDate = new Date(achievement.unlockedAt);
            const formattedDate = format(unlockedDate, "d 'de' MMMM 'de' yyyy", { locale: es });
            unlockedHTML = `
                <div class="unlock-badge">✓ Completado</div>
                <div class="achievement-unlocked-date">
                    🎉 Desbloqueado el ${formattedDate}
                </div>
            `;
        } else {
            progressHTML = `
                <div class="achievement-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${achievement.percentage}%">
                            ${Math.round(achievement.percentage)}%
                        </div>
                    </div>
                    <div class="progress-text">
                        ${achievement.progress} / ${achievement.requirement}
                    </div>
                </div>
            `;
        }
        
        card.innerHTML = `
            ${unlockedHTML}
            <div class="achievement-header">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-description">${achievement.description}</div>
                </div>
            </div>
            ${progressHTML}
        `;
        
        grid.appendChild(card);
    });
}

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        achievementsFilter = btn.dataset.filter;
        renderAchievements();
    });
});

document.getElementById('history-filter').addEventListener('change', (e) => {
    currentFilter = e.target.value;
    renderHistory();
});

document.getElementById('back-button').addEventListener('click', () => {
    window.location.href = 'index.html';
});

document.getElementById('logout-button').addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = 'landing.html';
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        alert('Error al cerrar sesión');
    }
});
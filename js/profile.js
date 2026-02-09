import { auth } from "./firebase_init.js";
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  getUserData, 
  getUserDogs, 
  getAllAchievements 
} from './firebase_database.js';

let currentUser = null;
let currentFilter = 'all';
let achievementsFilter = 'all';

onAuthStateChanged(auth, async (user) => {
    if (!user) 
    {
      window.location.href = '../index.html';
    } 
    else 
    {
      currentUser = user;
      await loadProfile();
    }
});

async function loadProfile() 
{
    try 
    {
      document.getElementById('user-email').textContent = currentUser.email;

      const userData = await getUserData(currentUser.uid);
      const userDogs = await getUserDogs(currentUser.uid);

      if (!userData) 
      {
        console.error('No se encontraron datos del usuario');
        return;
      }

      const favorites = userDogs.filter(dog => dog.isFavorite);

      document.getElementById('total-favorites').textContent = userData.totalFavorites || 0;
      document.getElementById('total-likes').textContent = userData.totalLikes || 0;
      document.getElementById('total-dislikes').textContent = userData.totalDislikes || 0;
      document.getElementById('total-dogs').textContent = userData.totalDogs || 0;

      renderFavorites(favorites);
      renderHistory(userData.history || []);
      await renderAchievements(userData);
    } 
    catch (error) 
    {
      console.error('Error cargando perfil:', error);
      alert('Error cargando tu perfil. Por favor recarga la página.');
    }
}

function renderFavorites(favorites) 
{
    const favoritesList = document.getElementById('favorites-list');

    if (favorites.length === 0) 
    {
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

function renderHistory(history) 
{
    const tbody = document.getElementById('history-tbody');
    let filteredHistory = history;
    if (currentFilter !== 'all') 
    {
      filteredHistory = history.filter(entry => entry.action === currentFilter);
    }

    if (filteredHistory.length === 0) 
    {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-message">No hay acciones registradas todavía</td></tr>';
      return;
    }

    tbody.innerHTML = '';

    filteredHistory.forEach(entry => {
      const row = document.createElement('tr');
      const date = new Date(entry.timestamp);
      const formattedDate = format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
      const formattedTime = format(date, 'HH:mm:ss', { locale: es });

      let actionText = '';
      let actionClass = '';
      switch (entry.action) 
      {
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

async function renderAchievements(userData) 
{
    try 
    {
      const allAchievements = await getAllAchievements();
      const achievementsProgress = userData.achievementsProgress || {};
      const userDogs = await getUserDogs(currentUser.uid);
      
      const grid = document.getElementById('achievements-grid');
      
      const achievementsWithProgress = allAchievements.map(achievement => {
      let progress = 0;
      
      switch (achievement.category) 
      {
        case 'likes':
          progress = userData.totalLikes || 0;
          break;
        case 'favorites':
          progress = userData.totalFavorites || 0;
          break;
        case 'dislikes':
          progress = userData.totalDislikes || 0;
          break;
        case 'dogs':
          progress = userData.totalDogs || 0;
          break;
        case 'special':
          if (achievement.id === 'balanced_voter') 
          {
            const likes = userData.totalLikes || 0;
            const dislikes = userData.totalDislikes || 0;
            progress = (likes >= 10 && dislikes >= 10 && likes === dislikes) ? 1 : 0;
          } 
          else if (achievement.id === 'all_favorites_liked') 
          {
            const favorites = userDogs.filter(dog => dog.isFavorite);
            const allFavoritesLiked = favorites.length > 0 && favorites.every(dog => dog.isLiked);
            progress = (userData.totalFavorites >= 5 && allFavoritesLiked) ? 1 : 0;
          }
          break;
      }
      
      const progressData = achievementsProgress[achievement.id];
      const isUnlocked = !!progressData?.unlockedAt;
      const percentage = Math.min(100, (progress / achievement.requirement) * 100);
      
      return {
        ...achievement,
        progress: progress,
        isUnlocked: isUnlocked,
        unlockedAt: progressData?.unlockedAt || null,
        percentage: percentage
      };
    });
    
    let filteredAchievements = achievementsWithProgress;
    if (achievementsFilter === 'unlocked') 
    {
      filteredAchievements = achievementsWithProgress.filter(a => a.isUnlocked);
    } 
    else if (achievementsFilter === 'locked') 
    {
      filteredAchievements = achievementsWithProgress.filter(a => !a.isUnlocked);
    }
    
    if (filteredAchievements.length === 0) 
    {
      grid.innerHTML = '<p class="empty-message">No hay logros en esta categoría</p>';
      return;
    }
    
    grid.innerHTML = '';
    
    filteredAchievements.forEach(achievement => {
      const card = document.createElement('div');
      card.className = `achievement-card ${achievement.isUnlocked ? 'unlocked' : 'locked'}`;
      
      let progressHTML = '';
      let unlockedHTML = '';
      
      if (achievement.isUnlocked) 
      {
        const unlockedDate = new Date(achievement.unlockedAt);
        const formattedDate = format(unlockedDate, "d 'de' MMMM 'de' yyyy", { locale: es });
        unlockedHTML = `
          <div class="unlock-badge">✓ Completado</div>
          <div class="achievement-unlocked-date">
            🎉 Desbloqueado el ${formattedDate}
          </div>
        `;
      } 
      else 
      {
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
  catch (error) 
  {
    console.error('Error renderizando logros:', error);
    document.getElementById('achievements-grid').innerHTML = '<p class="empty-message">Error cargando logros</p>';
  }
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    achievementsFilter = btn.dataset.filter;
    
    const userData = await getUserData(currentUser.uid);
    await renderAchievements(userData);
  });
});

document.getElementById('history-filter').addEventListener('change', async (e) => {
  currentFilter = e.target.value;
  const userData = await getUserData(currentUser.uid);
  renderHistory(userData.history || []);
});

document.getElementById('back-button').addEventListener('click', () => {
  window.location.href = 'main.html';
});

document.getElementById('logout-button').addEventListener('click', async () => {
  try 
  {
    await signOut(auth);
    window.location.href = 'index.html';
  } 
  catch (error) 
  {
    console.error('Error al cerrar sesión:', error);
    alert('Error al cerrar sesión');
  }
});
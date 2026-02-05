import { formatISO } from 'date-fns';

// Logros
export const ACHIEVEMENTS = [
  {
    id: 'first_like',
    name: 'Primer Amor',
    description: 'Dale tu primer me gusta a un perro',
    icon: '❤️',
    category: 'likes',
    requirement: 1,
    checkProgress: (stats) => stats.totalLikes
  },
  {
    id: 'likes_10',
    name: 'Amante de Perros',
    description: 'Dale me gusta a 10 perros',
    icon: '💕',
    category: 'likes',
    requirement: 10,
    checkProgress: (stats) => stats.totalLikes
  },
  {
    id: 'likes_50',
    name: 'Super Fan',
    description: 'Dale me gusta a 50 perros',
    icon: '💖',
    category: 'likes',
    requirement: 50,
    checkProgress: (stats) => stats.totalLikes
  },
  {
    id: 'likes_100',
    name: 'Leyenda del Amor',
    description: 'Dale me gusta a 100 perros',
    icon: '💝',
    category: 'likes',
    requirement: 100,
    checkProgress: (stats) => stats.totalLikes
  },
  {
    id: 'first_favorite',
    name: 'Primera Estrella',
    description: 'Añade tu primer favorito',
    icon: '⭐',
    category: 'favorites',
    requirement: 1,
    checkProgress: (stats) => stats.totalFavorites
  },
  {
    id: 'favorites_5',
    name: 'Coleccionista',
    description: 'Añade 5 favoritos',
    icon: '🌟',
    category: 'favorites',
    requirement: 5,
    checkProgress: (stats) => stats.totalFavorites
  },
  {
    id: 'favorites_10',
    name: 'Estrella Fugaz',
    description: 'Añade 10 favoritos',
    icon: '✨',
    category: 'favorites',
    requirement: 10,
    checkProgress: (stats) => stats.totalFavorites
  },
  {
    id: 'favorites_20',
    name: 'Constelación',
    description: 'Añade 20 favoritos',
    icon: '🌠',
    category: 'favorites',
    requirement: 20,
    checkProgress: (stats) => stats.totalFavorites
  },
  {
    id: 'first_dislike',
    name: 'Primera Crítica',
    description: 'Dale tu primer dislike',
    icon: '🤮',
    category: 'dislikes',
    requirement: 1,
    checkProgress: (stats) => stats.totalDislikes
  },
  {
    id: 'dislikes_10',
    name: 'Crítico Exigente',
    description: 'Dale dislike a 10 perros',
    icon: '👎',
    category: 'dislikes',
    requirement: 10,
    checkProgress: (stats) => stats.totalDislikes
  },
  {
    id: 'add_dogs_10',
    name: 'Descubridor',
    description: 'Añade 10 perros a la lista',
    icon: '🔍',
    category: 'dogs',
    requirement: 10,
    checkProgress: (stats) => stats.totalDogs
  },
  {
    id: 'add_dogs_50',
    name: 'Explorador',
    description: 'Añade 50 perros a la lista',
    icon: '🗺️',
    category: 'dogs',
    requirement: 50,
    checkProgress: (stats) => stats.totalDogs
  },
  {
    id: 'add_dogs_100',
    name: 'Maestro Explorador',
    description: 'Añade 100 perros a la lista',
    icon: '🏆',
    category: 'dogs',
    requirement: 100,
    checkProgress: (stats) => stats.totalDogs
  },
  {
    id: 'balanced_voter',
    name: 'Votante Equilibrado',
    description: 'Ten la misma cantidad de likes y dislikes (mínimo 10 de cada)',
    icon: '⚖️',
    category: 'special',
    requirement: 1,
    checkProgress: (stats) => {
      if (stats.totalLikes >= 10 && stats.totalDislikes >= 10 && stats.totalLikes === stats.totalDislikes) {
        return 1;
      }
      return 0;
    }
  },
  {
    id: 'all_favorites_liked',
    name: 'Amor Verdadero',
    description: 'Dale like a todos tus favoritos (mínimo 5 favoritos)',
    icon: '💗',
    category: 'special',
    requirement: 1,
    checkProgress: (stats) => {
      if (stats.totalFavorites >= 5 && stats.allFavoritesLiked) {
        return 1;
      }
      return 0;
    }
  }
];

// Stats
export function getCurrentStats() {
  const perricosArray = JSON.parse(localStorage.getItem('perricosArray') || '[]');
  const history = JSON.parse(localStorage.getItem('userHistory') || '[]');
  
  const favorites = perricosArray.filter(dog => dog.isFavorite);
  const totalLikes = history.filter(entry => entry.action === 'like').length;
  const totalDislikes = history.filter(entry => entry.action === 'dislike').length;
  
  const allFavoritesLiked = favorites.length > 0 && favorites.every(dog => dog.isLiked);
  
  return {
    totalFavorites: favorites.length,
    totalLikes: totalLikes,
    totalDislikes: totalDislikes,
    totalDogs: perricosArray.length,
    allFavoritesLiked: allFavoritesLiked
  };
}

export function checkAchievements() {
  const stats = getCurrentStats();
  const unlockedAchievements = JSON.parse(localStorage.getItem('achievements') || '{}');
  let newUnlocks = [];
  
  ACHIEVEMENTS.forEach(achievement => {
    const progress = achievement.checkProgress(stats);
    const isCompleted = progress >= achievement.requirement;
    
    if (isCompleted && !unlockedAchievements[achievement.id]) {
      unlockedAchievements[achievement.id] = {
        unlockedAt: formatISO(new Date()),
        progress: progress,
        requirement: achievement.requirement
      };
      newUnlocks.push(achievement);
    }
  });
  
  localStorage.setItem('achievements', JSON.stringify(unlockedAchievements));
  
  return newUnlocks; 
}

export function getAchievementsStatus() {
  const stats = getCurrentStats();
  const unlockedAchievements = JSON.parse(localStorage.getItem('achievements') || '{}');
  
  return ACHIEVEMENTS.map(achievement => {
    const progress = achievement.checkProgress(stats);
    const unlockData = unlockedAchievements[achievement.id];
    
    return {
      ...achievement,
      progress: progress,
      isUnlocked: !!unlockData,
      unlockedAt: unlockData?.unlockedAt || null,
      percentage: Math.min(100, (progress / achievement.requirement) * 100)
    };
  });
}
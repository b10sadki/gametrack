// Gestion locale des jeux et de leurs statuts
// Utilise localStorage pour la persistance des données

import { Game } from './api';

// Types pour la gestion des statuts
export type GameStatus = 'backlog' | 'playing' | 'completed' | 'wishlist' | 'none';

export interface UserGame extends Game {
  status: GameStatus;
  dateAdded: string;
  lastModified: string;
  rating?: number; // 1-5 stars
  notes?: string; // Personal notes and reviews
  playTime?: number; // Hours played
}

// Clé pour le stockage localStorage
const STORAGE_KEY = 'gametrack_user_games';

// Récupérer tous les jeux de l'utilisateur
export function getUserGames(): UserGame[] {
  try {
    const storedGames = localStorage.getItem(STORAGE_KEY);
    if (!storedGames) {
      return [];
    }
    return JSON.parse(storedGames);
  } catch (error) {
    console.error('Erreur lors de la récupération des jeux:', error);
    return [];
  }
}

// Récupérer un jeu spécifique
export function getUserGame(gameId: number): UserGame | undefined {
  const games = getUserGames();
  return games.find(game => game.id === gameId);
}

// Ajouter ou mettre à jour un jeu
export function saveUserGame(game: Game, status: GameStatus, additionalData?: Partial<Pick<UserGame, 'rating' | 'notes' | 'playTime'>>): void {
  try {
    const games = getUserGames();
    const now = new Date().toISOString();
    
    // Vérifier si le jeu existe déjà
    const existingIndex = games.findIndex(g => g.id === game.id);
    
    if (existingIndex >= 0) {
      // Mettre à jour le jeu existant
      games[existingIndex] = {
        ...games[existingIndex],
        ...game,
        status,
        lastModified: now,
        ...additionalData
      };
    } else {
      // Ajouter un nouveau jeu
      games.push({
        ...game,
        status,
        dateAdded: now,
        lastModified: now,
        ...additionalData
      });
    }
    
    // Sauvegarder dans localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du jeu:', error);
  }
}

// Supprimer un jeu
export function removeUserGame(gameId: number): void {
  try {
    const games = getUserGames();
    const updatedGames = games.filter(game => game.id !== gameId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGames));
  } catch (error) {
    console.error('Erreur lors de la suppression du jeu:', error);
  }
}

// Filtrer les jeux par statut
export function filterGamesByStatus(status: GameStatus | 'all'): UserGame[] {
  const games = getUserGames();
  
  if (status === 'all') {
    return games;
  }
  
  return games.filter(game => game.status === status);
}

// Filtrer les jeux par plateforme
export function filterGamesByPlatform(platformId: number): UserGame[] {
  const games = getUserGames();
  
  return games.filter(game => 
    game.platforms.some(platform => platform.platform.id === platformId)
  );
}

// Rechercher dans les jeux locaux
export function searchUserGames(query: string): UserGame[] {
  if (!query.trim()) {
    return getUserGames();
  }
  
  const games = getUserGames();
  const lowerQuery = query.toLowerCase();
  
  return games.filter(game => 
    game.name.toLowerCase().includes(lowerQuery)
  );
}

// Mettre à jour les données supplémentaires d'un jeu
export function updateUserGameData(gameId: number, data: Partial<Pick<UserGame, 'rating' | 'notes' | 'playTime' | 'status'>>): void {
  try {
    const games = getUserGames();
    const gameIndex = games.findIndex(g => g.id === gameId);
    
    if (gameIndex >= 0) {
      games[gameIndex] = {
        ...games[gameIndex],
        ...data,
        lastModified: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du jeu:', error);
  }
}

// Filtrer les jeux par genre
export function filterGamesByGenre(genreIds: number[]): UserGame[] {
  if (genreIds.length === 0) return getUserGames();
  
  const games = getUserGames();
  return games.filter(game => 
    game.genres.some(genre => genreIds.includes(genre.id))
  );
}

// Exporter les données en JSON
export function exportUserGames(): string {
  const games = getUserGames();
  const exportData = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    games: games
  };
  return JSON.stringify(exportData, null, 2);
}

// Importer les données depuis JSON
export function importUserGames(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData);
    if (data.games && Array.isArray(data.games)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.games));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erreur lors de l\'importation:', error);
    return false;
  }
}

// Obtenir des statistiques sur la collection
export function getUserGameStats() {
  const games = getUserGames();
  const completedGames = games.filter(game => game.status === 'completed');
  const ratedGames = completedGames.filter(game => game.rating);
  
  return {
    total: games.length,
    backlog: games.filter(game => game.status === 'backlog').length,
    playing: games.filter(game => game.status === 'playing').length,
    completed: completedGames.length,
    wishlist: games.filter(game => game.status === 'wishlist').length,
    averageRating: ratedGames.length > 0 
      ? ratedGames.reduce((sum, game) => sum + (game.rating || 0), 0) / ratedGames.length 
      : 0,
    totalPlayTime: games.reduce((sum, game) => sum + (game.playTime || 0), 0)
  };
}

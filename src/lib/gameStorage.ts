// Local management of games and their statuses
// Uses localStorage for data persistence

import { Game } from './api';

// Types for status management
export type GameStatus = 'backlog' | 'playing' | 'completed' | 'wishlist' | 'none';

export interface UserGame extends Game {
  userId?: string; // Firebase user ID
  status: GameStatus;
  dateAdded: string;
  lastModified: string;
  rating?: number; // 1-5 stars
  notes?: string; // Personal notes and reviews
  playTime?: number; // Hours played
}

// Key for localStorage storage
const STORAGE_KEY = 'gametrack_user_games';

// Get all user games
export function getUserGames(): UserGame[] {
  try {
    const storedGames = localStorage.getItem(STORAGE_KEY);
    if (!storedGames) {
      return [];
    }
    return JSON.parse(storedGames);
  } catch (error) {
    console.error('Erreur lors de la recuperation des jeux:', error);
    return [];
  }
}

// Recuperer un jeu specifique
export function getUserGame(gameId: number): UserGame | undefined {
  const games = getUserGames();
  return games.find(game => game.id === gameId);
}

// Add or update a game
export function saveUserGame(game: Game, status: GameStatus, additionalData?: Partial<Pick<UserGame, 'rating' | 'notes' | 'playTime'>>): void {
  try {
    const games = getUserGames();
    const now = new Date().toISOString();
    
    // Verifier si le jeu existe dej
    const existingIndex = games.findIndex(g => g.id === game.id);
    
    if (existingIndex >= 0) {
      // Update existing game
      games[existingIndex] = {
        ...games[existingIndex],
        ...game,
        status,
        lastModified: now,
        ...additionalData
      };
    } else {
      // Add new game
      games.push({
        ...game,
        status,
        dateAdded: now,
        lastModified: now,
        ...additionalData
      });
    }
    
    // Save to localStorage
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

// Filter games by status
export function filterGamesByStatus(status: GameStatus | 'all'): UserGame[] {
  const games = getUserGames();
  
  if (status === 'all') {
    return games;
  }
  
  return games.filter(game => game.status === status);
}

// Filter games by platform
export function filterGamesByPlatform(platformId: number): UserGame[] {
  const games = getUserGames();
  
  return games.filter(game => 
    game.platforms.some(platform => platform.platform.id === platformId)
  );
}

// Search in local games
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

// Update additional game data
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
    console.error('Error updating game:', error);
  }
}

// Filter games by genre
export function filterGamesByGenre(genreIds: number[]): UserGame[] {
  if (genreIds.length === 0) return getUserGames();
  
  const games = getUserGames();
  return games.filter(game => 
    game.genres.some(genre => genreIds.includes(genre.id))
  );
}

// Exporter les donnees en JSON
export function exportUserGames(): string {
  const games = getUserGames();
  const exportData = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    games: games
  };
  return JSON.stringify(exportData, null, 2);
}

// Importer les donnees depuis JSON
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

// Get collection statistics
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

// Firebase-based game storage system
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Game } from './api';
import { GameStatus, UserGame } from './gameStorage';

// Collection name in Firestore
const GAMES_COLLECTION = 'userGames';

// Convert Firestore document to UserGame
function docToUserGame(doc: any): UserGame {
  const data = doc.data();
  return {
    ...data,
    id: data.id,
    dateAdded: data.dateAdded?.toDate?.()?.toISOString() || data.dateAdded,
    lastModified: data.lastModified?.toDate?.()?.toISOString() || data.lastModified
  };
}

// Convert UserGame to Firestore document
function userGameToDoc(game: UserGame) {
  return {
    ...game,
    dateAdded: Timestamp.fromDate(new Date(game.dateAdded)),
    lastModified: Timestamp.fromDate(new Date(game.lastModified))
  };
}

// Get all user games for the current user
export async function getUserGames(userId: string): Promise<UserGame[]> {
  try {
    const gamesRef = collection(db, GAMES_COLLECTION);
    const q = query(
      gamesRef,
      where('userId', '==', userId),
      orderBy('lastModified', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToUserGame);
  } catch (error) {
    console.error('Error fetching user games:', error);
    return [];
  }
}

// Get a specific user game
export async function getUserGame(userId: string, gameId: number): Promise<UserGame | undefined> {
  try {
    const gameDocRef = doc(db, GAMES_COLLECTION, `${userId}_${gameId}`);
    const gameDoc = await getDoc(gameDocRef);
    
    if (gameDoc.exists()) {
      return docToUserGame(gameDoc);
    }
    return undefined;
  } catch (error) {
    console.error('Error fetching user game:', error);
    return undefined;
  }
}

// Save or update a user game
export async function saveUserGame(
  userId: string,
  game: Game,
  status: GameStatus,
  additionalData?: Partial<Pick<UserGame, 'rating' | 'notes' | 'playTime'>>
): Promise<void> {
  try {
    const gameDocRef = doc(db, GAMES_COLLECTION, `${userId}_${game.id}`);
    const now = new Date().toISOString();
    
    // Check if game already exists
    const existingGame = await getDoc(gameDocRef);
    
    const userGame: UserGame = {
      ...game,
      userId,
      status,
      dateAdded: existingGame.exists() ? existingGame.data().dateAdded : now,
      lastModified: now,
      ...additionalData
    };
    
    await setDoc(gameDocRef, userGameToDoc(userGame));
  } catch (error) {
    console.error('Error saving user game:', error);
    throw error;
  }
}

// Remove a user game
export async function removeUserGame(userId: string, gameId: number): Promise<void> {
  try {
    const gameDocRef = doc(db, GAMES_COLLECTION, `${userId}_${gameId}`);
    await deleteDoc(gameDocRef);
  } catch (error) {
    console.error('Error removing user game:', error);
    throw error;
  }
}

// Filter games by status
export function filterGamesByStatus(games: UserGame[], status: GameStatus | 'all'): UserGame[] {
  if (status === 'all') {
    return games;
  }
  return games.filter(game => game.status === status);
}

// Filter games by platform
export function filterGamesByPlatform(games: UserGame[], platformId: number): UserGame[] {
  return games.filter(game => 
    game.platforms?.some(platform => platform.platform.id === platformId)
  );
}

// Get collection statistics
export function getUserGameStats(games: UserGame[]) {
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

// Real-time listener for user games
export function subscribeToUserGames(
  userId: string,
  callback: (games: UserGame[]) => void
): () => void {
  const gamesRef = collection(db, GAMES_COLLECTION);
  const q = query(
    gamesRef,
    where('userId', '==', userId),
    orderBy('lastModified', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const games = querySnapshot.docs.map(docToUserGame);
    callback(games);
  }, (error) => {
    console.error('Error in games subscription:', error);
  });
}

// Export user games to JSON (for backup)
export function exportUserGames(games: UserGame[]): string {
  const exportData = {
    exportDate: new Date().toISOString(),
    version: '2.0',
    source: 'firebase',
    games: games
  };
  return JSON.stringify(exportData, null, 2);
}

// Import user games from JSON
export async function importUserGames(userId: string, jsonData: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonData);
    if (data.games && Array.isArray(data.games)) {
      // Import each game
      for (const game of data.games) {
        const { status, rating, notes, playTime, ...gameData } = game;
        await saveUserGame(userId, gameData, status, { rating, notes, playTime });
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error importing games:', error);
    return false;
  }
}
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/PocketBaseAuthContext';
import { UserGame, GameStatus } from '../lib/gameStorage';
import { Game } from '../lib/api';

// Local storage functions (existing)
import {
  getUserGames as getLocalUserGames,
  saveUserGame as saveLocalUserGame,
  removeUserGame as removeLocalUserGame,
  getUserGameStats as getLocalUserGameStats,
  exportUserGames as exportLocalUserGames,
  importUserGames as importLocalUserGames
} from '../lib/gameStorage';

// Firebase functions
import {
  getUserGames as getFirebaseUserGames,
  saveUserGame as saveFirebaseUserGame,
  removeUserGame as removeFirebaseUserGame,
  getUserGameStats as getFirebaseUserGameStats,
  exportUserGames as exportFirebaseUserGames,
  importUserGames as importFirebaseUserGames,
  subscribeToUserGames
} from '../lib/firebaseGameStorage';

export function useGameStorage() {
  const { user: currentUser } = useAuth();
  const [games, setGames] = useState<UserGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrationNeeded, setMigrationNeeded] = useState(false);

  // Load games when user changes
  useEffect(() => {
    if (!currentUser) {
      setGames([]);
      setLoading(false);
      return;
    }

    loadGames();
  }, [currentUser]);

  // Set up real-time listener for Firebase
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToUserGames(currentUser.id, (firebaseGames) => {
      setGames(firebaseGames);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  const loadGames = async () => {
    if (!currentUser) return;

    setLoading(true);
    
    try {
      // Load from Firebase
      const firebaseGames = await getFirebaseUserGames(currentUser.id);
      
      // Check if we need to migrate from localStorage
      if (firebaseGames.length === 0) {
        const localGames = getLocalUserGames();
        if (localGames.length > 0) {
          setMigrationNeeded(true);
          setGames(localGames);
        }
      } else {
        setGames(firebaseGames);
      }
    } catch (error) {
      console.error('Error loading games:', error);
      // Fallback to localStorage
      const localGames = getLocalUserGames();
      setGames(localGames);
    } finally {
      setLoading(false);
    }
  };

  const migrateToFirebase = async (): Promise<boolean> => {
    if (!currentUser || !migrationNeeded) return false;

    try {
      const localGames = getLocalUserGames();
      
      // Migrate each game to Firebase
      for (const game of localGames) {
        const { status, rating, notes, playTime, ...gameData } = game;
        await saveFirebaseUserGame(currentUser.id, gameData, status, {
          rating,
          notes,
          playTime
        });
      }
      
      setMigrationNeeded(false);
      
      // Clear localStorage after successful migration
      localStorage.removeItem('gametrack_user_games');
      
      return true;
    } catch (error) {
      console.error('Migration failed:', error);
      return false;
    }
  };

  const saveGame = async (
    game: Game,
    status: GameStatus,
    additionalData?: Partial<Pick<UserGame, 'rating' | 'notes' | 'playTime'>>
  ) => {
    if (!currentUser) {
      // Fallback to localStorage if not authenticated
      saveLocalUserGame(game, status, additionalData);
      return;
    }

    try {
      await saveFirebaseUserGame(currentUser.id, game, status, additionalData);
    } catch (error) {
      console.error('Error saving game:', error);
      // Fallback to localStorage
      saveLocalUserGame(game, status, additionalData);
    }
  };

  const removeGame = async (gameId: number) => {
    if (!currentUser) {
      removeLocalUserGame(gameId);
      return;
    }

    try {
      await removeFirebaseUserGame(currentUser.id, gameId);
    } catch (error) {
      console.error('Error removing game:', error);
      removeLocalUserGame(gameId);
    }
  };

  const getStats = () => {
    if (currentUser) {
      return getFirebaseUserGameStats(games);
    }
    return getLocalUserGameStats();
  };

  const exportGames = () => {
    if (currentUser) {
      return exportFirebaseUserGames(games);
    }
    return exportLocalUserGames();
  };

  const importGames = async (jsonData: string) => {
    if (!currentUser) {
      return importLocalUserGames(jsonData);
    }

    try {
      return await importFirebaseUserGames(currentUser.id, jsonData);
    } catch (error) {
      console.error('Error importing games:', error);
      return false;
    }
  };

  return {
    games,
    loading,
    migrationNeeded,
    migrateToFirebase,
    saveGame,
    removeGame,
    getStats,
    exportGames,
    importGames,
    refreshGames: loadGames
  };
}
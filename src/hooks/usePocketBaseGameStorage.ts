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

// PocketBase functions
import {
  getUserGames as getPocketBaseUserGames,
  saveUserGame as savePocketBaseUserGame,
  removeUserGame as removePocketBaseUserGame,
  getUserGameStats as getPocketBaseUserGameStats,
  exportUserGames as exportPocketBaseUserGames,
  importUserGames as importPocketBaseUserGames,
  subscribeToUserGames
} from '../lib/pocketbaseGameStorage';

export function useGameStorage() {
  const { user } = useAuth();
  const [games, setGames] = useState<UserGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrationNeeded, setMigrationNeeded] = useState(false);

  // Load games when user changes
  useEffect(() => {
    if (!user) {
      setGames([]);
      setLoading(false);
      return;
    }

    loadGames();
  }, [user]);

  // Set up real-time listener for PocketBase
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserGames(user.id, (pocketbaseGames) => {
      setGames(pocketbaseGames);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const loadGames = async () => {
    if (!user) return;

    setLoading(true);
    
    try {
      // Load from PocketBase
      const pocketbaseGames = await getPocketBaseUserGames(user.id);
      
      // Check if we need to migrate from localStorage
      if (pocketbaseGames.length === 0) {
        const localGames = getLocalUserGames();
        if (localGames.length > 0) {
          setMigrationNeeded(true);
          setGames(localGames);
        }
      } else {
        setGames(pocketbaseGames);
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

  const migrateToPocketBase = async (): Promise<boolean> => {
    if (!user || !migrationNeeded) return false;

    try {
      const localGames = getLocalUserGames();
      
      // Migrate each game to PocketBase
      for (const game of localGames) {
        const { status, rating, notes, playTime, ...gameData } = game;
        await savePocketBaseUserGame(user.id, gameData, status, {
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
    if (!user) {
      // Fallback to localStorage if not authenticated
      saveLocalUserGame(game, status, additionalData);
      return;
    }

    try {
      await savePocketBaseUserGame(user.id, game, status, additionalData);
    } catch (error) {
      console.error('Error saving game:', error);
      // Fallback to localStorage
      saveLocalUserGame(game, status, additionalData);
    }
  };

  const removeGame = async (gameId: number) => {
    if (!user) {
      removeLocalUserGame(gameId);
      return;
    }

    try {
      await removePocketBaseUserGame(user.id, gameId);
    } catch (error) {
      console.error('Error removing game:', error);
      removeLocalUserGame(gameId);
    }
  };

  const getStats = () => {
    if (user) {
      return getPocketBaseUserGameStats(games);
    }
    return getLocalUserGameStats();
  };

  const exportGames = async () => {
    if (user) {
      return await exportPocketBaseUserGames(user.id);
    }
    return exportLocalUserGames();
  };

  const importGames = async (jsonData: string) => {
    if (!user) {
      return importLocalUserGames(jsonData);
    }

    try {
      const games = JSON.parse(jsonData);
      await importPocketBaseUserGames(user.id, games);
      return true;
    } catch (error) {
      console.error('Error importing games:', error);
      return false;
    }
  };

  return {
    games,
    loading,
    migrationNeeded,
    migrateToFirebase: migrateToPocketBase, // Keep the same name for compatibility
    saveGame,
    removeGame,
    getStats,
    exportGames,
    importGames,
    refreshGames: loadGames
  };
}
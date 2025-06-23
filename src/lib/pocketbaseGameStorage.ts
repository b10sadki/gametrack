import { pb, PBUserGame } from './pocketbase';
import { Game } from './api';
import { GameStatus, UserGame } from './gameStorage';

// Collection name in PocketBase
const GAMES_COLLECTION = 'user_games';

// Convert PocketBase record to UserGame
function pbRecordToUserGame(record: PBUserGame): UserGame {
  return {
    id: record.game_id,
    name: record.game_name,
    background_image: record.game_background_image || null,
    released: record.game_released || null,
    metacritic: record.game_metacritic || null,
    platforms: record.game_platforms || [],
    genres: record.game_genres || [],
    userId: record.user,
    status: record.status,
    rating: record.rating,
    notes: record.notes,
    playTime: record.play_time,
    dateAdded: record.date_added,
    lastModified: record.last_modified
  };
}

// Convert UserGame to PocketBase record data
function userGameToPBRecord(userId: string, game: Game, status: GameStatus, additionalData?: Partial<Pick<UserGame, 'rating' | 'notes' | 'playTime'>>): Partial<PBUserGame> {
  const now = new Date().toISOString();
  
  return {
    user: userId,
    game_id: game.id,
    game_name: game.name,
    game_background_image: game.background_image || undefined,
    game_released: game.released || undefined,
    game_metacritic: game.metacritic || undefined,
    game_platforms: game.platforms,
    game_genres: game.genres,
    status,
    rating: additionalData?.rating,
    notes: additionalData?.notes,
    play_time: additionalData?.playTime,
    date_added: now,
    last_modified: now
  };
}

// Get all user games for the current user
export async function getUserGames(userId: string): Promise<UserGame[]> {
  try {
    const records = await pb.collection(GAMES_COLLECTION).getFullList<PBUserGame>({
      filter: `user = "${userId}"`,
      sort: '-last_modified'
    });
    
    return records.map(pbRecordToUserGame);
  } catch (error) {
    console.error('Error fetching user games:', error);
    return [];
  }
}

// Get a specific user game
export async function getUserGame(userId: string, gameId: number): Promise<UserGame | undefined> {
  try {
    const records = await pb.collection(GAMES_COLLECTION).getFullList<PBUserGame>({
      filter: `user = "${userId}" && game_id = ${gameId}`
    });
    
    if (records.length > 0) {
      return pbRecordToUserGame(records[0]);
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
    // Check if game already exists
    const existingGame = await getUserGame(userId, game.id);
    
    if (existingGame) {
      // Update existing game
      const records = await pb.collection(GAMES_COLLECTION).getFullList<PBUserGame>({
        filter: `user = "${userId}" && game_id = ${game.id}`
      });
      
      if (records.length > 0) {
        const updateData = {
          status,
          rating: additionalData?.rating,
          notes: additionalData?.notes,
          play_time: additionalData?.playTime,
          last_modified: new Date().toISOString()
        };
        
        await pb.collection(GAMES_COLLECTION).update(records[0].id, updateData);
      }
    } else {
      // Create new game
      const recordData = userGameToPBRecord(userId, game, status, additionalData);
      await pb.collection(GAMES_COLLECTION).create(recordData);
    }
  } catch (error) {
    console.error('Error saving user game:', error);
    throw error;
  }
}

// Remove a user game
export async function removeUserGame(userId: string, gameId: number): Promise<void> {
  try {
    const records = await pb.collection(GAMES_COLLECTION).getFullList<PBUserGame>({
      filter: `user = "${userId}" && game_id = ${gameId}`
    });
    
    if (records.length > 0) {
      await pb.collection(GAMES_COLLECTION).delete(records[0].id);
    }
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

// Real-time subscription for user games
export function subscribeToUserGames(userId: string, callback: (games: UserGame[]) => void): () => void {
  pb.collection(GAMES_COLLECTION).subscribe('*', (_e) => {
    // Refetch user games when any change occurs
    getUserGames(userId).then(callback);
  }, {
    filter: `user = "${userId}"`
  });
  
  return () => {
    pb.collection(GAMES_COLLECTION).unsubscribe();
  };
}

// Export and import functions
export async function exportUserGames(userId: string): Promise<UserGame[]> {
  return await getUserGames(userId);
}

export async function importUserGames(userId: string, games: UserGame[]): Promise<void> {
  try {
    for (const game of games) {
      await saveUserGame(userId, game, game.status, {
        rating: game.rating,
        notes: game.notes,
        playTime: game.playTime
      });
    }
  } catch (error) {
    console.error('Error importing user games:', error);
    throw error;
  }
}
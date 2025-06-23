import PocketBase from 'pocketbase';

// PocketBase configuration
const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090');

// Enable auto cancellation for duplicate requests
pb.autoCancellation(false);

// Export the PocketBase instance
export { pb };
export default pb;

// Types for PocketBase collections
export interface PBUser {
  id: string;
  email: string;
  username?: string;
  name?: string;
  avatar?: string;
  created: string;
  updated: string;
}

export interface PBUserGame {
  id: string;
  user: string; // User ID
  game_id: number;
  game_name: string;
  game_background_image?: string;
  game_released?: string;
  game_metacritic?: number;
  game_platforms?: any[];
  game_genres?: any[];
  status: 'backlog' | 'playing' | 'completed' | 'wishlist' | 'none';
  rating?: number;
  notes?: string;
  play_time?: number;
  date_added: string;
  last_modified: string;
  created: string;
  updated: string;
}
// RAWG API for video game data retrieval
// Uses the API key provided by the user

// Cle API RAWG
const API_KEY = "2326583f87294eaeb9eba725e9af2777";
const BASE_URL = "https://api.rawg.io/api";

// RAWG platform ID mapping
export const PLATFORMS = {
  "Steam": 4,
  "PlayStation 5": 187,
  "Nintendo Switch": 7,
  "GameCube": 105,
  "PlayStation 2": 15,
  "PlayStation 3": 16,
  "Wii": 11,
  "Wii U": 10
};

// TypeScript types
export interface Game {
  id: number;
  name: string;
  background_image: string | null;
  released: string | null;
  metacritic: number | null;
  platforms: Platform[];
  genres: Genre[];
  status?: string; // Ajoute localement
}

export interface Platform {
  platform: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
}

export interface SearchParams {
  query?: string;
  platforms?: number[];
  page?: number;
  page_size?: number;
}

// Function to search for games
export async function searchGames(params: SearchParams): Promise<{ results: Game[], count: number }> {
  try {
    let url = `${BASE_URL}/games?key=${API_KEY}`;
    
    // Add search parameters
    if (params.query) {
      url += `&search=${encodeURIComponent(params.query)}`;
    }
    
    // Add platforms if specified
    if (params.platforms && params.platforms.length > 0) {
      url += `&platforms=${params.platforms.join(',')}`;
    }
    
    // Ajouter la pagination
    if (params.page) {
      url += `&page=${params.page}`;
    }
    
    if (params.page_size) {
      url += `&page_size=${params.page_size}`;
    } else {
      url += '&page_size=20'; // Default value
    }
    
    // Add filter for games since 2005
    url += '&dates=2005-01-01,2030-12-31';
    
    // Effectuer la requùte
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      results: data.results,
      count: data.count
    };
  } catch (error) {
    console.error("Erreur lors de la recherche de jeux:", error);
    throw error;
  }
}

// Function to get game details
export async function getGameDetails(gameId: number): Promise<Game> {
  try {
    const url = `${BASE_URL}/games/${gameId}?key=${API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erreur lors de la recuperation des details du jeu ${gameId}:`, error);
    throw error;
  }
}

// Function to get games by platform
export async function getGamesByPlatform(platformId: number, page: number = 1): Promise<{ results: Game[], count: number }> {
  try {
    const url = `${BASE_URL}/games?key=${API_KEY}&platforms=${platformId}&page=${page}&page_size=20&dates=2005-01-01,2030-12-31`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      results: data.results,
      count: data.count
    };
  } catch (error) {
    console.error(`Error retrieving games for platform ${platformId}:`, error);
    throw error;
  }
}

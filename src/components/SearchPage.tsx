import React, { useState, useEffect } from 'react';
import { searchGames, Game, PLATFORMS } from '../lib/api';
import { saveUserGame, getUserGame, GameStatus, UserGame } from '../lib/gameStorage';
import GameDetailsModal from './GameDetailsModal';
import { Plus, Check, Heart, Clock, Play, Trophy } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

// Game search component
const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<GameStatus>('backlog');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Perform search
  const handleSearch = async () => {
    if (!query.trim() && selectedPlatforms.length === 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await searchGames({
        query: query.trim(),
        platforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined,
        page: 1,
        page_size: 20
      });

      setGames(result.results);
      setTotalCount(result.count);
      setPage(1);
    } catch (err) {
      setError('Search error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load more results
  const loadMore = async () => {
    if (loading || games.length >= totalCount) {
      return;
    }

    setLoading(true);
    
    try {
      const nextPage = page + 1;
      const result = await searchGames({
        query: query.trim(),
        platforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined,
        page: nextPage,
        page_size: 20
      });

      setGames([...games, ...result.results]);
      setPage(nextPage);
    } catch (err) {
      setError('Error loading additional results.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle platform change
  const togglePlatform = (platformId: number) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  // Add a game to user's list
  const addToUserGames = (game: Game, status: GameStatus) => {
    if (status === 'wishlist') {
      // For wishlist, add directly
      saveUserGame(game, status);
    } else {
      // For other statuses, open modal for more details
      setSelectedGame(game);
      setPendingStatus(status);
      setIsModalOpen(true);
    }
  };

  const handleModalSave = () => {
    // The modal handles the save
    setSelectedGame(null);
    setIsModalOpen(false);
  };

  // Get the status of a game
  const getGameStatus = (gameId: number): GameStatus | null => {
    const userGame = getUserGame(gameId);
    return userGame ? userGame.status : null;
  };

  const getStatusIcon = (status: GameStatus) => {
    switch (status) {
      case 'wishlist': return <Heart className="w-4 h-4" />;
      case 'backlog': return <Clock className="w-4 h-4" />;
      case 'playing': return <Play className="w-4 h-4" />;
      case 'completed': return <Trophy className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusColor = (status: GameStatus) => {
    switch (status) {
      case 'wishlist': return 'text-purple-400 bg-purple-500/20';
      case 'backlog': return 'text-yellow-400 bg-yellow-500/20';
      case 'playing': return 'text-blue-400 bg-blue-500/20';
      case 'completed': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusLabel = (status: GameStatus) => {
    switch (status) {
      case 'wishlist': return 'Wishlist';
      case 'backlog': return 'To Play';
      case 'playing': return 'Playing';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  // Perform search when platforms change
  useEffect(() => {
    if (selectedPlatforms.length > 0 || query.trim()) {
      handleSearch();
    }
  }, [selectedPlatforms]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Netflix-style Hero Search Section */}
      <div className="relative bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Discover Games</h1>
            <p className="text-xl text-gray-300 mb-8">Find your next gaming adventure</p>
          </div>
          
          {/* Netflix-style Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for games..."
                className="w-full px-6 py-4 text-lg bg-black bg-opacity-50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent backdrop-blur-sm"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
          
          {/* Platform filters - Netflix style */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold mb-4 text-center">Filter by Platform</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {Object.entries(PLATFORMS).map(([name, id]) => (
                <button
                  key={id}
                  onClick={() => togglePlatform(id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedPlatforms.includes(id)
                      ? 'bg-red-600 text-white shadow-lg transform scale-105'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Netflix-style Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-900 bg-opacity-50 border border-red-600 text-red-200 px-6 py-4 rounded-lg mb-8">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {loading && games.length === 0 && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-400 text-lg">Discovering amazing games...</p>
          </div>
        )}

        {!loading && games.length === 0 && (query || selectedPlatforms.length > 0) && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-xl">No games found. Try different search terms or platforms.</p>
          </div>
        )}

        {!loading && games.length === 0 && !query && selectedPlatforms.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-xl">Use the search bar or select a platform to find games.</p>
          </div>
        )}

        {games.length > 0 && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Search Results</h2>
              <p className="text-gray-400">
                {totalCount} games found
              </p>
            </div>
            
            {/* Netflix-style Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {games.map(game => {
                const status = getGameStatus(game.id);
                return (
                  <div key={game.id} className="group relative cursor-pointer transition-transform duration-300 hover:scale-105">
                    <div className="aspect-[2/3] relative overflow-hidden rounded-lg bg-gray-900">
                      {game.background_image ? (
                        <img 
                          src={game.background_image} 
                          alt={game.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <span className="text-gray-500 text-sm">No Image</span>
                        </div>
                      )}
                      
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-end">
                        <div className="p-4 w-full transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">{game.name}</h3>
                          
                          {/* Rating */}
                          {game.metacritic && (
                            <div className="flex items-center mb-2">
                              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded font-bold">
                                {game.metacritic}
                              </span>
                            </div>
                          )}
                          
                          {/* Release Year */}
                          {game.released && (
                            <p className="text-gray-300 text-xs mb-2">
                              {new Date(game.released).getFullYear()}
                            </p>
                          )}
                          
                          {/* Action Buttons */}
                          {status ? (
                            <div className="flex items-center gap-1 text-green-400 text-xs">
                              <Check className="w-3 h-3" />
                              <span>In Collection</span>
                            </div>
                          ) : (
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToUserGames(game, 'wishlist');
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white p-1 rounded transition-colors"
                                title="Add to Wishlist"
                              >
                                <Heart className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToUserGames(game, 'backlog');
                                }}
                                className="bg-gray-600 hover:bg-gray-700 text-white p-1 rounded transition-colors"
                                title="Add to Backlog"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Status badge */}
                      {status && (
                        <div className="absolute top-2 left-2">
                          <div className={`px-2 py-1 rounded text-xs font-semibold ${
                            status === 'completed' ? 'bg-green-600 text-white' :
                            status === 'playing' ? 'bg-blue-600 text-white' :
                            status === 'wishlist' ? 'bg-red-600 text-white' :
                            'bg-yellow-600 text-white'
                          }`}>
                            {getStatusIcon(status)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Load More Button */}
            {games.length < totalCount && (
              <div className="mt-12 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More Games'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Game details modal */}
      {selectedGame && (
        <GameDetailsModal
          game={{
            ...selectedGame,
            status: pendingStatus,
            dateAdded: new Date().toISOString(),
            lastModified: new Date().toISOString()
          } as UserGame}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedGame(null);
          }}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
};

export default SearchPage;

import React, { useState, useEffect } from 'react';
import { searchGames, Game, PLATFORMS } from '../lib/api';
import { saveUserGame, getUserGame, GameStatus, UserGame } from '../lib/gameStorage';
import GameDetailsModal from './GameDetailsModal';
import { Plus, Check, Heart, Clock, Play, Trophy } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

// Composant de recherche de jeux
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

  // Effectuer la recherche
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
      setError('Erreur lors de la recherche. Veuillez réessayer.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Charger plus de résultats
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
      setError('Erreur lors du chargement de résultats supplémentaires.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Gérer le changement de plateforme
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

  // Effectuer la recherche lorsque les plateformes changent
  useEffect(() => {
    if (selectedPlatforms.length > 0 || query.trim()) {
      handleSearch();
    }
  }, [selectedPlatforms]);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Search Games</h1>
      
      {/* Search bar */}
      <div className="search-bar mb-6">
        <span className="search-icon">??</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search for a game..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-md"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>
      
      {/* Platform filters */}
      <div className="mb-6 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-2">Platforms</h2>
        <div className="flex flex-wrap">
          {Object.entries(PLATFORMS).map(([name, id]) => (
            <div
              key={id}
              className={`filter-chip ${selectedPlatforms.includes(id) ? 'filter-chip-active' : 'filter-chip-inactive'}`}
              onClick={() => togglePlatform(id)}
            >
              {name}
            </div>
          ))}
        </div>
      </div>
      
      {/* Search results */}
      {loading && games.length === 0 ? (
        <div className="loading-spinner" />
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : games.length === 0 ? (
        <div className="empty-message">
          {query || selectedPlatforms.length > 0 
            ? "No games found. Try different search terms or platforms."
            : "Use the search bar or select a platform to find games."}
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {totalCount} games found
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {games.map(game => {
              const status = getGameStatus(game.id);
              return (
                <div key={game.id} className="game-card bg-card rounded-lg overflow-hidden shadow-sm border">
                  <div className="aspect-video relative overflow-hidden">
                    {game.background_image ? (
                      <img 
                        src={game.background_image} 
                        alt={game.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">No image</span>
                      </div>
                    )}
                    
                    {/* Badge de statut si déjà ajouté */}
                    {status && (
                      <div className="absolute top-2 left-2">
                        <Badge className={`${getStatusColor(status)} border-0`}>
                          {getStatusIcon(status)}
                          <span className="ml-1">{getStatusLabel(status)}</span>
                        </Badge>
                      </div>
                    )}
                    
                    {/* RAWG Rating */}
                    {game.metacritic && (
                      <div className="absolute top-2 right-2">
                        <div className="flex items-center gap-1 bg-background/80 px-2 py-1 rounded">
                          <span className="text-xs font-medium">{game.metacritic}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3">
                    <h3 className="font-medium text-sm mb-2 line-clamp-2">{game.name}</h3>
                    
                    <div className="space-y-2">
                      {/* Release date */}
                      {game.released && (
                        <p className="text-xs text-muted-foreground">
                          Released: {new Date(game.released).toLocaleDateString()}
                        </p>
                      )}
                      
                      {/* Genres */}
                      <div className="flex flex-wrap gap-1">
                        {game.genres?.slice(0, 2).map(genre => (
                          <Badge key={genre.id} variant="outline" className="text-xs">
                            {genre.name}
                          </Badge>
                        ))}
                        {(game.genres?.length || 0) > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{(game.genres?.length || 0) - 2}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Platforms */}
                      <div className="flex flex-wrap gap-1">
                        {game.platforms?.slice(0, 3).map(platform => (
                          <Badge key={platform.platform.id} variant="secondary" className="text-xs">
                            {platform.platform.name}
                          </Badge>
                        ))}
                        {(game.platforms?.length || 0) > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{(game.platforms?.length || 0) - 3}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="pt-2">
                        {status ? (
                          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                            <Check className="w-4 h-4" />
                            <span className="text-center">Already in your collection</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addToUserGames(game, 'wishlist')}
                              className="h-8 text-xs px-2 flex items-center justify-center"
                            >
                              <Heart className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">Wishlist</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addToUserGames(game, 'backlog')}
                              className="h-8 text-xs px-2 flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">To Play</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addToUserGames(game, 'playing')}
                              className="h-8 text-xs px-2 flex items-center justify-center"
                            >
                              <Play className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">Playing</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addToUserGames(game, 'completed')}
                              className="h-8 text-xs px-2 flex items-center justify-center"
                            >
                              <Trophy className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">Completed</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {games.length < totalCount && (
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load more'}
              </Button>
            </div>
          )}
        </>
      )}
      
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

import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
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
=======
import { searchGames, PLATFORMS, Game } from '../lib/api';
import { saveUserGame, getUserGame, GameStatus } from '../lib/gameStorage';

// Composant de recherche de jeux
const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Effectuer la recherche
>>>>>>> cb3fb52bbf3299708f510a1cf36e06b0771e6d14
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
<<<<<<< HEAD
      setError('Search error. Please try again.');
=======
      setError('Erreur lors de la recherche. Veuillez réessayer.');
>>>>>>> cb3fb52bbf3299708f510a1cf36e06b0771e6d14
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  // Load more results
=======
  // Charger plus de résultats
>>>>>>> cb3fb52bbf3299708f510a1cf36e06b0771e6d14
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
<<<<<<< HEAD
      setError('Error loading additional results.');
=======
      setError('Erreur lors du chargement de résultats supplémentaires.');
>>>>>>> cb3fb52bbf3299708f510a1cf36e06b0771e6d14
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  // Handle platform change
=======
  // Gérer le changement de plateforme
>>>>>>> cb3fb52bbf3299708f510a1cf36e06b0771e6d14
  const togglePlatform = (platformId: number) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

<<<<<<< HEAD
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
=======
  // Ajouter un jeu à la liste de l'utilisateur
  const addGameToList = (game: Game, status: GameStatus) => {
    saveUserGame(game, status);
    // Forcer la mise à jour de l'interface
    setGames([...games]);
  };

  // Obtenir le statut actuel d'un jeu
  const getGameStatus = (gameId: number): GameStatus => {
    const userGame = getUserGame(gameId);
    return userGame?.status || 'none';
  };

  // Effectuer la recherche lorsque les plateformes changent
>>>>>>> cb3fb52bbf3299708f510a1cf36e06b0771e6d14
  useEffect(() => {
    if (selectedPlatforms.length > 0 || query.trim()) {
      handleSearch();
    }
  }, [selectedPlatforms]);

  return (
    <div className="container mx-auto px-4 py-6">
<<<<<<< HEAD
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
=======
      <h1 className="text-2xl font-bold mb-6">Rechercher des jeux</h1>
      
      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Rechercher un jeu..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? '...' : 'Rechercher'}
          </button>
        </div>
      </div>
      
      {/* Filtres de plateformes */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Plateformes</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(PLATFORMS).map(([name, id]) => (
            <button
              key={id}
              onClick={() => togglePlatform(id)}
              className={`filter-chip ${
                selectedPlatforms.includes(id) 
                  ? 'filter-chip-active' 
                  : 'filter-chip-inactive'
              }`}
            >
              {name}
            </button>
>>>>>>> cb3fb52bbf3299708f510a1cf36e06b0771e6d14
          ))}
        </div>
      </div>
      
<<<<<<< HEAD
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
                    
                    {/* Status badge if already added */}
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
=======
      {/* Message d'erreur */}
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          {error}
        </div>
      )}
      
      {/* Résultats */}
      {games.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">
            Résultats ({totalCount} jeux trouvés)
          </h3>
          
          <div className="games-grid">
            {games.map((game) => {
              const currentStatus = getGameStatus(game.id);
              
              return (
                <div key={game.id} className="game-card">
                  {game.background_image && (
                    <img
                      src={game.background_image}
                      alt={game.name}
                      className="game-card-image"
                    />
                  )}
                  
                  <div className="game-card-content">
                    <h4 className="game-card-title">{game.name}</h4>
                    
                    <div className="game-card-platforms">
                      {game.platforms?.map(p => p.platform.name).join(', ')}
                    </div>
                    
                    {game.released && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Sortie: {new Date(game.released).getFullYear()}
                      </div>
                    )}
                    
                    {game.rating && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Note: {game.rating}/5
                      </div>
                    )}
                    
                    {/* Boutons d'action */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {currentStatus === 'none' ? (
                        <>
                          <button
                            onClick={() => addGameToList(game, 'backlog')}
                            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            + À jouer
                          </button>
                          <button
                            onClick={() => addGameToList(game, 'playing')}
                            className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            + En cours
                          </button>
                          <button
                            onClick={() => addGameToList(game, 'completed')}
                            className="text-xs px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                          >
                            + Terminé
                          </button>
                        </>
                      ) : (
                        <span className={`game-card-status status-${currentStatus}`}>
                          {currentStatus === 'backlog' && 'À jouer'}
                          {currentStatus === 'playing' && 'En cours'}
                          {currentStatus === 'completed' && 'Terminé'}
                        </span>
                      )}
>>>>>>> cb3fb52bbf3299708f510a1cf36e06b0771e6d14
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
<<<<<<< HEAD
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
=======
          {/* Bouton "Charger plus" */}
          {games.length < totalCount && (
            <div className="text-center mt-6">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 disabled:opacity-50"
              >
                {loading ? 'Chargement...' : 'Charger plus'}
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Message si aucun résultat */}
      {!loading && games.length === 0 && (query.trim() || selectedPlatforms.length > 0) && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-4xl mb-4">🎮</div>
          <p>Aucun jeu trouvé pour votre recherche.</p>
          <p className="text-sm mt-2">Essayez avec d'autres mots-clés ou plateformes.</p>
        </div>
      )}
      
      {/* Message d'accueil */}
      {!loading && games.length === 0 && !query.trim() && selectedPlatforms.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-4xl mb-4">🔍</div>
          <p>Recherchez vos jeux préférés</p>
          <p className="text-sm mt-2">Utilisez la barre de recherche ou sélectionnez des plateformes.</p>
        </div>
>>>>>>> cb3fb52bbf3299708f510a1cf36e06b0771e6d14
      )}
    </div>
  );
};

<<<<<<< HEAD
export default SearchPage;
=======
export default SearchPage;
>>>>>>> cb3fb52bbf3299708f510a1cf36e06b0771e6d14

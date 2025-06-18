import React, { useState, useEffect } from 'react';
import { getUserGames, removeUserGame, GameStatus, UserGame, updateUserGameData } from '../lib/gameStorage';
import { PLATFORMS, Genre } from '../lib/api';
import { useSwipeElement } from '../hooks/use-swipe';
import { useIsMobile } from '../hooks/use-mobile';
import GameDetailsModal from './GameDetailsModal';
import GenreFilter from './GenreFilter';
import ExportImport from './ExportImport';
import { Star, Clock, Trash2, Edit, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

// Composant de liste des jeux de l'utilisateur
const MyGamesPage: React.FC = () => {
  const [games, setGames] = useState(getUserGames());
  const [currentStatus, setCurrentStatus] = useState<GameStatus | 'all'>('all');
  const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedGame, setSelectedGame] = useState<UserGame | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Rafraechir la liste des jeux
  const refreshGames = () => {
    let filteredGames = getUserGames();
    
    // Filter by status
    if (currentStatus !== 'all') {
      filteredGames = filteredGames.filter(game => game.status === currentStatus);
    }
    
    // Filter by platform
    if (selectedPlatforms.length > 0) {
      filteredGames = filteredGames.filter(game => 
        game.platforms.some(p => selectedPlatforms.includes(p.platform.id))
      );
    }
    
    // Filter by genre
    if (selectedGenres.length > 0) {
      filteredGames = filteredGames.filter(game => 
        game.genres.some(g => selectedGenres.includes(g.id))
      );
    }
    
    setGames(filteredGames);
  };
  
  // Remove a game
  const handleRemoveGame = (gameId: number) => {
    removeUserGame(gameId);
    refreshGames();
  };
  
  // Changer le filtre de statut
  const handleStatusChange = (status: GameStatus | 'all') => {
    setCurrentStatus(status);
  };
  
  // Handle platform change
  const togglePlatform = (platformId: number) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };
  
  // Mettre e jour la liste quand les filtres changent
  useEffect(() => {
    refreshGames();
  }, [currentStatus, selectedPlatforms, selectedGenres]);

  // Obtenir tous les genres disponibles
  const getAvailableGenres = (): Genre[] => {
    const allGames = getUserGames();
    const genresMap = new Map<number, Genre>();
    
    allGames.forEach(game => {
      game.genres.forEach(genre => {
        genresMap.set(genre.id, genre);
      });
    });
    
    return Array.from(genresMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  };

  const handleGameEdit = (game: UserGame) => {
    setSelectedGame(game);
    setIsModalOpen(true);
  };

  const handleModalSave = () => {
    refreshGames();
  };
  
  // Statistiques
  const allGames = getUserGames();
  const stats = {
    total: allGames.length,
    backlog: allGames.filter(g => g.status === 'backlog').length,
    playing: allGames.filter(g => g.status === 'playing').length,
    completed: allGames.filter(g => g.status === 'completed').length,
    wishlist: allGames.filter(g => g.status === 'wishlist').length,
    averageRating: (() => {
      const ratedGames = allGames.filter(g => g.rating && g.rating > 0);
      return ratedGames.length > 0 
        ? ratedGames.reduce((sum, g) => sum + (g.rating || 0), 0) / ratedGames.length 
        : 0;
    })(),
    totalPlayTime: allGames.reduce((sum, g) => sum + (g.playTime || 0), 0)
  };

  // Netflix-style Game Card Component
  const GameCard: React.FC<{ game: UserGame }> = ({ game }) => {
    const swipeRef = useSwipeElement({
      onSwipeLeft: () => isMobile && handleRemoveGame(game.id),
      onSwipeRight: () => isMobile && handleGameEdit(game),
      threshold: 100
    });

    const getStatusColor = (status: GameStatus) => {
      switch (status) {
        case 'completed': return 'bg-green-600';
        case 'playing': return 'bg-blue-600';
        case 'backlog': return 'bg-yellow-600';
        case 'wishlist': return 'bg-purple-600';
        default: return 'bg-gray-600';
      }
    };

    const getStatusIcon = (status: GameStatus) => {
      switch (status) {
        case 'wishlist': return <Heart className="w-3 h-3" />;
        default: return null;
      }
    };

    return (
      <div
        ref={swipeRef as React.RefObject<HTMLDivElement>}
        className="group relative cursor-pointer transition-transform duration-300 hover:scale-105"
        onClick={() => handleGameEdit(game)}
      >
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
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-end">
            <div className="p-4 w-full transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">{game.name}</h3>
              
              {/* Rating */}
              {game.rating && (
                <div className="flex items-center mb-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="text-white text-sm font-medium">{game.rating}/5</span>
                </div>
              )}
              
              {/* Play Time */}
              {game.playTime && game.playTime > 0 && (
                <div className="flex items-center mb-2">
                  <Clock className="w-4 h-4 text-gray-300 mr-1" />
                  <span className="text-gray-300 text-sm">{game.playTime}h played</span>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGameEdit(game);
                  }}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  <Edit className="w-3 h-3 mr-1 inline" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveGame(game.id);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  <Trash2 className="w-3 h-3 mr-1 inline" />
                  Remove
                </button>
              </div>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <div className={`px-2 py-1 rounded text-xs font-semibold text-white ${getStatusColor(game.status)}`}>
              {getStatusIcon(game.status)}
              <span className={getStatusIcon(game.status) ? 'ml-1' : ''}>
                {game.status === 'wishlist' ? 'Wishlist' :
                 game.status === 'backlog' ? 'To Play' :
                 game.status === 'playing' ? 'Playing' : 'Completed'}
              </span>
            </div>
          </div>
          
          {/* Rating Badge for completed games */}
          {game.status === 'completed' && game.rating && (
            <div className="absolute top-2 right-2">
              <div className="bg-black bg-opacity-60 px-2 py-1 rounded flex items-center">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="text-white text-xs font-medium">{game.rating}</span>
              </div>
            </div>
          )}
          
          {/* Mobile Swipe Indicator */}
          {isMobile && (
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="text-xs text-white bg-black bg-opacity-60 px-2 py-1 rounded">
                ? Remove | Edit ?
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Ma liste de jeux</h1>
      
      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
        <div className="bg-card p-3 rounded-lg text-center">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
        <div className="bg-card p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-400">{stats.wishlist}</div>
          <div className="text-xs text-muted-foreground">Souhaits</div>
        </div>
        <div className="bg-card p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-400">{stats.backlog}</div>
          <div className="text-xs text-muted-foreground">To Play</div>
        </div>
        <div className="bg-card p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.playing}</div>
          <div className="text-xs text-muted-foreground">Playing</div>
        </div>
        <div className="bg-card p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </div>
      </div>
      
      {/* Statistiques supplementaires */}
      {(stats.averageRating > 0 || stats.totalPlayTime > 0) && (
        <div className="grid grid-cols-2 gap-2 mb-6">
          {stats.averageRating > 0 && (
            <div className="bg-card p-3 rounded-lg text-center">
              <div className="text-xl font-bold flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">Note moyenne</div>
            </div>
          )}
          {stats.totalPlayTime > 0 && (
            <div className="bg-card p-3 rounded-lg text-center">
              <div className="text-xl font-bold flex items-center justify-center gap-1">
                <Clock className="w-4 h-4" />
                {stats.totalPlayTime}h
              </div>
              <div className="text-xs text-muted-foreground">Temps total</div>
            </div>
          )}
        </div>
      )}
      
      {/* Export/Import */}
      <div className="mb-6">
        <ExportImport onImportComplete={refreshGames} />
      </div>
      
      {/* Filtres de statut */}
      <div className="tabs mb-4">
        <button 
          className={`tab ${currentStatus === 'all' ? 'tab-active' : 'tab-inactive'}`}
          onClick={() => handleStatusChange('all')}
        >
          Tous
        </button>
        <button 
          className={`tab ${currentStatus === 'wishlist' ? 'tab-active' : 'tab-inactive'}`}
          onClick={() => handleStatusChange('wishlist')}
        >
          Souhaits
        </button>
        <button 
          className={`tab ${currentStatus === 'backlog' ? 'tab-active' : 'tab-inactive'}`}
          onClick={() => handleStatusChange('backlog')}
        >
          To Play
        </button>
        <button 
          className={`tab ${currentStatus === 'playing' ? 'tab-active' : 'tab-inactive'}`}
          onClick={() => handleStatusChange('playing')}
        >
          Playing
        </button>
        <button 
          className={`tab ${currentStatus === 'completed' ? 'tab-active' : 'tab-inactive'}`}
          onClick={() => handleStatusChange('completed')}
        >
          Completed
        </button>
      </div>
      
      {/* Platform and genre filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {/* Platform filters */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(PLATFORMS).map(([name, id]) => (
            <button
              key={id}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedPlatforms.includes(id)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
              onClick={() => togglePlatform(id)}
            >
              {name}
            </button>
          ))}
        </div>
        
        {/* Filtre de genre */}
        <GenreFilter
          availableGenres={getAvailableGenres()}
          selectedGenres={selectedGenres}
          onGenreChange={(genreIds: number[]) => {
            setSelectedGenres(genreIds);
          }}
        />
      </div>
      
      {/* Instructions pour mobile */}
      {isMobile && games.length > 0 && (
        <div className="bg-muted/50 p-3 rounded-lg mb-4">
          <p className="text-sm text-muted-foreground text-center">
            ? Swipe left to remove, right to edit
          </p>
        </div>
      )}
      
      {/* Liste des jeux */}
      {games.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {currentStatus === 'all' 
              ? 'No games in your collection'
        : `No ${currentStatus === 'wishlist' ? 'wishlist' :
            currentStatus === 'backlog' ? 'to play' :
            currentStatus === 'playing' ? 'playing' : 'completed'} games`
            }
          </p>
          <p className="text-sm text-muted-foreground">
            Use the Search tab to add games
          </p>
        </div>
      ) : (
        <div className="responsive-grid">
          {games.map(game => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
      
      {/* Modal de details du jeu */}
      {selectedGame && (
        <GameDetailsModal
          game={selectedGame}
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

export default MyGamesPage;

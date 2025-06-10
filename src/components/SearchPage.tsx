import React, { useState, useEffect } from 'react';
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
  useEffect(() => {
    if (selectedPlatforms.length > 0 || query.trim()) {
      handleSearch();
    }
  }, [selectedPlatforms]);

  return (
    <div className="container mx-auto px-4 py-6">
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
          ))}
        </div>
      </div>
      
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
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
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
      )}
    </div>
  );
};

export default SearchPage;
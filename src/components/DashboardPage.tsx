import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, PieChart, Pie, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell
} from 'recharts';
import { getUserGames, GameStatus, getUserGameStats } from '../lib/gameStorage';
import { PLATFORMS } from '../lib/api';
import { Star, Clock, Trophy, Heart, Gamepad2, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

// Composant Dashboard pour afficher les KPI
const DashboardPage: React.FC = () => {
  const [games, setGames] = useState(getUserGames());
  // Utiliser un effet pour mettre à jour les jeux si nécessaire
  useEffect(() => {
    const updateGames = () => {
      setGames(getUserGames());
    };
    
    // Écouter les changements potentiels dans le stockage local
    window.addEventListener('storage', updateGames);
    return () => {
      window.removeEventListener('storage', updateGames);
    };
  }, []);
  const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<GameStatus | 'all'>('all');
  
  // Couleurs pour les graphiques
  const COLORS = {
    backlog: '#3B82F6', // bleu
    playing: '#10B981', // vert
    completed: '#8B5CF6', // violet
    platforms: [
      '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', 
      '#EF4444', '#EC4899', '#6366F1', '#14B8A6'
    ]
  };
  
  // Fonction pour obtenir les jeux filtrés
  const getFilteredGames = () => {
    let filtered = games;
    
    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(game => game.status === selectedStatus);
    }
    
    // Filter by platform
    if (selectedPlatforms.length > 0) {
      filtered = filtered.filter(game => 
        game.platforms.some(p => selectedPlatforms.includes(p.platform.id))
      );
    }
    
    return filtered;
  };
  
  // Statistiques générales
  const stats = getUserGameStats();
  
  // Statistiques supplémentaires
  const additionalStats = {
    averageRating: stats.averageRating,
    totalPlayTime: stats.totalPlayTime,
    ratedGamesCount: games.filter(g => g.rating && g.rating > 0).length,
    gamesWithNotes: games.filter(g => g.notes && g.notes.trim().length > 0).length
  };

  // Préparer les données pour le graphique en donut (statuts)
  const prepareStatusData = () => {
    const filtered = getFilteredGames();
    const statusCounts = {
      wishlist: filtered.filter(g => g.status === 'wishlist').length,
      backlog: filtered.filter(g => g.status === 'backlog').length,
      playing: filtered.filter(g => g.status === 'playing').length,
      completed: filtered.filter(g => g.status === 'completed').length
    };
    
    return [
      { name: 'Wishlist', value: statusCounts.wishlist, color: '#a855f7' },
    { name: 'To Play', value: statusCounts.backlog, color: COLORS.backlog },
    { name: 'Playing', value: statusCounts.playing, color: COLORS.playing },
    { name: 'Completed', value: statusCounts.completed, color: COLORS.completed }
    ];
  };
  
  // Préparer les données pour le graphique en barres (plateformes)
  const preparePlatformData = () => {
    const filtered = getFilteredGames();
    const platformCounts: Record<string, number> = {};
    
    // Initialiser les compteurs pour chaque plateforme
    Object.entries(PLATFORMS).forEach(([name]) => {
      platformCounts[name] = 0;
    });
    
    // Compter les jeux par plateforme
    filtered.forEach(game => {
      game.platforms.forEach(p => {
        const platformName = Object.entries(PLATFORMS).find(
          ([, id]) => id === p.platform.id
        )?.[0];
        
        if (platformName) {
          platformCounts[platformName]++;
        }
      });
    });
    
    // Convertir en tableau pour le graphique
    return Object.entries(platformCounts)
      .filter(([, count]) => count > 0) // Exclure les plateformes sans jeux
      .map(([name, count], index) => ({
        name,
        count,
        color: COLORS.platforms[index % COLORS.platforms.length]
      }));
  };
  
  // Préparer les données pour le graphique en ligne (évolution temporelle)
  const prepareTimelineData = () => {
    // Simuler des données d'évolution (à remplacer par des données réelles)
    // Dans une version réelle, ces données seraient stockées avec des timestamps
    return [
      { month: 'Jan', total: 10, backlog: 7, playing: 2, completed: 1 },
    { month: 'Feb', total: 15, backlog: 10, playing: 3, completed: 2 },
    { month: 'Mar', total: 18, backlog: 11, playing: 3, completed: 4 },
    { month: 'Apr', total: 22, backlog: 13, playing: 4, completed: 5 },
    { month: 'May', total: 25, backlog: 14, playing: 4, completed: 7 },
      { month: 'Juin', total: games.length, 
        backlog: games.filter(g => g.status === 'backlog').length, 
        playing: games.filter(g => g.status === 'playing').length, 
        completed: games.filter(g => g.status === 'completed').length 
      }
    ];
  };
  
  // Calculer le temps estimé pour terminer le backlog
  const calculateBacklogTime = () => {
    const backlogGames = games.filter(g => g.status === 'backlog').length;
    // Estimation moyenne de 20 heures par jeu (à affiner avec des données RAWG)
    const estimatedHours = backlogGames * 20;
    
    // Convert to days/months for better readability
    if (estimatedHours < 24) {
      return `${estimatedHours} heures`;
    } else if (estimatedHours < 720) { // Moins d'un mois
      return `${Math.round(estimatedHours / 24)} jours`;
    } else {
      return `${Math.round(estimatedHours / 720)} mois`;
    }
  };
  
  // Gérer le changement de filtre de statut
  const handleStatusChange = (status: GameStatus | 'all') => {
    setSelectedStatus(status);
  };
  
  // Gérer le changement de filtre de plateforme
  const togglePlatform = (platformId: number) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };
  
  // Données pour les graphiques
  const statusData = prepareStatusData();
  const platformData = preparePlatformData();
  const timelineData = prepareTimelineData();
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Gamepad2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Souhaits</CardTitle>
            <Heart className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">{stats.wishlist}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">To Play</CardTitle>
            <Clock className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{stats.backlog}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Playing</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{stats.playing}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Trophy className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
          </CardContent>
        </Card>
        
        {additionalStats.averageRating > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
              <Star className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">
                {additionalStats.averageRating.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                {additionalStats.ratedGamesCount} jeu{additionalStats.ratedGamesCount > 1 ? 'x' : ''} noté{additionalStats.ratedGamesCount > 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Statistiques supplémentaires */}
      {(additionalStats.totalPlayTime > 0 || additionalStats.gamesWithNotes > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {additionalStats.totalPlayTime > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Temps de jeu total</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{additionalStats.totalPlayTime}h</div>
                <p className="text-xs text-muted-foreground">
                  Moyenne: {(additionalStats.totalPlayTime / Math.max(stats.total - stats.wishlist, 1)).toFixed(1)}h par jeu
                </p>
              </CardContent>
            </Card>
          )}
          
          {additionalStats.gamesWithNotes > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Jeux avec notes</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{additionalStats.gamesWithNotes}</div>
                <p className="text-xs text-muted-foreground">
                  {((additionalStats.gamesWithNotes / stats.total) * 100).toFixed(1)}% de votre collection
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      {/* Temps estimé pour terminer le backlog */}
      <div className="bg-gray-900 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Temps estimé pour terminer votre backlog</h2>
        <div className="text-3xl font-bold text-blue-400">{calculateBacklogTime()}</div>
        <div className="text-xs text-gray-400 mt-1">
          Basé sur une estimation moyenne de 20 heures par jeu
        </div>
      </div>
      
      {/* Filtres */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Filtres</h2>
        
        {/* Filtres de statut */}
        <div className="tabs mb-4">
          <button 
            className={`tab ${selectedStatus === 'all' ? 'tab-active' : 'tab-inactive'}`}
            onClick={() => handleStatusChange('all')}
          >
            Tous
          </button>
          <button 
            className={`tab ${selectedStatus === 'backlog' ? 'tab-active' : 'tab-inactive'}`}
            onClick={() => handleStatusChange('backlog')}
          >
            To Play
          </button>
          <button 
            className={`tab ${selectedStatus === 'playing' ? 'tab-active' : 'tab-inactive'}`}
            onClick={() => handleStatusChange('playing')}
          >
            Playing
          </button>
          <button 
            className={`tab ${selectedStatus === 'completed' ? 'tab-active' : 'tab-inactive'}`}
            onClick={() => handleStatusChange('completed')}
          >
            Completed
          </button>
        </div>
        
        {/* Filtres de plateforme */}
        <div className="overflow-x-auto">
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
      </div>
      
      {/* Graphique en donut - Répartition par statut */}
      <div className="bg-gray-900 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-4">Répartition par statut</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Graphique en barres - Répartition par plateforme */}
      <div className="bg-gray-900 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-4">Répartition par plateforme</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={platformData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" tick={{ fill: '#fff' }} />
              <YAxis tick={{ fill: '#fff' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }}
              />
              <Bar dataKey="count" name="Nombre de jeux">
                {platformData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Graphique en ligne - Évolution dans le temps */}
      <div className="bg-gray-900 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-4">Évolution de votre collection</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={timelineData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="month" tick={{ fill: '#fff' }} />
              <YAxis tick={{ fill: '#fff' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="total" 
                name="Total" 
                stroke="#fff" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="backlog" 
                name="To Play" 
                stroke={COLORS.backlog} 
              />
              <Line 
                type="monotone" 
                dataKey="playing" 
                name="Playing" 
                stroke={COLORS.playing} 
              />
              <Line 
                type="monotone" 
                dataKey="completed" 
                name="Completed" 
                stroke={COLORS.completed} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

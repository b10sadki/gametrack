import React, { useState } from 'react';
import { 
  BarChart, Bar, PieChart, Pie, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell
} from 'recharts';
import { GameStatus } from '../lib/gameStorage';
import { useGameStorage } from '../hooks/usePocketBaseGameStorage';
import { PLATFORMS } from '../lib/api';
import { Star, Clock, Trophy, Heart, Gamepad2, TrendingUp } from 'lucide-react';

import MigrationBanner from './MigrationBanner';

// Composant Dashboard pour afficher les KPI
const DashboardPage: React.FC = () => {
  const { games, getStats, migrationNeeded, migrateToFirebase } = useGameStorage();
  const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<GameStatus | 'all'>('all');
  const [showMigrationBanner, setShowMigrationBanner] = useState(true);
  
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
  
  // Fonction pour obtenir les jeux filtres
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
  
  // Statistiques generales
  const stats = getStats();
  
  // Statistiques supplementaires
  const additionalStats = {
    averageRating: stats.averageRating,
    totalPlayTime: stats.totalPlayTime,
    ratedGamesCount: games.filter(g => g.rating && g.rating > 0).length,
    gamesWithNotes: games.filter(g => g.notes && g.notes.trim().length > 0).length
  };

  // Prepare data for donut chart (statuses)
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
  
  // Prepare data for bar chart (platforms)
  const preparePlatformData = () => {
    const filtered = getFilteredGames();
    const platformCounts: Record<string, number> = {};
    
    // Initialize counters for each platform
    Object.entries(PLATFORMS).forEach(([name]) => {
      platformCounts[name] = 0;
    });
    
    // Count games by platform
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
      .filter(([, count]) => count > 0) // Exclude platforms without games
      .map(([name, count], index) => ({
        name,
        count,
        color: COLORS.platforms[index % COLORS.platforms.length]
      }));
  };
  
  // Prepare data for line chart (timeline evolution)
  const prepareTimelineData = () => {
    // Simulate evolution data (to be replaced with real data)
    // Dans une version reelle, ces donnees seraient stockees avec des timestamps
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
  
  // Calculer le temps estime pour terminer le backlog
  const calculateBacklogTime = () => {
    const backlogGames = games.filter(g => g.status === 'backlog').length;
    // Average estimation of 20 hours per game (to be refined with RAWG data)
    const estimatedHours = backlogGames * 20;
    
    // Convert to days/months for better readability
    if (estimatedHours < 24) {
      return `${estimatedHours} hours`;
    } else if (estimatedHours < 720) { // Less than a month
      return `${Math.round(estimatedHours / 24)} days`;
    } else {
      return `${Math.round(estimatedHours / 720)} months`;
    }
  };
  
  // Handle status filter change
  const handleStatusChange = (status: GameStatus | 'all') => {
    setSelectedStatus(status);
  };
  
  // Handle platform filter change
  const togglePlatform = (platformId: number) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };
  
  // Donnees pour les graphiques
  const statusData = prepareStatusData();
  const platformData = preparePlatformData();
  const timelineData = prepareTimelineData();
  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Migration Banner */}
      {migrationNeeded && showMigrationBanner && (
        <div className="max-w-7xl mx-auto px-8 pt-6">
          <MigrationBanner
            onMigrate={migrateToFirebase}
            onDismiss={() => setShowMigrationBanner(false)}
          />
        </div>
      )}
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-red-900 via-black to-black py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold mb-4">Tableau de bord</h1>
          <p className="text-xl text-gray-300 mb-8">Decouvrez vos statistiques de jeu et suivez vos progres</p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <Gamepad2 className="h-8 w-8 text-red-500" />
                <span className="text-3xl font-bold">{stats.total}</span>
              </div>
              <p className="text-gray-400">Total des jeux</p>
            </div>
            
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="h-8 w-8 text-green-500" />
                <span className="text-3xl font-bold">{stats.completed}</span>
              </div>
              <p className="text-gray-400">Termines</p>
            </div>
            
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-8 w-8 text-blue-500" />
                <span className="text-3xl font-bold">{stats.playing}</span>
              </div>
              <p className="text-gray-400">En cours</p>
            </div>
            
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-8 w-8 text-yellow-500" />
                <span className="text-3xl font-bold">{stats.backlog}</span>
              </div>
              <p className="text-gray-400">A jouer</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Detailed Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <Gamepad2 className="h-6 w-6 text-gray-400" />
                <span className="text-sm text-gray-400">Total</span>
              </div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <Heart className="h-6 w-6 text-purple-400" />
                <span className="text-sm text-gray-400">Souhaits</span>
              </div>
              <div className="text-2xl font-bold text-purple-400">{stats.wishlist}</div>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-6 w-6 text-yellow-400" />
                <span className="text-sm text-gray-400">A jouer</span>
              </div>
              <div className="text-2xl font-bold text-yellow-400">{stats.backlog}</div>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-6 w-6 text-blue-400" />
                <span className="text-sm text-gray-400">En cours</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">{stats.playing}</div>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="h-6 w-6 text-green-400" />
                <span className="text-sm text-gray-400">Termines</span>
              </div>
              <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
            </div>
            
            {additionalStats.averageRating > 0 && (
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <Star className="h-6 w-6 text-yellow-400" />
                  <span className="text-sm text-gray-400">Note moyenne</span>
                </div>
                <div className="text-2xl font-bold text-yellow-400">
                  {additionalStats.averageRating.toFixed(1)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {additionalStats.ratedGamesCount} jeu{additionalStats.ratedGamesCount > 1 ? 'x' : ''} note{additionalStats.ratedGamesCount > 1 ? 's' : ''}
                </p>
              </div>
            )}
      </div>
      
        {/* Additional Stats */}
        {(additionalStats.totalPlayTime > 0 || additionalStats.gamesWithNotes > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {additionalStats.totalPlayTime > 0 && (
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-8 border border-gray-800">
                <div className="flex items-center mb-4">
                  <Clock className="h-8 w-8 text-blue-400 mr-3" />
                  <h3 className="text-xl font-semibold">Temps de jeu total</h3>
                </div>
                <div className="text-4xl font-bold text-blue-400 mb-2">{additionalStats.totalPlayTime}h</div>
                <p className="text-gray-400">
                  Moyenne: {(additionalStats.totalPlayTime / Math.max(stats.total - stats.wishlist, 1)).toFixed(1)}h par jeu
                </p>
              </div>
            )}
            
            {additionalStats.gamesWithNotes > 0 && (
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-8 border border-gray-800">
                <div className="flex items-center mb-4">
                  <Trophy className="h-8 w-8 text-yellow-400 mr-3" />
                  <h3 className="text-xl font-semibold">Jeux avec notes</h3>
                </div>
                <div className="text-4xl font-bold text-yellow-400 mb-2">{additionalStats.gamesWithNotes}</div>
                <p className="text-gray-400">
                  {((additionalStats.gamesWithNotes / stats.total) * 100).toFixed(1)}% de votre collection
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Backlog Time Estimation */}
        <div className="bg-gradient-to-r from-red-900/20 to-black/20 backdrop-blur-sm rounded-lg p-8 border border-red-800/30 mb-12">
          <div className="flex items-center mb-4">
            <Clock className="h-10 w-10 text-red-400 mr-4" />
            <div>
              <h2 className="text-2xl font-bold">Temps estime pour votre backlog</h2>
              <p className="text-gray-400">Base sur une estimation moyenne de 20 heures par jeu</p>
            </div>
          </div>
          <div className="text-5xl font-bold text-red-400">{calculateBacklogTime()}</div>
        </div>
      
        {/* Filters */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8">Filtres et analyses</h2>
          
          {/* Status filters */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-300">Statut des jeux</h3>
            <div className="flex flex-wrap gap-3">
              <button 
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  selectedStatus === 'all' 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/25' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => handleStatusChange('all')}
              >
                Tous
              </button>
              <button 
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  selectedStatus === 'backlog' 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/25' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => handleStatusChange('backlog')}
              >
                A jouer
              </button>
              <button 
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  selectedStatus === 'playing' 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/25' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => handleStatusChange('playing')}
              >
                En cours
              </button>
              <button 
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  selectedStatus === 'completed' 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/25' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => handleStatusChange('completed')}
              >
                Termines
              </button>
            </div>
          </div>
          
          {/* Platform filters */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-300">Plateformes</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PLATFORMS).map(([name, id]) => (
                <button
                  key={id}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedPlatforms.includes(id)
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/25'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={() => togglePlatform(id)}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Donut chart - Distribution by status */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-8 border border-gray-800">
            <h3 className="text-2xl font-bold mb-6 text-gray-100">Distribution par statut</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#111827', 
                      borderColor: '#374151', 
                      color: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #374151'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Bar chart - Distribution by platform */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-8 border border-gray-800">
            <h3 className="text-2xl font-bold mb-6 text-gray-100">Distribution par plateforme</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={platformData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#D1D5DB', fontSize: 12 }}
                    axisLine={{ stroke: '#374151' }}
                  />
                  <YAxis 
                    tick={{ fill: '#D1D5DB', fontSize: 12 }}
                    axisLine={{ stroke: '#374151' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#111827', 
                      borderColor: '#374151', 
                      color: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #374151'
                    }}
                  />
                  <Bar dataKey="count" name="Nombre de jeux" radius={[4, 4, 0, 0]}>
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Line chart - Evolution over time */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-8 border border-gray-800">
          <h3 className="text-2xl font-bold mb-6 text-gray-100">evolution de votre collection</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={timelineData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#D1D5DB', fontSize: 12 }}
                  axisLine={{ stroke: '#374151' }}
                />
                <YAxis 
                  tick={{ fill: '#D1D5DB', fontSize: 12 }}
                  axisLine={{ stroke: '#374151' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111827', 
                    borderColor: '#374151', 
                    color: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #374151'
                  }}
                />
                <Legend 
                  wrapperStyle={{ color: '#D1D5DB' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  name="Total" 
                  stroke="#fff" 
                  strokeWidth={3}
                  activeDot={{ r: 6, fill: '#fff' }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="backlog" 
                  name="A jouer" 
                  stroke={COLORS.backlog} 
                  strokeWidth={2}
                  activeDot={{ r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="playing" 
                  name="En cours" 
                  stroke={COLORS.playing} 
                  strokeWidth={2}
                  activeDot={{ r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  name="Termines" 
                  stroke={COLORS.completed} 
                  strokeWidth={2}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

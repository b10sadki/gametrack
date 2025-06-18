import React, { useState, useEffect } from 'react';
import { Search, Library, BarChart3, Download, LogOut } from 'lucide-react';
import SearchPage from './components/SearchPage';
import MyGamesPage from './components/MyGamesPage';
import DashboardPage from './components/DashboardPage';
import LoginPage from './components/LoginPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

// Composant principal de l'application
const AppContent: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'search' | 'myGames' | 'dashboard'>('search');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Gerer l'evenement d'installation PWA
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Empecher Chrome 67+ d'afficher automatiquement la banniere d'installation
      e.preventDefault();
      // Store the event to trigger it later
      setDeferredPrompt(e);
      // Mettre e jour l'interface pour montrer le bouton d'installation
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    };
  }, []);

  // Installer l'application
  const handleInstallClick = () => {
    if (!deferredPrompt) {
      return;
    }

    // Afficher la banniere d'installation
    deferredPrompt.prompt();

    // Attendre la reponse de l'utilisateur
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Netflix-style PWA Installation Banner */}
      {showInstallBanner && (
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-3 text-center relative">
          <span className="mr-4">Install GameTracker for the ultimate gaming experience!</span>
          <button
            onClick={handleInstallClick}
            className="bg-white text-red-600 px-4 py-1 rounded font-semibold hover:bg-gray-100 transition-colors mr-2"
          >
            <Download className="inline w-4 h-4 mr-1" />
            Install
          </button>
          <button
            onClick={() => setShowInstallBanner(false)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors text-xl"
          >
            ?
          </button>
        </div>
      )}

      {/* Netflix-style Header */}
      <header className="bg-black bg-opacity-90 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Netflix-style Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-red-600 tracking-tight">GAMETRACKER</h1>
            </div>
            
            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300 hidden sm:block">
                {currentUser?.email}
              </span>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
            
            {/* Netflix-style Navigation */}
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => setActiveTab('search')}
                className={`text-sm font-medium transition-colors duration-200 hover:text-gray-300 ${
                  activeTab === 'search'
                    ? 'text-white'
                    : 'text-gray-400'
                }`}
              >
                Browse
              </button>
              
              <button
                onClick={() => setActiveTab('myGames')}
                className={`text-sm font-medium transition-colors duration-200 hover:text-gray-300 ${
                  activeTab === 'myGames'
                    ? 'text-white'
                    : 'text-gray-400'
                }`}
              >
                My List
              </button>
              
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`text-sm font-medium transition-colors duration-200 hover:text-gray-300 ${
                  activeTab === 'dashboard'
                    ? 'text-white'
                    : 'text-gray-400'
                }`}
              >
                Dashboard
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button className="text-white hover:text-gray-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen bg-black">
        {activeTab === 'search' && <SearchPage />}
        {activeTab === 'myGames' && <MyGamesPage />}
        {activeTab === 'dashboard' && <DashboardPage />}
      </main>

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-95 backdrop-blur-sm border-t border-gray-800 md:hidden">
        <div className="flex justify-around py-2">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex flex-col items-center px-4 py-2 transition-colors ${
              activeTab === 'search'
                ? 'text-red-600'
                : 'text-gray-400'
            }`}
          >
            <Search className="w-5 h-5" />
            <span className="text-xs mt-1">Browse</span>
          </button>
          
          <button
            onClick={() => setActiveTab('myGames')}
            className={`flex flex-col items-center px-4 py-2 transition-colors ${
              activeTab === 'myGames'
                ? 'text-red-600'
                : 'text-gray-400'
            }`}
          >
            <Library className="w-5 h-5" />
            <span className="text-xs mt-1">My List</span>
          </button>
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center px-4 py-2 transition-colors ${
              activeTab === 'dashboard'
                ? 'text-red-600'
                : 'text-gray-400'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs mt-1">Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppWrapper />
    </AuthProvider>
  );
};

const AppWrapper: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  return <AppContent />;
};

export default App;

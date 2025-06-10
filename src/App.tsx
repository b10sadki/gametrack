import React, { useState, useEffect } from 'react';
import { Search, Library, BarChart3, Download } from 'lucide-react';
import SearchPage from './components/SearchPage';
import MyGamesPage from './components/MyGamesPage';
import DashboardPage from './components/DashboardPage';
import './App.css';

// Composant principal de l'application
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'myGames' | 'dashboard'>('search');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Gérer l'événement d'installation PWA
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Empêcher Chrome 67+ d'afficher automatiquement la bannière d'installation
      e.preventDefault();
      // Store the event to trigger it later
      setDeferredPrompt(e);
      // Mettre à jour l'interface pour montrer le bouton d'installation
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

    // Afficher la bannière d'installation
    deferredPrompt.prompt();

    // Attendre la réponse de l'utilisateur
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Bannière d'installation PWA */}
      {showInstallBanner && (
        <div className="bg-primary text-primary-foreground p-3 text-center">
          <span className="mr-4">Installer GameTracker pour une meilleure expérience !</span>
          <button
            onClick={handleInstallClick}
            className="bg-white text-primary px-4 py-1 rounded hover:bg-gray-100 transition-colors mr-2"
          >
            <Download className="inline w-4 h-4 mr-1" />
            Installer
          </button>
          <button
            onClick={() => setShowInstallBanner(false)}
            className="text-primary-foreground hover:text-gray-200 transition-colors"
          >
            ?
          </button>
        </div>
      )}

      {/* En-tête avec navigation */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-primary">GameTracker</h1>
            
            {/* Navigation */}
            <nav className="flex space-x-1">
              <button
                onClick={() => setActiveTab('search')}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'search'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Search className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Recherche</span>
              </button>
              
              <button
                onClick={() => setActiveTab('myGames')}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'myGames'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Library className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Ma Collection</span>
              </button>
              
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Tableau de bord</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-6">
        {activeTab === 'search' && <SearchPage />}
        {activeTab === 'myGames' && <MyGamesPage />}
        {activeTab === 'dashboard' && <DashboardPage />}
      </main>

      {/* Navigation mobile en bas */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border sm:hidden">
        <div className="flex justify-around py-2">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex flex-col items-center px-4 py-2 ${
              activeTab === 'search'
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          >
            <Search className="w-5 h-5" />
            <span className="text-xs mt-1">Recherche</span>
          </button>
          
          <button
            onClick={() => setActiveTab('myGames')}
            className={`flex flex-col items-center px-4 py-2 ${
              activeTab === 'myGames'
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          >
            <Library className="w-5 h-5" />
            <span className="text-xs mt-1">Collection</span>
          </button>
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center px-4 py-2 ${
              activeTab === 'dashboard'
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs mt-1">Tableau</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;

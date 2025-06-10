import React, { useState, useEffect } from 'react';
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

    // Attendre que l'utilisateur réponde à la bannière
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Utilisateur a accepté l\'installation');
      } else {
        console.log('Utilisateur a refusé l\'installation');
      }
      // Réinitialiser le prompt différé - il ne peut être utilisé qu'une fois
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* En-tête */}
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">GameTrack</h1>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="pb-16">
        {activeTab === 'search' ? <SearchPage /> : 
         activeTab === 'myGames' ? <MyGamesPage /> : 
         <DashboardPage />}
      </main>

      {/* Navigation en bas */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex justify-around">
          <button
            className={`flex-1 py-3 flex flex-col items-center ${activeTab === 'search' ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('search')}
          >
            <span className="text-xl">??</span>
            <span className="text-xs mt-1">Search</span>
          </button>
          <button
            className={`flex-1 py-3 flex flex-col items-center ${activeTab === 'myGames' ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('myGames')}
          >
            <span className="text-xl">??</span>
            <span className="text-xs mt-1">Ma Liste</span>
          </button>
          <button
            className={`flex-1 py-3 flex flex-col items-center ${activeTab === 'dashboard' ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="text-xl">??</span>
            <span className="text-xs mt-1">Dashboard</span>
          </button>
        </div>
      </nav>

      {/* Bannière d'installation PWA */}
      {showInstallBanner && (
        <div className="install-banner">
          <div>Installez GameTrack sur votre écran d'accueil</div>
          <button className="install-button" onClick={handleInstallClick}>
            Installer
          </button>
        </div>
      )}
    </div>
  );
};

export default App;

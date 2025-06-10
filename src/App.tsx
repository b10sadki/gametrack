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

  // G�rer l'�v�nement d'installation PWA
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Emp�cher Chrome 67+ d'afficher automatiquement la banni�re d'installation
      e.preventDefault();
      // Store the event to trigger it later
      setDeferredPrompt(e);
      // Mettre � jour l'interface pour montrer le bouton d'installation
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

    // Afficher la banni�re d'installation
    deferredPrompt.prompt();

    // Attendre que l'utilisateur r�ponde � la banni�re
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Utilisateur a accept� l\'installation');
      } else {
        console.log('Utilisateur a refus� l\'installation');
      }
      // R�initialiser le prompt diff�r� - il ne peut �tre utilis� qu'une fois
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* En-t�te */}
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

      {/* Banni�re d'installation PWA */}
      {showInstallBanner && (
        <div className="install-banner">
          <div>Installez GameTrack sur votre �cran d'accueil</div>
          <button className="install-button" onClick={handleInstallClick}>
            Installer
          </button>
        </div>
      )}
    </div>
  );
};

export default App;

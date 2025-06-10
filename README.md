# GameTrack - Application de suivi de jeux vidéo

GameTrack est une application web progressive (PWA) qui vous permet de suivre votre collection de jeux vidéo, avec un focus sur les plateformes Steam, PlayStation 5, Nintendo Switch, et plusieurs plateformes rétro (GameCube, PS2, PS3, Wii, WiiU).

## Fonctionnalités

- **Interface avec thème sombre** optimisée pour mobile
- **Recherche de jeux** incluant les titres récents comme Silent Hill 2 Remake et Elden Ring
- **Filtrage par plateformes**:
  - Récentes: Steam, PlayStation 5, Nintendo Switch
  - Rétro: GameCube, PlayStation 2, PlayStation 3, Wii, WiiU
- **Gestion des statuts**: À jouer (backlog), En cours, Terminé
- **Dashboard avec KPI**:
  - Statistiques générales de votre collection
  - Graphiques en barres pour les valeurs absolues
  - Graphiques en donut pour les pourcentages
  - Line charts pour les évolutions dans le temps
  - Filtres par plateforme et statut
  - Estimation du temps pour terminer votre backlog
- **Persistance locale** des données sur votre appareil
- **Installation sur écran d'accueil** comme une application native
- **Fonctionnement hors-ligne** pour consulter votre liste sans connexion

## Installation locale

### Prérequis

- Node.js 16+ et npm/pnpm

### Installation des dépendances

```bash
cd gametrack
npm install
# ou avec pnpm
pnpm install
```

### Lancement en mode développement

```bash
npm run dev
# ou avec pnpm
pnpm dev
```

### Construction pour la production

```bash
npm run build
# ou avec pnpm
pnpm build
```

### Prévisualisation de la version de production

```bash
npm run preview
# ou avec pnpm
pnpm preview
```

## Technologies utilisées

- **React 18** avec TypeScript
- **Vite** pour le build et le développement
- **Tailwind CSS** pour le styling
- **Radix UI** pour les composants accessibles
- **Recharts** pour les graphiques du dashboard
- **PWA** avec service worker pour le fonctionnement hors-ligne

## Structure du projet

```
src/
├── components/          # Composants React
│   ├── SearchPage.tsx   # Page de recherche de jeux
│   ├── MyGamesPage.tsx  # Page de gestion de la liste
│   ├── DashboardPage.tsx # Page des statistiques
│   └── ui/              # Composants UI réutilisables
├── lib/                 # Utilitaires et logique métier
│   ├── api.ts          # API pour récupérer les données de jeux
│   ├── gameStorage.ts  # Gestion du stockage local
│   └── utils.ts        # Fonctions utilitaires
├── hooks/              # Hooks React personnalisés
└── assets/             # Ressources statiques
```

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## Licence

Ce projet est sous licence MIT.
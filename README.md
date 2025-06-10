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

Le résultat de la construction se trouve dans le dossier `dist`.

## Déploiement

### Hébergement sur votre cloud personnel

1. Construisez l'application avec `npm run build`
2. Déployez le contenu du dossier `dist` sur votre serveur web
3. Assurez-vous que votre serveur est configuré pour servir correctement les fichiers statiques et le manifest.json

### Configuration HTTPS

Pour une expérience PWA complète, il est recommandé de servir l'application via HTTPS.

## Clé API RAWG

L'application utilise l'API RAWG pour récupérer les informations sur les jeux. La clé API est déjà configurée dans le code source.

Si vous souhaitez utiliser votre propre clé API:
1. Créez un compte sur [RAWG.io](https://rawg.io)
2. Obtenez une clé API sur [https://rawg.io/apidocs](https://rawg.io/apidocs)
3. Modifiez la clé API dans le fichier `src/lib/api.ts`

## Structure du projet

- `src/` - Code source de l'application
  - `components/` - Composants React
  - `lib/` - Utilitaires et API
  - `assets/` - Ressources statiques
- `public/` - Fichiers publics (manifest.json, service-worker.js, etc.)
- `dist/` - Build de production

## Personnalisation

### Thème

Le thème sombre est configuré dans `src/index.css` et utilise Tailwind CSS.

### Plateformes supportées

Vous pouvez modifier les plateformes supportées dans `src/lib/api.ts` en ajustant l'objet `PLATFORMS`.

## Licence

Ce projet est sous licence MIT.

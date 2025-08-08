# Waymaker - Application de cartographie et itinéraires

Application React utilisant l'API OpenRouteService pour calculer et afficher des itinéraires sur une carte interactive.

## 🌐 Demo en ligne

**Accédez à l'application :** [https://jeckelsister.github.io/ors-map/](https://jeckelsister.github.io/ors-map/)

## ✨ Fonctionnalités

- 🗺️ **Carte interactive** avec Leaflet
- 🚶 **Calcul d'itinéraires** pour différents modes de transport :
  - Randonnée pédestre
  - Vélo classique
  - VTT
  - Vélo électrique
- 📍 **Géolocalisation** pour définir le point de départ
- 🔍 **Recherche de lieux** avec autocomplétion
- 📊 **Informations détaillées** : distance, durée, dénivelé
- 🎨 **Traces colorées** selon le mode de transport
- 🔄 **Comparaison d'itinéraires** multiples

## 🚀 Installation et démarrage

```bash
# Installation des dépendances
npm install

# Lancement en mode développement
npm run dev

# Build de production
npm run build

# Aperçu de la build
npm run preview
```

## 🧪 Tests

Le projet utilise **Vitest** et **React Testing Library** pour les tests unitaires.

```bash
# Lancer les tests en mode watch
npm run test

# Lancer les tests une fois
npm run test:run

# Interface graphique des tests
npm run test:ui

# Rapport de couverture
npm run test:coverage
```

### Structure des tests

```
tests/
├── components/          # Tests des composants React
├── hooks/              # Tests des hooks personnalisés
├── services/           # Tests des services/API
├── ui/                 # Tests des composants UI
├── setup.js            # Configuration globale des tests
└── README.md           # Documentation des tests
```

Les tests suivent la même structure que le code source dans `src/`.

## 🏗️ Architecture

```
src/
├── components/         # Composants React
├── hooks/             # Hooks personnalisés
├── services/          # Services et API
├── constants/         # Constantes et configuration
├── ui/               # Composants UI réutilisables
└── types/            # Définitions TypeScript
```

## 🔧 Technologies utilisées

- **React 19** - Framework JavaScript
- **Vite** - Build tool et dev server
- **Leaflet** - Bibliothèque de cartographie
- **Tailwind CSS** - Framework CSS utilitaire
- **Vitest** - Framework de test
- **React Testing Library** - Tests de composants
- **OpenRouteService API** - Calcul d'itinéraires
- **Nominatim API** - Géocodage et recherche

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env.local` :

```
VITE_ORS_API_KEY=votre_clé_api_openrouteservice
```

### API OpenRouteService

1. Créez un compte sur [openrouteservice.org](https://openrouteservice.org/)
2. Générez une clé API
3. Ajoutez-la dans votre fichier `.env.local`

## 📝 Scripts disponibles

- `npm run dev` - Serveur de développement
- `npm run build` - Build de production
- `npm run preview` - Aperçu de la build
- `npm run lint` - Vérification ESLint
- `npm run test` - Tests en mode watch
- `npm run test:run` - Tests une fois
- `npm run test:ui` - Interface graphique des tests
- `npm run test:coverage` - Rapport de couverture
- `npm run deploy` - Déployer sur GitHub Pages

## 🚀 Déploiement

L'application est automatiquement déployée sur GitHub Pages à chaque push sur la branche `main`.

### Déploiement manuel

```bash
# Build et déploiement
npm run deploy
```

### URL de production

L'application est accessible à : [https://jeckelsister.github.io/ors-map/](https://jeckelsister.github.io/ors-map/)

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

### Standards de code

- Utilisez ESLint pour le style de code
- Écrivez des tests pour les nouvelles fonctionnalités
- Suivez la structure des dossiers existante
- Documentez les composants complexes

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

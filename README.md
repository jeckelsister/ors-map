# 🥾 WayMaker - Planificateur de Randonnées Avancé

Application React moderne de planification de randonnées avec profils altimétriques, export GPX et gestion des points d'intérêt. Utilise l'API OpenRouteService pour des calculs d'itinéraires précis et des données cartographiques françaises spécialisées.

## 🌐 Demo en ligne

**🚀 Accédez à l'application :** [https://jeckelsister.github.io/ors-map/](https://jeckelsister.github.io/ors-map/)

---

## 🎯 **Points Techniques Clés**

### **📊 Métriques du Projet**
- **180+ tests unitaires** avec 85%+ de couverture
- **100% TypeScript** avec configuration stricte
- **Architecture modulaire** scalable et maintenable
- **Performance optimisée** : Code splitting, lazy loading, compression
- **CI/CD complet** avec déploiement automatique

### **🚀 Compétences Techniques Démontrées**
- **Frontend avancé** : React 19, hooks personnalisés, gestion d'état complexe
- **TypeScript expert** : Types avancés, génériques, type guards
- **Architecture logicielle** : Separation of concerns, patterns modernes
- **Testing** : TDD, mocking, tests d'intégration, couverture
- **Performance** : Optimisations, profiling, bundle analysis
- **DevOps** : CI/CD, déploiement automatisé, GitHub Actions
- **APIs géospatiales** : Intégration complexe, gestion d'erreurs, retry logic

### **🛠️ Défis Techniques Relevés**
- **Gestion d'état géospatial** complexe avec synchronisation carte/données
- **Optimisations mémoire** pour le rendu de milliers de points
- **Architecture modulaire** permettant l'ajout facile de nouvelles fonctionnalités
- **Parsing robuste** de fichiers GPX avec gestion d'erreurs avancée
- **Responsive design** avec adaptation mobile native

---

## ✨ Fonctionnalités Principales

### 🗺️ **Cartographie Avancée**
- **Carte interactive** multi-couches avec Leaflet
- **Fonds cartographiques spécialisés** :
  - OpenStreetMap standard
  - IGN Plan (France)
  - IGN Satellite (France)
  - Cartes topographiques pour randonnée
- **Interface 100% responsive** - mobile, tablette, desktop

### 🥾 **Planificateur de Randonnée**
- **Itinéraires multi-étapes** avec waypoints draggables
- **Profils de randonnée** : Loisir, Sportif, Expert
- **Calcul automatique** des étapes selon la distance souhaitée
- **Boucles automatiques** ou trajets linéaires
- **Profil altimétrique détaillé** avec visualisation interactive
- **Statistiques complètes** : distance, dénivelé +/-, temps estimé

### 📱 **Points d'Intérêt (POI)**
- **🏠 Refuges** : gardés, non gardés, avec informations détaillées
- **💧 Points d'eau** : sources, fontaines, rivières
- **Recherche et filtrage** des POI par type
- **Zoom automatique** sur les POI sélectionnés
- **Intégration** avec les itinéraires de randonnée

### 📁 **Export & Import GPX**
- **Export GPX** compatible avec tous les GPS et applications
- **Import GPX** pour charger des traces existantes
- **Parsing intelligent** avec gestion d'erreurs
- **Métadonnées complètes** dans les fichiers GPX

### 🗺️ **Carte Interactive Classique**
- **Calcul d'itinéraires** pour différents modes de transport :
  - 🚶 Randonnée pédestre
  - 🚴 Vélo classique
  - � VTT
  - ⚡ Vélo électrique
- **Géolocalisation** automatique
- **Recherche de lieux** avec autocomplétion avancée
- **Comparaison d'itinéraires** multiples
- **Informations détaillées** en temps réel

## 🚀 Installation et Démarrage

```bash
# Cloner le repository
git clone https://github.com/jeckelsister/ors-map.git
cd ors-map

# Installation des dépendances
npm install

# Lancement en mode développement
npm run dev

# Build de production optimisée
npm run build

# Aperçu de la build
npm run preview
```

## 🧪 Tests et Qualité

Le projet utilise **Vitest** et **React Testing Library** pour une couverture de tests complète.

```bash
# Lancer les tests en mode watch
npm run test

# Tests avec interface graphique
npm run test:ui

# Rapport de couverture détaillé
npm run test:coverage

# Vérification du code (ESLint)
npm run lint

# Correction automatique
npm run lint:fix

# Formatage du code (Prettier)
npm run format
```

### 📊 Couverture de Tests

- ✅ **Composants React** : Navigation, cartes, formulaires
- ✅ **Hooks personnalisés** : gestion d'état, géolocalisation
- ✅ **Services** : API calls, parsing GPX, calculs
- ✅ **Utilitaires** : formatage, validation, helpers

### Structure des Tests

```
tests/
├── components/          # Tests des composants React
│   ├── hiking/         # Tests planificateur randonnée
│   ├── map/            # Tests carte interactive
│   └── shared/         # Tests composants partagés
├── hooks/              # Tests hooks personnalisés
├── services/           # Tests services/API
├── ui/                # Tests composants UI
├── utils/             # Tests utilitaires
└── setup.js           # Configuration globale
```

## 🏗️ Architecture Technique

### 📁 Structure du Projet

```
src/
├── components/         # Composants React organisés par fonctionnalité
│   ├── hiking/        # Planificateur de randonnée
│   ├── map/           # Carte interactive classique
│   └── shared/        # Composants partagés (Navigation, etc.)
├── hooks/             # Hooks personnalisés React
│   ├── hiking/        # Hooks spécifiques randonnée
│   ├── map/          # Hooks gestion carte
│   └── shared/       # Hooks utilitaires
├── services/          # Services et intégrations API
├── types/            # Définitions TypeScript
├── constants/        # Configuration et constantes
├── ui/              # Composants UI réutilisables
├── utils/           # Fonctions utilitaires
└── pages/           # Pages principales de l'app
```

### 🎯 Patterns et Bonnes Pratiques

- **🔧 Architecture modulaire** : Séparation claire des responsabilités
- **♻️ Hooks personnalisés** : Logique réutilisable et testable
- **📝 TypeScript strict** : Type safety complet
- **🎨 Design system** : Composants UI cohérents
- **⚡ Optimisations performances** : Code splitting, lazy loading
- **📱 Mobile-first** : Design responsive natif

## 🔧 Technologies et Stack

### 🚀 Frontend Core
- **React 19** - Framework JavaScript moderne
- **TypeScript** - Type safety et développement robuste
- **Vite** - Build tool ultra-rapide avec HMR
- **Tailwind CSS** - Framework CSS utilitaire

### 🗺️ Cartographie et Géo
- **Leaflet** - Bibliothèque de cartographie interactive
- **OpenRouteService API** - Calcul d'itinéraires avancés
- **Nominatim API** - Géocodage et recherche de lieux
- **IGN Géoportail** - Données cartographiques françaises

### 🧪 Testing et Qualité
- **Vitest** - Framework de test moderne et rapide
- **React Testing Library** - Tests centrés utilisateur
- **ESLint + Prettier** - Qualité et formatage du code
- **GitHub Actions** - CI/CD automatisé

### 📦 Outils et Libraries
- **React Router** - Navigation SPA
- **Lucide React** - Icônes modernes
- **DnD Kit** - Drag & drop pour waypoints
- **Date-fns** - Manipulation des dates

## ⚙️ Configuration et Setup

### 🔑 Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# Clé API OpenRouteService (obligatoire)
VITE_ORS_API_KEY=votre_clé_api_openrouteservice

# Configuration optionnelle
VITE_APP_VERSION=1.0.0
VITE_ENABLE_DEBUG=false
```

### 🌍 Configuration API OpenRouteService

1. **Créez un compte** sur [openrouteservice.org](https://openrouteservice.org/)
2. **Générez une clé API** gratuite (quota : 2000 requêtes/jour)
3. **Ajoutez la clé** dans `.env.local`
4. **Redémarrez** le serveur de développement

### 🗺️ Sources Cartographiques

L'application utilise plusieurs sources de données :

- **🌍 OpenStreetMap** - Données cartographiques mondiales
- **🇫🇷 IGN Géoportail** - Cartes officielles françaises
- **📍 Nominatim** - Service de géocodage OpenStreetMap
- **🏔️ Refuges.info** - Base de données des refuges de montagne

## 📝 Scripts Disponibles

```bash
# 🚀 Développement
npm run dev              # Serveur de développement (localhost:5173)
npm run preview          # Aperçu de la build de production

# 🏗️ Build et Production
npm run build            # Build optimisée pour production
npm run deploy           # Build + déploiement automatique sur GitHub Pages

# 🧪 Tests et Qualité
npm run test             # Tests en mode watch
npm run test:run         # Tests en mode CI
npm run test:ui          # Interface graphique des tests
npm run test:coverage    # Rapport de couverture HTML

# 🔧 Code Quality
npm run lint             # Vérification ESLint
npm run lint:fix         # Correction automatique ESLint
npm run format           # Formatage Prettier
npm run format:check     # Vérification formatage
npm run type-check       # Vérification TypeScript
```

## 🚀 Déploiement et Production

### 🤖 Déploiement Automatique

L'application est **automatiquement déployée** sur GitHub Pages à chaque push sur `main` :

- ✅ **Build automatique** avec optimisations
- ✅ **Tests de validation** avant déploiement
- ✅ **Cache intelligent** pour des chargements ultra-rapides
- ✅ **PWA ready** avec service worker

### ⚡ Déploiement Manuel

```bash
# Déploiement rapide
npm run deploy

# Ou étape par étape
npm run build
npx gh-pages -d dist
```

### 🌐 URL de Production

**Application en ligne :** [https://jeckelsister.github.io/ors-map/](https://jeckelsister.github.io/ors-map/)

### 📊 Optimisations de Performance

- **📦 Code splitting** automatique par routes et features
- **🗜️ Compression gzip** pour tous les assets
- **🎯 Tree shaking** pour éliminer le code non utilisé
- **🖼️ Optimisation images** avec formats modernes
- **⚡ Lazy loading** des composants lourds
- **💾 Cache intelligent** des ressources statiques

## 🎨 Guide de Style et Développement

### 🎯 Conventions de Code

```typescript
// ✅ Nommage des composants (PascalCase)
const HikingPlannerPage: React.FC = () => {
  return <div>...</div>;
};

// ✅ Hooks personnalisés (camelCase avec 'use')
const useHikingRoute = () => {
  // logique du hook
};

// ✅ Types et interfaces (PascalCase)
interface RouteData {
  distance: number;
  duration: string;
}

// ✅ Constantes (SCREAMING_SNAKE_CASE)
const DEFAULT_ZOOM_LEVEL = 13;
```

### 📁 Organisation des Fichiers

```
src/component/hiking/
├── HikingMap.tsx              # Composant principal
├── HikingMap.test.tsx         # Tests associés
├── RouteStagesPlanner.tsx     # Sous-composants
├── ElevationProfile.tsx
└── index.ts                   # Exports publics
```

### 🧪 Standards de Tests

```typescript
// ✅ Tests descriptifs et organisés
describe('HikingMap Component', () => {
  it('should render hiking map with waypoints', () => {
    // Arrange
    const props = { waypoints: mockWaypoints };

    // Act
    render(<HikingMap {...props} />);

    // Assert
    expect(screen.getByRole('button', { name: /add waypoint/i })).toBeInTheDocument();
  });
});
```

## 🤝 Contribution et Développement

### 🔧 Setup de Développement

```bash
# 1. Fork le repository sur GitHub
# 2. Clone votre fork
git clone https://github.com/votre-username/ors-map.git
cd ors-map

# 3. Installation des dépendances
npm install

# 4. Configuration de l'environnement
cp .env.example .env.local
# Editez .env.local avec votre clé API

# 5. Lancement du serveur de dev
npm run dev
```

### 📋 Checklist avant PR

- [ ] ✅ Tous les tests passent (`npm run test:run`)
- [ ] 🔍 ESLint sans erreurs (`npm run lint`)
- [ ] 🎨 Code formaté avec Prettier (`npm run format`)
- [ ] 📝 Documentation mise à jour si nécessaire
- [ ] 🧪 Tests ajoutés pour les nouvelles fonctionnalités
- [ ] 📱 Responsive design testé sur mobile/tablet
- [ ] ⚡ Performances vérifiées (pas de régression)

### 🎯 Guidelines de Développement

#### **🚀 Nouvelles Fonctionnalités**
- Créer les composants dans le bon dossier (`components/hiking/`, `components/map/`, etc.)
- Ajouter les tests correspondants
- Documenter les nouvelles APIs/hooks
- Tester sur mobile et desktop

#### **🐛 Corrections de Bugs**
- Identifier la cause racine
- Ajouter un test qui reproduit le bug
- Corriger le bug
- Vérifier que le test passe

#### **♻️ Refactoring**
- Maintenir la couverture de tests
- Documenter les changements d'API
- Vérifier les performances
- Tester l'impact sur l'UX

### 🏷️ Convention de Commits

Utilisez les préfixes suivants pour vos commits :

```bash
feat: nouvelle fonctionnalité
fix: correction de bug
docs: mise à jour documentation
style: formatage, indentation
refactor: refactoring du code
test: ajout/modification de tests
chore: tâches de maintenance
perf: amélioration de performance
```

### 🙏 Crédits et Remerciements

- **🗺️ [OpenRouteService](https://openrouteservice.org/)** - API de calcul d'itinéraires
- **🇫🇷 [IGN Géoportail](https://geoservices.ign.fr/)** - Données cartographiques françaises
- **🌍 [OpenStreetMap](https://www.openstreetmap.org/)** - Données cartographiques mondiales
- **🏔️ [Refuges.info](https://www.refuges.info/)** - Base de données des refuges
- **💧 [DataGouv](https://www.data.gouv.fr/)** - Données publiques françaises
- **⚛️ [React](https://react.dev/)** & **🔧 [Vite](https://vitejs.dev/)** - Technologies de base
- **🗺️ [Leaflet](https://leafletjs.com/)** - Bibliothèque cartographique

---

**🚀 Prêt pour l'aventure ?** [Lancez WayMaker](https://jeckelsister.github.io/ors-map/) et planifiez votre prochaine randonnée ! 🥾⛰️

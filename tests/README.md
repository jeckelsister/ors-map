# Tests

Ce projet utilise **Vitest** et **React Testing Library** pour les tests unitaires.

## Configuration

- **Vitest** : Framework de test rapide compatible avec Jest
- **React Testing Library** : Bibliothèque pour tester les composants React
- **jsdom** : Environnement DOM pour les tests
- **@testing-library/jest-dom** : Matchers supplémentaires pour les assertions

## Scripts disponibles

```bash
# Lancer les tests en mode watch
npm run test

# Lancer les tests une fois
npm run test:run

# Lancer les tests avec l'interface graphique
npm run test:ui

# Lancer les tests avec le rapport de couverture
npm run test:coverage
```

## Structure des tests

```
tests/
├── components/
│   └── TransportModeSelector.test.jsx
├── hooks/
│   └── useAutocomplete.test.js
├── services/
│   └── mapService.test.js
├── ui/
│   └── Button.test.jsx
├── setup.js                           # Configuration globale des tests
└── README.md                          # Documentation des tests

src/
├── components/
│   └── TransportModeSelector.jsx
├── hooks/
│   └── useAutocomplete.js
├── services/
│   └── mapService.js
└── ui/
    └── Button.jsx
```

Les tests suivent la même structure que le code source dans `src/`, mais sont organisés dans un dossier `tests/` dédié.

## Mocks disponibles

### Global Setup (tests/setup.js)

- **Leaflet** : Mock complet de la bibliothèque de cartes
- **Navigator.geolocation** : Mock de l'API de géolocalisation
- **fetch** : Mock global pour les appels API

### Exemples d'utilisation

#### Test d'un composant React

```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import MonComposant from '../../src/components/MonComposant';

describe('MonComposant', () => {
  it('renders correctly', () => {
    render(<MonComposant />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<MonComposant onClick={handleClick} />);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalled();
  });
});
```

#### Test d'un hook

```javascript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import useMonHook from '../../src/hooks/useMonHook';

describe('useMonHook', () => {
  it('initializes with correct values', () => {
    const { result } = renderHook(() => useMonHook());
    expect(result.current.value).toBe(initialValue);
  });

  it('updates value correctly', () => {
    const { result } = renderHook(() => useMonHook());

    act(() => {
      result.current.setValue('new value');
    });

    expect(result.current.value).toBe('new value');
  });
});
```

#### Test d'un service avec mocks

```javascript
import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import { monService } from '../../src/services/monService';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('monService', () => {
  it('fetches data successfully', async () => {
    const mockData = { data: 'test' };
    mockedAxios.get.mockResolvedValueOnce({ data: mockData });

    const result = await monService.fetchData();

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/data');
    expect(result).toEqual(mockData);
  });
});
```

## Convention de nommage

- Les fichiers de test suivent le pattern : `[NomDuFichier].test.[js|jsx]`
- Les tests sont organisés dans `tests/` en miroir de la structure `src/`
- Exemple :
  - Code : `src/components/Button.jsx`
  - Test : `tests/components/Button.test.jsx`

## Bonnes pratiques

1. **Tester le comportement, pas l'implémentation**
2. **Utiliser des queries accessibles** (`getByRole`, `getByLabelText`, etc.)
3. **Mocker les dépendances externes** (APIs, bibliothèques tierces)
4. **Nettoyer les mocks entre les tests**
5. **Utiliser des assertions descriptives**
6. **Maintenir la structure tests/ en miroir de src/**

## Couverture de code

La configuration Vitest inclut la génération de rapports de couverture. Pour l'activer :

```bash
npm run test:coverage
```

Le rapport sera généré dans le dossier `coverage/`.

## Debugging

Pour déboguer les tests :

1. Utiliser `screen.debug()` pour voir le DOM rendu
2. Utiliser l'interface graphique : `npm run test:ui`
3. Ajouter des `console.log` dans les tests
4. Utiliser le mode watch pour un feedback immédiat

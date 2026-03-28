# 📚 Structure des Fichiers Partagés

Ce dossier contient les modules partagés entre tous les jeux.

## 📁 Fichiers

### `constants.js`
Contient toutes les constantes de l'application :
- Joueurs, modes de jeu, difficultés
- Symboles et couleurs
- Configuration du timer
- Probabilités de l'IA
- Messages d'erreur
- Classes CSS

**Utilisation :**
```javascript
import { PLAYER, GAME_MODE, DIFFICULTY, TIMER } from './js/shared/constants.js';

if (currentPlayer === PLAYER.ONE) {
    console.log('C\'est au tour du joueur 1');
}
```

### `chatbot.js`
Classe Chatbot pour gérer les messages de manière centralisée.

**Utilisation :**
```javascript
// Initialiser le chatbot
const chatbotMessages = document.getElementById('chatbotMessages');
const chatbot = new Chatbot(chatbotMessages);

// Afficher un message
chatbot.showMessage('welcome');
chatbot.showMessage('difficulty');

// Ajouter des messages personnalisés
chatbot.addCustomMessages({
    customWin: ['🎊 Super victoire !', '🌟 Incroyable !']
});

// Afficher un message avec délai
chatbot.showMessageDelayed('thinking', 1000);
```

### `utils.js`
Fonctions utilitaires réutilisables.

**Utilisation :**
```javascript
import {
    randomInt,
    randomChoice,
    sleep,
    isValidIndex,
    findEmptyCells,
    logError
} from './js/shared/utils.js';

// Nombre aléatoire
const random = randomInt(1, 10);

// Choix aléatoire dans un tableau
const choice = randomChoice([0, 1, 2, 3]);

// Attendre (async/await)
await sleep(1000); // Attend 1 seconde

// Vérifier un index
if (isValidIndex(index, 9)) {
    console.log('Index valide');
}

// Trouver les cases vides
const emptyCells = findEmptyCells(gameBoard, '');
```

## 🔄 Migration des fichiers existants

### Étape 1 : Ajouter les imports dans le HTML

**Pour `morpion.html` :**
```html
<!-- Avant game.js -->
<script type="module" src="js/shared/constants.js"></script>
<script src="js/shared/chatbot.js"></script>
<script type="module" src="js/shared/utils.js"></script>
<script type="module" src="game.js"></script>
```

**Pour `puissance4.html` :**
```html
<!-- Avant puissance4.js -->
<script type="module" src="js/shared/constants.js"></script>
<script src="js/shared/chatbot.js"></script>
<script type="module" src="js/shared/utils.js"></script>
<script src="bot-puissance4.js"></script>
<script type="module" src="puissance4.js"></script>
```

### Étape 2 : Importer dans les fichiers JS

**En haut de `game.js` et `puissance4.js` :**
```javascript
import {
    PLAYER,
    GAME_MODE,
    DIFFICULTY,
    TIMER,
    AI_PROBABILITY,
    MORPION,
    CSS_CLASS
} from './js/shared/constants.js';

import {
    randomInt,
    randomChoice,
    sleep,
    isValidIndex,
    findEmptyCells,
    logError,
    logInfo
} from './js/shared/utils.js';
```

### Étape 3 : Remplacer le chatbot

**Supprimer l'ancien objet chatbot et le remplacer par :**
```javascript
// Initialiser le chatbot
const chatbot = new Chatbot(document.getElementById('chatbotMessages'));
```

### Étape 4 : Remplacer les valeurs hardcodées

**Avant :**
```javascript
let currentPlayer = 1;
if (difficulty === 'easy') { ... }
timeLeft = 10;
```

**Après :**
```javascript
let currentPlayer = PLAYER.ONE;
if (difficulty === DIFFICULTY.EASY) { ... }
timeLeft = TIMER.DURATION;
```

## ✅ Avantages

1. **Maintenance facile** : Modifier une constante met à jour tous les jeux
2. **Code lisible** : `PLAYER.ONE` est plus clair que `1`
3. **Réutilisabilité** : Le chatbot et les utils fonctionnent partout
4. **Pas de duplication** : Un seul chatbot pour tous les jeux
5. **Testabilité** : Les fonctions utilitaires sont faciles à tester
6. **Évolutivité** : Facile d'ajouter de nouvelles constantes ou fonctions

## 🎯 Prochaines étapes

1. Créer des classes pour les IAs (`js/ai/`)
2. Créer des classes pour la logique de jeu (`js/games/`)
3. Séparer la logique UI de la logique métier

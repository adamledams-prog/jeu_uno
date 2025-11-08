// ============================================
// CONSTANTES PARTAGÉES
// ============================================

// Joueurs
export const PLAYER = {
    ONE: 1,
    TWO: 2
};

// Modes de jeu
export const GAME_MODE = {
    TWO_PLAYERS: 'twoPlayers',
    COMPUTER: 'computer',
    PLAYER: 'player'
};

// Difficultés de l'IA
export const DIFFICULTY = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard'
};

// Équipes (pour le morpion)
export const TEAM = {
    RED: 'red',
    BLUE: 'blue'
};

// Symboles
export const SYMBOL = {
    CROSS: '❌',
    CIRCLE: '⭕',
    EMPTY: ''
};

// Couleurs
export const COLOR = {
    RED: '#e74c3c',
    BLUE: '#3498db',
    YELLOW: '#f1c40f'
};

// Timer
export const TIMER = {
    DURATION: 10, // secondes
    WARNING_THRESHOLD: 5, // Agrandir le timer à partir de 5 secondes
    HURRY_DELAY: 5000 // Afficher "Dépêche-toi" après 5 secondes
};

// IA - Temps de réflexion
export const AI_THINKING_TIME = {
    MIN: 1000, // 1 seconde
    MAX: 4000  // 4 secondes
};

// IA - Probabilités
export const AI_PROBABILITY = {
    EASY: {
        WIN: 0.75,  // 75% de chance de gagner si possible
        BLOCK: 0.20 // 20% de chance de bloquer
    },
    MEDIUM: {
        WIN: 0.95,  // 95% de chance de gagner
        BLOCK: 0.60, // 60% de chance de bloquer
        CENTER: 0.50 // 50% de chance de prendre le centre
    },
    HARD: {
        WIN: 1.0,   // 100% - toujours gagner si possible
        BLOCK: 0.80 // 80% de chance de bloquer
    }
};

// Morpion
export const MORPION = {
    GRID_SIZE: 9,
    WINNING_LENGTH: 3,
    WINNING_COMBINATIONS: [
        [0, 1, 2], // Ligne 1
        [3, 4, 5], // Ligne 2
        [6, 7, 8], // Ligne 3
        [0, 3, 6], // Colonne 1
        [1, 4, 7], // Colonne 2
        [2, 5, 8], // Colonne 3
        [0, 4, 8], // Diagonale 1
        [2, 4, 6]  // Diagonale 2
    ],
    CENTER_INDEX: 4,
    CORNERS: [0, 2, 6, 8]
};

// Puissance 4
export const PUISSANCE4 = {
    ROWS: 6,
    COLS: 7,
    WINNING_LENGTH: 4,
    CENTER_COL: 3
};

// Pseudo - Limites
export const PSEUDO = {
    MAX_LENGTH_MORPION: 8,
    MAX_LENGTH_PUISSANCE4: 10
};

// Messages d'erreur
export const ERROR_MESSAGES = {
    INVALID_INDEX: 'Index invalide retourné',
    CELL_NOT_EMPTY: 'La case sélectionnée n\'est pas vide',
    CELL_NOT_FOUND: 'Cellule introuvable',
    COLUMN_FULL: 'La colonne sélectionnée est pleine',
    COLUMN_INVALID: 'Colonne invalide retournée',
    NO_ROW_FOUND: 'Impossible de trouver une ligne vide'
};

// Animations
export const ANIMATION = {
    COIN_FLIP_DURATION: 2000, // 2 secondes
    END_GAME_DELAY: 500,      // 0.5 seconde
    AI_MOVE_DELAY: 500        // 0.5 seconde avant que l'IA joue
};

// Classes CSS
export const CSS_CLASS = {
    SELECTED: 'selected',
    TAKEN: 'taken',
    WINNER: 'winner',
    WINNER_PLAYER1: 'winner-player1',
    WINNER_PLAYER2: 'winner-player2',
    FILLED: 'filled',
    ACTIVE: 'active'
};

// États du jeu
export const GAME_STATE = {
    ACTIVE: true,
    INACTIVE: false
};

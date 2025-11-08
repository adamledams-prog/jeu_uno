// ============================================
// EXEMPLE D'INTÉGRATION DANS game.js
// ============================================

// 1. IMPORTS EN HAUT DU FICHIER
import {
    PLAYER,
    GAME_MODE,
    DIFFICULTY,
    TEAM,
    TIMER,
    AI_THINKING_TIME,
    AI_PROBABILITY,
    MORPION,
    CSS_CLASS,
    ERROR_MESSAGES
} from './js/shared/constants.js';

import {
    randomInt,
    randomChoice,
    sleep,
    isValidIndex,
    findEmptyCells,
    logError,
    logInfo,
    getRandomThinkingTime,
    addClass,
    removeClass,
    hasClass
} from './js/shared/utils.js';

// 2. INITIALISER LE CHATBOT
const chatbot = new Chatbot(document.getElementById('chatbotMessages'));

// 3. REMPLACER LES ANCIENNES VARIABLES
// ❌ AVANT :
// let currentPlayer = 1;
// let gameMode = 'player';
// let difficulty = '';
// let selectedTeam = '';
// let timeLeft = 10;

// ✅ APRÈS :
let currentPlayer = PLAYER.ONE;
let gameMode = GAME_MODE.PLAYER;
let difficulty = '';
let selectedTeam = '';
let timeLeft = TIMER.DURATION;

// 4. UTILISER LES CONSTANTES DANS LES FONCTIONS
function checkStartComputerButton() {
    const pseudo = document.getElementById('player1NameSolo').value.trim();
    const startBtn = document.getElementById('startComputerGame');

    if (player1AvatarSolo && pseudo.length > 0 && selectedTeam) {
        startBtn.disabled = false;
    } else {
        startBtn.disabled = true;
    }
}

// 5. REMPLACER LA LOGIQUE D'IA
function easyAIMove() {
    // ❌ AVANT : if (aiWinMove !== -1 && Math.random() < 0.75)
    // ✅ APRÈS :
    const aiWinMove = checkTwoInLine(player2Avatar);
    if (aiWinMove !== -1 && Math.random() < AI_PROBABILITY.EASY.WIN) {
        return aiWinMove;
    }

    const playerWinMove = checkTwoInLine(player1Avatar);
    if (playerWinMove !== -1 && Math.random() < AI_PROBABILITY.EASY.BLOCK) {
        return playerWinMove;
    }

    // Utiliser la fonction utilitaire
    const emptyCells = findEmptyCells(gameBoard, '');
    return randomChoice(emptyCells);
}

function mediumAIMove() {
    const aiWinMove = checkTwoInLine(player2Avatar);
    if (aiWinMove !== -1 && Math.random() < AI_PROBABILITY.MEDIUM.WIN) {
        return aiWinMove;
    }

    const playerWinMove = checkTwoInLine(player1Avatar);
    if (playerWinMove !== -1 && Math.random() < AI_PROBABILITY.MEDIUM.BLOCK) {
        return playerWinMove;
    }

    // ❌ AVANT : if (gameBoard[4] === '' && Math.random() < 0.50)
    // ✅ APRÈS :
    if (gameBoard[MORPION.CENTER_INDEX] === '' && Math.random() < AI_PROBABILITY.MEDIUM.CENTER) {
        return MORPION.CENTER_INDEX;
    }

    const emptyCells = findEmptyCells(gameBoard, '');
    return randomChoice(emptyCells);
}

function hardAIMove() {
    const aiWinMove = checkTwoInLine(player2Avatar);
    if (aiWinMove !== -1) {
        return aiWinMove;
    }

    const playerWinMove = checkTwoInLine(player1Avatar);
    if (playerWinMove !== -1 && Math.random() < AI_PROBABILITY.HARD.BLOCK) {
        return playerWinMove;
    }

    // Utiliser les constantes
    if (gameBoard[MORPION.CENTER_INDEX] === '') {
        return MORPION.CENTER_INDEX;
    }

    const availableCorners = MORPION.CORNERS.filter(i => gameBoard[i] === '');
    if (availableCorners.length > 0) {
        return randomChoice(availableCorners);
    }

    const emptyCells = findEmptyCells(gameBoard, '');
    return randomChoice(emptyCells);
}

// 6. AMÉLIORER LA FONCTION makeAIMove
function makeAIMove() {
    if (!gameActive) return;

    isRobotThinking = true;
    // ❌ AVANT : const thinkingTime = Math.floor(Math.random() * 3000) + 1000;
    // ✅ APRÈS :
    const thinkingTime = getRandomThinkingTime(AI_THINKING_TIME.MIN, AI_THINKING_TIME.MAX);

    chatbot.showMessage('thinking');

    setTimeout(() => {
        if (!gameActive) {
            isRobotThinking = false;
            return;
        }

        // Choisir la fonction d'IA
        let index;
        if (difficulty === DIFFICULTY.EASY) {
            index = easyAIMove();
        } else if (difficulty === DIFFICULTY.MEDIUM) {
            index = mediumAIMove();
        } else if (difficulty === DIFFICULTY.HARD) {
            index = hardAIMove();
        }

        // Utiliser la fonction utilitaire pour valider
        if (!isValidIndex(index, MORPION.GRID_SIZE)) {
            logError(ERROR_MESSAGES.INVALID_INDEX, index);
            isRobotThinking = false;
            currentPlayer = PLAYER.ONE;
            updateCurrentPlayer();
            return;
        }

        if (gameBoard[index] !== '') {
            logError(ERROR_MESSAGES.CELL_NOT_EMPTY, index);
            isRobotThinking = false;
            currentPlayer = PLAYER.ONE;
            updateCurrentPlayer();
            return;
        }

        const cell = document.querySelector(`[data-index="${index}"]`);

        if (!cell) {
            logError(ERROR_MESSAGES.CELL_NOT_FOUND, index);
            isRobotThinking = false;
            currentPlayer = PLAYER.ONE;
            updateCurrentPlayer();
            return;
        }

        // Utiliser les constantes pour les couleurs et symboles
        let symbol, color;
        if (selectedTeam === TEAM.RED) {
            symbol = '⭕';
            color = '#3498db';
        } else {
            symbol = '❌';
            color = '#e74c3c';
        }

        gameBoard[index] = player2Avatar;
        cell.innerHTML = `<span style="color: ${color} !important;">${symbol}</span>`;
        // ❌ AVANT : cell.classList.add('taken');
        // ✅ APRÈS :
        addClass(cell, CSS_CLASS.TAKEN);

        if (checkWinner()) {
            endGame(false);
        } else if (checkDraw()) {
            endGame(true);
        } else {
            currentPlayer = PLAYER.ONE;
            updateCurrentPlayer();
        }
        isRobotThinking = false;
    }, thinkingTime);
}

// 7. AMÉLIORER checkWinner
function checkWinner() {
    const currentAvatar = currentPlayer === PLAYER.ONE ? player1Avatar : player2Avatar;

    // ❌ AVANT : Combinaisons en dur
    // ✅ APRÈS : Utiliser la constante
    for (let combination of MORPION.WINNING_COMBINATIONS) {
        const [a, b, c] = combination;
        if (gameBoard[a] === currentAvatar &&
            gameBoard[b] === currentAvatar &&
            gameBoard[c] === currentAvatar) {

            // Utiliser les constantes pour les classes CSS
            const winnerClass = currentPlayer === PLAYER.ONE ?
                CSS_CLASS.WINNER_PLAYER1 : CSS_CLASS.WINNER_PLAYER2;

            const cells = [a, b, c].map(i => document.querySelector(`[data-index="${i}"]`));
            cells.forEach(cell => {
                addClass(cell, CSS_CLASS.WINNER);
                addClass(cell, winnerClass);
            });

            return true;
        }
    }
    return false;
}

// 8. AMÉLIORER startTimer
function startTimer() {
    if (timer) clearInterval(timer);
    if (hurryUpTimer) clearTimeout(hurryUpTimer);

    // ❌ AVANT : timeLeft = 10;
    // ✅ APRÈS :
    timeLeft = TIMER.DURATION;
    const timerElement = document.getElementById('timer');
    timerElement.textContent = timeLeft;
    timerElement.style.fontSize = '1.5rem';

    // Utiliser les constantes
    if (gameMode === GAME_MODE.COMPUTER) {
        hurryUpTimer = setTimeout(() => {
            chatbot.showMessage('hurryUp');
        }, TIMER.HURRY_DELAY);
    }

    timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;

        // ❌ AVANT : if (timeLeft <= 5 && timeLeft > 0)
        // ✅ APRÈS :
        if (timeLeft <= TIMER.WARNING_THRESHOLD && timeLeft > 0) {
            timerElement.style.fontSize = '2.5rem';
            timerElement.style.fontWeight = 'bold';
        } else {
            timerElement.style.fontSize = '1.5rem';
            timerElement.style.fontWeight = 'bold';
        }

        if (timeLeft <= 0) {
            clearInterval(timer);
            if (hurryUpTimer) clearTimeout(hurryUpTimer);
            timerElement.style.fontSize = '1.5rem';

            // Coup automatique si le joueur n'a pas joué
            if (currentPlayer === PLAYER.ONE && gameActive) {
                const emptyCells = findEmptyCells(gameBoard, '');
                if (emptyCells.length > 0) {
                    const randomIndex = randomChoice(emptyCells);
                    const cell = document.querySelector(`[data-index="${randomIndex}"]`);
                    cell.click();
                }
            }
        }
    }, 1000);
}

// 9. LOGS AVEC LES FONCTIONS UTILITAIRES
function debugInfo() {
    logInfo('Mode de jeu', gameMode);
    logInfo('Difficulté', difficulty);
    logInfo('Joueur actuel', currentPlayer === PLAYER.ONE ? 'Joueur 1' : 'Joueur 2');
}

// RÉSULTAT : Code plus lisible, maintenable et réutilisable ! ✨

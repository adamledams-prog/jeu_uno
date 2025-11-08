// Variables globales
let gameBoard = [];
let currentPlayer = 1; // 1 = rouge, 2 = jaune
let gameActive = false;
let gameMode = ''; // 'twoPlayers' ou 'computer'
let difficulty = ''; // 'easy', 'medium', 'hard'
let player1Name = 'Joueur 1';
let player2Name = 'Joueur 2';
let scores = { player1: 0, player2: 0 };
let isAIThinking = false;

const ROWS = 6;
const COLS = 7;

// Chatbot
const chatbot = {
    messages: {
        welcome: [
            "🎮 Bienvenue au Puissance 4 ! Cliquez sur la grille pour commencer !",
            "👋 Prêt à aligner 4 jetons ? Cliquez pour jouer !",
            "✨ Puissance 4 vous attend ! Commencez maintenant !"
        ],
        modeSelection: [
            "🎯 Choisissez votre mode de jeu !",
            "👥 2 joueurs ou contre l'ordinateur ?",
            "🎮 Quel mode préférez-vous ?"
        ],
        difficulty: [
            "🤖 Quel niveau de défi voulez-vous ?",
            "🎯 Facile, moyen ou difficile ?",
            "💪 Choisissez votre adversaire !"
        ],
        gameStart: [
            "🎲 C'est parti ! Que le meilleur gagne !",
            "🌟 La partie commence ! Bonne chance !",
            "🎯 Alignez 4 jetons pour gagner !"
        ],
        playerTurn: [
            "🎮 À vous de jouer !",
            "💭 Réfléchissez bien à votre coup !",
            "⚡ Faites le bon choix !"
        ],
        aiThinking: [
            "🤔 L'IA réfléchit...",
            "🧠 Calcul en cours...",
            "⚡ Je prépare mon coup..."
        ],
        playerWin: [
            "🎉 Victoire ! Bien joué !",
            "👏 Excellent ! Vous avez gagné !",
            "🌟 Bravo, quelle performance !"
        ],
        aiWin: [
            "🤖 L'IA gagne cette fois !",
            "😎 J'ai gagné ! Revanche ?",
            "🎯 L'ordinateur est victorieux !"
        ],
        draw: [
            "🤝 Match nul ! Bien joué à tous les deux !",
            "⚖️ Égalité parfaite !",
            "🎭 Personne ne gagne cette fois !"
        ]
    },
    
    showMessage(type) {
        const messages = this.messages[type];
        if (!messages) return;
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        const chatbotMessages = document.getElementById('chatbotMessages');
        
        chatbotMessages.innerHTML = '';
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.textContent = randomMessage;
        chatbotMessages.appendChild(messageDiv);
    }
};

// Éléments DOM
const homePage = document.getElementById('homePage');
const homeGameCard = document.getElementById('homeGameCard');
const modeSelection = document.getElementById('modeSelection');
const difficultySelection = document.getElementById('difficultySelection');
const playerSelection = document.getElementById('playerSelection');
const gameArea = document.getElementById('gameArea');
const gameBoardElement = document.getElementById('gameBoard');
const winnerMessage = document.getElementById('winnerMessage');

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    chatbot.showMessage('welcome');
    initializeBoard();
});

// Clic sur la carte de jeu
homeGameCard.addEventListener('click', () => {
    homePage.style.display = 'none';
    modeSelection.style.display = 'block';
    chatbot.showMessage('modeSelection');
});

// Sélection du mode de jeu
document.getElementById('twoPlayersBtn').addEventListener('click', () => {
    gameMode = 'twoPlayers';
    modeSelection.style.display = 'none';
    playerSelection.style.display = 'block';
    document.getElementById('player2Name').parentElement.style.display = 'block';
});

document.getElementById('computerBtn').addEventListener('click', () => {
    gameMode = 'computer';
    modeSelection.style.display = 'none';
    difficultySelection.style.display = 'block';
    chatbot.showMessage('difficulty');
});

// Sélection de la difficulté
document.getElementById('easyMode').addEventListener('click', () => {
    difficulty = 'easy';
    difficultySelection.style.display = 'none';
    playerSelection.style.display = 'block';
    document.getElementById('player2Name').parentElement.style.display = 'none';
    player2Name = '🤖 Robot Facile';
});

document.getElementById('mediumMode').addEventListener('click', () => {
    difficulty = 'medium';
    difficultySelection.style.display = 'none';
    playerSelection.style.display = 'block';
    document.getElementById('player2Name').parentElement.style.display = 'none';
    player2Name = '🤖 Robot Moyen';
});

document.getElementById('hardMode').addEventListener('click', () => {
    difficulty = 'hard';
    difficultySelection.style.display = 'none';
    playerSelection.style.display = 'block';
    document.getElementById('player2Name').parentElement.style.display = 'none';
    player2Name = '🤖 Robot Expert';
});

document.getElementById('backFromDifficulty').addEventListener('click', () => {
    difficultySelection.style.display = 'none';
    modeSelection.style.display = 'block';
});

document.getElementById('backFromPlayers').addEventListener('click', () => {
    playerSelection.style.display = 'none';
    if (gameMode === 'computer') {
        difficultySelection.style.display = 'block';
    } else {
        modeSelection.style.display = 'block';
    }
});

// Démarrer le jeu
document.getElementById('startGame').addEventListener('click', () => {
    player1Name = document.getElementById('player1Name').value.trim() || 'Joueur 1';
    
    if (gameMode === 'twoPlayers') {
        player2Name = document.getElementById('player2Name').value.trim() || 'Joueur 2';
    }
    
    playerSelection.style.display = 'none';
    gameArea.style.display = 'block';
    
    document.getElementById('player1NameDisplay').textContent = player1Name;
    document.getElementById('player2NameDisplay').textContent = player2Name;
    document.getElementById('player1Score').textContent = scores.player1;
    document.getElementById('player2Score').textContent = scores.player2;
    
    resetBoard();
    gameActive = true;
    updateCurrentPlayer();
    chatbot.showMessage('gameStart');
});

// Initialiser le plateau
function initializeBoard() {
    gameBoard = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    gameBoardElement.innerHTML = '';
    
    // Créer les cellules (de haut en bas, gauche à droite)
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', () => handleCellClick(col));
            gameBoardElement.appendChild(cell);
        }
    }
    
    // Ajouter les événements sur les indicateurs de colonnes
    document.querySelectorAll('.column-indicator').forEach(indicator => {
        indicator.addEventListener('click', function() {
            const col = parseInt(this.dataset.col);
            handleCellClick(col);
        });
        
        indicator.addEventListener('mouseenter', function() {
            if (gameActive && !isAIThinking) {
                this.classList.add('active');
            }
        });
        
        indicator.addEventListener('mouseleave', function() {
            this.classList.remove('active');
        });
    });
}

// Gérer le clic sur une colonne
function handleCellClick(col) {
    if (!gameActive || isAIThinking) return;
    
    // Trouver la première ligne vide de bas en haut
    let row = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
        if (gameBoard[r][col] === 0) {
            row = r;
            break;
        }
    }
    
    if (row === -1) return; // Colonne pleine
    
    // Placer le jeton
    gameBoard[row][col] = currentPlayer;
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    const token = document.createElement('div');
    token.className = `token ${currentPlayer === 1 ? 'red' : 'yellow'}`;
    cell.appendChild(token);
    cell.classList.add('filled');
    
    // Vérifier la victoire
    if (checkWinner(row, col)) {
        endGame(false);
        return;
    }
    
    // Vérifier le match nul
    if (checkDraw()) {
        endGame(true);
        return;
    }
    
    // Changer de joueur
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    updateCurrentPlayer();
    
    // Si c'est le tour de l'IA
    if (gameMode === 'computer' && currentPlayer === 2 && gameActive) {
        isAIThinking = true;
        chatbot.showMessage('aiThinking');
        setTimeout(async () => {
            await makeAIMove();
            isAIThinking = false;
        }, 500);
    }
}

// Mettre à jour l'affichage du joueur actuel
function updateCurrentPlayer() {
    const currentToken = document.getElementById('currentToken');
    const currentPlayerName = document.getElementById('currentPlayerName');
    
    currentToken.className = `token ${currentPlayer === 1 ? 'red' : 'yellow'}`;
    currentPlayerName.textContent = `Tour de ${currentPlayer === 1 ? player1Name : player2Name}`;
}

// Vérifier la victoire
function checkWinner(row, col) {
    const player = gameBoard[row][col];
    
    // Vérifier horizontal
    if (checkDirection(row, col, 0, 1, player)) return true;
    // Vérifier vertical
    if (checkDirection(row, col, 1, 0, player)) return true;
    // Vérifier diagonale /
    if (checkDirection(row, col, 1, 1, player)) return true;
    // Vérifier diagonale \
    if (checkDirection(row, col, 1, -1, player)) return true;
    
    return false;
}

function checkDirection(row, col, dRow, dCol, player) {
    let count = 1;
    const winningCells = [{row, col}];
    
    // Vérifier dans une direction
    for (let i = 1; i < 4; i++) {
        const newRow = row + dRow * i;
        const newCol = col + dCol * i;
        if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS && 
            gameBoard[newRow][newCol] === player) {
            count++;
            winningCells.push({row: newRow, col: newCol});
        } else {
            break;
        }
    }
    
    // Vérifier dans la direction opposée
    for (let i = 1; i < 4; i++) {
        const newRow = row - dRow * i;
        const newCol = col - dCol * i;
        if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS && 
            gameBoard[newRow][newCol] === player) {
            count++;
            winningCells.push({row: newRow, col: newCol});
        } else {
            break;
        }
    }
    
    if (count >= 4) {
        // Animer les cellules gagnantes
        winningCells.forEach(({row, col}) => {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            cell.classList.add('winner');
        });
        return true;
    }
    
    return false;
}

// Vérifier le match nul
function checkDraw() {
    return gameBoard[0].every(cell => cell !== 0);
}

// IA - Faire un coup
async function makeAIMove() {
    let col;
    
    if (difficulty === 'easy') {
        col = await easyAI(gameBoard, ROWS, COLS);
    } else if (difficulty === 'medium') {
        col = mediumAI();
    } else {
        col = hardAI();
    }
    
    handleCellClick(col);
}

// IA Facile - Utilise la fonction du fichier bot-puissance4.js
// (La fonction easyAI est maintenant importée depuis bot-puissance4.js)

// IA Moyenne - Essaie de gagner, bloque parfois
function mediumAI() {
    // Essayer de gagner
    const winCol = findWinningMove(2);
    if (winCol !== -1) return winCol;
    
    // 70% de chance de bloquer le joueur
    if (Math.random() < 0.7) {
        const blockCol = findWinningMove(1);
        if (blockCol !== -1) return blockCol;
    }
    
    // Jouer au centre si possible
    if (gameBoard[ROWS - 1][3] === 0) return 3;
    
    // Sinon, coup aléatoire
    return randomMove();
}

// IA Difficile - Joue de manière optimale
function hardAI() {
    // Essayer de gagner
    const winCol = findWinningMove(2);
    if (winCol !== -1) return winCol;
    
    // Bloquer le joueur
    const blockCol = findWinningMove(1);
    if (blockCol !== -1) return blockCol;
    
    // Jouer au centre si possible
    if (gameBoard[ROWS - 1][3] === 0) return 3;
    
    // Jouer dans les colonnes centrales (3, 2, 4, 1, 5, 0, 6)
    const preferredCols = [3, 2, 4, 1, 5, 0, 6];
    for (const col of preferredCols) {
        for (let row = ROWS - 1; row >= 0; row--) {
            if (gameBoard[row][col] === 0) {
                return col;
            }
        }
    }
    
    return randomMove();
}

// Trouver un coup gagnant pour un joueur
function findWinningMove(player) {
    for (let col = 0; col < COLS; col++) {
        // Trouver la ligne où le jeton tomberait
        let row = -1;
        for (let r = ROWS - 1; r >= 0; r--) {
            if (gameBoard[r][col] === 0) {
                row = r;
                break;
            }
        }
        
        if (row === -1) continue; // Colonne pleine
        
        // Simuler le coup
        gameBoard[row][col] = player;
        
        // Vérifier si c'est gagnant
        const isWinning = checkWinner(row, col);
        
        // Annuler le coup
        gameBoard[row][col] = 0;
        
        if (isWinning) {
            return col;
        }
    }
    
    return -1;
}

// Coup aléatoire
function randomMove() {
    const availableCols = [];
    for (let col = 0; col < COLS; col++) {
        if (gameBoard[0][col] === 0) {
            availableCols.push(col);
        }
    }
    
    if (availableCols.length === 0) return 0;
    return availableCols[Math.floor(Math.random() * availableCols.length)];
}

// Terminer le jeu
function endGame(isDraw) {
    gameActive = false;
    
    setTimeout(() => {
        if (isDraw) {
            document.getElementById('winnerText').textContent = 'Match nul !';
            document.getElementById('winnerToken').innerHTML = '<div class="token red"></div><div class="token yellow"></div>';
            chatbot.showMessage('draw');
        } else {
            const winner = currentPlayer === 1 ? player1Name : player2Name;
            const winnerClass = currentPlayer === 1 ? 'red' : 'yellow';
            
            document.getElementById('winnerText').textContent = `${winner} gagne !`;
            document.getElementById('winnerToken').innerHTML = `<div class="token ${winnerClass}"></div>`;
            
            // Mettre à jour le score
            if (currentPlayer === 1) {
                scores.player1++;
                document.getElementById('player1Score').textContent = scores.player1;
            } else {
                scores.player2++;
                document.getElementById('player2Score').textContent = scores.player2;
            }
            
            // Messages du chatbot
            if (gameMode === 'computer') {
                if (currentPlayer === 1) {
                    chatbot.showMessage('playerWin');
                } else {
                    chatbot.showMessage('aiWin');
                }
            } else {
                chatbot.showMessage('playerWin');
            }
        }
        
        winnerMessage.style.display = 'flex';
    }, 500);
}

// Réinitialiser le plateau
function resetBoard() {
    initializeBoard();
    currentPlayer = 1;
    updateCurrentPlayer();
    gameActive = true;
    winnerMessage.style.display = 'none';
}

// Boutons de contrôle
document.getElementById('playAgain').addEventListener('click', () => {
    winnerMessage.style.display = 'none';
    resetBoard();
});

document.getElementById('resetGame').addEventListener('click', () => {
    resetBoard();
});

document.getElementById('changeMode').addEventListener('click', () => {
    gameArea.style.display = 'none';
    modeSelection.style.display = 'block';
    
    // Réinitialiser les scores
    scores = { player1: 0, player2: 0 };
    
    // Réinitialiser les champs
    document.getElementById('player1Name').value = '';
    document.getElementById('player2Name').value = '';
    
    chatbot.showMessage('modeSelection');
});

document.getElementById('homeButton').addEventListener('click', () => {
    gameArea.style.display = 'none';
    homePage.style.display = 'block';
    
    // Réinitialiser les scores
    scores = { player1: 0, player2: 0 };
    
    // Réinitialiser les champs
    document.getElementById('player1Name').value = '';
    document.getElementById('player2Name').value = '';
    
    chatbot.showMessage('welcome');
});

// Boutons retour accueil sur pages de sélection
document.getElementById('backToHomeMode').addEventListener('click', () => {
    window.location.href = 'index.html';
});

document.getElementById('backToHomePlayers').addEventListener('click', () => {
    window.location.href = 'index.html';
});

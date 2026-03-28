// Variables globales
let player1Avatar = '';
let player2Avatar = '';
let timer = null;
let timeLeft = 10;

// Chatbot
const chatbot = {
    messages: {
        welcome: [
            "👋 Bienvenue ! Cliquez sur le mini-jeu pour commencer !",
            "🎮 Prêt à jouer ? Cliquez sur la grille !",
            "✨ Hey ! Content de vous voir ! On commence ?"
        ],
        returnHome: [
            "🎯 Une autre partie ? Cliquez pour recommencer !",
            "🌟 C'était un beau match ! On en refait un ?",
            "🎮 Prêt pour une revanche ? Cliquez pour rejouer !"
        ],
        difficulty: [
            "🤖 Choisissez votre niveau ! Je suis prêt !",
            "🎯 Quel niveau de défi voulez-vous ?",
            "🎮 Facile, moyen ou difficile ? À vous de choisir !"
        ],
        gameStartEasy: [
            "😊 Mode facile activé ! Je serai gentil, promis !",
            "🌟 Parfait pour s'entraîner tranquillement !",
            "🎮 On va bien s'amuser en mode facile !"
        ],
        gameStartMedium: [
            "🤔 Mode moyen activé ! Ça va être intéressant !",
            "⚡ Je vais donner un peu plus de fil à retordre !",
            "🎯 Un bon défi en perspective !"
        ],
        gameStartHard: [
            "😈 Mode difficile ! Préparez-vous au défi !",
            "🔥 Je vais donner mon maximum !",
            "⚔️ Que le meilleur gagne !"
        ],
        robotWin: [
            "🤖 Voilà t'es bien nulllll !",
            "😎 Pas mal, mais je suis le boss !"
        ],
        robotLose: [
            "👏 Bien joué !",
            "🔄 Je prendrai ma revanche !"
        ],
        thinking: [
            "🤔 Hmm... Laissez-moi réfléchir...",
            "⚡ Je calcule mon prochain coup...",
            "🧮 En pleine réflexion..."
        ],
        hurryUp: [
            "⏰ Dépêche-toi !",
            "🕐 Allez, plus vite !",
            "⌛ On n'a pas toute la journée !"
        ],
        wait: [
            "⏳ Attendez que je finisse de jouer !",
            "🤚 Un peu de patience, je réfléchis !",
            "🎮 C'est encore mon tour !"
        ],
        avatarSelection: [
            "🎭 Choisissez vos avatars préférés !",
            "✏️ N'oubliez pas de choisir vos pseudos !",
            "🌟 Faites votre choix parmi ces super avatars !"
        ],
        gameStart: [
            "🎲 C'est parti ! Que le meilleur gagne !",
            "🎯 Montrez-nous vos talents !",
            "🌈 La partie commence ! Bonne chance !"
        ],
        during_game: [
            "💫 Bien joué ! Continuez comme ça !",
            "🎯 Belle stratégie !",
            "✨ Le match est serré !"
        ]
    },
    
    showMessage(type) {
        const messages = this.messages[type];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        const chatbotMessages = document.getElementById('chatbotMessages');
        
        // Supprimer l'ancien message
        chatbotMessages.innerHTML = '';
        
        // Ajouter le nouveau message
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.textContent = randomMessage;
        chatbotMessages.appendChild(messageDiv);
    }
};
let player1Pseudo = '';
let player2Pseudo = '';
let currentPlayer = 1;
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = false;
let scores = { player1: 0, player2: 0 };

// Combinaisons gagnantes
const winningCombinations = [
    [0, 1, 2], // Ligne 1
    [3, 4, 5], // Ligne 2
    [6, 7, 8], // Ligne 3
    [0, 3, 6], // Colonne 1
    [1, 4, 7], // Colonne 2
    [2, 5, 8], // Colonne 3
    [0, 4, 8], // Diagonale 1
    [2, 4, 6]  // Diagonale 2
];

// Éléments DOM
const homePage = document.getElementById('homePage');
const playButton = document.getElementById('playButton');
const avatarSelection = document.getElementById('avatarSelection');
const avatarSelectionSolo = document.getElementById('avatarSelectionSolo');
const gameArea = document.getElementById('gameArea');
const difficultySelection = document.getElementById('difficultySelection');

// Gestion de la difficulté
let gameMode = 'player'; // 'player' ou 'computer'
let difficulty = ''; // 'easy', 'medium', 'hard'
let player1AvatarSolo = '';
let player1PseudoSolo = '';
let selectedTeam = ''; // 'red' ou 'blue'

// Bouton pour jouer contre l'ordinateur (depuis la page avatars 2 joueurs)
document.getElementById('computerButton').addEventListener('click', () => {
    avatarSelection.style.display = 'none';
    difficultySelection.style.display = 'block';
    chatbot.showMessage('difficulty');
});

// Sélection de l'équipe
document.getElementById('teamRedBtn').addEventListener('click', () => {
    selectedTeam = 'red';
    document.getElementById('teamRedBtn').classList.add('selected');
    document.getElementById('teamBlueBtn').classList.remove('selected');
    document.getElementById('selectedTeam').textContent = '❌ Équipe Rouge sélectionnée';
    document.getElementById('selectedTeam').style.color = '#e74c3c';
    checkStartComputerButton();
});

document.getElementById('teamBlueBtn').addEventListener('click', () => {
    selectedTeam = 'blue';
    document.getElementById('teamBlueBtn').classList.add('selected');
    document.getElementById('teamRedBtn').classList.remove('selected');
    document.getElementById('selectedTeam').textContent = '⭕ Équipe Bleue sélectionnée';
    document.getElementById('selectedTeam').style.color = '#3498db';
    checkStartComputerButton();
});

// Sélection de l'avatar en mode solo
document.querySelectorAll('.avatar-btn-solo').forEach(btn => {
    btn.addEventListener('click', function() {
        const avatar = this.dataset.avatar;
        
        // Désélectionner les autres avatars
        document.querySelectorAll('.avatar-btn-solo').forEach(b => {
            b.classList.remove('selected');
        });
        
        // Sélectionner cet avatar
        this.classList.add('selected');
        player1AvatarSolo = avatar;
        document.getElementById('player1SelectedSolo').textContent = avatar;
        
        // Activer le bouton si avatar et pseudo sont remplis
        checkStartComputerButton();
    });
});

// Écouter les changements dans le champ pseudo solo
document.getElementById('player1NameSolo').addEventListener('input', checkStartComputerButton);

// Fonction pour vérifier si le bouton start computer peut être activé
function checkStartComputerButton() {
    const pseudo = document.getElementById('player1NameSolo').value.trim();
    const startBtn = document.getElementById('startComputerGame');
    
    if (player1AvatarSolo && pseudo.length > 0 && selectedTeam) {
        startBtn.disabled = false;
    } else {
        startBtn.disabled = true;
    }
}

// Démarrer le jeu contre l'ordinateur
document.getElementById('startComputerGame').addEventListener('click', () => {
    player1PseudoSolo = document.getElementById('player1NameSolo').value || 'Joueur';
    player1Avatar = player1AvatarSolo;
    player1Pseudo = player1PseudoSolo;
    gameMode = 'computer';
    
    // Aller à la page de tirage au sort
    avatarSelectionSolo.style.display = 'none';
    document.getElementById('coinFlip').style.display = 'flex';
});

// Variable pour suivre qui commence la prochaine partie
let nextStarter = 1; // 1 = joueur, 2 = IA

// Boutons de difficulté - Démarrer directement le jeu
document.getElementById('easyMode').addEventListener('click', () => {
    difficulty = 'easy';
    startQuickComputerGame();
});

document.getElementById('mediumMode').addEventListener('click', () => {
    difficulty = 'medium';
    startQuickComputerGame();
});

document.getElementById('hardMode').addEventListener('click', () => {
    difficulty = 'hard';
    startQuickComputerGame();
});

// Fonction pour démarrer rapidement le jeu contre l'ordinateur
function startQuickComputerGame() {
    // Le joueur est toujours les croix rouges
    player1Avatar = '👤';
    player1Pseudo = 'Vous';
    selectedTeam = 'red'; // Joueur = croix rouges
    gameMode = 'computer';
    
    // Réinitialiser les scores
    scores.player1 = 0;
    scores.player2 = 0;
    
    // Configuration de l'ordinateur selon la difficulté
    if (difficulty === 'easy') {
        player2Pseudo = "🤖 Robot Débutant";
        player2Avatar = "🤖";
        chatbot.showMessage('gameStartEasy');
    } else if (difficulty === 'medium') {
        player2Pseudo = "🦾 Robot Avancé";
        player2Avatar = "🦾";
        chatbot.showMessage('gameStartMedium');
    } else {
        player2Pseudo = "🤯 Robot Expert";
        player2Avatar = "🤯";
        chatbot.showMessage('gameStartHard');
    }
    
    // Masquer la sélection de difficulté et afficher le jeu
    difficultySelection.style.display = 'none';
    gameArea.style.display = 'block';
    
    // Mettre à jour l'interface avec les symboles
    document.getElementById('player1Avatar').innerHTML = '<span style="color: #e74c3c;">❌</span>';
    document.getElementById('player2Avatar').innerHTML = '<span style="color: #3498db;">⭕</span>';
    document.getElementById('player1Score').textContent = scores.player1;
    document.getElementById('player2Score').textContent = scores.player2;
    
    // Réinitialiser le jeu
    resetBoard();
    gameActive = true;
    
    // Le joueur commence toujours la première partie
    currentPlayer = 1;
    nextStarter = 1; // Première partie = joueur
    updateCurrentPlayer();
}

document.getElementById('backFromDifficulty').addEventListener('click', () => {
    difficultySelection.style.display = 'none';
    avatarSelection.style.display = 'block';
});

function startComputerGame(difficulty, teamStarts) {
    gameMode = 'computer';
    gameArea.style.display = 'block';
    
    // Déterminer qui commence
    if (selectedTeam === teamStarts) {
        currentPlayer = 1;
        chatbot.showMessage('gameStart');
    } else {
        currentPlayer = 2;
        setTimeout(() => {
            chatbot.showMessage('gameStart');
            setTimeout(() => {
                makeAIMove();
            }, 1000);
        }, 500);
    }
    
    // Configuration de l'ordinateur selon la difficulté
    if (difficulty === 'easy') {
        player2Pseudo = "Robot Débutant";
        player2Avatar = "🤖";
    } else if (difficulty === 'medium') {
        player2Pseudo = "Robot Avancé";
        player2Avatar = "🦾";
    } else {
        player2Pseudo = "Robot Expert";
        player2Avatar = "🤯";
    }
    
    // Mettre à jour l'interface
    document.getElementById('player1Avatar').textContent = player1Avatar;
    document.getElementById('player2Avatar').textContent = player2Avatar;
    document.getElementById('player1Score').textContent = "0";
    document.getElementById('player2Score').textContent = "0";
    document.getElementById('playerName').textContent = player1Pseudo;
    
    // Réinitialiser le jeu
    resetBoard();
    gameActive = true;
    updateCurrentPlayer();
}
const startGameBtn = document.getElementById('startGame');
const cells = document.querySelectorAll('.cell');
const resetGameBtn = document.getElementById('resetGame');
const changeAvatarsBtn = document.getElementById('changeAvatars');
const homeButton = document.getElementById('homeButton');
const winnerMessage = document.getElementById('winnerMessage');
const playAgainBtn = document.getElementById('playAgain');

// Fonction pour aller à la sélection des avatars
function goToAvatarSelection() {
    homePage.style.display = 'none';
    avatarSelection.style.display = 'block';
    document.body.classList.add('game-active');
}

// Chatbot initial
document.addEventListener('DOMContentLoaded', () => {
    chatbot.showMessage('welcome');
});

// Clic sur la carte du jeu dans la page d'accueil
document.getElementById('homeGameCard').addEventListener('click', () => {
    goToAvatarSelection();
    chatbot.showMessage('avatarSelection');
});

// Sélection des avatars
document.querySelectorAll('.avatar-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const player = this.dataset.player;
        const avatar = this.dataset.avatar;
        
        // Désélectionner les autres avatars du même joueur
        document.querySelectorAll(`[data-player="${player}"]`).forEach(b => {
            b.classList.remove('selected');
        });
        
        // Sélectionner cet avatar
        this.classList.add('selected');
        
        // Mettre à jour l'affichage
        if (player === '1') {
            player1Avatar = avatar;
            document.getElementById('player1Selected').textContent = avatar;
        } else {
            player2Avatar = avatar;
            document.getElementById('player2Selected').textContent = avatar;
        }
        
        // Activer le bouton start si les deux avatars sont sélectionnés et les pseudos remplis
        checkStartButton();
    });
});

// Écouter les changements dans les champs pseudo
document.getElementById('player1Name').addEventListener('input', checkStartButton);
document.getElementById('player2Name').addEventListener('input', checkStartButton);

// Fonction pour vérifier si le bouton start peut être activé
function checkStartButton() {
    const pseudo1 = document.getElementById('player1Name').value.trim();
    const pseudo2 = document.getElementById('player2Name').value.trim();
    
    if (player1Avatar && player2Avatar && pseudo1.length > 0 && pseudo2.length > 0) {
        startGameBtn.disabled = false;
    } else {
        startGameBtn.disabled = true;
    }
}

// Démarrer le jeu
startGameBtn.addEventListener('click', () => {
    // Récupérer les pseudos
    player1Pseudo = document.getElementById('player1Name').value || 'Joueur 1';
    player2Pseudo = document.getElementById('player2Name').value || 'Joueur 2';
    
    // Aller à la page de tirage au sort
    avatarSelection.style.display = 'none';
    document.getElementById('coinFlip').style.display = 'flex';
});

// Modifier le bouton de tirage pour gérer les 2 modes
document.getElementById('startFlip').addEventListener('click', () => {
    const coin = document.getElementById('coin');
    const flipResult = document.getElementById('flipResult');
    const startFlipBtn = document.getElementById('startFlip');
    
    // Désactiver le bouton pendant l'animation
    startFlipBtn.disabled = true;
    flipResult.textContent = '';
    
    // Tirage au sort
    const teamStarts = ['red', 'blue'][Math.floor(Math.random() * 2)];
    
    // Animation de la pièce
    coin.classList.add('flipping');
    
    setTimeout(() => {
        coin.classList.remove('flipping');
        
        // Afficher le résultat
        if (teamStarts === 'red') {
            coin.style.transform = 'rotateY(0deg)';
            flipResult.innerHTML = '❌ L\'équipe <span style="color: #e74c3c;">ROUGE</span> commence !';
        } else {
            coin.style.transform = 'rotateY(180deg)';
            flipResult.innerHTML = '⭕ L\'équipe <span style="color: #3498db;">BLEUE</span> commence !';
        }
        
        // Attendre 2 secondes puis lancer le jeu
        setTimeout(() => {
            document.getElementById('coinFlip').style.display = 'none';
            startFlipBtn.disabled = false;
            coin.style.transform = '';
            
            if (gameMode === 'player') {
                // Mode 2 joueurs
                start2PlayerGame(teamStarts);
            } else {
                // Mode ordinateur
                startComputerGame(difficulty, teamStarts);
            }
        }, 2000);
        
    }, 2000);
});

function start2PlayerGame(teamStarts) {
    gameArea.style.display = 'block';
    gameMode = 'player';
    
    // Rouge commence = joueur 1, Bleu commence = joueur 2
    currentPlayer = teamStarts === 'red' ? 1 : 2;
    
    // Afficher les avatars dans la zone de jeu
    document.getElementById('player1Avatar').textContent = player1Avatar;
    document.getElementById('player2Avatar').textContent = player2Avatar;
    document.getElementById('player1Score').textContent = scores.player1;
    document.getElementById('player2Score').textContent = scores.player2;
    
    updateCurrentPlayer();
    gameActive = true;
    chatbot.showMessage('gameStart');
}

// Fonction pour vérifier si il y a 2 symboles alignés
function checkTwoInLine(symbol) {
    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        const line = [gameBoard[a], gameBoard[b], gameBoard[c]];
        const symbolCount = line.filter(cell => cell === symbol).length;
        const emptyCount = line.filter(cell => cell === '').length;
        if (symbolCount === 2 && emptyCount === 1) {
            return combination[line.indexOf('')];
        }
    }
    return -1;
}

// Fonction pour l'IA facile
function easyAIMove() {
    // Vérifier si l'IA peut gagner (75% de chances de le faire)
    const aiWinMove = checkTwoInLine(player2Avatar);
    if (aiWinMove !== -1 && Math.random() < 0.75) {
        return aiWinMove;
    }

    // Bloquer le joueur (20% de chances)
    const playerWinMove = checkTwoInLine(player1Avatar);
    if (playerWinMove !== -1 && Math.random() < 0.20) {
        return playerWinMove;
    }

    // Sinon, jouer aléatoirement
    let emptyCells = [];
    for (let i = 0; i < gameBoard.length; i++) {
        if (gameBoard[i] === '') {
            emptyCells.push(i);
        }
    }
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

// Fonction pour l'IA moyenne
function mediumAIMove() {
    // Vérifier si l'IA peut gagner (95% de chances de le faire)
    const aiWinMove = checkTwoInLine(player2Avatar);
    if (aiWinMove !== -1 && Math.random() < 0.95) {
        return aiWinMove;
    }

    // Bloquer le joueur (60% de chances)
    const playerWinMove = checkTwoInLine(player1Avatar);
    if (playerWinMove !== -1 && Math.random() < 0.60) {
        return playerWinMove;
    }

    // Essayer de prendre le centre si disponible (50% de chances)
    if (gameBoard[4] === '' && Math.random() < 0.50) {
        return 4;
    }

    // Sinon, jouer aléatoirement
    let emptyCells = [];
    for (let i = 0; i < gameBoard.length; i++) {
        if (gameBoard[i] === '') {
            emptyCells.push(i);
        }
    }
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

// Fonction pour l'IA difficile
function hardAIMove() {
    // Vérifier si l'IA peut gagner (100% de chances - toujours)
    const aiWinMove = checkTwoInLine(player2Avatar);
    if (aiWinMove !== -1) {
        return aiWinMove;
    }

    // Bloquer le joueur (80% de chances)
    const playerWinMove = checkTwoInLine(player1Avatar);
    if (playerWinMove !== -1 && Math.random() < 0.80) {
        return playerWinMove;
    }

    // Essayer de prendre le centre si disponible
    if (gameBoard[4] === '') {
        return 4;
    }

    // Prendre les coins en priorité
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => gameBoard[i] === '');
    if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }

    // Sinon, jouer sur n'importe quelle case vide
    let emptyCells = [];
    for (let i = 0; i < gameBoard.length; i++) {
        if (gameBoard[i] === '') {
            emptyCells.push(i);
        }
    }
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

// Variable pour suivre si le robot est en train de "réfléchir"
let isRobotThinking = false;

// Fonction pour faire jouer l'IA
function makeAIMove() {
    isRobotThinking = true;
    // Temps de réflexion aléatoire entre 1 et 4 secondes
    const thinkingTime = Math.floor(Math.random() * 3000) + 1000;
    
    // Ajouter un message de réflexion
    chatbot.showMessage('thinking');
    
    setTimeout(() => {
        // Choisir la fonction d'IA selon la difficulté
        let index;
        if (difficulty === 'easy') {
            index = easyAIMove();
        } else if (difficulty === 'medium') {
            index = mediumAIMove();
        } else if (difficulty === 'hard') {
            index = hardAIMove();
        }
        
        const cell = document.querySelector(`[data-index="${index}"]`);
        
        // Effacer le message de réflexion
        document.getElementById('chatbotMessages').innerHTML = '';
        
        // Déterminer le symbole et la couleur du robot selon l'équipe choisie
        let symbol, color;
        if (selectedTeam === 'red') {
            // Joueur est rouge, robot est bleu
            symbol = '⭕';
            color = '#3498db';
        } else {
            // Joueur est bleu, robot est rouge
            symbol = '❌';
            color = '#e74c3c';
        }
        
        gameBoard[index] = player2Avatar;
        cell.innerHTML = `<span style="color: ${color} !important;">${symbol}</span>`;
        cell.classList.add('taken');

        if (checkWinner()) {
            endGame(false);
        } else if (checkDraw()) {
            endGame(true);
        } else {
            currentPlayer = 1;
            updateCurrentPlayer();
        }
        isRobotThinking = false;
    }, thinkingTime);
}

// Clic sur une case
cells.forEach(cell => {
    cell.addEventListener('click', () => {
        const index = cell.dataset.index;
        
        // Empêcher de jouer si le robot réfléchit
        if (isRobotThinking) {
            chatbot.showMessage('wait');
            return;
        }
        
        // Vérifier si la case est vide et le jeu est actif
        if (gameBoard[index] === '' && gameActive) {
            // En mode ordinateur, seul le joueur 1 peut jouer manuellement
            if (gameMode === 'computer' && currentPlayer !== 1) {
                return;
            }
            
            // Placer le symbole du joueur actuel
            const currentAvatar = currentPlayer === 1 ? player1Avatar : player2Avatar;
            
            // En mode ordinateur avec sélection d'équipe
            let symbol, color;
            if (gameMode === 'computer' && selectedTeam) {
                if (currentPlayer === 1) {
                    // Le joueur a choisi son équipe
                    symbol = selectedTeam === 'red' ? '❌' : '⭕';
                    color = selectedTeam === 'red' ? '#e74c3c' : '#3498db';
                } else {
                    // Le robot a l'équipe opposée
                    symbol = selectedTeam === 'red' ? '⭕' : '❌';
                    color = selectedTeam === 'red' ? '#3498db' : '#e74c3c';
                }
            } else {
                // Mode 2 joueurs normal
                symbol = currentPlayer === 1 ? '❌' : '⭕';
                color = currentPlayer === 1 ? '#e74c3c' : '#3498db';
            }
            
            gameBoard[index] = currentAvatar;
            cell.innerHTML = `<span style="color: ${color} !important;">${symbol}</span>`;
            cell.classList.add('taken');
            
            // Vérifier victoire
            if (checkWinner()) {
                endGame(false);
            } else if (checkDraw()) {
                endGame(true);
            } else if (gameMode === 'computer' && (difficulty === 'easy' || difficulty === 'medium' || difficulty === 'hard')) {
                // Annuler le timer du message "Dépêche-toi" quand le joueur joue
                if (hurryUpTimer) clearTimeout(hurryUpTimer);
                
                currentPlayer = 2;
                updateCurrentPlayer();
                makeAIMove();
            } else {
                // Mode 2 joueurs : changer de joueur
                currentPlayer = currentPlayer === 1 ? 2 : 1;
                updateCurrentPlayer();
            }
        }
    });
});

// Fonction pour démarrer le timer
let hurryUpTimer = null;

function startTimer() {
    if (timer) clearInterval(timer);
    if (hurryUpTimer) clearTimeout(hurryUpTimer);
    
    timeLeft = 10;
    const timerElement = document.getElementById('timer');
    timerElement.textContent = timeLeft;
    timerElement.style.fontSize = '1.5rem'; // Taille normale
    
    // Ajouter le message "Dépêche-toi" après 5 secondes en mode ordinateur
    if (gameMode === 'computer') {
        hurryUpTimer = setTimeout(() => {
            chatbot.showMessage('hurryUp');
        }, 5000);
    }
    
    timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        
        // Agrandir le timer à partir de 5 secondes
        if (timeLeft <= 5 && timeLeft > 0) {
            timerElement.style.fontSize = '2.5rem';
            timerElement.style.fontWeight = 'bold';
        } else {
            timerElement.style.fontSize = '1.5rem';
            timerElement.style.fontWeight = 'bold';
        }
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            if (hurryUpTimer) clearTimeout(hurryUpTimer);
            timerElement.style.fontSize = '1.5rem'; // Remettre la taille normale
            // Si c'est au tour du joueur 1 et qu'il n'a pas joué, faire un coup aléatoire
            if (currentPlayer === 1 && gameActive) {
                let emptyCells = [];
                for (let i = 0; i < gameBoard.length; i++) {
                    if (gameBoard[i] === '') {
                        emptyCells.push(i);
                    }
                }
                if (emptyCells.length > 0) {
                    const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                    const cell = document.querySelector(`[data-index="${randomIndex}"]`);
                    cell.click();
                }
            }
        }
    }, 1000);
}

// Mettre à jour l'affichage du joueur actuel
function updateCurrentPlayer() {
    const avatar = currentPlayer === 1 ? player1Avatar : player2Avatar;
    const pseudo = currentPlayer === 1 ? player1Pseudo : player2Pseudo;
    document.getElementById('currentPlayer').textContent = avatar;
    document.getElementById('playerName').textContent = pseudo;
    
    // Démarrer le timer seulement si c'est au tour du joueur 1
    if (currentPlayer === 1 && gameMode === 'computer') {
        startTimer();
    } else {
        if (timer) clearInterval(timer);
        document.getElementById('timer').textContent = '-';
    }
}

// Vérifier victoire
function checkWinner() {
    const currentAvatar = currentPlayer === 1 ? player1Avatar : player2Avatar;
    
    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (gameBoard[a] === currentAvatar && 
            gameBoard[b] === currentAvatar && 
            gameBoard[c] === currentAvatar) {
            // Animer les cases gagnantes avec la couleur du joueur
            const winnerClass = currentPlayer === 1 ? 'winner-player1' : 'winner-player2';
            cells[a].classList.add('winner', winnerClass);
            cells[b].classList.add('winner', winnerClass);
            cells[c].classList.add('winner', winnerClass);
            return true;
        }
    }
    return false;
}

// Vérifier match nul
function checkDraw() {
    return gameBoard.every(cell => cell !== '');
}

// Terminer le jeu
function endGame(isDraw) {
    gameActive = false;
    
    setTimeout(() => {
        if (isDraw) {
            document.getElementById('winnerText').textContent = 'Match nul !';
            document.getElementById('winnerAvatar').textContent = '🤝';
        } else {
            const winnerAvatar = currentPlayer === 1 ? player1Avatar : player2Avatar;
            const winnerPseudo = currentPlayer === 1 ? player1Pseudo : player2Pseudo;
            document.getElementById('winnerText').textContent = `${winnerPseudo} gagne !`;
            document.getElementById('winnerAvatar').textContent = winnerAvatar;
            
            // Messages spéciaux pour le mode ordinateur
            if (gameMode === 'computer') {
                if (currentPlayer === 2) { // Robot gagne
                    chatbot.showMessage('robotWin');
                } else { // Joueur gagne
                    chatbot.showMessage('robotLose');
                }
            }
            
            // Mettre à jour le score
            if (currentPlayer === 1) {
                scores.player1++;
                document.getElementById('player1Score').textContent = scores.player1;
            } else {
                scores.player2++;
                document.getElementById('player2Score').textContent = scores.player2;
            }
        }
        
        winnerMessage.style.display = 'flex';
    }, 500);
}

// Réinitialiser le plateau
function resetBoard() {
    if (timer) clearInterval(timer);
    if (hurryUpTimer) clearTimeout(hurryUpTimer);
    timeLeft = 10;
    document.getElementById('timer').textContent = '10';
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('taken', 'winner', 'winner-player1', 'winner-player2');
    });
    // Ne pas réinitialiser currentPlayer ici, laissez l'appelant le gérer
    gameActive = true;
}

// Bouton rejouer
playAgainBtn.addEventListener('click', () => {
    winnerMessage.style.display = 'none';
    resetBoard();
    
    // Alterner qui commence : si le joueur a commencé, l'IA commence
    if (nextStarter === 1) {
        nextStarter = 2; // Prochaine fois l'IA commence
        currentPlayer = 1;
        gameActive = true;
        updateCurrentPlayer();
    } else {
        nextStarter = 1; // Prochaine fois le joueur commence
        currentPlayer = 2;
        gameActive = true;
        updateCurrentPlayer();
        // L'IA joue en premier
        setTimeout(() => {
            makeAIMove();
        }, 1000);
    }
});

// Bouton nouvelle partie
resetGameBtn.addEventListener('click', () => {
    // Annuler la partie en cours
    gameActive = false;
    if (timer) clearInterval(timer);
    if (hurryUpTimer) clearTimeout(hurryUpTimer);
    
    // Réinitialiser le plateau
    resetBoard();
    
    // Le joueur recommence toujours
    currentPlayer = 1;
    nextStarter = 1;
    updateCurrentPlayer();
});

// Bouton changer les avatars
changeAvatarsBtn.addEventListener('click', () => {
    // Annuler la partie en cours
    gameActive = false;
    if (timer) clearInterval(timer);
    if (hurryUpTimer) clearTimeout(hurryUpTimer);
    
    gameArea.style.display = 'none';
    
    // Réinitialiser complètement le jeu
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('taken', 'winner', 'winner-player1', 'winner-player2');
    });
    currentPlayer = 1;
    
    // Réinitialiser les scores
    scores = { player1: 0, player2: 0 };
    
    if (gameMode === 'computer') {
        // Retour à la sélection solo
        avatarSelectionSolo.style.display = 'block';
        
        // Désélectionner les avatars solo
        document.querySelectorAll('.avatar-btn-solo').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Désélectionner les équipes
        document.getElementById('teamRedBtn').classList.remove('selected');
        document.getElementById('teamBlueBtn').classList.remove('selected');
        document.getElementById('selectedTeam').textContent = 'Choisissez votre équipe...';
        document.getElementById('selectedTeam').style.color = '#666';
        selectedTeam = '';
        
        player1AvatarSolo = '';
        player1PseudoSolo = '';
        document.getElementById('player1SelectedSolo').textContent = 'Choisissez...';
        document.getElementById('player1NameSolo').value = '';
        document.getElementById('startComputerGame').disabled = true;
    } else {
        // Retour à la sélection 2 joueurs
        avatarSelection.style.display = 'block';
        
        // Désélectionner tous les avatars
        document.querySelectorAll('.avatar-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        player1Avatar = '';
        player2Avatar = '';
        player1Pseudo = '';
        player2Pseudo = '';
        document.getElementById('player1Selected').textContent = 'Choisissez...';
        document.getElementById('player2Selected').textContent = 'Choisissez...';
        document.getElementById('player1Name').value = '';
        document.getElementById('player2Name').value = '';
        startGameBtn.disabled = true;
    }
});

// Bouton accueil
homeButton.addEventListener('click', () => {
    // Annuler la partie en cours
    gameActive = false;
    if (timer) clearInterval(timer);
    if (hurryUpTimer) clearTimeout(hurryUpTimer);
    
    gameArea.style.display = 'none';
    homePage.style.display = 'block';
    document.body.classList.remove('game-active');
    
    // Réinitialiser complètement le jeu
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('taken', 'winner', 'winner-player1', 'winner-player2');
    });
    currentPlayer = 1;
    
    chatbot.showMessage('returnHome');
    
    // Réinitialiser les scores
    scores = { player1: 0, player2: 0 };
    
    // Désélectionner tous les avatars (2 joueurs)
    document.querySelectorAll('.avatar-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Désélectionner les avatars solo
    document.querySelectorAll('.avatar-btn-solo').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Désélectionner les équipes
    document.getElementById('teamRedBtn').classList.remove('selected');
    document.getElementById('teamBlueBtn').classList.remove('selected');
    document.getElementById('selectedTeam').textContent = 'Choisissez votre équipe...';
    document.getElementById('selectedTeam').style.color = '#666';
    selectedTeam = '';
    
    // Réinitialiser les variables
    player1Avatar = '';
    player2Avatar = '';
    player1Pseudo = '';
    player2Pseudo = '';
    player1AvatarSolo = '';
    player1PseudoSolo = '';
    gameMode = 'player';
    
    // Réinitialiser les champs 2 joueurs
    document.getElementById('player1Selected').textContent = 'Choisissez...';
    document.getElementById('player2Selected').textContent = 'Choisissez...';
    document.getElementById('player1Name').value = '';
    document.getElementById('player2Name').value = '';
    startGameBtn.disabled = true;
    
    // Réinitialiser les champs solo
    document.getElementById('player1SelectedSolo').textContent = 'Choisissez...';
    document.getElementById('player1NameSolo').value = '';
    document.getElementById('startComputerGame').disabled = true;
});

// Boutons retour accueil sur pages de sélection
document.getElementById('backToHome').addEventListener('click', () => {
    window.location.href = 'index.html';
});

document.getElementById('backToHomeSolo').addEventListener('click', () => {
    window.location.href = 'index.html';
});

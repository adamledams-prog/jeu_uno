// Variables globales
let player1Avatar = '';
let player2Avatar = '';
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
const gameArea = document.getElementById('gameArea');
const startGameBtn = document.getElementById('startGame');
const cells = document.querySelectorAll('.cell');
const resetGameBtn = document.getElementById('resetGame');
const changeAvatarsBtn = document.getElementById('changeAvatars');
const homeButton = document.getElementById('homeButton');
const winnerMessage = document.getElementById('winnerMessage');
const playAgainBtn = document.getElementById('playAgain');

// Bouton Jouer sur la page d'accueil
playButton.addEventListener('click', () => {
    homePage.style.display = 'none';
    avatarSelection.style.display = 'block';
    document.body.classList.add('game-active');
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
    
    avatarSelection.style.display = 'none';
    gameArea.style.display = 'block';
    
    // Afficher les avatars dans la zone de jeu
    document.getElementById('player1Avatar').textContent = player1Avatar;
    document.getElementById('player2Avatar').textContent = player2Avatar;
    document.getElementById('player1Score').textContent = scores.player1;
    document.getElementById('player2Score').textContent = scores.player2;
    
    updateCurrentPlayer();
    gameActive = true;
});

// Clic sur une case
cells.forEach(cell => {
    cell.addEventListener('click', () => {
        const index = cell.dataset.index;
        
        if (gameBoard[index] === '' && gameActive) {
            // Placer le symbole du joueur actuel
            const avatar = currentPlayer === 1 ? player1Avatar : player2Avatar;
            const symbol = currentPlayer === 1 ? '❌' : '⭕';
            gameBoard[index] = avatar;
            
            // Afficher seulement le symbole
            cell.textContent = symbol;
            cell.classList.add('taken');
            
            // Vérifier victoire
            if (checkWinner()) {
                endGame(false);
            } else if (checkDraw()) {
                endGame(true);
            } else {
                // Changer de joueur
                currentPlayer = currentPlayer === 1 ? 2 : 1;
                updateCurrentPlayer();
            }
        }
    });
});

// Mettre à jour l'affichage du joueur actuel
function updateCurrentPlayer() {
    const avatar = currentPlayer === 1 ? player1Avatar : player2Avatar;
    const pseudo = currentPlayer === 1 ? player1Pseudo : player2Pseudo;
    document.getElementById('currentPlayer').textContent = avatar;
    document.getElementById('playerName').textContent = pseudo;
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
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('taken', 'winner', 'winner-player1', 'winner-player2');
    });
    currentPlayer = 1;
    updateCurrentPlayer();
    gameActive = true;
}

// Bouton rejouer
playAgainBtn.addEventListener('click', () => {
    winnerMessage.style.display = 'none';
    resetBoard();
});

// Bouton nouvelle partie
resetGameBtn.addEventListener('click', () => {
    resetBoard();
});

// Bouton changer les avatars
changeAvatarsBtn.addEventListener('click', () => {
    gameArea.style.display = 'none';
    avatarSelection.style.display = 'block';
    resetBoard();
    
    // Réinitialiser les scores
    scores = { player1: 0, player2: 0 };
    
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
});

// Bouton accueil
homeButton.addEventListener('click', () => {
    gameArea.style.display = 'none';
    homePage.style.display = 'block';
    document.body.classList.remove('game-active');
    resetBoard();
    
    // Réinitialiser les scores
    scores = { player1: 0, player2: 0 };
    
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
});

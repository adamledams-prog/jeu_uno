// Variables globales
let deck = [];
let playerHand = [];
let opponentHand = [];
let discardPile = [];
let currentColor = '';
let currentValue = '';
let gameMode = '';
let difficulty = '';
let player1Name = 'Joueur 1';
let player2Name = 'Joueur 2';
let currentPlayer = 1; // 1 = joueur, 2 = adversaire
let gameActive = false;
let scores = { player1: 0, player2: 0 };
let drawCount = 0;

// Chatbot
const chatbot = {
    messages: {
        welcome: [
            "🎮 Bienvenue au UNO ! Cliquez pour commencer !",
            "👋 Prêt à jouer au UNO ? C'est parti !",
            "✨ Le meilleur jeu de cartes vous attend !"
        ],
        modeSelection: [
            "🎯 Choisissez votre mode de jeu !",
            "👥 Seul ou à deux ?",
            "🎮 Quel mode préférez-vous ?"
        ],
        difficulty: [
            "🤖 Quel niveau de défi voulez-vous ?",
            "🎯 Choisissez votre adversaire !",
            "💪 Prêt pour le défi ?"
        ],
        gameStart: [
            "🎲 C'est parti ! Bonne chance !",
            "🌟 La partie commence !",
            "🎯 Que le meilleur gagne !"
        ],
        playerTurn: [
            "🎮 À votre tour de jouer !",
            "💭 Réfléchissez bien !",
            "⚡ Quel sera votre coup ?"
        ],
        aiThinking: [
            "🤔 L'IA réfléchit...",
            "🧠 Je calcule mon coup...",
            "⚡ Laissez-moi voir..."
        ],
        playerWin: [
            "🎉 Victoire ! Bravo !",
            "👏 Excellent ! Vous avez gagné !",
            "🌟 Quelle performance !"
        ],
        aiWin: [
            "🤖 L'IA gagne cette fois !",
            "😎 J'ai gagné ! Revanche ?",
            "🎯 Victoire de l'ordinateur !"
        ],
        uno: [
            "🎴 UNO ! Plus qu'une carte !",
            "⚠️ Attention, UNO !",
            "🔥 UNO ! La tension monte !"
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

// Initialisation du deck
function initializeDeck() {
    deck = [];
    const colors = ['red', 'yellow', 'green', 'blue'];
    const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '🚫', '🔄', '+2'];
    
    // Cartes normales
    colors.forEach(color => {
        values.forEach(value => {
            deck.push({ color, value });
            if (value !== '0') {
                deck.push({ color, value }); // Deux fois sauf le 0
            }
        });
    });
    
    // Cartes spéciales (Joker et +4)
    for (let i = 0; i < 4; i++) {
        deck.push({ color: 'wild', value: 'joker' });
        deck.push({ color: 'wild', value: '+4' });
    }
    
    shuffleDeck();
}

// Mélanger le deck
function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Piocher une carte
function drawCard() {
    if (deck.length === 0) {
        // Remélanger la défausse dans le deck
        const lastCard = discardPile.pop();
        deck = [...discardPile];
        discardPile = [lastCard];
        shuffleDeck();
    }
    return deck.pop();
}

// Distribuer les cartes
function dealCards() {
    playerHand = [];
    opponentHand = [];
    
    for (let i = 0; i < 7; i++) {
        playerHand.push(drawCard());
        opponentHand.push(drawCard());
    }
    
    // Première carte de la défausse
    let firstCard = drawCard();
    while (firstCard.color === 'wild') {
        deck.unshift(firstCard);
        shuffleDeck();
        firstCard = drawCard();
    }
    
    discardPile.push(firstCard);
    currentColor = firstCard.color;
    currentValue = firstCard.value;
}

// Afficher les cartes du joueur
function displayPlayerHand(animated = false) {
    const playerHandElement = document.getElementById('playerHand');
    playerHandElement.innerHTML = '';
    
    playerHand.forEach((card, index) => {
        const cardElement = createCardElement(card, index);
        
        if (animated) {
            cardElement.classList.add('dealing');
            cardElement.style.animationDelay = `${index * 0.15}s`;
        }
        
        playerHandElement.appendChild(cardElement);
    });
}

// Créer un élément carte
function createCardElement(card, index) {
    const cardDiv = document.createElement('div');
    cardDiv.className = `card ${card.color}`;
    
    // Afficher la valeur appropriée
    let displayValue = card.value;
    if (card.value === 'joker') {
        displayValue = '🃏';
    } else if (card.value === '+4') {
        displayValue = '+4<br>🃏';
    }
    
    cardDiv.innerHTML = displayValue;
    cardDiv.dataset.index = index;
    
    // Vérifier si la carte peut être jouée
    if (!canPlayCard(card)) {
        cardDiv.classList.add('disabled');
    } else {
        cardDiv.addEventListener('click', () => playCard(index));
    }
    
    return cardDiv;
}

// Vérifier si une carte peut être jouée
function canPlayCard(card) {
    if (!gameActive || currentPlayer !== 1) return false;
    
    if (card.color === 'wild') return true;
    if (card.color === currentColor) return true;
    if (card.value === currentValue) return true;
    
    return false;
}

// Jouer une carte
function playCard(index) {
    if (!gameActive || currentPlayer !== 1) return;
    
    const card = playerHand[index];
    if (!canPlayCard(card)) return;
    
    // Retirer la carte de la main
    playerHand.splice(index, 1);
    
    // Vérifier UNO
    if (playerHand.length === 1) {
        chatbot.showMessage('uno');
    }
    
    // Ajouter à la défausse
    discardPile.push(card);
    
    // Si c'est une carte wild, demander la couleur
    if (card.color === 'wild') {
        showColorSelector();
        return;
    }
    
    currentColor = card.color;
    currentValue = card.value;
    
    // Appliquer l'effet de la carte
    applyCardEffect(card, 1);
    
    updateDiscardPile();
    displayPlayerHand();
    updateCardsCount();
    
    // Vérifier la victoire
    if (playerHand.length === 0) {
        endGame(1);
        return;
    }
    
    // Passer au joueur suivant si pas d'effet bloquant
    if (card.value !== '🚫') {
        switchPlayer();
    }
}

// Appliquer l'effet d'une carte
function applyCardEffect(card, player) {
    const opponent = player === 1 ? 2 : 1;
    
    switch (card.value) {
        case '+2':
            // L'adversaire pioche 2 cartes
            if (opponent === 1) {
                playerHand.push(drawCard());
                playerHand.push(drawCard());
            } else {
                opponentHand.push(drawCard());
                opponentHand.push(drawCard());
            }
            break;
            
        case '+4':
            // L'adversaire pioche 4 cartes
            for (let i = 0; i < 4; i++) {
                if (opponent === 1) {
                    playerHand.push(drawCard());
                } else {
                    opponentHand.push(drawCard());
                }
            }
            break;
            
        case '🔄':
            // Inverser l'ordre (en jeu à 2, passe juste le tour)
            break;
            
        case '🚫':
            // Passer le tour de l'adversaire
            break;
    }
}

// Afficher le sélecteur de couleur
function showColorSelector() {
    const colorSelector = document.getElementById('colorSelector');
    colorSelector.style.display = 'block';
    
    const colorButtons = colorSelector.querySelectorAll('.color-btn');
    colorButtons.forEach(btn => {
        btn.onclick = () => selectColor(btn.dataset.color);
    });
}

// Sélectionner une couleur
function selectColor(color) {
    currentColor = color;
    document.getElementById('colorSelector').style.display = 'none';
    
    const lastCard = discardPile[discardPile.length - 1];
    applyCardEffect(lastCard, 1);
    
    updateDiscardPile();
    displayPlayerHand();
    updateCardsCount();
    
    if (playerHand.length === 0) {
        endGame(1);
        return;
    }
    
    switchPlayer();
}

// Mettre à jour la pile de défausse
function updateDiscardPile() {
    const discardPileElement = document.getElementById('discardPile');
    discardPileElement.innerHTML = '';
    
    if (discardPile.length > 0) {
        const lastCard = discardPile[discardPile.length - 1];
        const cardElement = document.createElement('div');
        cardElement.className = `card ${lastCard.color === 'wild' ? currentColor : lastCard.color}`;
        
        let displayValue = lastCard.value;
        if (lastCard.value === 'joker') {
            displayValue = '🃏';
        } else if (lastCard.value === '+4') {
            displayValue = '+4<br>🃏';
        }
        
        cardElement.innerHTML = displayValue;
        cardElement.style.cursor = 'default';
        discardPileElement.appendChild(cardElement);
    }
}

// Mettre à jour le compteur de cartes
function updateCardsCount() {
    document.getElementById('opponentCards').textContent = `${opponentHand.length} carte${opponentHand.length > 1 ? 's' : ''}`;
}

// Changer de joueur
function switchPlayer() {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    
    const deckElement = document.getElementById('deck');
    
    if (currentPlayer === 1) {
        chatbot.showMessage('playerTurn');
        deckElement.classList.remove('disabled');
        drawCount = 0;
    } else {
        deckElement.classList.add('disabled');
        chatbot.showMessage('aiThinking');
        
        if (gameMode === 'computer') {
            setTimeout(() => {
                makeAIMove();
            }, 2000);
        }
    }
    
    displayPlayerHand();
}

// IA - Faire un coup
function makeAIMove() {
    if (!gameActive || currentPlayer !== 2) return;
    
    let playableCards = opponentHand.filter(card => canPlayCardAI(card));
    
    if (playableCards.length === 0) {
        // Piocher une carte
        const drawnCard = drawCard();
        opponentHand.push(drawnCard);
        updateCardsCount();
        
        if (canPlayCardAI(drawnCard)) {
            playableCards = [drawnCard];
        } else {
            switchPlayer();
            return;
        }
    }
    
    // Choisir une carte selon la difficulté
    let selectedCard;
    if (difficulty === 'easy') {
        selectedCard = playableCards[Math.floor(Math.random() * playableCards.length)];
    } else if (difficulty === 'medium') {
        selectedCard = selectMediumAICard(playableCards);
    } else {
        selectedCard = selectHardAICard(playableCards);
    }
    
    // Jouer la carte
    const index = opponentHand.indexOf(selectedCard);
    opponentHand.splice(index, 1);
    
    // Vérifier UNO
    if (opponentHand.length === 1) {
        chatbot.showMessage('uno');
    }
    
    discardPile.push(selectedCard);
    
    // Choisir la couleur si wild
    if (selectedCard.color === 'wild') {
        currentColor = chooseColorAI();
    } else {
        currentColor = selectedCard.color;
        currentValue = selectedCard.value;
    }
    
    applyCardEffect(selectedCard, 2);
    
    updateDiscardPile();
    updateCardsCount();
    displayPlayerHand();
    
    // Vérifier la victoire
    if (opponentHand.length === 0) {
        endGame(2);
        return;
    }
    
    // Passer au joueur suivant
    if (selectedCard.value !== '🚫') {
        switchPlayer();
    }
}

// Vérifier si l'IA peut jouer une carte
function canPlayCardAI(card) {
    if (card.color === 'wild') return true;
    if (card.color === currentColor) return true;
    if (card.value === currentValue) return true;
    return false;
}

// IA moyenne - Choisir une carte
function selectMediumAICard(cards) {
    // Priorité aux cartes spéciales
    const specialCards = cards.filter(c => ['🚫', '🔄', '+2', '+4', 'joker'].includes(c.value));
    if (specialCards.length > 0 && Math.random() < 0.6) {
        return specialCards[Math.floor(Math.random() * specialCards.length)];
    }
    return cards[Math.floor(Math.random() * cards.length)];
}

// IA difficile - Choisir une carte
function selectHardAICard(cards) {
    // Priorité maximale aux cartes +4 et +2
    const drawCards = cards.filter(c => c.value === '+4' || c.value === '+2');
    if (drawCards.length > 0) {
        return drawCards[0];
    }
    
    // Ensuite les cartes spéciales
    const specialCards = cards.filter(c => ['🚫', '🔄', 'joker'].includes(c.value));
    if (specialCards.length > 0) {
        return specialCards[0];
    }
    
    // Sinon jouer la carte la plus haute
    return cards.reduce((max, card) => {
        const val1 = isNaN(card.value) ? 10 : parseInt(card.value);
        const val2 = isNaN(max.value) ? 10 : parseInt(max.value);
        return val1 > val2 ? card : max;
    });
}

// Choisir une couleur (IA)
function chooseColorAI() {
    // Compter les couleurs dans la main
    const colorCount = { red: 0, yellow: 0, green: 0, blue: 0 };
    opponentHand.forEach(card => {
        if (card.color !== 'wild') {
            colorCount[card.color]++;
        }
    });
    
    // Choisir la couleur la plus fréquente
    return Object.keys(colorCount).reduce((a, b) => 
        colorCount[a] > colorCount[b] ? a : b
    );
}

// Piocher une carte (joueur)
document.getElementById('deck').addEventListener('click', () => {
    if (!gameActive || currentPlayer !== 1) return;
    
    const deckElement = document.getElementById('deck');
    if (deckElement.classList.contains('disabled')) return;
    
    const card = drawCard();
    playerHand.push(card);
    drawCount++;
    
    displayPlayerHand();
    updateCardsCount();
    
    // Après avoir pioché, si la carte ne peut pas être jouée, passer le tour
    if (drawCount >= 1) {
        const canPlay = playerHand.some(c => canPlayCard(c));
        if (!canPlay) {
            drawCount = 0;
            switchPlayer();
        }
    }
});

// Terminer le jeu
function endGame(winner) {
    gameActive = false;
    
    setTimeout(() => {
        const winnerName = winner === 1 ? player1Name : player2Name;
        document.getElementById('winnerText').textContent = `${winnerName} gagne !`;
        
        if (winner === 1) {
            scores.player1++;
            chatbot.showMessage('playerWin');
        } else {
            scores.player2++;
            chatbot.showMessage('aiWin');
        }
        
        document.getElementById('playerScore').textContent = scores.player1;
        document.getElementById('winnerMessage').style.display = 'flex';
    }, 500);
}

// Réinitialiser le jeu
function resetGame() {
    initializeDeck();
    dealCards();
    currentPlayer = 1;
    gameActive = true;
    drawCount = 0;
    
    updateDiscardPile();
    displayPlayerHand(true); // Animation de distribution
    updateCardsCount();
    
    document.getElementById('winnerMessage').style.display = 'none';
    
    // Afficher le message après l'animation
    setTimeout(() => {
        chatbot.showMessage('gameStart');
    }, 1500);
}

// Événements de navigation
document.addEventListener('DOMContentLoaded', () => {
    chatbot.showMessage('welcome');
});

document.getElementById('homeGameCard').addEventListener('click', () => {
    document.getElementById('homePage').style.display = 'none';
    document.getElementById('modeSelection').style.display = 'block';
    chatbot.showMessage('modeSelection');
});

document.getElementById('twoPlayersBtn').addEventListener('click', () => {
    gameMode = 'twoPlayers';
    document.getElementById('modeSelection').style.display = 'none';
    document.getElementById('playerSelection').style.display = 'block';
    document.getElementById('player2Config').style.display = 'block';
});

document.getElementById('computerBtn').addEventListener('click', () => {
    gameMode = 'computer';
    document.getElementById('modeSelection').style.display = 'none';
    document.getElementById('difficultySelection').style.display = 'block';
    chatbot.showMessage('difficulty');
});

document.getElementById('easyMode').addEventListener('click', () => {
    difficulty = 'easy';
    document.getElementById('difficultySelection').style.display = 'none';
    document.getElementById('playerSelection').style.display = 'block';
    document.getElementById('player2Config').style.display = 'none';
    player2Name = '🤖 Robot Facile';
});

document.getElementById('mediumMode').addEventListener('click', () => {
    difficulty = 'medium';
    document.getElementById('difficultySelection').style.display = 'none';
    document.getElementById('playerSelection').style.display = 'block';
    document.getElementById('player2Config').style.display = 'none';
    player2Name = '🤖 Robot Moyen';
});

document.getElementById('hardMode').addEventListener('click', () => {
    difficulty = 'hard';
    document.getElementById('difficultySelection').style.display = 'none';
    document.getElementById('playerSelection').style.display = 'block';
    document.getElementById('player2Config').style.display = 'none';
    player2Name = '🤖 Robot Expert';
});

document.getElementById('backFromDifficulty').addEventListener('click', () => {
    document.getElementById('difficultySelection').style.display = 'none';
    document.getElementById('modeSelection').style.display = 'block';
});

document.getElementById('startGame').addEventListener('click', () => {
    player1Name = document.getElementById('player1Name').value.trim() || 'Joueur 1';
    
    if (gameMode === 'twoPlayers') {
        player2Name = document.getElementById('player2Name').value.trim() || 'Joueur 2';
    }
    
    document.getElementById('playerSelection').style.display = 'none';
    document.getElementById('gameArea').style.display = 'block';
    
    document.getElementById('currentPlayerName').textContent = player1Name;
    document.getElementById('opponentName').textContent = player2Name;
    document.getElementById('playerScore').textContent = scores.player1;
    
    resetGame();
});

document.getElementById('backFromPlayers').addEventListener('click', () => {
    document.getElementById('playerSelection').style.display = 'none';
    if (gameMode === 'computer') {
        document.getElementById('difficultySelection').style.display = 'block';
    } else {
        document.getElementById('modeSelection').style.display = 'block';
    }
});

document.getElementById('playAgain').addEventListener('click', () => {
    resetGame();
});

document.getElementById('resetGame').addEventListener('click', () => {
    resetGame();
});

document.getElementById('changeMode').addEventListener('click', () => {
    document.getElementById('gameArea').style.display = 'none';
    document.getElementById('modeSelection').style.display = 'block';
    scores = { player1: 0, player2: 0 };
    chatbot.showMessage('modeSelection');
});

document.getElementById('homeButton').addEventListener('click', () => {
    document.getElementById('gameArea').style.display = 'none';
    document.getElementById('homePage').style.display = 'block';
    scores = { player1: 0, player2: 0 };
    chatbot.showMessage('welcome');
});

document.getElementById('backToHomeMode').addEventListener('click', () => {
    window.location.href = 'index.html';
});

document.getElementById('backToHomePlayers').addEventListener('click', () => {
    window.location.href = 'index.html';
});

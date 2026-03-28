// ============================================
// JEU DU PENDU
// ============================================

// Initialiser le chatbot
const chatbot = window.Chatbot ? new Chatbot(document.getElementById('chatbotMessages')) : null;

// Dictionnaire de mots par catégorie
const WORDS = {
    animaux: [
        { word: 'ELEPHANT', hint: 'Le plus gros animal terrestre' },
        { word: 'GIRAFE', hint: 'Animal avec un très long cou' },
        { word: 'DAUPHIN', hint: 'Mammifère marin très intelligent' },
        { word: 'KANGOUROU', hint: 'Animal australien qui saute' },
        { word: 'PAPILLON', hint: 'Insecte avec de belles ailes colorées' },
        { word: 'CROCODILE', hint: 'Reptile avec de grandes dents' },
        { word: 'LION', hint: 'Le roi de la savane' },
        { word: 'PINGOUIN', hint: 'Oiseau qui ne peut pas voler mais nage bien' },
        { word: 'TIGRE', hint: 'Grand félin rayé orange et noir' },
        { word: 'ZEBRE', hint: 'Cheval rayé noir et blanc' }
    ],
    pays: [
        { word: 'FRANCE', hint: 'Pays de la tour Eiffel' },
        { word: 'JAPON', hint: 'Pays du soleil levant' },
        { word: 'BRESIL', hint: 'Pays du carnaval de Rio' },
        { word: 'EGYPTE', hint: 'Pays des pyramides' },
        { word: 'AUSTRALIE', hint: 'Pays-continent avec des kangourous' },
        { word: 'CANADA', hint: 'Grand pays au nord des États-Unis' },
        { word: 'ITALIE', hint: 'Pays en forme de botte' },
        { word: 'ESPAGNE', hint: 'Pays de la paella et du flamenco' },
        { word: 'MEXIQUE', hint: 'Pays des tacos et des mariachis' },
        { word: 'CHINE', hint: 'Pays de la Grande Muraille' }
    ],
    films: [
        { word: 'TITANIC', hint: 'Film sur un bateau qui coule' },
        { word: 'AVATAR', hint: 'Film avec des créatures bleues' },
        { word: 'INCEPTION', hint: 'Film sur les rêves dans les rêves' },
        { word: 'FROZEN', hint: 'Reine des neiges en anglais' },
        { word: 'BATMAN', hint: 'Superhéros chauve-souris' },
        { word: 'GLADIATOR', hint: 'Film sur un combattant romain' },
        { word: 'MATRIX', hint: 'Réalité virtuelle et pilules' },
        { word: 'SHREK', hint: 'Ogre vert et âne bavard' },
        { word: 'NARNIA', hint: 'Monde magique derrière une armoire' },
        { word: 'JUMANJI', hint: 'Jeu de société dangereux' }
    ],
    sports: [
        { word: 'FOOTBALL', hint: 'Sport le plus populaire au monde' },
        { word: 'BASKETBALL', hint: 'Sport avec un panier en hauteur' },
        { word: 'TENNIS', hint: 'Sport avec une raquette et une balle jaune' },
        { word: 'NATATION', hint: 'Sport aquatique' },
        { word: 'ATHLETISME', hint: 'Course, saut, lancer' },
        { word: 'CYCLISME', hint: 'Sport avec un vélo' },
        { word: 'ESCALADE', hint: 'Sport de grimpe' },
        { word: 'KARATE', hint: 'Art martial japonais' },
        { word: 'RUGBY', hint: 'Sport avec un ballon ovale' },
        { word: 'VOLLEYBALL', hint: 'Sport avec un filet et une balle' }
    ],
    fruits: [
        { word: 'BANANE', hint: 'Fruit jaune courbé' },
        { word: 'POMME', hint: 'Fruit rouge ou vert croquant' },
        { word: 'FRAISE', hint: 'Petit fruit rouge avec des graines' },
        { word: 'ORANGE', hint: 'Fruit rond et juteux' },
        { word: 'ANANAS', hint: 'Fruit tropical avec une couronne' },
        { word: 'CERISE', hint: 'Petit fruit rouge à noyau' },
        { word: 'PASTÈQUE', hint: 'Gros fruit vert et rouge très juteux' },
        { word: 'MANGUE', hint: 'Fruit tropical orange' },
        { word: 'KIWI', hint: 'Fruit poilu vert à l\'intérieur' },
        { word: 'RAISIN', hint: 'Fruit en grappes' }
    ],
    metiers: [
        { word: 'MEDECIN', hint: 'Soigne les malades' },
        { word: 'PROFESSEUR', hint: 'Enseigne à l\'école' },
        { word: 'POMPIER', hint: 'Éteint les feux' },
        { word: 'CUISINIER', hint: 'Prépare de bons plats' },
        { word: 'PILOTE', hint: 'Conduit des avions' },
        { word: 'DENTISTE', hint: 'Soigne les dents' },
        { word: 'ARCHITECTE', hint: 'Dessine des bâtiments' },
        { word: 'ASTRONAUTE', hint: 'Voyage dans l\'espace' },
        { word: 'MUSICIEN', hint: 'Joue des instruments' },
        { word: 'POLICIER', hint: 'Protège les citoyens' }
    ]
};

// Variables globales
let currentWord = '';
let currentHint = '';
let currentCategory = '';
let guessedLetters = [];
let wrongGuesses = 0;
let maxWrongGuesses = 7;
let score = 0;
let lives = 7;
let gameActive = false;
let hintUsed = false;

// Parties du pendu à afficher
const hangmanParts = [
    '.head',
    '.body',
    '.left-arm',
    '.right-arm',
    '.left-leg',
    '.right-leg',
    '.sad-face'
];

// Éléments DOM
const homePage = document.getElementById('homePage');
const homeGameCard = document.getElementById('homeGameCard');
const categorySelection = document.getElementById('categorySelection');
const gameArea = document.getElementById('gameArea');
const endMessage = document.getElementById('endMessage');

// Afficher message de bienvenue
if (chatbot) {
    chatbot.showMessage('welcome');
}

// Événement page d'accueil
homeGameCard.addEventListener('click', () => {
    homePage.style.display = 'none';
    categorySelection.style.display = 'block';
    if (chatbot) {
        chatbot.showMessage('modeSelection');
    }
});

// Sélection de catégorie
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        currentCategory = this.dataset.category;
        startGame();
    });
});

// Boutons de navigation
document.getElementById('backToHomeCategory').addEventListener('click', () => {
    window.location.href = 'index.html';
});

document.getElementById('homeButtonTop').addEventListener('click', () => {
    window.location.href = 'index.html';
});

document.getElementById('newWord').addEventListener('click', () => {
    resetGame();
    pickNewWord();
});

document.getElementById('changeCategory').addEventListener('click', () => {
    gameArea.style.display = 'none';
    categorySelection.style.display = 'block';
    if (chatbot) {
        chatbot.displayMessage('📂 Choisissez une nouvelle catégorie !');
    }
});

document.getElementById('playAgain').addEventListener('click', () => {
    endMessage.style.display = 'none';
    resetGame();
    pickNewWord();
});

// Bouton indice
document.getElementById('hintButton').addEventListener('click', () => {
    if (!hintUsed && gameActive && lives > 3) {
        hintUsed = true;
        lives -= 3;
        for (let i = 0; i < 3; i++) {
            wrongGuesses++;
            showHangmanPart();
        }
        updateLives();
        document.getElementById('hintDisplay').style.display = 'block';
        document.getElementById('hintText').textContent = currentHint;
        document.getElementById('hintButton').disabled = true;
        if (chatbot) {
            chatbot.displayMessage('💡 Voici un indice ! (-3 vies)');
        }

        // Vérifier si le joueur a perdu
        if (wrongGuesses >= maxWrongGuesses) {
            setTimeout(loseGame, 500);
        }
    }
});

// Bouton révéler une lettre
document.getElementById('revealLetterButton').addEventListener('click', () => {
    if (gameActive && lives > 3) {
        // Trouver toutes les lettres non devinées
        const unrevealedLetters = [];
        for (let i = 0; i < currentWord.length; i++) {
            const letter = currentWord[i];
            if (!guessedLetters.includes(letter)) {
                unrevealedLetters.push(letter);
            }
        }

        if (unrevealedLetters.length > 0) {
            // Choisir une lettre au hasard
            const randomLetter = unrevealedLetters[Math.floor(Math.random() * unrevealedLetters.length)];

            // Ajouter la lettre aux lettres devinées
            guessedLetters.push(randomLetter);

            // Coûte 3 vies
            lives -= 3;
            for (let i = 0; i < 3; i++) {
                wrongGuesses++;
                showHangmanPart();
            }
            updateLives();

            // Mettre à jour l'affichage
            displayWord();

            // Désactiver les touches correspondantes sur le clavier virtuel
            document.querySelectorAll('.key').forEach(key => {
                if (key.dataset.letter === randomLetter) {
                    key.classList.add('correct');
                    key.disabled = true;
                }
            });

            if (chatbot) {
                chatbot.displayMessage(`🔍 Lettre révélée : ${randomLetter} (-3 vies)`);
            }

            // Vérifier si le mot est complet
            if (isWordComplete()) {
                setTimeout(winGame, 500);
            }

            // Vérifier si le joueur a perdu
            if (wrongGuesses >= maxWrongGuesses) {
                setTimeout(loseGame, 500);
            }
        }
    }
});


// Démarrer le jeu
function startGame() {
    categorySelection.style.display = 'none';
    gameArea.style.display = 'block';

    // Afficher la catégorie
    const categoryNames = {
        animaux: '🐾 Animaux',
        pays: '🌍 Pays',
        films: '🎬 Films',
        sports: '⚽ Sports',
        fruits: '🍎 Fruits',
        metiers: '👨‍💼 Métiers'
    };

    document.getElementById('currentCategory').textContent = categoryNames[currentCategory];

    // Créer le clavier
    createKeyboard();

    // Choisir un mot
    pickNewWord();

    if (chatbot) {
        chatbot.showMessage('gameStart');
    }
}

// Créer le clavier
function createKeyboard() {
    const keyboard = document.getElementById('keyboard');
    keyboard.innerHTML = '';

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    letters.forEach(letter => {
        const key = document.createElement('button');
        key.className = 'key';
        key.textContent = letter;
        key.dataset.letter = letter;
        key.addEventListener('click', () => handleGuess(letter));
        keyboard.appendChild(key);
    });
}

// Choisir un nouveau mot
function pickNewWord() {
    const categoryWords = WORDS[currentCategory];
    const randomIndex = Math.floor(Math.random() * categoryWords.length);
    const wordData = categoryWords[randomIndex];

    currentWord = wordData.word;
    currentHint = wordData.hint;
    guessedLetters = [];
    hintUsed = false;
    gameActive = true;

    document.getElementById('hintDisplay').style.display = 'none';
    document.getElementById('hintButton').disabled = false;

    displayWord();
    updateUsedLetters();
}

// Afficher le mot
function displayWord() {
    const wordDisplay = document.getElementById('wordDisplay');
    wordDisplay.innerHTML = '';

    for (let letter of currentWord) {
        const span = document.createElement('span');
        span.className = 'letter';

        if (letter === ' ') {
            span.textContent = ' ';
            span.style.borderBottom = 'none';
        } else if (guessedLetters.includes(letter)) {
            span.textContent = letter;
        } else {
            span.textContent = '_';
        }

        wordDisplay.appendChild(span);
    }
}

// Gérer une tentative
function handleGuess(letter) {
    if (!gameActive || guessedLetters.includes(letter)) return;

    guessedLetters.push(letter);

    const key = document.querySelector(`[data-letter="${letter}"]`);
    key.disabled = true;

    if (currentWord.includes(letter)) {
        // Bonne lettre
        key.classList.add('correct');
        displayWord();

        // Vérifier si le mot est complet
        if (isWordComplete()) {
            winGame();
        }
    } else {
        // Mauvaise lettre
        key.classList.add('wrong');
        wrongGuesses++;
        lives--;
        updateLives();
        showHangmanPart();

        if (wrongGuesses >= maxWrongGuesses) {
            loseGame();
        }
    }

    updateUsedLetters();
}

// Afficher une partie du pendu
function showHangmanPart() {
    if (wrongGuesses > 0 && wrongGuesses <= hangmanParts.length) {
        const part = document.querySelector('.hangman-part' + hangmanParts[wrongGuesses - 1]);
        if (part) {
            part.style.display = 'block';
        }
    }
}

// Mettre à jour les vies
function updateLives() {
    document.getElementById('lives').textContent = lives;
    const livesElement = document.getElementById('lives');

    if (lives <= 2) {
        livesElement.style.color = '#e74c3c';
        livesElement.style.fontSize = '1.5rem';
    }
}

// Mettre à jour les lettres utilisées
function updateUsedLetters() {
    const wrongLetters = guessedLetters.filter(letter => !currentWord.includes(letter));
    document.getElementById('usedLetters').textContent = wrongLetters.join(', ') || 'Aucune';
}

// Vérifier si le mot est complet
function isWordComplete() {
    for (let letter of currentWord) {
        if (letter !== ' ' && !guessedLetters.includes(letter)) {
            return false;
        }
    }
    return true;
}

// Gagner
function winGame() {
    gameActive = false;
    score += lives * 10; // Points bonus selon vies restantes
    document.getElementById('score').textContent = score;

    setTimeout(() => {
        document.getElementById('endEmoji').textContent = '🎉';
        document.getElementById('endTitle').textContent = 'Bravo ! Vous avez gagné !';
        document.getElementById('endWord').textContent = `Le mot était : ${currentWord}`;
        document.getElementById('endScore').textContent = `Score : ${score} points`;
        endMessage.style.display = 'flex';

        if (chatbot) {
            chatbot.displayMessage('🎉 Excellent ! Tu as trouvé le mot !');
        }
    }, 500);
}

// Perdre
function loseGame() {
    gameActive = false;

    // Révéler le mot
    guessedLetters = currentWord.split('');
    displayWord();

    setTimeout(() => {
        document.getElementById('endEmoji').textContent = '😢';
        document.getElementById('endTitle').textContent = 'Perdu !';
        document.getElementById('endWord').textContent = `Le mot était : ${currentWord}`;
        document.getElementById('endScore').textContent = `Score final : ${score} points`;
        endMessage.style.display = 'flex';

        if (chatbot) {
            chatbot.displayMessage('😢 Dommage ! Le pendu est complet...');
        }
    }, 500);
}

// Réinitialiser le jeu
function resetGame() {
    wrongGuesses = 0;
    lives = maxWrongGuesses;
    guessedLetters = [];
    hintUsed = false;
    gameActive = true;

    document.getElementById('lives').textContent = lives;
    document.getElementById('lives').style.color = '#2c3e50';
    document.getElementById('lives').style.fontSize = '1.3rem';

    // Cacher toutes les parties du pendu
    document.querySelectorAll('.hangman-part.head, .hangman-part.body, .hangman-part.left-arm, .hangman-part.right-arm, .hangman-part.left-leg, .hangman-part.right-leg, .hangman-part.sad-face').forEach(part => {
        part.style.display = 'none';
    });

    // Réinitialiser le clavier
    document.querySelectorAll('.key').forEach(key => {
        key.disabled = false;
        key.classList.remove('correct', 'wrong');
    });

    document.getElementById('hintDisplay').style.display = 'none';
    document.getElementById('hintButton').disabled = false;
    document.getElementById('usedLetters').textContent = 'Aucune';
}

// Support du clavier physique
document.addEventListener('keydown', (e) => {
    if (!gameActive) return;

    const letter = e.key.toUpperCase();
    if (/^[A-Z]$/.test(letter)) {
        const key = document.querySelector(`[data-letter="${letter}"]`);
        if (key && !key.disabled) {
            handleGuess(letter);
        }
    }
});

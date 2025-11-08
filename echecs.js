// ============================================
// JEU D'ÉCHECS
// ============================================

// Variables globales
let board = [];
let currentPlayer = 'white'; // 'white' ou 'black'
let selectedSquare = null;
let validMoves = [];
let gameActive = false;
let moveHistory = [];
let capturedPieces = { white: [], black: [] };

// Pièces Unicode
const PIECES = {
    white: {
        king: '♔',
        queen: '♕',
        rook: '♖',
        bishop: '♗',
        knight: '♘',
        pawn: '♙'
    },
    black: {
        king: '♚',
        queen: '♛',
        rook: '♜',
        bishop: '♝',
        knight: '♞',
        pawn: '♟'
    }
};

// Chatbot messages
const chatbot = {
    messages: {
        welcome: [
            "♟️ Bienvenue aux Échecs ! Le roi des jeux !",
            "👑 Prêt pour une partie d'échecs ?",
            "♟️ Que la meilleure stratégie gagne !"
        ],
        modeSelection: [
            "🎮 Choisissez votre mode de jeu !",
            "👥 Jouez à deux ou contre l'ordinateur ?",
            "🎯 Quel mode préférez-vous ?"
        ],
        gameStart: [
            "🎲 La partie commence ! Bonne chance !",
            "♟️ Les blancs commencent ! À vous de jouer !",
            "👑 Que le meilleur stratège gagne !"
        ],
        check: [
            "⚠️ Échec au roi !",
            "👑 Attention, votre roi est en danger !",
            "⚡ Échec ! Protégez votre roi !"
        ],
        checkmate: [
            "🎉 Échec et mat ! Partie terminée !",
            "👑 Le roi est mat ! Victoire !",
            "🏆 Échec et mat ! Félicitations !"
        ],
        capture: [
            "💥 Belle capture !",
            "⚔️ Pièce capturée !",
            "🎯 Excellente prise !"
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
const gameArea = document.getElementById('gameArea');
const chessBoard = document.getElementById('chessBoard');
const endMessage = document.getElementById('endMessage');

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    chatbot.showMessage('welcome');
});

// Navigation
homeGameCard.addEventListener('click', () => {
    homePage.style.display = 'none';
    modeSelection.style.display = 'block';
    chatbot.showMessage('modeSelection');
});

document.getElementById('twoPlayersBtn').addEventListener('click', () => {
    modeSelection.style.display = 'none';
    gameArea.style.display = 'block';
    startGame();
});

document.getElementById('backToHomeMode').addEventListener('click', () => {
    window.location.href = 'index.html';
});

document.getElementById('resetGame').addEventListener('click', () => {
    resetGame();
});

document.getElementById('undoMove').addEventListener('click', () => {
    undoLastMove();
});

document.getElementById('homeButton').addEventListener('click', () => {
    window.location.href = 'index.html';
});

document.getElementById('playAgain').addEventListener('click', () => {
    endMessage.style.display = 'none';
    resetGame();
});

// Initialiser le plateau
function initializeBoard() {
    board = [
        // Rangée 8 (pièces noires)
        [{ type: 'rook', color: 'black' }, { type: 'knight', color: 'black' }, { type: 'bishop', color: 'black' }, { type: 'queen', color: 'black' },
        { type: 'king', color: 'black' }, { type: 'bishop', color: 'black' }, { type: 'knight', color: 'black' }, { type: 'rook', color: 'black' }],
        // Rangée 7 (pions noirs)
        Array(8).fill(null).map(() => ({ type: 'pawn', color: 'black' })),
        // Rangées vides 6-3
        Array(8).fill(null),
        Array(8).fill(null),
        Array(8).fill(null),
        Array(8).fill(null),
        // Rangée 2 (pions blancs)
        Array(8).fill(null).map(() => ({ type: 'pawn', color: 'white' })),
        // Rangée 1 (pièces blanches)
        [{ type: 'rook', color: 'white' }, { type: 'knight', color: 'white' }, { type: 'bishop', color: 'white' }, { type: 'queen', color: 'white' },
        { type: 'king', color: 'white' }, { type: 'bishop', color: 'white' }, { type: 'knight', color: 'white' }, { type: 'rook', color: 'white' }]
    ];
}

// Afficher le plateau
function renderBoard() {
    chessBoard.innerHTML = '';

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = 'square';
            square.className += (row + col) % 2 === 0 ? ' light' : ' dark';
            square.dataset.row = row;
            square.dataset.col = col;

            const piece = board[row][col];
            if (piece) {
                const pieceElement = document.createElement('span');
                pieceElement.className = 'piece';
                pieceElement.textContent = PIECES[piece.color][piece.type];
                square.appendChild(pieceElement);
            }

            square.addEventListener('click', () => handleSquareClick(row, col));
            chessBoard.appendChild(square);
        }
    }
}

// Gérer le clic sur une case
function handleSquareClick(row, col) {
    if (!gameActive) return;

    const square = board[row][col];

    // Si aucune pièce n'est sélectionnée
    if (selectedSquare === null) {
        if (square && square.color === currentPlayer) {
            selectSquare(row, col);
        }
    } else {
        // Si on clique sur une case valide
        if (isValidMove(selectedSquare.row, selectedSquare.col, row, col)) {
            movePiece(selectedSquare.row, selectedSquare.col, row, col);
            clearSelection();
            switchPlayer();
        } else if (square && square.color === currentPlayer) {
            // Sélectionner une autre pièce de la même couleur
            clearSelection();
            selectSquare(row, col);
        } else {
            clearSelection();
        }
    }
}

// Sélectionner une case
function selectSquare(row, col) {
    selectedSquare = { row, col };
    const squareElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    squareElement.classList.add('selected');

    // Afficher les mouvements valides (qui ne laissent pas le roi en échec)
    validMoves = getValidMoves(row, col);

    // Si le joueur est en échec et n'a pas de mouvements valides avec cette pièce
    if (isKingInCheck(currentPlayer) && validMoves.length === 0) {
        document.getElementById('gameMessage').textContent = '⚠️ Cette pièce ne peut pas vous sortir de l\'échec !';
        setTimeout(() => {
            if (isKingInCheck(currentPlayer)) {
                document.getElementById('gameMessage').textContent = '⚠️ Échec !';
            } else {
                document.getElementById('gameMessage').textContent = '';
            }
        }, 2000);
    }

    highlightValidMoves();
}

// Effacer la sélection
function clearSelection() {
    document.querySelectorAll('.square').forEach(sq => {
        sq.classList.remove('selected', 'valid-move', 'valid-capture');
    });
    selectedSquare = null;
    validMoves = [];
}

// Mettre en évidence les mouvements valides
function highlightValidMoves() {
    validMoves.forEach(move => {
        const squareElement = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
        if (board[move.row][move.col]) {
            squareElement.classList.add('valid-capture');
        } else {
            squareElement.classList.add('valid-move');
        }
    });
}

// Obtenir les mouvements valides pour une pièce
function getValidMoves(row, col) {
    const piece = board[row][col];
    if (!piece) return [];

    let moves = [];

    switch (piece.type) {
        case 'pawn':
            moves = getPawnMoves(row, col, piece.color);
            break;
        case 'rook':
            moves = getRookMoves(row, col, piece.color);
            break;
        case 'knight':
            moves = getKnightMoves(row, col, piece.color);
            break;
        case 'bishop':
            moves = getBishopMoves(row, col, piece.color);
            break;
        case 'queen':
            moves = getQueenMoves(row, col, piece.color);
            break;
        case 'king':
            moves = getKingMoves(row, col, piece.color);
            break;
    }

    // Filtrer les mouvements qui laissent le roi en échec
    return moves.filter(move => !wouldBeInCheck(row, col, move.row, move.col, piece.color));
}

// Vérifier si un mouvement laisserait le roi en échec
function wouldBeInCheck(fromRow, fromCol, toRow, toCol, color) {
    // Sauvegarder l'état actuel
    const piece = board[fromRow][fromCol];
    const capturedPiece = board[toRow][toCol];

    // Simuler le mouvement
    board[toRow][toCol] = piece;
    board[fromRow][fromCol] = null;

    // Vérifier si le roi est en échec
    const inCheck = isKingInCheck(color);

    // Restaurer l'état
    board[fromRow][fromCol] = piece;
    board[toRow][toCol] = capturedPiece;

    return inCheck;
}

// Mouvements du pion
function getPawnMoves(row, col, color) {
    const moves = [];
    const direction = color === 'white' ? -1 : 1;
    const startRow = color === 'white' ? 6 : 1;

    // Avancer d'une case
    if (isInBounds(row + direction, col) && !board[row + direction][col]) {
        moves.push({ row: row + direction, col });

        // Avancer de deux cases depuis la position initiale
        if (row === startRow && !board[row + 2 * direction][col]) {
            moves.push({ row: row + 2 * direction, col });
        }
    }

    // Captures diagonales
    [-1, 1].forEach(offset => {
        const newRow = row + direction;
        const newCol = col + offset;
        if (isInBounds(newRow, newCol) && board[newRow][newCol] && board[newRow][newCol].color !== color) {
            moves.push({ row: newRow, col: newCol });
        }
    });

    return moves;
}

// Mouvements de la tour
function getRookMoves(row, col, color) {
    const moves = [];
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    directions.forEach(([dRow, dCol]) => {
        let newRow = row + dRow;
        let newCol = col + dCol;

        while (isInBounds(newRow, newCol)) {
            if (!board[newRow][newCol]) {
                moves.push({ row: newRow, col: newCol });
            } else {
                if (board[newRow][newCol].color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
                break;
            }
            newRow += dRow;
            newCol += dCol;
        }
    });

    return moves;
}

// Mouvements du cavalier
function getKnightMoves(row, col, color) {
    const moves = [];
    const offsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
    ];

    offsets.forEach(([dRow, dCol]) => {
        const newRow = row + dRow;
        const newCol = col + dCol;

        if (isInBounds(newRow, newCol)) {
            if (!board[newRow][newCol] || board[newRow][newCol].color !== color) {
                moves.push({ row: newRow, col: newCol });
            }
        }
    });

    return moves;
}

// Mouvements du fou
function getBishopMoves(row, col, color) {
    const moves = [];
    const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

    directions.forEach(([dRow, dCol]) => {
        let newRow = row + dRow;
        let newCol = col + dCol;

        while (isInBounds(newRow, newCol)) {
            if (!board[newRow][newCol]) {
                moves.push({ row: newRow, col: newCol });
            } else {
                if (board[newRow][newCol].color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
                break;
            }
            newRow += dRow;
            newCol += dCol;
        }
    });

    return moves;
}

// Mouvements de la reine
function getQueenMoves(row, col, color) {
    return [...getRookMoves(row, col, color), ...getBishopMoves(row, col, color)];
}

// Mouvements du roi
function getKingMoves(row, col, color) {
    const moves = [];
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    directions.forEach(([dRow, dCol]) => {
        const newRow = row + dRow;
        const newCol = col + dCol;

        if (isInBounds(newRow, newCol)) {
            if (!board[newRow][newCol] || board[newRow][newCol].color !== color) {
                moves.push({ row: newRow, col: newCol });
            }
        }
    });

    return moves;
}

// Vérifier si les coordonnées sont dans les limites
function isInBounds(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

// Vérifier si un mouvement est valide
function isValidMove(fromRow, fromCol, toRow, toCol) {
    return validMoves.some(move => move.row === toRow && move.col === toCol);
}

// Déplacer une pièce
function movePiece(fromRow, fromCol, toRow, toCol) {
    const piece = board[fromRow][fromCol];
    const capturedPiece = board[toRow][toCol];

    // Sauvegarder le mouvement pour l'annulation
    moveHistory.push({
        from: { row: fromRow, col: fromCol },
        to: { row: toRow, col: toCol },
        piece: { ...piece },
        captured: capturedPiece ? { ...capturedPiece } : null
    });

    // Capturer une pièce
    if (capturedPiece) {
        capturedPieces[piece.color].push(capturedPiece);
        updateCapturedPieces();
        chatbot.showMessage('capture');
    }

    // Déplacer la pièce
    board[toRow][toCol] = piece;
    board[fromRow][fromCol] = null;

    renderBoard();
}

// Changer de joueur
function switchPlayer() {
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    updateTurnDisplay();

    // Vérifier l'échec
    if (isKingInCheck(currentPlayer)) {
        if (isCheckmate(currentPlayer)) {
            endGame();
        } else {
            chatbot.showMessage('check');
            document.getElementById('gameMessage').textContent = '⚠️ Échec !';
            setTimeout(() => {
                document.getElementById('gameMessage').textContent = '';
            }, 2000);
        }
    }
}

// Mettre à jour l'affichage du tour
function updateTurnDisplay() {
    const display = document.getElementById('currentPlayerDisplay');
    display.textContent = currentPlayer === 'white' ? '⚪ Tour des Blancs' : '⚫ Tour des Noirs';
}

// Mettre à jour les pièces capturées
function updateCapturedPieces() {
    const capturedWhite = document.getElementById('capturedWhite');
    const capturedBlack = document.getElementById('capturedBlack');

    capturedWhite.innerHTML = capturedPieces.white.map(p =>
        `<span class="captured-piece">${PIECES[p.color][p.type]}</span>`
    ).join('');

    capturedBlack.innerHTML = capturedPieces.black.map(p =>
        `<span class="captured-piece">${PIECES[p.color][p.type]}</span>`
    ).join('');
}

// Trouver le roi
function findKing(color) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece.type === 'king' && piece.color === color) {
                return { row, col };
            }
        }
    }
    return null;
}

// Vérifier si le roi est en échec
function isKingInCheck(color) {
    const kingPos = findKing(color);
    if (!kingPos) return false;

    // Vérifier si une pièce adverse peut attaquer le roi
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece.color !== color) {
                const moves = getRawMoves(row, col, piece);
                if (moves.some(move => move.row === kingPos.row && move.col === kingPos.col)) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Obtenir les mouvements bruts sans vérification d'échec (pour éviter la récursion)
function getRawMoves(row, col, piece) {
    let moves = [];

    switch (piece.type) {
        case 'pawn':
            moves = getPawnMoves(row, col, piece.color);
            break;
        case 'rook':
            moves = getRookMoves(row, col, piece.color);
            break;
        case 'knight':
            moves = getKnightMoves(row, col, piece.color);
            break;
        case 'bishop':
            moves = getBishopMoves(row, col, piece.color);
            break;
        case 'queen':
            moves = getQueenMoves(row, col, piece.color);
            break;
        case 'king':
            moves = getKingMoves(row, col, piece.color);
            break;
    }

    return moves;
}

// Vérifier l'échec et mat
function isCheckmate(color) {
    // Le joueur doit être en échec pour être mat
    if (!isKingInCheck(color)) {
        return false;
    }

    // Vérifier si le joueur a des mouvements légaux pour sortir de l'échec
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece.color === color) {
                const moves = getValidMoves(row, col);
                if (moves.length > 0) {
                    return false; // Il existe au moins un mouvement légal pour sortir de l'échec
                }
            }
        }
    }
    return true; // Aucun mouvement légal, c'est échec et mat
}

// Annuler le dernier mouvement
function undoLastMove() {
    if (moveHistory.length === 0) return;

    const lastMove = moveHistory.pop();

    // Restaurer la pièce
    board[lastMove.from.row][lastMove.from.col] = lastMove.piece;
    board[lastMove.to.row][lastMove.to.col] = lastMove.captured;

    // Restaurer les pièces capturées
    if (lastMove.captured) {
        const color = lastMove.piece.color;
        capturedPieces[color].pop();
        updateCapturedPieces();
    }

    // Changer de joueur
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    updateTurnDisplay();

    renderBoard();
    clearSelection();
}

// Terminer le jeu
function endGame() {
    gameActive = false;
    const winner = currentPlayer === 'white' ? 'Noirs' : 'Blancs';

    setTimeout(() => {
        document.getElementById('endEmoji').textContent = '👑';
        document.getElementById('endTitle').textContent = `Échec et mat ! Les ${winner} gagnent !`;
        endMessage.style.display = 'flex';
        chatbot.showMessage('checkmate');
    }, 500);
}

// Démarrer le jeu
function startGame() {
    initializeBoard();
    renderBoard();
    currentPlayer = 'white';
    updateTurnDisplay();
    gameActive = true;
    moveHistory = [];
    capturedPieces = { white: [], black: [] };
    updateCapturedPieces();
    chatbot.showMessage('gameStart');
}

// Réinitialiser le jeu
function resetGame() {
    clearSelection();
    startGame();
}

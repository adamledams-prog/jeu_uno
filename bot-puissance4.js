// ============================================
// BOT PUISSANCE 4 - NIVEAU FACILE
// ============================================

/**
 * IA Facile pour Puissance 4
 * - 10% de chance de bloquer le joueur
 * - 90% de coups complètement aléatoires
 * - Ne tente jamais de gagner activement
 * - Joue avec un délai aléatoire entre 1 et 4 secondes
 */

async function easyAI(gameBoard, ROWS, COLS) {
    // Délai aléatoire entre 1 et 4 secondes
    const delay = Math.floor(Math.random() * 3000) + 1000; // 1000-4000ms
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // 10% de chance de bloquer le joueur
    if (Math.random() < 0.1) {
        const blockCol = findWinningMove(gameBoard, ROWS, COLS, 1);
        if (blockCol !== -1) {
            console.log("🤖 IA Facile: Je bloque (rare!)");
            return blockCol;
        }
    }
    
    // 90% du temps : coup complètement aléatoire
    console.log("🤖 IA Facile: Coup aléatoire");
    return randomMove(gameBoard, COLS);
}

/**
 * Trouve un coup gagnant pour un joueur donné
 * @param {Array} gameBoard - La grille de jeu
 * @param {number} ROWS - Nombre de lignes
 * @param {number} COLS - Nombre de colonnes
 * @param {number} player - Joueur (1 ou 2)
 * @returns {number} Index de la colonne gagnante, ou -1
 */
function findWinningMove(gameBoard, ROWS, COLS, player) {
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
        const isWinning = checkWinningPosition(gameBoard, row, col, player, ROWS, COLS);
        
        // Annuler le coup
        gameBoard[row][col] = 0;
        
        if (isWinning) {
            return col;
        }
    }
    
    return -1;
}

/**
 * Vérifie si une position est gagnante
 */
function checkWinningPosition(gameBoard, row, col, player, ROWS, COLS) {
    // Vérifier horizontal
    if (checkDirection(gameBoard, row, col, 0, 1, player, ROWS, COLS)) return true;
    // Vérifier vertical
    if (checkDirection(gameBoard, row, col, 1, 0, player, ROWS, COLS)) return true;
    // Vérifier diagonale /
    if (checkDirection(gameBoard, row, col, 1, 1, player, ROWS, COLS)) return true;
    // Vérifier diagonale \
    if (checkDirection(gameBoard, row, col, 1, -1, player, ROWS, COLS)) return true;
    
    return false;
}

/**
 * Vérifie une direction pour un alignement de 4
 */
function checkDirection(gameBoard, row, col, dRow, dCol, player, ROWS, COLS) {
    let count = 1;
    
    // Vérifier dans une direction
    for (let i = 1; i < 4; i++) {
        const newRow = row + dRow * i;
        const newCol = col + dCol * i;
        if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS && 
            gameBoard[newRow][newCol] === player) {
            count++;
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
        } else {
            break;
        }
    }
    
    return count >= 4;
}

/**
 * Coup aléatoire dans une colonne disponible
 */
function randomMove(gameBoard, COLS) {
    const availableCols = [];
    for (let col = 0; col < COLS; col++) {
        if (gameBoard[0][col] === 0) {
            availableCols.push(col);
        }
    }
    
    if (availableCols.length === 0) return 0;
    return availableCols[Math.floor(Math.random() * availableCols.length)];
}

// Export pour utilisation dans le jeu principal
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { easyAI, findWinningMove, randomMove };
}

// ============================================
// FONCTIONS UTILITAIRES PARTAGÉES
// ============================================

/**
 * Génère un nombre aléatoire entre min et max (inclus)
 * @param {number} min - Valeur minimale
 * @param {number} max - Valeur maximale
 * @returns {number} Nombre aléatoire
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Sélectionne un élément aléatoire dans un tableau
 * @param {Array} array - Le tableau
 * @returns {*} Élément aléatoire ou undefined si tableau vide
 */
export function randomChoice(array) {
    if (!array || array.length === 0) return undefined;
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Attend un certain temps (pour utilisation avec async/await)
 * @param {number} ms - Temps en millisecondes
 * @returns {Promise} Promise qui se résout après le délai
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Récupère un temps de réflexion aléatoire pour l'IA
 * @param {number} min - Temps minimum en ms
 * @param {number} max - Temps maximum en ms
 * @returns {number} Temps en millisecondes
 */
export function getRandomThinkingTime(min = 1000, max = 4000) {
    return randomInt(min, max);
}

/**
 * Vérifie si un index est valide pour un tableau
 * @param {number} index - L'index à vérifier
 * @param {number} maxLength - Longueur maximale du tableau
 * @returns {boolean} true si l'index est valide
 */
export function isValidIndex(index, maxLength) {
    return index !== undefined &&
        index !== null &&
        !isNaN(index) &&
        index >= 0 &&
        index < maxLength;
}

/**
 * Affiche un message d'erreur dans la console de manière formatée
 * @param {string} message - Le message d'erreur
 * @param {*} data - Données supplémentaires à afficher
 */
export function logError(message, data = null) {
    console.error(`❌ ${message}`, data !== null ? data : '');
}

/**
 * Affiche un message d'information dans la console
 * @param {string} message - Le message
 * @param {*} data - Données supplémentaires
 */
export function logInfo(message, data = null) {
    console.log(`ℹ️ ${message}`, data !== null ? data : '');
}

/**
 * Trouve toutes les cases vides dans un plateau de jeu
 * @param {Array} board - Le plateau de jeu
 * @param {*} emptyValue - La valeur représentant une case vide (0, '', null, etc.)
 * @returns {Array} Tableau des indices des cases vides
 */
export function findEmptyCells(board, emptyValue = '') {
    const emptyCells = [];
    for (let i = 0; i < board.length; i++) {
        if (board[i] === emptyValue) {
            emptyCells.push(i);
        }
    }
    return emptyCells;
}

/**
 * Vérifie si un élément DOM existe
 * @param {string} selector - Le sélecteur CSS
 * @returns {HTMLElement|null} L'élément ou null
 */
export function getElement(selector) {
    const element = document.querySelector(selector);
    if (!element) {
        logError(`Élément introuvable: ${selector}`);
    }
    return element;
}

/**
 * Vérifie si tous les éléments d'un tableau sont égaux à une valeur
 * @param {Array} array - Le tableau à vérifier
 * @param {*} value - La valeur à comparer
 * @returns {boolean} true si tous les éléments sont égaux à value
 */
export function allEqual(array, value) {
    return array.every(item => item === value);
}

/**
 * Compte les occurrences d'une valeur dans un tableau
 * @param {Array} array - Le tableau
 * @param {*} value - La valeur à compter
 * @returns {number} Nombre d'occurrences
 */
export function countOccurrences(array, value) {
    return array.filter(item => item === value).length;
}

/**
 * Désactive un bouton
 * @param {HTMLElement} button - Le bouton à désactiver
 */
export function disableButton(button) {
    if (button) {
        button.disabled = true;
    }
}

/**
 * Active un bouton
 * @param {HTMLElement} button - Le bouton à activer
 */
export function enableButton(button) {
    if (button) {
        button.disabled = false;
    }
}

/**
 * Ajoute une classe CSS à un élément
 * @param {HTMLElement} element - L'élément
 * @param {string} className - La classe à ajouter
 */
export function addClass(element, className) {
    if (element && className) {
        element.classList.add(className);
    }
}

/**
 * Retire une classe CSS d'un élément
 * @param {HTMLElement} element - L'élément
 * @param {string} className - La classe à retirer
 */
export function removeClass(element, className) {
    if (element && className) {
        element.classList.remove(className);
    }
}

/**
 * Vérifie si un élément a une classe CSS
 * @param {HTMLElement} element - L'élément
 * @param {string} className - La classe à vérifier
 * @returns {boolean} true si l'élément a la classe
 */
export function hasClass(element, className) {
    return element && element.classList.contains(className);
}

/**
 * Affiche ou cache un élément
 * @param {HTMLElement} element - L'élément
 * @param {boolean} show - true pour afficher, false pour cacher
 */
export function toggleDisplay(element, show) {
    if (element) {
        element.style.display = show ? 'block' : 'none';
    }
}

/**
 * Mélange un tableau (algorithme Fisher-Yates)
 * @param {Array} array - Le tableau à mélanger
 * @returns {Array} Le tableau mélangé (modifie le tableau original)
 */
export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Formate un temps en secondes pour l'affichage
 * @param {number} seconds - Le nombre de secondes
 * @returns {string} Le temps formaté (ex: "01:23")
 */
export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Débounce une fonction (évite les appels trop fréquents)
 * @param {Function} func - La fonction à débouncer
 * @param {number} wait - Temps d'attente en ms
 * @returns {Function} Fonction débouncée
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

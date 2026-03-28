// ============================================
// CHATBOT PARTAGÉ
// ============================================

/**
 * Classe Chatbot - Gère les messages du chatbot de manière centralisée
 */
class Chatbot {
    constructor(messagesElement) {
        this.messagesElement = messagesElement;
        this.messages = {
            // Messages communs
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
            avatarSelection: [
                "🎭 Choisissez vos avatars préférés !",
                "✏️ N'oubliez pas de choisir vos pseudos !",
                "🌟 Faites votre choix parmi ces super avatars !"
            ],
            gameStart: [
                "🎲 C'est parti ! Que le meilleur gagne !",
                "🌟 La partie commence ! Bonne chance !",
                "🎯 Bonne chance à tous !"
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
            playerTurn: [
                "🎮 À vous de jouer !",
                "💭 Réfléchissez bien à votre coup !",
                "⚡ Faites le bon choix !"
            ],
            thinking: [
                "🤔 Hmm... Laissez-moi réfléchir...",
                "⚡ Je calcule mon prochain coup...",
                "🧮 En pleine réflexion..."
            ],
            aiThinking: [
                "🤔 L'IA réfléchit...",
                "🧠 Calcul en cours...",
                "⚡ Je prépare mon coup..."
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
            playerWin: [
                "🎉 Victoire ! Bien joué !",
                "👏 Excellent ! Vous avez gagné !",
                "🌟 Bravo, quelle performance !"
            ],
            robotWin: [
                "🤖 Voilà t'es bien nulllll !",
                "😎 Pas mal, mais je suis le boss !",
                "🎯 L'ordinateur est victorieux !"
            ],
            robotLose: [
                "👏 Bien joué !",
                "🔄 Je prendrai ma revanche !",
                "🌟 Vous êtes trop fort !"
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
            ],
            duringGame: [
                "💫 Bien joué ! Continuez comme ça !",
                "🎯 Belle stratégie !",
                "✨ Le match est serré !"
            ]
        };
    }

    /**
     * Affiche un message aléatoire d'une catégorie
     * @param {string} type - Le type de message à afficher
     */
    showMessage(type) {
        const messages = this.messages[type];
        if (!messages || messages.length === 0) {
            console.warn(`Type de message chatbot inconnu: ${type}`);
            return;
        }

        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        this.displayMessage(randomMessage);
    }

    /**
     * Affiche un message personnalisé
     * @param {string} message - Le message à afficher
     */
    displayMessage(message) {
        if (!this.messagesElement) {
            console.warn('Élément de messages du chatbot non trouvé');
            return;
        }

        // Supprimer l'ancien message
        this.messagesElement.innerHTML = '';

        // Ajouter le nouveau message
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.textContent = message;
        this.messagesElement.appendChild(messageDiv);
    }

    /**
     * Ajoute des messages personnalisés pour un jeu spécifique
     * @param {Object} customMessages - Objet contenant les messages personnalisés
     */
    addCustomMessages(customMessages) {
        this.messages = { ...this.messages, ...customMessages };
    }

    /**
     * Efface tous les messages
     */
    clearMessages() {
        if (this.messagesElement) {
            this.messagesElement.innerHTML = '';
        }
    }

    /**
     * Affiche un message avec un délai
     * @param {string} type - Le type de message à afficher
     * @param {number} delay - Délai en millisecondes
     */
    showMessageDelayed(type, delay) {
        setTimeout(() => {
            this.showMessage(type);
        }, delay);
    }
}

// Export pour utilisation dans les autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Chatbot;
}

// Export ES6
if (typeof window !== 'undefined') {
    window.Chatbot = Chatbot;
}

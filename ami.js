// ============================================
// SYSTÈME DE GESTION DES AMIS - FICHIER PRINCIPAL
// Ce fichier gère : amis, profil, QR code, chat
// Les invitations sont dans ami2.js
// ============================================

let myFriendCode = '';
let friends = [];
let currentTab = 'friends';
let userHasInteracted = false;

// Fonction utilitaire pour vibration sécurisée
function safeVibrate(pattern) {
    if (!userHasInteracted) return;
    try {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    } catch (e) {
        // Ignorer silencieusement les erreurs de vibration
    }
}

// Initialisation au chargement de la page
window.addEventListener('load', () => {
    // Détecter la première interaction utilisateur
    document.addEventListener('click', () => { userHasInteracted = true; }, { once: true });
    document.addEventListener('touchstart', () => { userHasInteracted = true; }, { once: true });
    document.addEventListener('keydown', () => { userHasInteracted = true; }, { once: true });
    
    initializeFriendSystem();
});

// ============================================
// INITIALISATION
// ============================================

function initializeFriendSystem() {
    // Récupérer ou générer le code ami
    myFriendCode = localStorage.getItem('myFriendCode');
    if (!myFriendCode) {
        myFriendCode = generateFriendCode();
        localStorage.setItem('myFriendCode', myFriendCode);
    }
    
    // Afficher le code
    document.getElementById('myFriendCode').textContent = myFriendCode;
    
    // Générer le QR Code
    generateQRCode(myFriendCode);
    
    // Charger le profil utilisateur
    loadUserProfile();
    
    // Charger la liste des amis
    loadFriends();
    
    // Afficher l'onglet actif (sans vibration au chargement initial)
    switchTab('friends', false);
    
    // Note: Vibration désactivée au chargement
}

// ============================================
// GÉNÉRATION CODE AMI
// ============================================

function generateFriendCode() {
    return String(Math.floor(1000 + Math.random() * 9000));
}

// ============================================
// QR CODE
// ============================================

function generateQRCode(code) {
    // URL complète du site avec le code ami en paramètre
    const currentUrl = window.location.href.split('?')[0];
    const qrData = `${currentUrl}?add=${code}`;
    
    // Créer le QR code avec l'URL complète
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
    document.getElementById('qrCodeImg').src = qrApiUrl;
}

// ============================================
// GESTION DES ONGLETS
// ============================================

function switchTab(tab, shouldVibrate = true) {
    currentTab = tab;
    
    // Mise à jour des boutons d'onglets
    document.querySelectorAll('.main-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    if (tab === 'friends') {
        document.getElementById('friendsTab').classList.add('active');
        document.getElementById('friendsContent').classList.add('active');
    } else if (tab === 'invitations') {
        document.getElementById('invitationsTab').classList.add('active');
        document.getElementById('invitationsContent').classList.add('active');
        // Recharger les invitations (fonction dans ami2.js)
        if (typeof loadInvitations === 'function') {
            loadInvitations();
        }
    } else if (tab === 'profile') {
        document.getElementById('profileTab').classList.add('active');
        document.getElementById('profileContent').classList.add('active');
    }
    
    // Vibrer seulement si demandé
    if (shouldVibrate) {
        safeVibrate(30);
    }
}

// ============================================
// GESTION DES AMIS
// ============================================

function loadFriends() {
    const savedFriends = localStorage.getItem(`friends_${myFriendCode}`);
    friends = savedFriends ? JSON.parse(savedFriends) : [];
    displayFriends();
}

function saveFriends() {
    localStorage.setItem(`friends_${myFriendCode}`, JSON.stringify(friends));
}

function displayFriends() {
    const container = document.getElementById('friendsContainer');
    const noFriends = document.getElementById('noFriends');
    const friendCount = document.getElementById('friendCount');
    const friendsTabCount = document.getElementById('friendsTabCount');
    
    // Mettre à jour le compteur
    friendCount.textContent = friends.length;
    friendsTabCount.textContent = friends.length;
    
    if (friends.length === 0) {
        noFriends.style.display = 'block';
        const existingCards = container.querySelectorAll('.friend-card');
        existingCards.forEach(card => card.remove());
    } else {
        noFriends.style.display = 'none';
        
        const existingCards = container.querySelectorAll('.friend-card');
        existingCards.forEach(card => card.remove());
        
        friends.forEach((friend, index) => {
            const friendCard = createFriendCard(friend, index);
            container.appendChild(friendCard);
        });
    }
}

function createFriendCard(friend, index) {
    const card = document.createElement('div');
    card.className = 'friend-card';
    card.innerHTML = `
        <span class="friend-avatar">👤</span>
        <div class="friend-nickname">${friend.nickname}</div>
        <div class="friend-code-small">Code: ${friend.code}</div>
        <div class="friend-actions">
            <button class="action-btn chat-btn" onclick="openChat('${friend.code}', '${friend.nickname}')">
                💬 Chat
            </button>
            <button class="action-btn delete-btn" onclick="deleteFriend(${index})">
                🗑️ Supprimer
            </button>
        </div>
    `;
    return card;
}

function deleteFriend(index) {
    if (confirm(`Veux-tu vraiment supprimer ${friends[index].nickname} de tes amis ?`)) {
        friends.splice(index, 1);
        saveFriends();
        displayFriends();
        showNotification('❌ Ami supprimé', 'error');
        safeVibrate([50, 50, 50]);
    }
}

// ============================================
// SYSTÈME DE CHAT
// ============================================

let currentChatFriend = null;
let chatRefreshInterval = null;

function openChat(friendCode, friendNickname) {
    currentChatFriend = {
        code: friendCode,
        nickname: friendNickname
    };
    
    document.getElementById('chatFriendName').textContent = friendNickname;
    document.getElementById('chatFriendCode').textContent = 'Code: ' + friendCode;
    document.getElementById('chatInput').value = '';
    
    loadMessages();
    
    document.getElementById('chatModal').classList.add('active');
    
    if (chatRefreshInterval) {
        clearInterval(chatRefreshInterval);
    }
    chatRefreshInterval = setInterval(() => {
        loadMessages();
    }, 2000);
    
    setTimeout(() => {
        document.getElementById('chatInput').focus();
    }, 300);
    
    safeVibrate(50);
}

function closeChat() {
    document.getElementById('chatModal').classList.remove('active');
    currentChatFriend = null;
    
    if (chatRefreshInterval) {
        clearInterval(chatRefreshInterval);
        chatRefreshInterval = null;
    }
}

function loadMessages() {
    if (!currentChatFriend) return;
    
    const chatKey = getChatKey(myFriendCode, currentChatFriend.code);
    const savedMessages = localStorage.getItem(chatKey);
    const messages = savedMessages ? JSON.parse(savedMessages) : [];
    
    displayMessages(messages);
}

function getChatKey(code1, code2) {
    const codes = [code1, code2].sort();
    return `chat_${codes[0]}_${codes[1]}`;
}

function displayMessages(messages) {
    const container = document.getElementById('chatMessages');
    const chatEmpty = container.querySelector('.chat-empty');
    
    if (messages.length === 0) {
        if (chatEmpty) chatEmpty.style.display = 'block';
        container.querySelectorAll('.message').forEach(msg => msg.remove());
        return;
    }
    
    if (chatEmpty) chatEmpty.style.display = 'none';
    
    const wasAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
    
    container.querySelectorAll('.message').forEach(msg => msg.remove());
    
    messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = msg.sender === myFriendCode ? 'message sent' : 'message received';
        
        const time = new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        messageDiv.innerHTML = `
            ${msg.text}
            <span class="message-time">${time}</span>
        `;
        
        container.appendChild(messageDiv);
    });
    
    if (wasAtBottom) {
        container.scrollTop = container.scrollHeight;
    }
}

function sendMessage() {
    if (!currentChatFriend) return;
    
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    const message = {
        sender: myFriendCode,
        text: text,
        timestamp: Date.now()
    };
    
    const chatKey = getChatKey(myFriendCode, currentChatFriend.code);
    const savedMessages = localStorage.getItem(chatKey);
    const messages = savedMessages ? JSON.parse(savedMessages) : [];
    
    messages.push(message);
    localStorage.setItem(chatKey, JSON.stringify(messages));
    
    loadMessages();
    
    input.value = '';
    
    safeVibrate(30);
    
    const container = document.getElementById('chatMessages');
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);
}

// ============================================
// GESTION DU PROFIL UTILISATEUR
// ============================================

function loadUserProfile() {
    const savedPseudo = localStorage.getItem(`userPseudo_${myFriendCode}`);
    if (savedPseudo) {
        document.getElementById('profileTitle').textContent = savedPseudo;
        const profileTabLabel = document.querySelector('#profileTab .tab-label');
        if (profileTabLabel) {
            profileTabLabel.textContent = savedPseudo;
        }
    }
    
    const savedAvatar = localStorage.getItem(`userAvatar_${myFriendCode}`);
    if (savedAvatar) {
        document.getElementById('profileAvatar').textContent = savedAvatar;
        document.querySelectorAll('.avatar-option').forEach(option => {
            if (option.textContent.trim() === savedAvatar) {
                option.classList.add('selected');
            }
        });
    }
}

function savePseudo() {
    const input = document.getElementById('pseudoInput');
    const pseudo = input.value.trim();
    
    if (!pseudo) {
        showNotification('❌ Le pseudo ne peut pas être vide', 'error');
        return;
    }
    
    if (pseudo.length > 15) {
        showNotification('❌ Le pseudo est trop long (max 15 caractères)', 'error');
        return;
    }
    
    localStorage.setItem(`userPseudo_${myFriendCode}`, pseudo);
    
    document.getElementById('profileTitle').textContent = pseudo;
    
    const profileTabLabel = document.querySelector('#profileTab .tab-label');
    if (profileTabLabel) {
        profileTabLabel.textContent = pseudo;
    }
    
    showNotification('✅ Pseudo enregistré avec succès !', 'success');
    
    safeVibrate([50, 30, 50]);
    
    const titleElement = document.getElementById('profileTitle');
    titleElement.style.transform = 'scale(1.1)';
    setTimeout(() => {
        titleElement.style.transform = 'scale(1)';
    }, 300);
}

function selectAvatar(emoji) {
    localStorage.setItem(`userAvatar_${myFriendCode}`, emoji);
    
    document.getElementById('profileAvatar').textContent = emoji;
    
    document.querySelectorAll('.avatar-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    event.target.classList.add('selected');
    
    showNotification('✅ Avatar sélectionné !', 'success');
    
    safeVibrate(50);
    
    const avatarElement = document.getElementById('profileAvatar');
    avatarElement.style.transform = 'rotate(360deg) scale(1.3)';
    setTimeout(() => {
        avatarElement.style.transform = 'rotate(0deg) scale(1)';
    }, 500);
}

// ============================================
// NOTIFICATIONS
// ============================================

function showNotification(message, type = 'success', duration = 3000) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification show ' + type;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
}

// ============================================
// GESTION DES EVENTS CLAVIER
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Enter sur le chat input = envoyer message
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
    }
});

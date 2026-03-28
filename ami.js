// ============================================
// SYSTÈME DE GESTION DES AMIS
// ============================================

let myFriendCode = '';
let friends = [];
let invitations = [];
let pendingFriendCode = '';
let currentTab = 'friends';
let pendingInvitationIndex = -1;
let userHasInteracted = false;

// Fonction utilitaire pour vibration sécurisée
function safeVibrate(pattern) {
    // Ne tenter la vibration que si l'utilisateur a déjà interagi
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
    // Détecter la première interaction utilisateur (après le chargement)
    document.addEventListener('click', () => { userHasInteracted = true; }, { once: true });
    document.addEventListener('touchstart', () => { userHasInteracted = true; }, { once: true });
    document.addEventListener('keydown', () => { userHasInteracted = true; }, { once: true });
    
    initializeFriendSystem();
});

// Arrêter la caméra lors de la fermeture de la page
window.addEventListener('beforeunload', () => {
    stopQRScanner();
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
    
    // Charger les invitations
    loadInvitations();
    
    // Afficher l'onglet actif (sans vibration au chargement initial)
    switchTab('friends', false);
    
    // Vérifier si on arrive via un QR code scanné
    checkForFriendCodeInURL();
    
    // Note: Vibration désactivée au chargement (nécessite interaction utilisateur)
}

// ============================================
// DÉTECTION QR CODE DANS L'URL
// ============================================

function checkForFriendCodeInURL() {
    // Récupérer les paramètres de l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const friendCodeToAdd = urlParams.get('add');
    
    if (friendCodeToAdd && friendCodeToAdd.length === 4 && !isNaN(friendCodeToAdd)) {
        // Un code ami a été détecté dans l'URL !
        
        // Nettoyer l'URL (enlever le paramètre)
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Attendre que tout soit chargé
        setTimeout(() => {
            // Vérifier si c'est son propre code
            if (friendCodeToAdd === myFriendCode) {
                showNotification('❌ Tu ne peux pas t\'ajouter toi-même !', 'error');
                return;
            }
            
            // Vérifier si l'ami existe déjà
            const alreadyFriend = friends.find(f => f.code === friendCodeToAdd);
            if (alreadyFriend) {
                showNotification(`✅ ${alreadyFriend.nickname} est déjà dans tes amis !`, 'success');
                return;
            }
            
            // Vérifier si une invitation a déjà été envoyée
            const allInvitations = localStorage.getItem('globalInvitations');
            let globalInvitations = allInvitations ? JSON.parse(allInvitations) : [];
            const alreadySent = globalInvitations.find(inv => 
                inv.fromCode === myFriendCode && inv.toCode === friendCodeToAdd
            );
            
            if (alreadySent) {
                // Supprimer l'ancienne invitation
                globalInvitations = globalInvitations.filter(inv => 
                    !(inv.fromCode === myFriendCode && inv.toCode === friendCodeToAdd)
                );
                localStorage.setItem('globalInvitations', JSON.stringify(globalInvitations));
            }
            
            // Afficher la modal pour envoyer l'invitation
            pendingFriendCode = friendCodeToAdd;
            
            // Aller dans l'onglet profil et afficher la modal
            switchTab('profile', false);
            
            showNotification(`📸 QR Code scanné ! Code détecté : ${friendCodeToAdd}`, 'success', 4000);
            
            setTimeout(() => {
                showSendInvitationModal(friendCodeToAdd);
                safeVibrate([100, 50, 100]);
            }, 500);
        }, 1000);
    }
}

// ============================================
// GÉNÉRATION CODE AMI
// ============================================

function generateFriendCode() {
    // Génère un code à 4 chiffres unique
    return String(Math.floor(1000 + Math.random() * 9000));
}

// ============================================
// QR CODE
// ============================================

function generateQRCode(code) {
    // URL complète du site avec le code ami en paramètre
    const currentUrl = window.location.href.split('?')[0]; // URL sans paramètres
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
    } else if (tab === 'profile') {
        document.getElementById('profileTab').classList.add('active');
        document.getElementById('profileContent').classList.add('active');
    }
    
    // Vibrer seulement si demandé (pas au chargement initial)
    if (shouldVibrate) {
        safeVibrate(30);
    }
}

// ============================================
// GESTION DES AMIS
// ============================================

function loadFriends() {
    // Charger depuis localStorage (propre à ce code)
    const savedFriends = localStorage.getItem(`friends_${myFriendCode}`);
    friends = savedFriends ? JSON.parse(savedFriends) : [];
    
    // Afficher la liste
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
        // Supprimer les cartes existantes
        const existingCards = container.querySelectorAll('.friend-card');
        existingCards.forEach(card => card.remove());
    } else {
        noFriends.style.display = 'none';
        
        // Vider le container (sauf noFriends)
        const existingCards = container.querySelectorAll('.friend-card');
        existingCards.forEach(card => card.remove());
        
        // Ajouter chaque ami
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

function playWithFriend(nickname) {
    showNotification(`🎮 Invitation envoyée à ${nickname} !`, 'success');
    
    safeVibrate([100, 50, 100]);
    
    // Rediriger vers la page d'accueil pour choisir un jeu
    setTimeout(() => {
        if (confirm(`🎮 Veux-tu retourner à l'accueil pour jouer avec ${nickname} ?`)) {
            window.location.href = 'index.html';
        }
    }, 500);
}

// ============================================
// GESTION DES INVITATIONS
// ============================================

function loadInvitations() {
    // Charger toutes les invitations du localStorage global
    const allInvitations = localStorage.getItem('globalInvitations');
    const globalInvitations = allInvitations ? JSON.parse(allInvitations) : [];
    
    // Filtrer les invitations destinées à mon code
    invitations = globalInvitations.filter(inv => inv.toCode === myFriendCode);
    
    // Afficher les invitations
    displayInvitations();
}

function saveInvitation(invitation) {
    // Sauvegarder dans le localStorage global
    const allInvitations = localStorage.getItem('globalInvitations');
    const globalInvitations = allInvitations ? JSON.parse(allInvitations) : [];
    
    globalInvitations.push(invitation);
    localStorage.setItem('globalInvitations', JSON.stringify(globalInvitations));
}

function removeInvitation(invitationToRemove) {
    // Retirer une invitation du localStorage global
    const allInvitations = localStorage.getItem('globalInvitations');
    let globalInvitations = allInvitations ? JSON.parse(allInvitations) : [];
    
    globalInvitations = globalInvitations.filter(inv => 
        !(inv.fromCode === invitationToRemove.fromCode && 
          inv.toCode === invitationToRemove.toCode && 
          inv.timestamp === invitationToRemove.timestamp)
    );
    
    localStorage.setItem('globalInvitations', JSON.stringify(globalInvitations));
    loadInvitations();
}

function displayInvitations() {
    const container = document.getElementById('invitationsContainer');
    const noInvitations = document.getElementById('noInvitations');
    const invitationCount = document.getElementById('invitationCount');
    const invitationsTabCount = document.getElementById('invitationsTabCount');
    
    // Mettre à jour le compteur
    invitationCount.textContent = invitations.length;
    invitationsTabCount.textContent = invitations.length;
    
    if (invitations.length === 0) {
        noInvitations.style.display = 'block';
        // Supprimer les cartes existantes
        const existingCards = container.querySelectorAll('.invitation-card');
        existingCards.forEach(card => card.remove());
    } else {
        noInvitations.style.display = 'none';
        
        // Vider le container
        const existingCards = container.querySelectorAll('.invitation-card');
        existingCards.forEach(card => card.remove());
        
        // Ajouter chaque invitation
        invitations.forEach((invitation, index) => {
            const invitationCard = createInvitationCard(invitation, index);
            container.appendChild(invitationCard);
        });
    }
}

function createInvitationCard(invitation, index) {
    const card = document.createElement('div');
    card.className = 'invitation-card';
    card.innerHTML = `
        <span class="invitation-avatar">👤</span>
        <div class="invitation-nickname">${invitation.fromNickname}</div>
        <div class="invitation-code">Code: ${invitation.fromCode}</div>
        <div class="invitation-actions">
            <button class="accept-invitation-btn" onclick="showAcceptModal(${index})">
                ✅ Accepter
            </button>
            <button class="refuse-invitation-btn" onclick="refuseInvitationDirect(${index})">
                ❌ Refuser
            </button>
        </div>
    `;
    return card;
}

// ============================================
// AJOUTER UN AMI (ENVOYER INVITATION)
// ============================================

function showAddOptions() {
    document.getElementById('addModal').classList.add('active');
    
    safeVibrate(50);
}

function closeAddModal() {
    document.getElementById('addModal').classList.remove('active');
}

function showCodeInput() {
    closeAddModal();
    document.getElementById('codeInputModal').classList.add('active');
    
    // Focus sur le premier input
    setTimeout(() => {
        document.getElementById('digit1').focus();
    }, 100);
    
    safeVibrate(50);
}

function closeCodeInput() {
    document.getElementById('codeInputModal').classList.remove('active');
    
    // Réinitialiser les inputs
    document.getElementById('digit1').value = '';
    document.getElementById('digit2').value = '';
    document.getElementById('digit3').value = '';
    document.getElementById('digit4').value = '';
}

function moveToNext(current, nextId) {
    if (current.value.length >= 1) {
        // Limiter à 1 chiffre
        current.value = current.value.slice(0, 1);
        
        if (nextId) {
            document.getElementById(nextId).focus();
        }
    }
}

function validateCode() {
    const digit1 = document.getElementById('digit1').value;
    const digit2 = document.getElementById('digit2').value;
    const digit3 = document.getElementById('digit3').value;
    const digit4 = document.getElementById('digit4').value;
    
    if (digit1 && digit2 && digit3 && digit4) {
        // Code complet
        safeVibrate(50);
    }
}

function verifyCode() {
    const digit1 = document.getElementById('digit1').value;
    const digit2 = document.getElementById('digit2').value;
    const digit3 = document.getElementById('digit3').value;
    const digit4 = document.getElementById('digit4').value;
    
    if (!digit1 || !digit2 || !digit3 || !digit4) {
        showNotification('❌ Entre les 4 chiffres !', 'error');
        safeVibrate([100, 50, 100]);
        return;
    }
    
    const code = digit1 + digit2 + digit3 + digit4;
    
    // Vérifier si c'est son propre code
    if (code === myFriendCode) {
        showNotification('❌ Tu ne peux pas t\'ajouter toi-même !', 'error');
        safeVibrate([100, 50, 100, 50, 100]);
        return;
    }
    
    // Vérifier si l'ami existe déjà
    const alreadyFriend = friends.find(f => f.code === code);
    if (alreadyFriend) {
        showNotification(`❌ ${alreadyFriend.nickname} est déjà dans tes amis !`, 'error');
        safeVibrate([100, 50, 100]);
        return;
    }
    
    // Vérifier si une invitation a déjà été envoyée
    const allInvitations = localStorage.getItem('globalInvitations');
    let globalInvitations = allInvitations ? JSON.parse(allInvitations) : [];
    const alreadySent = globalInvitations.find(inv => 
        inv.fromCode === myFriendCode && inv.toCode === code
    );
    
    if (alreadySent) {
        // Supprimer l'ancienne invitation pour permettre de réinviter
        globalInvitations = globalInvitations.filter(inv => 
            !(inv.fromCode === myFriendCode && inv.toCode === code)
        );
        localStorage.setItem('globalInvitations', JSON.stringify(globalInvitations));
        showNotification('🔄 Ancienne invitation remplacée !', 'success');
        safeVibrate([50, 50]);
    }
    
    // Code valide - afficher la modal d'envoi d'invitation
    pendingFriendCode = code;
    closeCodeInput();
    showSendInvitationModal(code);
}

// Variable globale pour le scanner QR
let html5QrcodeScanner = null;
let isScanning = false;

function showQRScanner() {
    closeAddModal();
    document.getElementById('scannerModal').classList.add('active');
    
    safeVibrate([50, 50]);
    
    // Démarrer le scan après un court délai pour laisser la modal s'afficher
    setTimeout(() => {
        startQRScanner();
    }, 300);
}

function startQRScanner() {
    if (isScanning) return;
    
    // Vérifier si la bibliothèque est chargée
    if (typeof Html5Qrcode === 'undefined') {
        showNotification('❌ Erreur : bibliothèque de scan non chargée', 'error');
        return;
    }
    
    isScanning = true;
    
    // Créer le scanner
    html5QrcodeScanner = new Html5Qrcode("qr-reader");
    
    // Configuration du scanner
    const config = {
        fps: 10,    // Images par seconde
        qrbox: { width: 250, height: 250 }  // Taille de la zone de scan
    };
    
    // Démarrer le scanner avec la caméra arrière (environnement) si disponible
    html5QrcodeScanner.start(
        { facingMode: "environment" }, // Caméra arrière
        config,
        onScanSuccess,
        onScanError
    ).catch(err => {
        // Si la caméra arrière n'est pas disponible, essayer la caméra frontale
        html5QrcodeScanner.start(
            { facingMode: "user" }, // Caméra frontale
            config,
            onScanSuccess,
            onScanError
        ).catch(err2 => {
            showNotification('❌ Impossible d\'accéder à la caméra', 'error');
            isScanning = false;
        });
    });
}

function onScanSuccess(decodedText, decodedResult) {
    // QR Code détecté avec succès
    safeVibrate([50, 100, 50]);
    
    // Arrêter le scanner
    stopQRScanner();
    
    // Traiter le résultat
    processScannedCode(decodedText);
}

function onScanError(errorMessage) {
    // Erreur de scan (normal, ça arrive tant qu'aucun QR n'est détecté)
    // On n'affiche rien pour ne pas polluer la console
}

function processScannedCode(scannedData) {
    // Le QR code peut contenir :
    // 1. Une URL complète du site avec ?add=XXXX
    // 2. "FRIEND:XXXX" (ancien format)
    // 3. Directement un code à 4 chiffres
    
    let code = '';
    
    // Vérifier si c'est une URL avec le paramètre add
    if (scannedData.includes('?add=')) {
        const match = scannedData.match(/[?&]add=(\d{4})/);
        if (match) {
            code = match[1];
        }
    } 
    // Ancien format FRIEND:XXXX
    else if (scannedData.startsWith('FRIEND:')) {
        code = scannedData.replace('FRIEND:', '');
    } 
    // Code direct à 4 chiffres
    else if (scannedData.length === 4 && !isNaN(scannedData)) {
        code = scannedData;
    } 
    
    if (!code || code.length !== 4 || isNaN(code)) {
        showNotification('❌ QR Code invalide ! Ce n\'est pas un code ami.', 'error');
        closeScannerModal();
        return;
    }
    
    // Vérifications comme pour le code manuel
    if (code === myFriendCode) {
        showNotification('❌ Tu ne peux pas t\'ajouter toi-même !', 'error');
        closeScannerModal();
        return;
    }
    
    const alreadyFriend = friends.find(f => f.code === code);
    if (alreadyFriend) {
        showNotification(`❌ ${alreadyFriend.nickname} est déjà dans tes amis !`, 'error');
        closeScannerModal();
        return;
    }
    
    const allInvitations = localStorage.getItem('globalInvitations');
    let globalInvitations = allInvitations ? JSON.parse(allInvitations) : [];
    const alreadySent = globalInvitations.find(inv => 
        inv.fromCode === myFriendCode && inv.toCode === code
    );
    
    if (alreadySent) {
        // Supprimer l'ancienne invitation pour permettre de réinviter
        globalInvitations = globalInvitations.filter(inv => 
            !(inv.fromCode === myFriendCode && inv.toCode === code)
        );
        localStorage.setItem('globalInvitations', JSON.stringify(globalInvitations));
        showNotification('🔄 Ancienne invitation remplacée !', 'success');
        safeVibrate([50, 50]);
    } else {
        showNotification('📸 QR Code scanné avec succès !', 'success');
    }
    pendingFriendCode = code;
    closeScannerModal();
    
    setTimeout(() => {
        showSendInvitationModal(code);
    }, 500);
}

function stopQRScanner() {
    if (html5QrcodeScanner && isScanning) {
        html5QrcodeScanner.stop().then(() => {
            html5QrcodeScanner.clear();
            html5QrcodeScanner = null;
            isScanning = false;
        }).catch(err => {
            console.error('Erreur lors de l\'arrêt du scanner:', err);
            isScanning = false;
        });
    }
}

function closeScannerModal() {
    // Arrêter le scanner si actif
    stopQRScanner();
    
    document.getElementById('scannerModal').classList.remove('active');
}

function simulateScan() {
    // Arrêter le scanner si actif
    stopQRScanner();
    
    // Simulation d'un scan de QR code
    safeVibrate([50, 100, 50]);
    
    showNotification('🔄 Mode simulation activé', 'success');
    
    setTimeout(() => {
        // Pour la simulation, on demande à l'utilisateur d'entrer un code
        const scannedCode = prompt('📸 Code scanné (simulation) :\n\nEntre le code à 4 chiffres de ton ami :');
        
        if (!scannedCode || scannedCode.length !== 4 || isNaN(scannedCode)) {
            showNotification('❌ Code invalide !', 'error');
            closeScannerModal();
            return;
        }
        
        // Même vérifications que pour le code manuel
        if (scannedCode === myFriendCode) {
            showNotification('❌ Tu ne peux pas t\'ajouter toi-même !', 'error');
            closeScannerModal();
            return;
        }
        
        const alreadyFriend = friends.find(f => f.code === scannedCode);
        if (alreadyFriend) {
            showNotification(`❌ ${alreadyFriend.nickname} est déjà dans tes amis !`, 'error');
            closeScannerModal();
            return;
        }
        
        const allInvitations = localStorage.getItem('globalInvitations');
        let globalInvitations = allInvitations ? JSON.parse(allInvitations) : [];
        const alreadySent = globalInvitations.find(inv => 
            inv.fromCode === myFriendCode && inv.toCode === scannedCode
        );
        
        if (alreadySent) {
            // Supprimer l'ancienne invitation pour permettre de réinviter
            globalInvitations = globalInvitations.filter(inv => 
                !(inv.fromCode === myFriendCode && inv.toCode === scannedCode)
            );
            localStorage.setItem('globalInvitations', JSON.stringify(globalInvitations));
            showNotification('🔄 Ancienne invitation remplacée !', 'success');
            safeVibrate([50, 50]);
        }
        
        pendingFriendCode = scannedCode;
        closeScannerModal();
        showSendInvitationModal(scannedCode);
    }, 500);
}

// ============================================
// ENVOYER INVITATION
// ============================================

function showSendInvitationModal(code) {
    document.getElementById('previewCode').textContent = code;
    document.getElementById('nicknameInput').value = '';
    document.getElementById('confirmModal').classList.add('active');
    
    // Focus sur l'input pseudo après un court délai
    setTimeout(() => {
        document.getElementById('nicknameInput').focus();
    }, 300);
    
    safeVibrate(50);
}

function sendInvitation() {
    const nickname = document.getElementById('nicknameInput').value.trim();
    
    if (!nickname) {
        showNotification('❌ Entre ton pseudo !', 'error');
        safeVibrate([100, 50, 100]);
        return;
    }
    
    // Créer l'invitation
    const invitation = {
        fromCode: myFriendCode,
        fromNickname: nickname,
        toCode: pendingFriendCode,
        timestamp: Date.now()
    };
    
    // Sauvegarder l'invitation
    saveInvitation(invitation);
    
    // Fermer la modal
    document.getElementById('confirmModal').classList.remove('active');
    
    // Notification de succès avec explications (6 secondes pour avoir le temps de lire)
    showNotification(`📤 Invitation envoyée ! ${pendingFriendCode} doit RAFRAÎCHIR sa page et aller dans "Invitations". ⚠️ Ne fonctionne que sur le même navigateur !`, 'success', 6000);
    
    safeVibrate([100, 50, 100, 50, 100]);
    
    // Réinitialiser
    pendingFriendCode = '';
}

function cancelInvitation() {
    document.getElementById('confirmModal').classList.remove('active');
    pendingFriendCode = '';
    
    safeVibrate([50, 50]);
}

// ============================================
// ACCEPTER/REFUSER INVITATION
// ============================================

function showAcceptModal(index) {
    pendingInvitationIndex = index;
    const invitation = invitations[index];
    
    document.getElementById('senderNickname').textContent = invitation.fromNickname;
    document.getElementById('senderCode').textContent = invitation.fromCode;
    document.getElementById('recipientNicknameInput').value = '';
    document.getElementById('acceptInvitationModal').classList.add('active');
    
    // Focus sur l'input
    setTimeout(() => {
        document.getElementById('recipientNicknameInput').focus();
    }, 300);
    
    safeVibrate(50);
}

function acceptInvitation() {
    if (pendingInvitationIndex < 0) return;
    
    const nickname = document.getElementById('recipientNicknameInput').value.trim();
    
    if (!nickname) {
        showNotification('❌ Entre un pseudo pour ton ami !', 'error');
        safeVibrate([100, 50, 100]);
        return;
    }
    
    const invitation = invitations[pendingInvitationIndex];
    
    // Ajouter l'ami à ma liste
    const newFriend = {
        code: invitation.fromCode,
        nickname: nickname,
        addedAt: new Date().toISOString()
    };
    
    friends.push(newFriend);
    saveFriends();
    
    // Ajouter moi-même à la liste de l'expéditeur
    const senderFriendsKey = `friends_${invitation.fromCode}`;
    const senderFriendsData = localStorage.getItem(senderFriendsKey);
    const senderFriends = senderFriendsData ? JSON.parse(senderFriendsData) : [];
    
    senderFriends.push({
        code: myFriendCode,
        nickname: invitation.fromNickname, // Le pseudo qu'il avait donné
        addedAt: new Date().toISOString()
    });
    
    localStorage.setItem(senderFriendsKey, JSON.stringify(senderFriends));
    
    // Retirer l'invitation
    removeInvitation(invitation);
    
    // Fermer la modal
    document.getElementById('acceptInvitationModal').classList.remove('active');
    
    // Mettre à jour l'affichage
    displayFriends();
    displayInvitations();
    
    // Notification de succès
    showNotification(`✅ ${nickname} est maintenant ton ami !`, 'success');
    
    safeVibrate([100, 50, 100, 50, 100]);
    
    pendingInvitationIndex = -1;
}

function refuseInvitation() {
    if (pendingInvitationIndex < 0) return;
    
    const invitation = invitations[pendingInvitationIndex];
    
    // Retirer l'invitation
    removeInvitation(invitation);
    
    // Fermer la modal
    document.getElementById('acceptInvitationModal').classList.remove('active');
    
    showNotification('❌ Invitation refusée', 'error');
    
    safeVibrate([50, 50]);
    
    pendingInvitationIndex = -1;
}

function refuseInvitationDirect(index) {
    const invitation = invitations[index];
    
    if (confirm(`Veux-tu vraiment refuser l'invitation de ${invitation.fromNickname} ?`)) {
        removeInvitation(invitation);
        showNotification('❌ Invitation refusée', 'error');
        
        safeVibrate([50, 50]);
    }
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
// EMPÊCHER LA SOUMISSION DES INPUTS PAR ENTRÉE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Empêcher l'envoi de formulaire avec Enter sur les inputs de code
    const codeInputs = document.querySelectorAll('.code-digit');
    codeInputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                verifyCode();
            }
        });
    });
    
    // Enter sur le pseudo d'envoi = envoyer
    const nicknameInput = document.getElementById('nicknameInput');
    if (nicknameInput) {
        nicknameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendInvitation();
            }
        });
    }
    
    // Enter sur le pseudo de réception = accepter
    const recipientNicknameInput = document.getElementById('recipientNicknameInput');
    if (recipientNicknameInput) {
        recipientNicknameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                acceptInvitation();
            }
        });
    }
    
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
    
    // Charger les messages
    loadMessages();
    
    // Ouvrir la modal
    document.getElementById('chatModal').classList.add('active');
    
    // Auto-refresh des messages toutes les 2 secondes
    if (chatRefreshInterval) {
        clearInterval(chatRefreshInterval);
    }
    chatRefreshInterval = setInterval(() => {
        loadMessages();
    }, 2000);
    
    // Focus sur l'input
    setTimeout(() => {
        document.getElementById('chatInput').focus();
    }, 300);
    
    safeVibrate(50);
}

function closeChat() {
    document.getElementById('chatModal').classList.remove('active');
    currentChatFriend = null;
    
    // Arrêter l'auto-refresh
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
    // Créer une clé unique pour la conversation (ordre alphabétique pour cohérence)
    const codes = [code1, code2].sort();
    return `chat_${codes[0]}_${codes[1]}`;
}

function displayMessages(messages) {
    const container = document.getElementById('chatMessages');
    const chatEmpty = container.querySelector('.chat-empty');
    
    if (messages.length === 0) {
        if (chatEmpty) chatEmpty.style.display = 'block';
        // Supprimer tous les messages
        container.querySelectorAll('.message').forEach(msg => msg.remove());
        return;
    }
    
    if (chatEmpty) chatEmpty.style.display = 'none';
    
    // Sauvegarder la position de scroll
    const wasAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
    
    // Vider les messages existants
    container.querySelectorAll('.message').forEach(msg => msg.remove());
    
    // Ajouter tous les messages
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
    
    // Scroller vers le bas si on était déjà en bas
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
    
    // Sauvegarder le message
    const chatKey = getChatKey(myFriendCode, currentChatFriend.code);
    const savedMessages = localStorage.getItem(chatKey);
    const messages = savedMessages ? JSON.parse(savedMessages) : [];
    
    messages.push(message);
    localStorage.setItem(chatKey, JSON.stringify(messages));
    
    // Afficher les messages
    loadMessages();
    
    // Vider l'input
    input.value = '';
    
    // Vibration
    safeVibrate(30);
    
    // Scroller vers le bas
    const container = document.getElementById('chatMessages');
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);
}

// ============================================
// AUTO-REFRESH DES INVITATIONS
// ============================================

// Refresh toutes les 3 secondes
setInterval(() => {
    const currentInvitationCount = invitations.length;
    loadInvitations();
    
    // Si nouvelles invitations, notification
    if (invitations.length > currentInvitationCount) {
        showNotification('📬 Nouvelle invitation reçue !', 'success');
        safeVibrate([100, 50, 100]);
    }
}, 3000);
// ============================================
// GESTION DU PROFIL UTILISATEUR
// ============================================

function loadUserProfile() {
    // Charger le pseudo
    const savedPseudo = localStorage.getItem(`userPseudo_${myFriendCode}`);
    if (savedPseudo) {
        document.getElementById('profileTitle').textContent = savedPseudo;
        // Mettre à jour le label de l'onglet
        const profileTabLabel = document.querySelector('#profileTab .tab-label');
        if (profileTabLabel) {
            profileTabLabel.textContent = savedPseudo;
        }
    }
    
    // Charger l'avatar
    const savedAvatar = localStorage.getItem(`userAvatar_${myFriendCode}`);
    if (savedAvatar) {
        document.getElementById('profileAvatar').textContent = savedAvatar;
        // Sélectionner visuellement l'avatar
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
    
    // Validation
    if (!pseudo) {
        showNotification('❌ Le pseudo ne peut pas être vide', 'error');
        return;
    }
    
    if (pseudo.length > 15) {
        showNotification('❌ Le pseudo est trop long (max 15 caractères)', 'error');
        return;
    }
    
    // Sauvegarder
    localStorage.setItem(`userPseudo_${myFriendCode}`, pseudo);
    
    // Mettre à jour l'affichage
    document.getElementById('profileTitle').textContent = pseudo;
    
    // Mettre à jour le label de l'onglet
    const profileTabLabel = document.querySelector('#profileTab .tab-label');
    if (profileTabLabel) {
        profileTabLabel.textContent = pseudo;
    }
    
    // Notification de succès
    showNotification('✅ Pseudo enregistré avec succès !', 'success');
    
    // Vibration
    safeVibrate([50, 30, 50]);
    
    // Animation sur le titre
    const titleElement = document.getElementById('profileTitle');
    titleElement.style.transform = 'scale(1.1)';
    setTimeout(() => {
        titleElement.style.transform = 'scale(1)';
    }, 300);
}

function selectAvatar(emoji) {
    // Sauvegarder
    localStorage.setItem(`userAvatar_${myFriendCode}`, emoji);
    
    // Mettre à jour l'affichage dans le header
    document.getElementById('profileAvatar').textContent = emoji;
    
    // Mettre à jour la sélection visuelle
    document.querySelectorAll('.avatar-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Sélectionner le nouvel avatar
    event.target.classList.add('selected');
    
    // Notification de succès
    showNotification('✅ Avatar sélectionné !', 'success');
    
    // Vibration
    safeVibrate(50);
    
    // Animation sur l'avatar
    const avatarElement = document.getElementById('profileAvatar');
    avatarElement.style.transform = 'rotate(360deg) scale(1.3)';
    setTimeout(() => {
        avatarElement.style.transform = 'rotate(0deg) scale(1)';
    }, 500);
}
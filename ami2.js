// ============================================
// SYSTÈME DE GESTION DES INVITATIONS
// Ce fichier gère : invitations, scan QR, envoi/réception
// Nécessite ami.js pour fonctionner
// ============================================

let invitations = [];
let pendingFriendCode = '';
let pendingInvitationIndex = -1;
let html5QrcodeScanner = null;
let isScanning = false;

// ============================================
// INITIALISATION DES INVITATIONS
// ============================================

window.addEventListener('load', () => {
    // Charger les invitations
    loadInvitations();
    
    // Vérifier si on arrive via un QR code scanné
    checkForFriendCodeInURL();
    
    // Arrêter la caméra lors de la fermeture de la page
    window.addEventListener('beforeunload', () => {
        stopQRScanner();
    });
});

// ============================================
// DÉTECTION QR CODE DANS L'URL
// ============================================

function checkForFriendCodeInURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const friendCodeToAdd = urlParams.get('add');
    
    if (friendCodeToAdd && friendCodeToAdd.length === 4 && !isNaN(friendCodeToAdd)) {
        // Nettoyer l'URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
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
                globalInvitations = globalInvitations.filter(inv => 
                    !(inv.fromCode === myFriendCode && inv.toCode === friendCodeToAdd)
                );
                localStorage.setItem('globalInvitations', JSON.stringify(globalInvitations));
            }
            
            pendingFriendCode = friendCodeToAdd;
            
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
// GESTION DES INVITATIONS
// ============================================

function loadInvitations() {
    const allInvitations = localStorage.getItem('globalInvitations');
    const globalInvitations = allInvitations ? JSON.parse(allInvitations) : [];
    
    // Filtrer les invitations destinées à mon code
    invitations = globalInvitations.filter(inv => inv.toCode === myFriendCode);
    
    console.log('📬 Mon code:', myFriendCode);
    console.log('📋 Toutes les invitations:', globalInvitations);
    console.log('✅ Mes invitations:', invitations);
    
    displayInvitations();
}

function saveInvitation(invitation) {
    const allInvitations = localStorage.getItem('globalInvitations');
    const globalInvitations = allInvitations ? JSON.parse(allInvitations) : [];
    
    globalInvitations.push(invitation);
    localStorage.setItem('globalInvitations', JSON.stringify(globalInvitations));
    
    console.log('📤 Invitation sauvegardée:', invitation);
    console.log('📋 Toutes les invitations:', globalInvitations);
}

function removeInvitation(invitationToRemove) {
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
        const existingCards = container.querySelectorAll('.invitation-card');
        existingCards.forEach(card => card.remove());
    } else {
        noInvitations.style.display = 'none';
        
        const existingCards = container.querySelectorAll('.invitation-card');
        existingCards.forEach(card => card.remove());
        
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
// AJOUTER UN AMI (MODAL)
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
    
    setTimeout(() => {
        document.getElementById('digit1').focus();
    }, 100);
    
    safeVibrate(50);
}

function closeCodeInput() {
    document.getElementById('codeInputModal').classList.remove('active');
    
    document.getElementById('digit1').value = '';
    document.getElementById('digit2').value = '';
    document.getElementById('digit3').value = '';
    document.getElementById('digit4').value = '';
}

function moveToNext(current, nextId) {
    if (current.value.length >= 1) {
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
    
    if (code === myFriendCode) {
        showNotification('❌ Tu ne peux pas t\'ajouter toi-même !', 'error');
        safeVibrate([100, 50, 100, 50, 100]);
        return;
    }
    
    const alreadyFriend = friends.find(f => f.code === code);
    if (alreadyFriend) {
        showNotification(`❌ ${alreadyFriend.nickname} est déjà dans tes amis !`, 'error');
        safeVibrate([100, 50, 100]);
        return;
    }
    
    const allInvitations = localStorage.getItem('globalInvitations');
    let globalInvitations = allInvitations ? JSON.parse(allInvitations) : [];
    const alreadySent = globalInvitations.find(inv => 
        inv.fromCode === myFriendCode && inv.toCode === code
    );
    
    if (alreadySent) {
        globalInvitations = globalInvitations.filter(inv => 
            !(inv.fromCode === myFriendCode && inv.toCode === code)
        );
        localStorage.setItem('globalInvitations', JSON.stringify(globalInvitations));
        showNotification('🔄 Ancienne invitation remplacée !', 'success');
        safeVibrate([50, 50]);
    }
    
    pendingFriendCode = code;
    closeCodeInput();
    showSendInvitationModal(code);
}

// ============================================
// SCANNER QR CODE
// ============================================

function showQRScanner() {
    closeAddModal();
    document.getElementById('scannerModal').classList.add('active');
    
    safeVibrate([50, 50]);
    
    setTimeout(() => {
        startQRScanner();
    }, 300);
}

function startQRScanner() {
    if (isScanning) return;
    
    if (typeof Html5Qrcode === 'undefined') {
        showNotification('❌ Erreur : bibliothèque de scan non chargée', 'error');
        return;
    }
    
    isScanning = true;
    
    html5QrcodeScanner = new Html5Qrcode("qr-reader");
    
    const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 }
    };
    
    html5QrcodeScanner.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanError
    ).catch(err => {
        html5QrcodeScanner.start(
            { facingMode: "user" },
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
    safeVibrate([50, 100, 50]);
    stopQRScanner();
    processScannedCode(decodedText);
}

function onScanError(errorMessage) {
    // Normal, pas de QR détecté
}

function processScannedCode(scannedData) {
    let code = '';
    
    // URL avec paramètre add
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
    // Code direct
    else if (scannedData.length === 4 && !isNaN(scannedData)) {
        code = scannedData;
    }
    
    if (!code || code.length !== 4 || isNaN(code)) {
        showNotification('❌ QR Code invalide !', 'error');
        closeScannerModal();
        return;
    }
    
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
            console.error('Erreur arrêt scanner:', err);
            isScanning = false;
        });
    }
}

function closeScannerModal() {
    stopQRScanner();
    document.getElementById('scannerModal').classList.remove('active');
}

// ============================================
// ENVOYER INVITATION
// ============================================

function showSendInvitationModal(code) {
    document.getElementById('previewCode').textContent = code;
    document.getElementById('nicknameInput').value = '';
    document.getElementById('confirmModal').classList.add('active');
    
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
    
    const invitation = {
        fromCode: myFriendCode,
        fromNickname: nickname,
        toCode: pendingFriendCode,
        timestamp: Date.now()
    };
    
    saveInvitation(invitation);
    
    document.getElementById('confirmModal').classList.remove('active');
    
    showNotification(`📤 Invitation envoyée ! Si vous êtes sur le MÊME NAVIGATEUR, l'autre personne la verra dans 3 secondes max.`, 'success', 6000);
    
    safeVibrate([100, 50, 100, 50, 100]);
    
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
    
    // Récupérer mon propre pseudo
    const myNickname = localStorage.getItem(`userPseudo_${myFriendCode}`) || 'Utilisateur';
    
    senderFriends.push({
        code: myFriendCode,
        nickname: myNickname,
        addedAt: new Date().toISOString()
    });
    
    localStorage.setItem(senderFriendsKey, JSON.stringify(senderFriends));
    
    // Retirer l'invitation
    removeInvitation(invitation);
    
    document.getElementById('acceptInvitationModal').classList.remove('active');
    
    displayFriends();
    displayInvitations();
    
    showNotification(`✅ ${nickname} est maintenant ton ami !`, 'success');
    
    safeVibrate([100, 50, 100, 50, 100]);
    
    pendingInvitationIndex = -1;
}

function refuseInvitation() {
    if (pendingInvitationIndex < 0) return;
    
    const invitation = invitations[pendingInvitationIndex];
    
    removeInvitation(invitation);
    
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
// AUTO-REFRESH DES INVITATIONS
// ============================================

setInterval(() => {
    console.log('🔄 Auto-refresh des invitations...');
    
    const currentInvitationCount = invitations.length;
    loadInvitations();
    
    console.log(`📊 Avant: ${currentInvitationCount}, Après: ${invitations.length}`);
    
    if (invitations.length > currentInvitationCount) {
        console.log('🎉 NOUVELLE INVITATION DÉTECTÉE !');
        showNotification('📬 Nouvelle invitation reçue !', 'success');
        safeVibrate([100, 50, 100]);
    }
}, 3000);

// ============================================
// GESTION DES EVENTS CLAVIER
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Enter sur les inputs de code
    const codeInputs = document.querySelectorAll('.code-digit');
    codeInputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                verifyCode();
            }
        });
    });
    
    // Enter sur le pseudo d'envoi
    const nicknameInput = document.getElementById('nicknameInput');
    if (nicknameInput) {
        nicknameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendInvitation();
            }
        });
    }
    
    // Enter sur le pseudo de réception
    const recipientNicknameInput = document.getElementById('recipientNicknameInput');
    if (recipientNicknameInput) {
        recipientNicknameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                acceptInvitation();
            }
        });
    }
});

// ============================================
// SYSTÈME DE GESTION DES INVITATIONS AVEC SUPABASE
// Ce fichier gère : invitations, scan QR, envoi/réception
// Nécessite ami.js + supabase-config.js pour fonctionner
// ============================================

let invitations = [];
let pendingFriendCode = '';
let pendingInvitationIndex = -1;
let html5QrcodeScanner = null;
let isScanning = false;
let invitationSubscription = null;

// ============================================
// INITIALISATION DES INVITATIONS
// ============================================

window.addEventListener('load', () => {
    // Afficher le bon message selon le mode
    updateSystemStatusDisplay();
    
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
// AFFICHAGE DU STATUT SYSTÈME
// ============================================

function updateSystemStatusDisplay() {
    const supabaseStatus = document.getElementById('supabaseStatus');
    const localStorageWarning = document.getElementById('localStorageWarning');
    
    if (window.isSupabaseConfigured && window.supabaseClient) {
        // Mode Supabase : afficher message vert
        if (supabaseStatus) supabaseStatus.style.display = 'block';
        if (localStorageWarning) localStorageWarning.style.display = 'none';
    } else {
        // Mode localStorage : afficher avertissement orange
        if (supabaseStatus) supabaseStatus.style.display = 'none';
        if (localStorageWarning) localStorageWarning.style.display = 'block';
    }
}

// ============================================
// DÉTECTION QR CODE DANS L'URL
// ============================================

async function checkForFriendCodeInURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const friendCodeToAdd = urlParams.get('add');
    
    if (friendCodeToAdd && friendCodeToAdd.length === 4 && !isNaN(friendCodeToAdd)) {
        // Nettoyer l'URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        setTimeout(async () => {
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
            if (window.isSupabaseConfigured && window.supabaseClient) {
                try {
                    const { data } = await window.supabaseClient
                        .from('invitations')
                        .select('*')
                        .eq('from_code', myFriendCode)
                        .eq('to_code', friendCodeToAdd);
                    
                    if (data && data.length > 0) {
                        // Supprimer l'ancienne invitation
                        await window.supabaseClient
                            .from('invitations')
                            .delete()
                            .eq('from_code', myFriendCode)
                            .eq('to_code', friendCodeToAdd);
                    }
                } catch (err) {
                    console.error('Erreur:', err);
                }
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
// GESTION DES INVITATIONS AVEC SUPABASE
// ============================================

async function loadInvitations() {
    try {
        // Si Supabase est configuré, l'utiliser
        if (window.isSupabaseConfigured && window.supabaseClient) {
            try {
                const { data, error } = await window.supabaseClient
                    .from('invitations')
                    .select('*')
                    .eq('to_code', myFriendCode);
                
                if (error) {
                    console.error('❌ Erreur Supabase:', error);
                    console.log('🔄 Passage en mode localStorage');
                    loadInvitationsFromLocalStorage();
                    return;
                }
                
                // Convertir au format interne
                invitations = (data || []).map(inv => ({
                    fromCode: inv.from_code,
                    fromNickname: inv.from_nickname,
                    toCode: inv.to_code,
                    timestamp: inv.timestamp,
                    id: inv.id
                }));
                
                console.log('📬 Mon code:', myFriendCode);
                console.log('✅ Mes invitations (Supabase):', invitations);
                
                displayInvitations();
                return;
            } catch (err) {
                console.error('❌ Erreur Supabase:', err);
                console.log('🔄 Passage en mode localStorage');
            }
        }
        
        // Sinon, utiliser localStorage
        loadInvitationsFromLocalStorage();
    } catch (err) {
        console.error('❌ Erreur:', err);
        loadInvitationsFromLocalStorage();
    }
}

// Fonction de secours : charger depuis localStorage
function loadInvitationsFromLocalStorage() {
    const saved = localStorage.getItem(`invitations_${myFriendCode}`);
    invitations = saved ? JSON.parse(saved) : [];
    console.log('📬 Mon code:', myFriendCode);
    console.log('✅ Mes invitations (localStorage):', invitations);
    displayInvitations();
}

// Fonction de secours : sauvegarder dans localStorage
function saveInvitationsToLocalStorage() {
    localStorage.setItem(`invitations_${myFriendCode}`, JSON.stringify(invitations));
}

async function saveInvitation(invitation) {
    try {
        // Si Supabase est configuré, l'utiliser
        if (window.isSupabaseConfigured && window.supabaseClient) {
            try {
                const { data, error } = await window.supabaseClient
                    .from('invitations')
                    .insert([{
                        from_code: invitation.fromCode,
                        from_nickname: invitation.fromNickname,
                        to_code: invitation.toCode,
                        timestamp: invitation.timestamp
                    }])
                    .select();
                
                if (error) {
                    console.error('❌ Erreur Supabase:', error);
                    console.log('🔄 Sauvegarde en localStorage');
                    saveInvitationToLocalStorage(invitation);
                    return;
                }
                
                console.log('📤 Invitation sauvegardée (Supabase):', data);
                return;
            } catch (err) {
                console.error('❌ Erreur Supabase:', err);
            }
        }
        
        // Sinon, utiliser localStorage
        saveInvitationToLocalStorage(invitation);
    } catch (err) {
        console.error('❌ Erreur:', err);
        saveInvitationToLocalStorage(invitation);
    }
}

// Fonction de secours : sauvegarder dans localStorage
function saveInvitationToLocalStorage(invitation) {
    // Charger les invitations du destinataire
    const saved = localStorage.getItem(`invitations_${invitation.toCode}`);
    const targetInvitations = saved ? JSON.parse(saved) : [];
    
    // Ajouter l'invitation avec un ID unique
    invitation.id = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    targetInvitations.push(invitation);
    
    // Sauvegarder
    localStorage.setItem(`invitations_${invitation.toCode}`, JSON.stringify(targetInvitations));
    console.log('📤 Invitation sauvegardée (localStorage):', invitation);
}

async function removeInvitation(invitationToRemove) {
    try {
        // Si Supabase est configuré, l'utiliser
        if (window.isSupabaseConfigured && window.supabaseClient) {
            try {
                const { error } = await window.supabaseClient
                    .from('invitations')
                    .delete()
                    .eq('id', invitationToRemove.id);
                
                if (error) {
                    console.error('❌ Erreur Supabase:', error);
                    removeInvitationFromLocalStorage(invitationToRemove);
                    return;
                }
                
                console.log('🗑️ Invitation supprimée (Supabase)');
                loadInvitations();
                return;
            } catch (err) {
                console.error('❌ Erreur Supabase:', err);
            }
        }
        
        // Sinon, utiliser localStorage
        removeInvitationFromLocalStorage(invitationToRemove);
    } catch (err) {
        console.error('❌ Erreur:', err);
        removeInvitationFromLocalStorage(invitationToRemove);
    }
}

// Fonction de secours : supprimer de localStorage
function removeInvitationFromLocalStorage(invitationToRemove) {
    invitations = invitations.filter(inv => 
        inv.id !== invitationToRemove.id && 
        inv.timestamp !== invitationToRemove.timestamp
    );
    saveInvitationsToLocalStorage();
    console.log('🗑️ Invitation supprimée (localStorage)');
    displayInvitations();
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

async function verifyCode() {
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
    
    // Vérifier si une invitation a déjà été envoyée
    if (window.isSupabaseConfigured && window.supabaseClient) {
        try {
            const { data } = await window.supabaseClient
                .from('invitations')
                .select('*')
                .eq('from_code', myFriendCode)
                .eq('to_code', code);
            
            if (data && data.length > 0) {
                // Supprimer l'ancienne invitation
                await window.supabaseClient
                    .from('invitations')
                    .delete()
                    .eq('from_code', myFriendCode)
                    .eq('to_code', code);
                
                showNotification('🔄 Ancienne invitation remplacée !', 'success');
                safeVibrate([50, 50]);
            }
        } catch (err) {
            console.error('Erreur:', err);
        }
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

async function processScannedCode(scannedData) {
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
    
    // Vérifier si une invitation a déjà été envoyée
    if (window.isSupabaseConfigured && window.supabaseClient) {
        try {
            const { data } = await window.supabaseClient
                .from('invitations')
                .select('*')
                .eq('from_code', myFriendCode)
                .eq('to_code', code);
            
            if (data && data.length > 0) {
                // Supprimer l'ancienne invitation
                await window.supabaseClient
                    .from('invitations')
                    .delete()
                    .eq('from_code', myFriendCode)
                    .eq('to_code', code);
                
                showNotification('🔄 Ancienne invitation remplacée !', 'success');
                safeVibrate([50, 50]);
            } else {
                showNotification('📸 QR Code scanné avec succès !', 'success');
            }
        } catch (err) {
            console.error('Erreur:', err);
            showNotification('📸 QR Code scanné avec succès !', 'success');
        }
    } else {
        // Mode localStorage : vérifier les invitations locales
        const saved = localStorage.getItem(`invitations_${code}`);
        const existingInvitations = saved ? JSON.parse(saved) : [];
        const alreadySent = existingInvitations.find(inv => 
            inv.fromCode === myFriendCode
        );
        
        if (alreadySent) {
            showNotification('🔄 Tu as déjà envoyé une invitation !', 'info');
        } else {
            showNotification('📸 QR Code scanné avec succès !', 'success');
        }
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

async function sendInvitation() {
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
    
    await saveInvitation(invitation);
    
    document.getElementById('confirmModal').classList.remove('active');
    
    showNotification(`📤 Invitation envoyée ! L'autre personne la verra instantanément sur n'importe quel appareil ! 🚀`, 'success', 6000);
    
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

async function acceptInvitation() {
    if (pendingInvitationIndex < 0) return;
    
    const nickname = document.getElementById('recipientNicknameInput').value.trim();
    
    if (!nickname) {
        showNotification('❌ Entre un pseudo pour ton ami !', 'error');
        safeVibrate([100, 50, 100]);
        return;
    }
    
    const invitation = invitations[pendingInvitationIndex];
    
    // Ajouter l'ami à ma liste (localStorage)
    const newFriend = {
        code: invitation.fromCode,
        nickname: nickname,
        addedAt: new Date().toISOString()
    };
    
    friends.push(newFriend);
    saveFriends();
    
    // Ajouter moi-même à la liste de l'expéditeur (localStorage)
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
    
    // Sauvegarder les deux amis dans Supabase (si configuré)
    if (window.isSupabaseConfigured && window.supabaseClient) {
        try {
            await window.supabaseClient.from('friends').insert([
                {
                    user_code: myFriendCode,
                    friend_code: invitation.fromCode,
                    nickname: nickname,
                    added_at: new Date().toISOString()
                },
                {
                    user_code: invitation.fromCode,
                    friend_code: myFriendCode,
                    nickname: myNickname,
                    added_at: new Date().toISOString()
                }
            ]);
        } catch (err) {
            console.error('Erreur Supabase:', err);
        }
    }
    
    // Retirer l'invitation
    await removeInvitation(invitation);
    
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
// TEMPS RÉEL SUPABASE (UNIQUEMENT SI CONFIGURÉ)
// ============================================

function setupRealtimeInvitations() {
    // Ne pas activer le temps réel si Supabase n'est pas configuré
    if (!window.isSupabaseConfigured || !window.supabaseClient) {
        console.log('⚠️ Temps réel Supabase non disponible - Mode localStorage actif');
        return;
    }
    
    // Souscrire aux changements en temps réel
    invitationSubscription = window.supabaseClient
        .channel('invitations_channel')
        .on(
            'postgres_changes',
            {
                event: '*', // Tous les événements (INSERT, UPDATE, DELETE)
                schema: 'public',
                table: 'invitations',
                filter: `to_code=eq.${myFriendCode}`
            },
            (payload) => {
                console.log('🔔 Changement détecté:', payload);
                
                if (payload.eventType === 'INSERT') {
                    console.log('🎉 NOUVELLE INVITATION !');
                    showNotification('📬 Nouvelle invitation reçue !', 'success');
                    safeVibrate([100, 50, 100]);
                }
                
                // Recharger les invitations
                loadInvitations();
            }
        )
        .subscribe();
    
    console.log('✅ Temps réel Supabase activé pour les invitations');
}

// Appeler au chargement
window.addEventListener('load', () => {
    setupRealtimeInvitations();
});

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

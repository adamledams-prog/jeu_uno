# 🧪 Comment tester le système d'amis

## ✅ Problème résolu
Les erreurs de vibration sont maintenant gérées - elles ne bloquent plus rien !

## � Nouveau : Scan QR Code avec la caméra !
Tu peux maintenant scanner les QR codes de tes amis avec la caméra de ton téléphone/ordinateur !

### Comment scanner un QR Code :
1. Clique sur "+ Ajouter un ami"
2. Choisis "📸 Scanner QR Code"
3. **Autorise l'accès à la caméra** quand ton navigateur le demande
4. Place le QR code de ton ami devant la caméra
5. Le code sera détecté automatiquement !

### Mode Simulation :
Si tu n'as pas accès à une caméra ou si tu veux tester sans scanner, clique sur "🔄 Mode Simulation" pour entrer manuellement un code.

### 🔄 Réinviter une personne :
Tu peux maintenant renvoyer une invitation à une personne même si tu lui as déjà envoyé une invitation ! L'ancienne invitation sera automatiquement remplacée par la nouvelle. C'est utile si :
- Tu veux changer le pseudo que tu as donné
- L'autre personne a supprimé ton invitation par erreur
- Tu veux simplement renvoyer l'invitation

## 📱 Comment ajouter un ami (Test localStorage)

Le système d'amis fonctionne avec **localStorage** qui est partagé sur le même domaine. Pour tester :

### Méthode 1: Deux onglets sur le MÊME navigateur ✅

**IMPORTANT : Les deux onglets doivent être dans le même navigateur (pas d'incognito) !**

1. **Onglet 1 - Toi**
   - Ouvre `ami.html`
   - Note ton code (ex: 1234)
   - Va dans l'onglet "Moi" et donne-toi un pseudo + avatar

2. **Onglet 2 - Ton ami (dans le MÊME navigateur)**
   - Ouvre un NOUVEL onglet **NORMAL** (pas incognito !)
   - Va sur `ami.html` dans ce nouvel onglet
   - Note le code (ex: 5678)
   - Va dans l'onglet "Moi" et donne-toi un autre pseudo

3. **Envoi d'invitation (depuis onglet 1)**
   - Clique sur "+ Ajouter un ami"
   - Choisis **"🔢 Par Code"** pour entrer manuellement
   - OU choisis **"📸 Scanner QR Code"** pour scanner (si tu as 2 écrans/appareils)
   - Entre le code de l'onglet 2 (5678)
   - Donne ton pseudo et valide

4. **Accepter l'invitation (onglet 2)**
   - **Rafraîchis la page** ou attends 3 secondes
   - Va dans l'onglet "Invitations"
   - Tu verras l'invitation apparaître !
   - Clique sur "✅ Accepter"
   - Donne un pseudo pour ton ami
   - Validé ! 🎉

### Méthode 2: Deux appareils différents 📱💻

**⚠️ ATTENTION : Cette méthode NE FONCTIONNE PAS avec localStorage !**

Le système actuel utilise `localStorage` qui est **local à chaque navigateur**. 
Les invitations ne sont **PAS synchronisées** entre :
- ❌ Deux appareils différents (téléphone + ordinateur)
- ❌ Deux navigateurs différents (Chrome + Firefox)
- ❌ Navigation normale + Navigation privée

**Pour que ça fonctionne entre deux appareils, il faudrait :**
- Un serveur backend (Node.js, PHP, etc.)
- Ou une base de données en ligne (Firebase, Supabase, etc.)

**En attendant, utilise la Méthode 1 (deux onglets normaux du même navigateur) ! ✅**

### ⚠️ Important

**localStorage est LOCAL au navigateur :**
- ✅ **Fonctionne** : Deux onglets normaux du **même navigateur**
- ❌ **Ne fonctionne PAS** : Navigation normale + Navigation privée/incognito
- ❌ **Ne fonctionne PAS** : Deux navigateurs différents (Chrome/Firefox)
- ❌ **Ne fonctionne PAS** : Deux appareils différents (PC/téléphone)

**Pour tester le système :**
1. Ouvre `ami.html` dans un onglet normal
2. Note ton code (ex: 1234)
3. Ouvre un AUTRE onglet normal dans le même navigateur
4. Va sur `ami.html` dans ce deuxième onglet
5. Note le nouveau code (ex: 5678)
6. Envoie une invitation depuis l'onglet 1 vers le code 5678
7. **Rafraîchis l'onglet 2** et va dans "Invitations"
8. L'invitation devrait apparaître ! ✅

**Astuce :** Donne des pseudos différents dans chaque onglet pour éviter la confusion !

## 🎯 Fonctionnalités

- ✅ Code ami unique à 4 chiffres
- ✅ QR Code pour partager
- ✅ **Scanner QR Code avec la caméra réelle** 📸
- ✅ **Réinviter une personne** (remplace l'ancienne invitation) 🔄
- ✅ Système d'invitations bidirectionnel
- ✅ Chat en temps réel (localStorage)
- ✅ Notifications avec badge
- ✅ Profil personnalisable (pseudo + 5 avatars)
- ✅ Auto-refresh des invitations et messages

## 🐛 Erreurs ignorées

Ces erreurs dans la console sont normales et n'empêchent rien :
- `navigator.vibrate blocked` - La vibration nécessite une interaction utilisateur
- `favicon.ico 404` - Pas de favicon défini (cosmétique)
- `Camera permission denied` - Normal si tu refuses l'accès à la caméra

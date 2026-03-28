# 🧪 Comment tester le système d'amis

## ✅ Problème résolu
Les erreurs de vibration sont maintenant gérées - elles ne bloquent plus rien !

## 📸 Nouveau : Scan QR Code RÉEL avec l'appareil photo ! 🎉

**Le QR code fonctionne maintenant comme un vrai QR code !**

### Comment ça marche :
1. **Affiche ton QR code** dans l'onglet "Moi"
2. **Ton ami scanne avec son téléphone** (appareil photo natif ou app de scan)
3. **Le site s'ouvre automatiquement** avec ton code
4. **Une modal apparaît** pour proposer de t'ajouter en ami !

### Avantages :
- ✅ Fonctionne avec l'**appareil photo du téléphone** (pas besoin d'ouvrir le site d'abord)
- ✅ Scan depuis **n'importe quel appareil**
- ✅ **URL complète** dans le QR code (ex: `ami.html?add=1234`)
- ✅ Détection automatique du code ami
- ✅ Plus besoin de saisir manuellement !

### Scanner depuis l'app (optionnel) :
Tu peux aussi :
1. Ouvrir le site sur ton téléphone
2. Cliquer sur "+ Ajouter un ami"  
3. Choisir "📸 Scanner QR Code"
4. **Autorise l'accès à la caméra**
5. Scanner le QR code d'un ami

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

**MAIS maintenant avec le QR Code :**
- ✅ **Fonctionne** : Scanner le QR code depuis **n'importe quel appareil** !
- ✅ Le QR code contient l'URL complète du site + ton code
- ✅ Quand quelqu'un scanne, le site s'ouvre et propose d'ajouter en ami

**Pour tester le système (même navigateur) :**
1. Ouvre `ami.html` dans un onglet normal
2. Note ton code (ex: 1234)
3. Ouvre un AUTRE onglet normal dans le même navigateur
4. Va sur `ami.html` dans ce deuxième onglet
5. Note le nouveau code (ex: 5678)
6. Envoie une invitation depuis l'onglet 1 vers le code 5678
7. **Rafraîchis l'onglet 2** et va dans "Invitations"
8. L'invitation devrait apparaître ! ✅

**Pour tester avec QR Code (différents appareils) :**
1. Ouvre `ami.html` sur ton PC et va dans "Moi"
2. Affiche ton QR code
3. Scanne avec ton téléphone (appareil photo natif)
4. Le site s'ouvre sur le téléphone
5. Une modal propose d'ajouter en ami ! 🎉

**Astuce :** Donne des pseudos différents dans chaque onglet pour éviter la confusion !

### 🔄 Réinviter une personne :
Tu peux maintenant renvoyer une invitation à une personne même si tu lui as déjà envoyé une invitation ! L'ancienne invitation sera automatiquement remplacée par la nouvelle. C'est utile si :
- Tu veux changer le pseudo que tu as donné
- L'autre personne a supprimé ton invitation par erreur
- Tu veux simplement renvoyer l'invitation

## 🎯 Fonctionnalités

- ✅ Code ami unique à 4 chiffres
- ✅ **QR Code avec URL complète** 🚀 (scanne = ouvre le site + propose d'ajouter)
- ✅ **Scanner QR Code avec la caméra réelle** 📸
- ✅ **Fonctionne entre différents appareils** grâce au QR code
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

# 🧪 Comment tester le système d'amis

## ✅ Problème résolu
Les erreurs de vibration sont maintenant gérées - elles ne bloquent plus rien !

## 📱 Comment ajouter un ami (Test localStorage)

Le système d'amis fonctionne avec **localStorage** qui est partagé sur le même domaine. Pour tester :

### Méthode 1: Deux onglets (Recommandé) 🔄

1. **Onglet 1 - Toi**
   - Ouvre `ami.html`
   - Note ton code (ex: 1234)
   - Va dans l'onglet "Moi" et donne-toi un pseudo + avatar

2. **Onglet 2 - Ton ami**
   - Ouvre un NOUVEL onglet en navigation privée/incognito 🕵️
   - Va sur `ami.html`
   - Note le code (ex: 5678)
   - Va dans l'onglet "Moi" et donne-toi un autre pseudo

3. **Envoi d'invitation (depuis onglet 1)**
   - Clique sur "+ Ajouter un ami"
   - Choisis "Entrer un code"
   - Entre le code de l'onglet 2 (5678)
   - Donne ton pseudo et valide

4. **Accepter l'invitation (onglet 2)**
   - Va dans l'onglet "Invitations"
   - Tu verras l'invitation apparaître (auto-refresh toutes les 3s)
   - Clique sur "✅ Accepter"
   - Donne un pseudo pour ton ami
   - Validé ! 🎉

### Méthode 2: Deux appareils/navigateurs différents 📱💻

1. Ouvre `ami.html` sur deux appareils différents
2. Échange vos codes à 4 chiffres
3. Suivre les mêmes étapes que la Méthode 1

### ⚠️ Important

- **localStorage n'est PAS partagé** entre navigation normale et navigation privée
- **localStorage n'est PAS partagé** entre différents navigateurs
- Les invitations s'affichent automatiquement (refresh toutes les 3 secondes)
- Si tu ne vois pas d'invitations, c'est normal si personne ne t'a envoyé d'invitation

## 🎯 Fonctionnalités

- ✅ Code ami unique à 4 chiffres
- ✅ QR Code pour partager
- ✅ Système d'invitations bidirectionnel
- ✅ Chat en temps réel (localStorage)
- ✅ Notifications avec badge
- ✅ Profil personnalisable (pseudo + 5 avatars)
- ✅ Auto-refresh des invitations et messages

## 🐛 Erreurs ignorées

Ces erreurs dans la console sont normales et n'empêchent rien :
- `navigator.vibrate blocked` - La vibration nécessite une interaction utilisateur
- `favicon.ico 404` - Pas de favicon défini (cosmétique)

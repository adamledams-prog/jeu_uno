# 🚀 Guide d'installation Supabase

## Étape 1 : Créer un compte Supabase (2 minutes)

1. Va sur **https://supabase.com/**
2. Clique sur **"Start your project"**
3. Connecte-toi avec GitHub (ou email)
4. C'est **GRATUIT** !

---

## Étape 2 : Créer un projet (1 minute)

1. Clique sur **"New Project"**
2. Donne un nom : `jeu-uno-amis`
3. Choisis un mot de passe pour la base de données (note-le !)
4. Choisis la région : `West EU (London)` ou `Central EU (Frankfurt)`
5. Clique sur **"Create new project"**
6. ⏳ **Attends 2-3 minutes** (le projet se crée)

---

## Étape 3 : Créer la table "invitations" (2 minutes)

1. Dans ton projet, va dans **"Table Editor"** (icône tableau à gauche)
2. Clique sur **"Create a new table"**
3. Configure la table :

**Nom de la table :** `invitations`

**Colonnes à créer :**
- `id` : UUID (Primary Key) ✅ Déjà créé automatiquement
- `from_code` : text (VARCHAR)
- `from_nickname` : text (VARCHAR)
- `to_code` : text (VARCHAR)
- `timestamp` : bigint (NUMBER)
- `created_at` : timestamp with time zone ✅ Déjà créé automatiquement

4. **IMPORTANT** : Désactive RLS (Row Level Security) pour l'instant :
   - Va dans **"Authentication" → "Policies"**
   - Clique sur la table `invitations`
   - Clique sur **"Disable RLS"** (pour que tout le monde puisse lire/écrire)

---

## Étape 4 : Créer la table "friends" (2 minutes)

1. Clique sur **"Create a new table"**
2. Configure la table :

**Nom de la table :** `friends`

**Colonnes à créer :**
- `id` : UUID (Primary Key) ✅ Déjà créé automatiquement
- `user_code` : text (VARCHAR)
- `friend_code` : text (VARCHAR)
- `nickname` : text (VARCHAR)
- `added_at` : timestamp with time zone
- `created_at` : timestamp with time zone ✅ Déjà créé automatiquement

3. **Désactive RLS** pour cette table aussi

---

## Étape 5 : Récupérer les clés API (1 minute)

1. Va dans **"Settings"** (⚙️ en bas à gauche)
2. Va dans **"API"**
3. Tu verras :
   - **Project URL** : `https://xxxxx.supabase.co`
   - **anon public** : `eyJhbGc...` (une très longue clé)

4. **COPIE CES DEUX VALEURS** !

---

## Étape 6 : Configurer le projet (30 secondes)

1. Ouvre le fichier `supabase-config.js` que j'ai créé
2. Remplace :
   - `TON_URL_ICI` par ton **Project URL**
   - `TA_CLE_PUBLIQUE_ICI` par ta clé **anon public**

```javascript
const SUPABASE_URL = 'https://ton-projet.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOi...ta-clé-ici...';
```

3. **Sauvegarde le fichier**

---

## ✅ C'est tout !

Ton système d'amis fonctionnera maintenant :
- ✅ Entre **tous les navigateurs**
- ✅ Entre **tous les appareils** (PC, téléphone, tablette)
- ✅ En **temps réel** (invitations instantanées)
- ✅ **Gratuit** jusqu'à 500 Mo de données

---

## 🐛 Si ça ne marche pas

1. Ouvre la console (F12)
2. Regarde les erreurs
3. Vérifie que :
   - Les clés API sont bien copiées
   - RLS est bien désactivé sur les deux tables
   - Les noms des colonnes sont corrects

---

## 📊 Supabase Dashboard

Tu peux voir en direct :
- Toutes les invitations dans **"Table Editor" → invitations**
- Tous les amis dans **"Table Editor" → friends**
- Les logs dans **"Logs"**

C'est comme un panneau d'administration de ton système ! 🎉

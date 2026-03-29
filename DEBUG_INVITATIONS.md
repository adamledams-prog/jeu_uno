# 🔍 Debug : Pourquoi je ne reçois pas les invitations ?

## ❓ Quel mode utilises-tu ?

### Option 1 : Mode localStorage (LOCAL) ⚠️

**Message affiché :**
```
⚠️ MODE LOCAL
• Les invitations fonctionnent uniquement sur cet appareil
```

**Limitations :**
- ❌ Les invitations NE fonctionnent PAS entre différents appareils
- ❌ Pas de synchronisation en temps réel
- ✅ Fonctionne uniquement sur LE MÊME appareil/navigateur

**Exemple qui NE marche PAS :**
```
Appareil A (ton PC) → Envoie invitation → Appareil B (ton téléphone)
❌ L'invitation n'arrivera JAMAIS sur l'appareil B
```

**Exemple qui MARCHE :**
```
Appareil A → Envoie invitation → Appareil A
✅ L'invitation arrive car c'est le même appareil
```

---

### Option 2 : Mode Supabase (MULTI-APPAREILS) ✅

**Message affiché :**
```
✅ SYSTÈME EN LIGNE !
• Fonctionne maintenant entre TOUS les appareils !
```

**Fonctionnalités :**
- ✅ Invitations fonctionnent entre TOUS les appareils
- ✅ Synchronisation en temps réel
- ✅ Notifications instantanées

---

## 🔧 Comment savoir quel mode j'utilise ?

### Étape 1 : Ouvre la console du navigateur
1. Appuie sur `F12` (Windows/Linux) ou `Cmd+Option+J` (Mac)
2. Va dans l'onglet "Console"

### Étape 2 : Regarde les messages au chargement

#### Si tu vois en ORANGE/WARNING :
```
⚠️ Supabase non configuré - Mode localStorage activé
📖 Voir GUIDE_SUPABASE.md pour configurer Supabase
⚠️ Temps réel Supabase non disponible - Mode localStorage actif
```
➡️ **Tu es en mode LOCAL** : Les invitations ne fonctionnent PAS entre appareils

#### Si tu vois en VERT :
```
✅ Supabase configuré et prêt
✅ Temps réel Supabase activé pour les invitations
```
➡️ **Tu es en mode MULTI-APPAREILS** : Les invitations fonctionnent partout

---

## 🚀 Comment activer le mode MULTI-APPAREILS ?

Tu DOIS configurer Supabase. Suis le guide complet :

👉 **[GUIDE_SUPABASE.md](GUIDE_SUPABASE.md)**

### Résumé rapide :

#### 1. Créer un compte Supabase (gratuit)
- Va sur https://supabase.com/
- Crée un compte
- Crée un nouveau projet

#### 2. Créer les tables
Exécute ce SQL dans Supabase :

```sql
-- Table invitations
CREATE TABLE invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_code TEXT NOT NULL,
    from_nickname TEXT NOT NULL,
    to_code TEXT NOT NULL,
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX idx_invitations_to_code ON invitations(to_code);
CREATE INDEX idx_invitations_from_code ON invitations(from_code);
```

#### 3. Désactiver RLS (Row Level Security)
Dans Supabase :
- Va dans "Authentication" → "Policies"
- Clique sur la table `invitations`
- Clique sur "Disable RLS"

#### 4. Récupérer tes clés
Dans Supabase :
- Va dans "Settings" → "API"
- Copie ton **Project URL** (ex: `https://xyz123.supabase.co`)
- Copie ta clé **anon public**

#### 5. Mettre à jour supabase-config.js

Ouvre `supabase-config.js` et remplace :

```javascript
const SUPABASE_URL = 'https://TON-PROJET.supabase.co';
const SUPABASE_KEY = 'ta_cle_anon_publique_ici';
```

#### 6. Recharge la page

Tu devrais maintenant voir en vert :
```
✅ Supabase configuré et prêt
✅ SYSTÈME EN LIGNE !
```

---

## 🧪 Tester les invitations

### Test en mode LOCAL (sans Supabase)

1. Ouvre [ami.html](ami.html) dans ton navigateur
2. Note ton code ami (ex: `1234`)
3. **Dans LE MÊME navigateur, même onglet ou nouvel onglet :**
   - Va dans "Invitations"
   - Clique sur "➕ Ajouter"
   - Entre TON PROPRE code (`1234`)
   - Envoie l'invitation
4. ✅ L'invitation devrait apparaître

### Test en mode MULTI-APPAREILS (avec Supabase)

1. **Sur PC :** Ouvre [ami.html](ami.html)
   - Note ton code ami PC (ex: `1234`)
   
2. **Sur téléphone :** Ouvre [ami.html](ami.html)
   - Note ton code ami téléphone (ex: `5678`)
   
3. **Sur PC :** Envoie une invitation au code `5678`

4. **Sur téléphone :** Va dans l'onglet "Invitations"
   - ✅ L'invitation devrait apparaître **instantanément** !

---

## 🐛 Problèmes courants

### "Je ne reçois pas les invitations entre appareils"

**Cause :** Tu es en mode LOCAL (localStorage)

**Solution :** Configure Supabase selon le guide ci-dessus

---

### "J'ai configuré Supabase mais ça ne marche toujours pas"

Vérifie dans la console :

#### Si tu vois :
```
❌ Erreur Supabase: { status: 401, ... }
```
➡️ **Problème :** Clé API incorrecte
**Solution :** Vérifie que tu as copié la bonne clé "anon public" dans `supabase-config.js`

#### Si tu vois :
```
❌ Erreur Supabase: { status: 404, ... }
```
➡️ **Problème :** Table non créée
**Solution :** Crée la table `invitations` dans Supabase (voir SQL ci-dessus)

#### Si tu vois :
```
❌ Erreur Supabase: { status: 403, ... }
```
➡️ **Problème :** RLS activé
**Solution :** Désactive RLS sur la table `invitations`

---

### "Le temps réel ne fonctionne pas"

#### Vérifier si le temps réel est activé :

Regarde dans la console au chargement :

```
✅ Temps réel Supabase activé pour les invitations
```

Si tu vois :
```
⚠️ Temps réel Supabase non disponible - Mode localStorage actif
```

➡️ Supabase n'est pas configuré correctement

---

### "Les invitations arrivent mais avec beaucoup de retard"

**Si mode Supabase est activé :**

1. Vérifie que le temps réel fonctionne (voir ci-dessus)
2. Va dans Supabase → "Database" → "Replication"
3. Active la réplication en temps réel pour la table `invitations`

---

## 📊 Tableau récapitulatif

| Fonctionnalité | Mode LOCAL ⚠️ | Mode Supabase ✅ |
|----------------|---------------|------------------|
| Invitations même appareil | ✅ OUI | ✅ OUI |
| Invitations multi-appareils | ❌ NON | ✅ OUI |
| Synchronisation temps réel | ❌ NON | ✅ OUI |
| Notifications instantanées | ❌ NON | ✅ OUI |
| Persistance données | Local uniquement | Cloud (partout) |
| Configuration requise | Aucune | Supabase |

---

## 💡 Astuce : Vérification rapide

Tape dans la console :

```javascript
console.log('Supabase configuré:', window.isSupabaseConfigured);
console.log('Client Supabase:', window.supabaseClient);
```

**Résultats :**

```javascript
// Mode LOCAL
Supabase configuré: false
Client Supabase: null
```

```javascript
// Mode MULTI-APPAREILS
Supabase configuré: true
Client Supabase: SupabaseClient {...}
```

---

## 🆘 Besoin d'aide ?

1. Ouvre [test-corrections.html](test-corrections.html) pour diagnostiquer automatiquement
2. Consulte [GUIDE_SUPABASE.md](GUIDE_SUPABASE.md) pour la configuration complète
3. Consulte [CORRECTION_ERREURS.md](CORRECTION_ERREURS.md) pour résoudre les erreurs

---

## ✅ Checklist avant de dire "ça ne marche pas"

- [ ] J'ai vérifié quel mode j'utilise (console)
- [ ] Si mode LOCAL : Je teste sur le même appareil ?
- [ ] Si mode Supabase : J'ai bien configuré les clés ?
- [ ] J'ai créé la table `invitations` dans Supabase ?
- [ ] J'ai désactivé RLS sur la table ?
- [ ] J'ai rechargé la page après configuration ?
- [ ] Le message "✅ SYSTÈME EN LIGNE" s'affiche ?
- [ ] La console affiche "✅ Supabase configuré et prêt" ?

---

**Rappel important :** En mode LOCAL, c'est NORMAL de ne pas recevoir les invitations entre différents appareils. C'est fait exprès ! C'est pour ça que Supabase existe 😊

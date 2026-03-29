// ============================================
// CONFIGURATION SUPABASE
// ⚠️ INSTRUCTIONS : Remplacez les valeurs ci-dessous par vos vraies clés Supabase
// Voir GUIDE_SUPABASE.md pour les instructions complètes
// ============================================

// ⚠️ À REMPLACER : Vos vraies clés Supabase ici
const SUPABASE_URL = 'https://VOTRE-PROJET.supabase.co'; // Exemple : https://abcdefghijk.supabase.co
const SUPABASE_KEY = 'VOTRE_CLE_PUBLIQUE_SUPABASE'; // Clé "anon" publique de votre projet

// Variables globales accessibles partout (attachées à window)
window.isSupabaseConfigured = false;
window.supabaseClient = null;

// Vérifier si Supabase est disponible et configuré
try {
    if (window.supabase && 
        SUPABASE_URL.includes('.supabase.co') && 
        !SUPABASE_URL.includes('VOTRE-PROJET') &&
        SUPABASE_KEY.length > 50) {
        
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        window.isSupabaseConfigured = true;
        console.log('✅ Supabase configuré et prêt');
    } else {
        console.warn('⚠️ Supabase non configuré - Mode localStorage activé');
        console.warn('📖 Voir GUIDE_SUPABASE.md pour configurer Supabase');
    }
} catch (err) {
    console.warn('⚠️ Erreur Supabase - Mode localStorage activé:', err);
    window.isSupabaseConfigured = false;
}

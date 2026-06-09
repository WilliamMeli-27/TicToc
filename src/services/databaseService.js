// services/databaseService.js
import { ref, set, get, onValue, push, remove } from 'firebase/database'
import { realtimeDb as db } from '../lib/firebase'

// ── ÉCRIRE un utilisateur ────────────────────────────
export const creerUtilisateur = async (userId, data) => {
  try {
    await set(ref(db, `utilisateurs/${userId}`), {
      nom:   data.nom,
      email: data.email,
      role:  data.role || 'citoyen'
    })
    console.log('Utilisateur créé ✅')
  } catch (error) {
    console.error('Erreur écriture :', error)
  }
}

// ── LIRE un utilisateur ──────────────────────────────
export const lireUtilisateur = async (userId) => {
  try {
    const snapshot = await get(ref(db, `utilisateurs/${userId}`))
    if (snapshot.exists()) {
      return snapshot.val()
    } else {
      console.log('Aucune donnée trouvée')
      return null
    }
  } catch (error) {
    console.error('Erreur lecture :', error)
  }
}

// ── ÉCOUTER en temps réel ────────────────────────────
export const ecouterUtilisateurs = (callback) => {
  const unsubscribe = onValue(ref(db, 'utilisateurs'), (snapshot) => {
    const data = snapshot.val()
    callback(data)
  })
  return unsubscribe  // retourne la fonction pour stopper l'écoute
}

// ── AJOUTER un message (ID auto) ─────────────────────
export const ajouterMessage = async (texte) => {
  try {
    await push(ref(db, 'messages'), {
      texte: texte,
      date:  Date.now()
    })
    console.log('Message ajouté ✅')
  } catch (error) {
    console.error('Erreur ajout :', error)
  }
}

// ── SUPPRIMER un utilisateur ─────────────────────────
export const supprimerUtilisateur = async (userId) => {
  try {
    await remove(ref(db, `utilisateurs/${userId}`))
    console.log('Utilisateur supprimé ✅')
  } catch (error) {
    console.error('Erreur suppression :', error)
  }
}

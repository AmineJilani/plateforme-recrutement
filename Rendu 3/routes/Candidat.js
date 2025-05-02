const express = require('express');
const router = express.Router();
const OffreEmploi = require('../model/OffreEmploi'); // vérifie le chemin
const FicheDePoste = require('../model/FicheDePoste'); // vérifie le chemin aussi

function requireCandidat(req, res, next) {
  if (req.session.user && req.session.user.role === 'candidat') {
    next();
  } else {
    res.redirect('/login');
  }
}

// Route du dashboard
router.get('/dashboard', requireCandidat, (req, res) => {
  OffreEmploi.readAll((err, offres) => {
    if (err) {
      console.error("Erreur lors de la récupération des offres :", err);
      return res.status(500).send("Erreur serveur");
    }
    console.log("Offres récupérées :", offres); // Ajouter ce log pour vérifier les données

    res.render('candidat/dashboard', {
      utilisateur: {
        nom: req.session.user.nom,
        prenom: req.session.user.prenom || ''
      },
      offres: offres
    });
  });
});

// Route détails fiche de poste
router.get('/fiche/:id', requireCandidat, (req, res) => {
  const ficheId = req.params.id;

  FicheDePoste.readWithDetails(ficheId, (err, fiche) => {
    if (err) {
      console.error("Erreur lors de la récupération de la fiche de poste :", err);
      return res.status(500).send("Erreur serveur");
    }
    if (!fiche) return res.status(404).send("Fiche de poste non trouvée");

    res.render('candidat/fiche', { fiche });
  });
}),

// Route pour afficher la page de candidature
router.get('/candidater/:id', requireCandidat, (req, res) => {
  const offreId = req.params.id;

  // Récupérer les détails de l'offre
  OffreEmploi.read(offreId, (err, offre) => {
    if (err) {
      console.error("Erreur lors de la récupération de l'offre :", err);
      return res.status(500).send("Erreur serveur");
    }
    if (!offre) {
      return res.status(404).send("Offre d'emploi non trouvée");
    }

    // Récupérer les informations de l'utilisateur connecté
    const utilisateur = req.session.user;

    // Rendre la page de candidature avec les informations nécessaires
    res.render('candidat/candidater', {
      offre: offre, // Passer l'offre d'emploi à la vue
      utilisateur: utilisateur // Passer les informations de l'utilisateur à la vue
    });
  });
}),

// Route pour soumettre une candidature
router.post('/soumettre-candidature', requireCandidat, (req, res) => {
  const { offre_id} = req.body;
  const user_id = req.session.user.id;
  const date_candidature = new Date();

  // Créer la candidature dans la base de données
  Candidature.create(offre_id, user_id, date_candidature, 'En attente', (err, result) => {
    if (err) {
      console.error("Erreur lors de l'enregistrement de la candidature :", err);
      return res.status(500).send("Erreur serveur");
    }
    res.redirect('/candidat/dashboard'); // Rediriger vers le dashboard après soumission
  });
});

module.exports = router;

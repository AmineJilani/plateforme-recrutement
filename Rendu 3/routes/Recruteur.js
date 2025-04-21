const express = require('express');
const router = express.Router();
const OffreEmploi = require('../model/OffreEmploi');
const Candidature = require('../model/Candidature');

// Middleware pour s'assurer que l'utilisateur est un recruteur
function requireRecruteur(req, res, next) {
  if (req.session.user && req.session.user.role === 'recreteur') {
    next();
  } else {
    res.redirect('/login');
  }
}

// Route pour afficher le dashboard du recruteur
router.get('/dashboard', requireRecruteur, (req, res) => {
  OffreEmploi.readAll((err, offres) => {
    if (err) {
      return res.status(500).send("Erreur lors de la récupération des offres");
    }

    res.render('recruteur/dashboard', {
      utilisateur: {
        nom: req.session.user.nom,
        prenom: req.session.user.prenom || ''
      },
      offres: offres
    });
  });
});

// Route pour afficher les candidatures d'une offre
router.get('/gestion-candidatures/:offreId', requireRecruteur, (req, res) => {
    const offreId = req.params.offreId;

    Candidature.readAllByOffreId(offreId, (err, candidatures) => {
        if (err) {
            return res.status(500).send("Erreur lors de la récupération des candidatures");
        }

        res.render('recruteur/gestion-candidatures', {
            utilisateur: req.session.user,
            offreId: offreId,
            candidatures: candidatures
        });
    });
});
// Route pour afficher les informations de contact d'un candidat
router.get('/candidature/contact/:userId', requireRecruteur, (req, res) => {
    const userId = req.params.userId;
    const offreId = req.query.offreId; // Si tu veux retourner vers cette offre

    Candidature.getContactInfo(userId, (err, contactInfo) => {
        if (err) {
            return res.status(500).send("Erreur lors de la récupération des informations de contact");
        }

        if (!contactInfo) {
            return res.status(404).send("Utilisateur non trouvé");
        }

        // Passer les infos du candidat + l'offre pour le lien de retour
        res.render('recruteur/candidature-details', {
            recruteur: req.session.user,
            candidat: contactInfo,
            offreId: offreId
        });
    });
});


module.exports = router;

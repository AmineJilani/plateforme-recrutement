const express = require('express');
const router = express.Router();
const OffreEmploi = require('../models/OffreEmploi');
const FicheDePoste = require('../models/FicheDePoste');
const Candidature = require('../models/Candidature');

// Middleware pour s'assurer que l'utilisateur est un recruteur
function requireRecruteur(req, res, next) {
  if (req.session.user && req.session.user.role === 'recruteur') {
    next();
  } else {
    res.redirect('/');
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

// Route pour afficher le formulaire de création d'une offre
router.get('/nouvelle-offre', requireRecruteur, (req, res) => {
  res.render('recruteur/nouvelle-offre', {
    utilisateur: {
      nom: req.session.user.nom,
      prenom: req.session.user.prenom || ''
    },
    error: null
  });
});

// Route pour publier une nouvelle offre (crée la fiche de poste puis l'offre associée)
router.post('/nouvelle-offre', requireRecruteur, (req, res) => {
  const utilisateur = {
    nom: req.session.user.nom,
    prenom: req.session.user.prenom || ''
  };
  const organisationId = req.session.user.organisation_id;

  if (!organisationId) {
    return res.render('recruteur/nouvelle-offre', {
      utilisateur,
      error: "Votre compte n'est rattaché à aucune organisation, impossible de publier une offre."
    });
  }

  const { intitule, statut_poste, type_metier, lieu, rythme, salaire, description, responsable_hier, Etat, date_validite, indication, nbr_piece } = req.body;

  FicheDePoste.create(intitule, statut_poste, type_metier, lieu, rythme, salaire, description, responsable_hier, organisationId, (err, ficheResult) => {
    if (err) {
      console.error("Erreur lors de la création de la fiche de poste :", err);
      return res.render('recruteur/nouvelle-offre', { utilisateur, error: "Erreur lors de la création de la fiche de poste." });
    }

    const ficheId = ficheResult.insertId;

    OffreEmploi.create(Etat, date_validite, indication, nbr_piece, ficheId, (err) => {
      if (err) {
        console.error("Erreur lors de la création de l'offre :", err);
        return res.render('recruteur/nouvelle-offre', { utilisateur, error: "Erreur lors de la création de l'offre." });
      }
      res.redirect('/recruteur/dashboard');
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

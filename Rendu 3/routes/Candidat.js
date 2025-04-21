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
});



module.exports = router;

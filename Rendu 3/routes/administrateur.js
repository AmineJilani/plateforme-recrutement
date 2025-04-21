const express = require('express');
const router = express.Router();
const Utilisateur = require('../model/Utilisateur');
const Organisation = require('../model/Organisation');

// Middleware pour s'assurer que l'utilisateur est connecté et est un administrateur
function requireAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'administrateur') {
    next();
  } else {
    res.redirect('/login');
  }
}

// Route du dashboard administrateur
router.get('/dashboard', requireAdmin, (req, res) => {
  // Récupérer la liste des utilisateurs et des organisations
  Utilisateur.readall((err, utilisateurs) => {
    if (err) {
      return res.status(500).send('Erreur lors de la récupération des utilisateurs');
    }

    Organisation.readall((err, organisations) => {
      if (err) {
        return res.status(500).send('Erreur lors de la récupération des organisations');
      }

      // Rendu de la vue administrateur avec les utilisateurs et organisations
      res.render('admin/dashboard', {
        utilisateur: req.session.user,
        utilisateurs: utilisateurs,
        organisations: organisations
      });
    });
  });
});
console.log("📦 Le fichier administrateur.js est bien chargé !");

module.exports = router;

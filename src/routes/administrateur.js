const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Utilisateur = require('../models/Utilisateur');
const Organisation = require('../models/Organisation');
const db = require('../config/db');

const SALT_ROUNDS = 10;
const ROLES = ['candidat', 'recruteur', 'administrateur'];

// Middleware pour s'assurer que l'utilisateur est connecté et est un administrateur
function requireAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'administrateur') {
    next();
  } else {
    res.redirect('/');
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

// ---------- Gestion des utilisateurs ----------

// Formulaire de création d'un utilisateur
router.get('/utilisateurs/nouveau', requireAdmin, (req, res) => {
  Organisation.readall((err, organisations) => {
    if (err) return res.status(500).send('Erreur lors de la récupération des organisations');
    res.render('admin/utilisateur-form', {
      utilisateurCourant: req.session.user,
      utilisateur: null,
      organisations,
      roles: ROLES,
      error: null
    });
  });
});

// Création d'un utilisateur
router.post('/utilisateurs', requireAdmin, (req, res) => {
  const { Nom, Prenom, Telephone, email, password, role, organisation_id } = req.body;
  const organisationId = organisation_id || null;

  Organisation.readall((err, organisations) => {
    if (err) return res.status(500).send('Erreur lors de la récupération des organisations');

    const rerenderWithError = (error) => res.render('admin/utilisateur-form', {
      utilisateurCourant: req.session.user,
      utilisateur: null,
      organisations,
      roles: ROLES,
      error
    });

    db.query('SELECT Id FROM Utilisateur WHERE email = ?', [email], (err, existing) => {
      if (err) return rerenderWithError('Erreur serveur lors de la vérification de l\'email.');
      if (existing.length > 0) return rerenderWithError('Cet email est déjà utilisé.');

      bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
        if (err) return rerenderWithError('Erreur lors du hachage du mot de passe.');

        const sql = `INSERT INTO Utilisateur (Nom, Prenom, Telephone, StatutConnexion, DateCreation, email, password, organisation_id, role)
                     VALUES (?, ?, ?, 'hors ligne', NOW(), ?, ?, ?, ?)`;
        db.query(sql, [Nom, Prenom, Telephone, email, hash, organisationId, role], (err) => {
          if (err) return rerenderWithError("Erreur lors de la création de l'utilisateur.");
          res.redirect('/admin/dashboard');
        });
      });
    });
  });
});

// Formulaire de modification d'un utilisateur
router.get('/utilisateurs/:id/modifier', requireAdmin, (req, res) => {
  Utilisateur.readById(req.params.id, (utilisateurCible) => {
    if (!utilisateurCible) return res.status(404).send('Utilisateur non trouvé');
    Organisation.readall((err, organisations) => {
      if (err) return res.status(500).send('Erreur lors de la récupération des organisations');
      res.render('admin/utilisateur-form', {
        utilisateurCourant: req.session.user,
        utilisateur: utilisateurCible,
        organisations,
        roles: ROLES,
        error: null
      });
    });
  });
});

// Modification d'un utilisateur (rôle, organisation, informations de base — pas le mot de passe)
router.post('/utilisateurs/:id/modifier', requireAdmin, (req, res) => {
  const { Nom, Prenom, Telephone, email, role, organisation_id } = req.body;
  const data = { Nom, Prenom, Telephone, email, role, organisation_id: organisation_id || null };

  Utilisateur.update(req.params.id, data, (err) => {
    if (err) {
      console.error("Erreur lors de la mise à jour de l'utilisateur :", err);
      return res.status(500).send("Erreur lors de la mise à jour de l'utilisateur.");
    }
    res.redirect('/admin/dashboard');
  });
});

// Suppression d'un utilisateur
router.post('/utilisateurs/:id/supprimer', requireAdmin, (req, res) => {
  Utilisateur.deleteById(req.params.id, (err) => {
    if (err) {
      console.error("Erreur lors de la suppression de l'utilisateur :", err);
      return res.status(500).send("Impossible de supprimer cet utilisateur (des candidatures y sont peut-être encore liées).");
    }
    res.redirect('/admin/dashboard');
  });
});

// ---------- Gestion des organisations ----------

// Formulaire de création d'une organisation
router.get('/organisations/nouvelle', requireAdmin, (req, res) => {
  res.render('admin/organisation-form', { utilisateurCourant: req.session.user, organisation: null, error: null });
});

// Création d'une organisation
router.post('/organisations', requireAdmin, (req, res) => {
  const { Siren, Nom, adresse_admini, type } = req.body;
  Organisation.create(Siren, Nom, adresse_admini, type, (err) => {
    if (err) {
      const error = err.code === 'ER_DUP_ENTRY' ? 'Ce numéro SIREN existe déjà.' : "Erreur lors de la création de l'organisation.";
      return res.render('admin/organisation-form', { utilisateurCourant: req.session.user, organisation: null, error });
    }
    res.redirect('/admin/dashboard');
  });
});

// Formulaire de modification d'une organisation
router.get('/organisations/:siren/modifier', requireAdmin, (req, res) => {
  Organisation.read(req.params.siren, (organisationCible) => {
    if (!organisationCible) return res.status(404).send('Organisation non trouvée');
    res.render('admin/organisation-form', { utilisateurCourant: req.session.user, organisation: organisationCible, error: null });
  });
});

// Modification d'une organisation
router.post('/organisations/:siren/modifier', requireAdmin, (req, res) => {
  const { Nom, adresse_admini, type } = req.body;
  Organisation.update(req.params.siren, { Nom, adresse_admini, type }, (err) => {
    if (err) {
      console.error("Erreur lors de la mise à jour de l'organisation :", err);
      return res.status(500).send("Erreur lors de la mise à jour de l'organisation.");
    }
    res.redirect('/admin/dashboard');
  });
});

// Suppression d'une organisation
router.post('/organisations/:siren/supprimer', requireAdmin, (req, res) => {
  Organisation.delete(req.params.siren, (err) => {
    if (err) {
      console.error("Erreur lors de la suppression de l'organisation :", err);
      return res.status(500).send("Impossible de supprimer cette organisation (des utilisateurs ou fiches de poste y sont peut-être encore liés).");
    }
    res.redirect('/admin/dashboard');
  });
});

module.exports = router;

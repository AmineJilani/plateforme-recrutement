// route/login.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Utilisateur = require('../models/Utilisateur');

router.get('/', (req, res) => {
    res.render('login', { message: null }); // 👈 On passe un message vide par défaut
  });

// Route POST pour gérer la soumission du formulaire de login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Rechercher l'utilisateur par email dans la base de données
    Utilisateur.read(email, (user) => {
        if (!user) {
            return res.render('login', { message: 'Utilisateur non trouvé' });

        }

        // Vérifier que le mot de passe est correct
        bcrypt.compare(password, user.password, (err, match) => {
            if (err) {
                console.error('Erreur lors de la vérification du mot de passe:', err);
                return res.status(500).send('Erreur serveur');
            }
            if (!match) {
                return res.send('Mot de passe incorrect');
            }

            // Authentification réussie, on enregistre l'utilisateur dans la session
            req.session.user = {
                id: user.Id,
                nom: user.Nom,
                prenom: user.Prenom,
                role: user.role,
                organisation_id: user.organisation_id
            };

            // Rediriger en fonction du rôle de l'utilisateur
            if (user.role === 'candidat') {
                return res.redirect('/candidat/dashboard');
            } else if (user.role === 'recruteur') {
                return res.redirect('/recruteur/dashboard');
            } else if (user.role === 'administrateur') {
                return res.redirect('/admin/dashboard');
            }
        });
    });
});

// Route de déconnexion
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

module.exports = router;

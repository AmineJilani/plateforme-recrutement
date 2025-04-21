// route/login.js
const express = require('express');
const router = express.Router();
const Utilisateur = require('../model/Utilisateur');

router.get('/', (req, res) => {
    res.render('login', { message: null }); // 👈 On passe un message vide par défaut
  });

// Route POST pour gérer la soumission du formulaire de login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    console.log('Email:', email); // Vérifie que l'email est bien reçu
    console.log('Password:', password); // Vérifie que le mot de passe est bien reçu

    // Rechercher l'utilisateur par email dans la base de données
    Utilisateur.read(email, (user) => {
        if (!user) {
            console.log('Utilisateur non trouvé');
            return res.render('login', { message: 'Utilisateur non trouvé' });

        }

        // Vérifier que le mot de passe est correct
        if (user.password !== password) {
            console.log('Mot de passe incorrect');
            return res.send('Mot de passe incorrect');
        }

        // Authentification réussie, on enregistre l'utilisateur dans la session
        req.session.user = {
            id: user.Id,
            nom: user.Nom,
            prenom: user.Prenom, 
            role: user.role
        };

        console.log(`Utilisateur authentifié avec succès, rôle : ${user.role}`);

        // Rediriger en fonction du rôle de l'utilisateur
        if (user.role === 'candidat') {
            console.log('Redirection vers candidat/dashboard');
            return res.redirect('/candidat/dashboard');
        } else if (user.role === 'recreteur') {
            console.log('Redirection vers recruteur/dashboard');
            return res.redirect('/recruteur/dashboard');
        } else if (user.role === 'administrateur') {
            console.log('Redirection vers admin/dashboard');
            return res.redirect('/admin/dashboard');
        }
    });
});

module.exports = router;

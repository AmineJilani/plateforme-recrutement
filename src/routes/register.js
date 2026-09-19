const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');  // Assurez-vous que ce chemin est correct

const SALT_ROUNDS = 10;

// Route pour afficher le formulaire d'inscription
router.get('/', (req, res) => {
    res.render('register',  { error: null }); // Cela va rendre ta page register.ejs
});

router.post('/', (req, res) => {
    const { nom, prenom, email, password, confirmPassword, telephone } = req.body;

    // Vérification si les mots de passe correspondent
    if (password !== confirmPassword) {
        return res.render('register', { error: 'Les mots de passe ne correspondent pas.' });
    }

    // Vérification si l'email existe déjà
    db.query('SELECT * FROM utilisateur WHERE email = ?', [email], (err, result) => {
        if (err) {
            console.error('Erreur lors de la vérification de l\'email:', err);
            return res.status(500).send('Erreur serveur');
        }

        if (result.length > 0) {
            return res.render('register', { error: 'Cet email est déjà utilisé.' });
        }

        bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
            if (err) {
                console.error('Erreur lors du hachage du mot de passe:', err);
                return res.status(500).send('Erreur serveur');
            }

            // Insertion dans la base de données
            const query = `
                INSERT INTO utilisateur
                (Nom, Prenom, Telephone, StatutConnexion, DateCreation, email, password, organisation_id, role)
                VALUES (?, ?, ?, 'hors ligne', NOW(), ?, ?, NULL, 'candidat')
            `;
            const values = [nom, prenom, telephone, email, hash];

            db.query(query, values, (err) => {
                if (err) {
                    console.error('Erreur lors de l\'insertion dans la base de données:', err);
                    return res.status(500).send('Erreur serveur');
                }

                // Redirection vers la page de connexion après succès
                res.redirect('/');
            });
        });
    });
});

module.exports = router;

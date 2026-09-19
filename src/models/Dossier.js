// Dossier.js
const db = require('../config/db');

module.exports = {
    // Ajouter un dossier à une candidature
    create: function (type_fichier, nom_fichier, candidature_id, callback) {
        const sql = "INSERT INTO dossier (type_fichier, nom_fichier, candidature_id) VALUES (?, ?, ?)";
        db.query(sql, [type_fichier, nom_fichier, candidature_id], function (err, results) {
            if (err) {
                return callback(err, null); // Gérer l'erreur proprement
            }
            callback(null, results); // Retourner le résultat en cas de succès
        });
    },

    // Lire tous les dossiers d'une candidature
    readAllByCandidature: function (candidature_id, callback) {
        const sql = "SELECT * FROM dossier WHERE candidature_id = ?";
        db.query(sql, [candidature_id], function (err, results) {
            if (err) {
                return callback(err, null); // Gérer l'erreur proprement
            }
            callback(null, results); // Retourner les résultats en cas de succès
        });
    },

    // Supprimer un dossier
    delete: function (candidature_id, callback) {
        const sql = "DELETE FROM dossier WHERE candidature_id = ?";
        db.query(sql, [candidature_id], function (err, results) {
            if (err) {
                return callback(err, null); // Gérer l'erreur proprement
            }
            callback(null, results); // Retourner le résultat en cas de succès
        });
    }
};

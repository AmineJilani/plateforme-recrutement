const db = require('../config/db');

module.exports = {
  read: function (email, callback) {
    db.query("SELECT * FROM Utilisateur WHERE email = ?", [email], function (err, results) {
        if (err) {
            console.error('Erreur dans la requête de la base de données:', err);
            return callback(null); // Retourne null en cas d'erreur
        }
        console.log('Utilisateur trouvé:', results[0]);
        callback(results[0]); // Retourne l'utilisateur trouvé ou null si non trouvé
    });
  },

  readall: function (callback) {
    db.query("SELECT * FROM Utilisateur", function (err, results) {
      if (err) return callback(err, null);
      callback(null, results);
    });
  },
  

  // Vérifier si un utilisateur avec un email et un mot de passe est valide
  areValid: function (email, password, callback) {
    db.query("SELECT password FROM Utilisateur WHERE email = ?", [email], function (err, results) {
      if (err) throw err;
      if (results.length === 1 && results[0].password === password) {
        callback(true);
      } else {
        callback(false);
      }
    });
  },

  // Créer un nouvel utilisateur
  create: function (Id, Nom, Prenom, Telephone, StatutConnexion, DateCreation, email, password, organisation_id, role, callback) {
    const sql = "INSERT INTO Utilisateur (Id, Nom, Prenom, Telephone, StatutConnexion, DateCreation, email, password, organisation_id, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [Id, Nom, Prenom, Telephone, StatutConnexion, DateCreation, email, password, organisation_id, role], function (err, result) {
      if (err) return callback(err, null);
      callback(null, result);
    });
  },

  // Supprimer un utilisateur par email
  delete: function (email, callback) {
    db.query("DELETE FROM Utilisateur WHERE email = ?", [email], function (err, result) {
      if (err) return callback(err, null);
      callback(null, result);
    });
  },
  readById: function (id, callback) {
    db.query("SELECT * FROM Utilisateur WHERE Id = ?", [id], function (err, results) {
      if (err) {
        console.error("Erreur lors de la récupération par ID:", err);
        return callback(null);
      }
      callback(results[0] || null);
    });
  },

  // Mettre à jour les informations d'un utilisateur (ne touche pas le mot de passe)
  update: function (id, data, callback) {
    const { Nom, Prenom, Telephone, email, role, organisation_id } = data;
    const sql = "UPDATE Utilisateur SET Nom = ?, Prenom = ?, Telephone = ?, email = ?, role = ?, organisation_id = ? WHERE Id = ?";
    db.query(sql, [Nom, Prenom, Telephone, email, role, organisation_id, id], function (err, result) {
      if (err) return callback(err, null);
      callback(null, result);
    });
  },

  // Supprimer un utilisateur par son Id
  deleteById: function (id, callback) {
    db.query("DELETE FROM Utilisateur WHERE Id = ?", [id], function (err, result) {
      if (err) return callback(err, null);
      callback(null, result);
    });
  }
};

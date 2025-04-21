const db = require('./db');

module.exports = {
  // Lire une candidature par son id
  read: function (id, callback) {
    db.query("SELECT * FROM candidature WHERE offre_id = ? AND user_id = ?", [id.offre_id, id.user_id], function (err, results) {
      if (err) {
        return callback(err, null); // Gestion de l'erreur proprement
      }
      callback(null, results[0]); // Retourner la première ligne
    });
  },
  getContactInfo: function (user_id, callback) {
    const sql = `
      SELECT 
        u.Nom as nom,
        u.Prenom as prenom,
        u.email, 
        u.telephone
      FROM 
        Utilisateur u
      WHERE 
        u.Id = ?
    `;
    db.query(sql, [user_id], function (err, results) {
      if (err) {
        return callback(err, null);
      }
      if (results.length === 0) {
        return callback(new Error('Utilisateur non trouvé'), null);
      }
      callback(null, results[0]); // Retourner l'email et le téléphone
    });
  },

  readAll: function (callback) {
    const sql = `
      SELECT 
        c.date_candidature,
        c.offre_id,
        c.user_id,
        c.status,
        o.Id_offre,
        u.Nom AS user_nom,
        f.intitule AS fiche_intitule
      FROM candidature c
      JOIN Offre_emploi o ON c.offre_id = o.Id_offre
      JOIN Utilisateur u ON c.user_id = u.Id
      JOIN fiche_de_poste f ON o.fiche_id = f.Id_poste;
    `;
    db.query(sql, function (err, results) {
      if (err) return callback(err, null);
      callback(null, results);  // Retourne les résultats pour être utilisés dans la vue
    });
  },

  readAllByOffreId: function (offreId, callback) {
    const sql = `
      SELECT 
        u.Nom, 
        u.Prenom, 
        u.email, 
        c.date_candidature, 
        c.status,
        c.user_id
      FROM 
        candidature c
      JOIN 
        Utilisateur u ON c.user_id = u.Id
      WHERE 
        c.offre_id = ?
    `;
    db.query(sql, [offreId], (err, results) => {
      if (err) return callback(err, null);
      callback(null, results);
    });
  },
  
  // Créer une nouvelle candidature
  create: function (offre_id, user_id, date_candidature, etat, callback) {
    const sql = "INSERT INTO candidature (offre_id, user_id, date_candidature, etat) VALUES (?, ?, ?, ?)";
    db.query(sql, [offre_id, user_id, date_candidature, etat], function (err, result) {
      if (err) {
        return callback(err, null); // Gestion de l'erreur proprement
      }
      callback(null, result); // Retourner le résultat de l'insertion
    });
  },

  // Mettre à jour l'état d'une candidature
  updateEtat: function (offre_id, user_id, etat, callback) {
    const sql = "UPDATE candidature SET etat = ? WHERE offre_id = ? AND user_id = ?";
    db.query(sql, [etat, offre_id, user_id], function (err, result) {
      if (err) {
        return callback(err, null); // Gestion de l'erreur proprement
      }
      callback(null, result); // Retourner le résultat de la mise à jour
    });
  },

  // Supprimer une candidature
  delete: function (offre_id, user_id, callback) {
    const sql = "DELETE FROM candidature WHERE offre_id = ? AND user_id = ?";
    db.query(sql, [offre_id, user_id], function (err, result) {
      if (err) {
        return callback(err, null); // Gestion de l'erreur proprement
      }
      callback(null, result); // Retourner le résultat de la suppression
    });
  }
};

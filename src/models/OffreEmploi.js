const db = require('../config/db');

module.exports = {
    // Lire une offre d'emploi par ID
    read: function (id, callback) {
      db.query("SELECT * FROM Offre_emploi WHERE Id_offre = ?", [id], function (err, results) {
          if (err) {
              return callback(err, null); // Gestion d'erreur flexible
          }
          callback(null, results[0]); // Retourne la première offre trouvée
      });
  },  

  readAll: function(callback) {
    const sql = `
        SELECT 
            o.Id_offre, 
            o.Etat, 
            o.date_validite, 
            o.indication, 
            o.nbr_piece, 
            o.nombre_candidature AS nombre_candidatures,
            o.date_publication as date_publication,
            f.Id_poste AS Id_poste,
            f.intitule AS fiche_intitule,
            f.lieu AS lieu,
            f.type_metier AS type_metier,
            f.rythme AS rythme
        FROM 
            Offre_emploi o
        JOIN 
            fiche_de_poste f ON o.fiche_id = f.Id_poste
        ORDER BY o.date_publication DESC;  -- Exemple pour trier les offres par date de publication
    `;
    db.query(sql, function(err, results) {
        if (err) return callback(err, null);
        callback(null, results);
    });
},

    // Créer une nouvelle offre d'emploi (Id_offre auto-incrémenté, nombre_candidature démarre à 0, date_publication = maintenant)
    create: function (Etat, date_validite, indication, nbr_piece, fiche_id, callback) {
        const sql = "INSERT INTO Offre_emploi (Etat, date_validite, indication, nbr_piece, nombre_candidature, date_publication, fiche_id) VALUES (?, ?, ?, ?, 0, NOW(), ?)";
        db.query(sql, [Etat, date_validite, indication, nbr_piece, fiche_id], function (err, result) {
          if (err) return callback(err, null);
          callback(null, result);
        });
    },

    // Mettre à jour une offre d'emploi
    update: function (id, data, callback) {
        const { Etat, date_validite, indication, nbr_piece, fiche_id } = data;
        const sql = "UPDATE offre_emploi SET Etat = ?, date_validite = ?, indication = ?, nbr_piece = ?, fiche_id = ? WHERE Id_offre = ?";
        db.query(sql, [Etat, date_validite, indication, nbr_piece, fiche_id, id], function (err, result) {
          if (err) return callback(err, null);
          callback(null, result);
        });
    },

    // Supprimer une offre d'emploi par ID
    delete: function (id, callback) {
        db.query("DELETE FROM offre_emploi WHERE Id_offre = ?", [id], function (err, result) {
          if (err) return callback(err, null);
          callback(null, result);
        });
    }
};

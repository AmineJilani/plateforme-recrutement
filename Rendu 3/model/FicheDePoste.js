const db = require('./db');

module.exports = {
  // Lire une fiche de poste par ID
  read: function (id, callback) {
    db.query("SELECT * FROM fiche_de_poste WHERE Id_poste = ?", [id], function (err, results) {
      if (err) {
        console.error("Erreur lors de la récupération de la fiche :", err);
        return callback(err, null);  // Renvoyer l'erreur si elle se produit
      }
      if (results.length === 0) {
        return callback(null, null); // Si aucune fiche n'est trouvée, renvoyer null
      }
      callback(null, results[0]); // Retourner la fiche trouvée
    });
  },
  // Lire une fiche de poste + organisation associée
readWithDetails: function (id, callback) {
  const sql = `
    SELECT 
      f.Id_poste as Id_poste,
      f.intitule as fiche_intitule,
      f.statut_poste,
      f.type_metier,
      f.lieu,
      f.rythme,
      f.salaire,
      f.description,
      f.responsable_hier,
      o.Siren AS organisation_siren,
      o.Nom AS organisation_nom
    FROM fiche_de_poste f
    JOIN Organisation o ON f.organisation_id = o.Siren
    WHERE f.Id_poste = ?
  `;
  db.query(sql, [id], function (err, results) {
    if (err) {
      console.error("Erreur lors de la récupération de la fiche :", err);
      return callback(err, null);
    }
    if (results.length === 0) {
      return callback(null, null);
    }
    callback(null, results[0]);
  });
},

  // Lire toutes les fiches de poste
  readAll: function (callback) {
    const sql = `
      SELECT 
        f.Id_poste as Id_poste,
        f.intitule as fiche_intitule,
        f.statut_poste,
        f.type_metier,
        f.lieu,
        f.rythme,
        f.salaire,
        f.description,
        f.responsable_hier,
        o.Siren AS organisation_siren,
        o.Nom AS organisation_nom
      FROM fiche_de_poste f
      JOIN Organisation o ON f.organisation_id = o.Siren
    `;
    db.query(sql, function (err, results) {
      if (err) {
        console.error("Erreur lors de la récupération des fiches :", err);
        return callback(err, null);  // Retourner l'erreur si elle se produit
      }
      callback(null, results); // Retourner toutes les fiches
    });
  },

  // Créer une nouvelle fiche de poste
  create: function (Id_poste, intitule, statut_poste, type_metier, lieu, rythme, salaire, description, responsable_hier, organisation_id, callback) {
    const sql = "INSERT INTO fiche_de_poste (Id_poste, intitule, statut_poste, type_metier, lieu, rythme, salaire, description, responsable_hier, organisation_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [Id_poste, intitule, statut_poste, type_metier, lieu, rythme, salaire, description, responsable_hier, organisation_id], function (err, result) {
      if (err) {
        console.error("Erreur lors de la création de la fiche :", err);
        return callback(err, null);  // Retourner l'erreur si elle se produit
      }
      callback(null, result);  // Retourner le résultat si l'insertion réussit
    });
  },

  // Mettre à jour une fiche de poste
  update: function (id, data, callback) {
    const { intitule, statut_poste, type_metier, lieu, rythme, salaire, description, responsable_hier, organisation_id } = data;
    const sql = "UPDATE fiche_de_poste SET intitule = ?, statut_poste = ?, type_metier = ?, lieu = ?, rythme = ?, salaire = ?, description = ?, responsable_hier = ?, organisation_id = ? WHERE Id_poste = ?";
    db.query(sql, [intitule, statut_poste, type_metier, lieu, rythme, salaire, description, responsable_hier, organisation_id, id], function (err, result) {
      if (err) {
        console.error("Erreur lors de la mise à jour de la fiche :", err);
        return callback(err, null);  // Retourner l'erreur si elle se produit
      }
      callback(null, result);  // Retourner le résultat si la mise à jour réussit
    });
  },

  // Supprimer une fiche de poste par ID
  delete: function (id, callback) {
    db.query("DELETE FROM fiche_de_poste WHERE Id_poste = ?", [id], function (err, result) {
      if (err) {
        console.error("Erreur lors de la suppression de la fiche :", err);
        return callback(err, null);  // Retourner l'erreur si elle se produit
      }
      callback(null, result);  // Retourner le résultat si la suppression réussit
    });
  }
};

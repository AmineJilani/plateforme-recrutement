const db = require('../config/db');

module.exports = {
  // Lire une organisation par son Siren
  read: function (Siren, callback) {
    db.query("SELECT * FROM Organisation WHERE Siren = ?", [Siren], function (err, results) {
      if (err) throw err;
      callback(results[0]);
    });
  },

  readall: function (callback) {
    db.query("SELECT * FROM Organisation", function (err, results) {
      if (err) return callback(err, null);
      callback(null, results);
    });
  },
  

  // Créer une nouvelle organisation
  create: function (Siren, Nom, adresse_admini, type, callback) {
    const sql = "INSERT INTO Organisation (Siren, Nom, adresse_admini, type) VALUES (?, ?, ?, ?)";
    db.query(sql, [Siren, Nom, adresse_admini, type], function (err, result) {
      if (err) return callback(err, null);
      callback(null, result);
    });
  },

  // Mettre à jour une organisation par son Siren
  update: function (Siren, data, callback) {
    const { Nom, adresse_admini, type } = data;
    const sql = "UPDATE Organisation SET Nom = ?, adresse_admini = ?, type = ? WHERE Siren = ?";
    db.query(sql, [Nom, adresse_admini, type, Siren], function (err, result) {
      if (err) return callback(err, null);
      callback(null, result);
    });
  },

  // Supprimer une organisation par son Siren
  delete: function (Siren, callback) {
    db.query("DELETE FROM Organisation WHERE Siren = ?", [Siren], function (err, result) {
      if (err) return callback(err, null);
      callback(null, result);
    });
  }
};

// Script one-shot : re-hash en bcrypt les mots de passe encore stockés en clair.
// Usage : node scripts/rehash-passwords.js
// Idempotent : les mots de passe déjà au format bcrypt ($2a$/$2b$/$2y$) sont ignorés,
// donc le script peut être relancé sans risque.
require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../src/config/db');

const SALT_ROUNDS = 10;
const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$/;

db.query('SELECT Id, email, password FROM Utilisateur', (err, users) => {
  if (err) {
    console.error('Erreur lors de la lecture des utilisateurs :', err);
    process.exit(1);
  }

  if (users.length === 0) {
    console.log('Aucun utilisateur en base.');
    db.end();
    return;
  }

  let restants = users.length;
  const finish = () => {
    restants -= 1;
    if (restants === 0) db.end();
  };

  users.forEach((user) => {
    if (BCRYPT_HASH_REGEX.test(user.password)) {
      console.log(`Id ${user.Id} (${user.email}) : déjà hashé, ignoré.`);
      return finish();
    }

    bcrypt.hash(user.password, SALT_ROUNDS, (err, hash) => {
      if (err) {
        console.error(`Id ${user.Id} (${user.email}) : erreur de hachage`, err);
        return finish();
      }
      db.query('UPDATE Utilisateur SET password = ? WHERE Id = ?', [hash, user.Id], (err) => {
        if (err) {
          console.error(`Id ${user.Id} (${user.email}) : erreur de mise à jour`, err);
        } else {
          console.log(`Id ${user.Id} (${user.email}) : mot de passe re-hashé.`);
        }
        finish();
      });
    });
  });
});

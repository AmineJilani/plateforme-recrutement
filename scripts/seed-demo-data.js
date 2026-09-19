// Script de seed pour test manuel en local : crée un compte par rôle (candidat, recruteur,
// administrateur), une organisation et une offre d'emploi publiée.
// Usage : node scripts/seed-demo-data.js
// Idempotent : supprime d'abord les données de démo précédentes (mêmes emails/ids) avant de les recréer.
require('dotenv').config({ override: true });
const bcrypt = require('bcrypt');
const db = require('../src/config/db');

const DEMO_PASSWORD = 'Password123!';
const SIREN = 100000001;

function q(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)));
  });
}

(async () => {
  try {
    const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

    await q("DELETE FROM candidature WHERE offre_id = 900001");
    await q("DELETE FROM offre_emploi WHERE Id_offre = 900001");
    await q("DELETE FROM fiche_de_poste WHERE Id_poste = 900001");
    await q("DELETE FROM utilisateur WHERE email IN ('candidat@test.com','recruteur@test.com','admin@test.com')");
    await q("DELETE FROM organisation WHERE Siren = ?", [SIREN]);

    await q("INSERT INTO organisation (Siren, Nom, adresse_admini, type) VALUES (?, 'Acme Corp', '1 avenue de Test, Paris', 'entreprise')", [SIREN]);

    await q(`INSERT INTO utilisateur (Nom, Prenom, Telephone, StatutConnexion, DateCreation, email, password, organisation_id, role)
             VALUES ('Dupont', 'Jean', '0611111111', 'hors ligne', NOW(), 'candidat@test.com', ?, NULL, 'candidat')`, [hash]);

    await q(`INSERT INTO utilisateur (Nom, Prenom, Telephone, StatutConnexion, DateCreation, email, password, organisation_id, role)
             VALUES ('Martin', 'Marie', '0622222222', 'hors ligne', NOW(), 'recruteur@test.com', ?, ?, 'recruteur')`, [hash, SIREN]);

    await q(`INSERT INTO utilisateur (Nom, Prenom, Telephone, StatutConnexion, DateCreation, email, password, organisation_id, role)
             VALUES ('Système', 'Admin', '0633333333', 'hors ligne', NOW(), 'admin@test.com', ?, NULL, 'administrateur')`, [hash]);

    await q(`INSERT INTO fiche_de_poste (Id_poste, intitule, statut_poste, type_metier, lieu, rythme, salaire, description, responsable_hier, organisation_id)
             VALUES (900001, 'Développeur Full-Stack', 'ouvert', 'Développement', 'Paris', 'Temps plein', '42000', 'Poste de démonstration pour tester l\\'application.', 'Marie Martin', ?)`, [SIREN]);

    await q(`INSERT INTO offre_emploi (Id_offre, Etat, date_validite, indication, nbr_piece, nombre_candidature, date_publication, fiche_id)
             VALUES (900001, 'ouverte', '2027-12-31', 'Poste de démonstration', 2, 0, NOW(), 900001)`);

    console.log('Seed OK. Comptes de démo (mot de passe identique pour les 3) :');
    console.log('  Candidat      : candidat@test.com  / ' + DEMO_PASSWORD);
    console.log('  Recruteur     : recruteur@test.com / ' + DEMO_PASSWORD);
    console.log('  Administrateur: admin@test.com      / ' + DEMO_PASSWORD);
  } catch (e) {
    console.error('SEED ERROR:', e.message);
    process.exitCode = 1;
  } finally {
    db.end();
  }
})();

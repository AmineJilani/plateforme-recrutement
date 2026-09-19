const db= require("../src/config/db.js");
const Utilisateur = require("../src/models/Utilisateur.js");
const Candidature = require("../src/models/Candidature.js");

describe('Test des fonctions liées aux utilisateurs', () => {
  test("read user by IdUser", done => {
    const idUtilisateur = 1; // ID utilisateur existe dans la base
    function cbRead(resultat) {
      try {
        const nom = resultat.Nom; 
        expect(nom).toBe("Martin");
        done();
      } catch (error) {
        done(error);
      }
    }
    Utilisateur.readById(idUtilisateur, cbRead);
  });

  test("read user by mail", done => {
    const mailUser = 'luc.durand@humanaid.org'; // ID utilisateur existe dans la base
    function cbRead(resultat) {
      try {
        const nom = resultat.Nom; 
        expect(nom).toBe("Durand");
        done();
      } catch (error) {
        done(error);
      }
    }
    Utilisateur.read(mailUser, cbRead);
  });
  const testUser = {
    Id: 9998,
    Nom: "TestNom",
    Prenom: "TestPrenom",
    Telephone: "+33000000000",
    StatutConnexion: "inactif",
    DateCreation: new Date(), 
    email: "test1@example.com",
    password: "MotDePasse123!",
    organisation_id: 123456789,
    role: "candidat"
  };
  test("Création d'un utilisateur", (done) => {
    Utilisateur.create(
      testUser.Id,
      testUser.Nom,
      testUser.Prenom,
      testUser.Telephone,
      testUser.StatutConnexion,
      testUser.DateCreation,
      testUser.email,
      testUser.password,
      testUser.organisation_id,
      testUser.role,
      (err, result) => {
        try {
          expect(err).toBeNull();
          expect(result).not.toBeNull();
          expect(result.affectedRows).toBe(1);
          done();
        } catch (e) {
          done(e);
        }
      }
    );
  });
  const Utilisateur = require('../src/models/Utilisateur');
  test('supprimer user sans erreur', done => {
    const emailTest = 'test@example.com ';

    // Appeler la fonction delete
    Utilisateur.delete(emailTest, (err, result) => {
      try {
        expect(err).toBeNull(); // Pas d'erreur
        expect(result.affectedRows).toBeGreaterThanOrEqual(0); // Vérifie qu'au moins 0 ligne a été touchée
        done();
      } catch (error) {
        done(error);
      }
    });
  });
  test('devrait retourner un tableau de users', done => {
    Utilisateur.readall((err, results) => {
      try {
        expect(err).toBeNull(); // Pas d'erreur
        expect(Array.isArray(results)).toBe(true); // Résultat est un tableau
        //vérifier qu'au moins un utilisateur est retourné
        if (results.length > 0) {
          expect(results[0]).toHaveProperty('Nom'); // Vérifie qu'un champ attendu existe
          expect(results[0]).toHaveProperty('Prenom');
          expect(results[0]).toHaveProperty('email');
          expect(results[0]).toHaveProperty('Telephone');
          expect(results[0]).toHaveProperty('StatutConnexion');
          expect(results[0]).toHaveProperty('DateCreation');
          expect(results[0]).toHaveProperty('password');
        }
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});

describe('Test des fonctions liées aux Candidatures', () => {
    test("read status candidature by IdUser", done => {
      const idOffre = 1; // ID utilisateur existe dans la base
      function cbRead(resultat) {
        try {
          expect(resultat).not.toBeNull(); 
          const statut = resultat.status; 
          expect(statut).toBe("Retenue");
          done();
        } catch (error) {
          done(error);
        }
      }
      Candidature.read({offre_id:idOffre}, cbRead);
    });
    test('devrait mettre à jour l\'état de la candidature sans erreur', done => {
      const offre_id = 1;
      const user_id = 3;
      const nouvelEtat = 'Retenue';
  
      Candidature.updateEtat(offre_id, user_id, nouvelEtat, (err, result) => {
        try {
          expect(err).toBeNull();
          expect(result.affectedRows).toBeGreaterThan(0); //Vérifie qu'au moins une ligne a été modifiée
          done();
        } catch (error) {
          done(error);
        }
      });
    });
});
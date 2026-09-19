const request = require('supertest');
const app = require('../src/app');

describe('Test des routes recruteur', () => {
  let agent = request.agent(app); // Pour conserver les cookies de session
  let offreId;
  let userId;
  beforeAll(done => {
    // Connexion d'un utilisateur recruteur
    agent
      .post('/login')
      .send({ email: 'alice.martin@techcorp.com', password: 'passAlice123' })
      .then(res => {
        expect(res.statusCode).toBe(302);
        done();
      })
      .catch(done);
  });

  test('GET /recruteur/dashboard devrait retourner le dashboard du recruteur', done => {
    agent
      .get('/recruteur/dashboard')
      .then(res => {
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('Gestion des Offres');
        // Récupérer une offreId pour les prochains tests
            const matches = [...res.text.matchAll(/\/recruteur\/gestion-candidatures\/(\d+)/g)];
        // matches ressemble à ça :
// [
//   ["/recruteur/gestion-candidatures/3", "3"],
//   ["/recruteur/gestion-candidatures/2", "2"],
//   ...
// ]
        //.*match ne récupere que le premier match 
        //donc il vaut bien utiliser .matchAll pour avoir une liste de matches et choisir l'id
        if (matches.length < 2) {
            throw new Error('Pas assez d’offres trouvées');
        }   
        // Prend le deuxième id capturé (index 1)
        offreId = matches[1][1];
        done();
      })
      .catch(done);
  });

  test('GET /recruteur/gestion-candidatures/:offreId devrait afficher les candidatures', done => {
    agent
      .get(`/recruteur/gestion-candidatures/${offreId}`)
      .then(res => {
        console.log(res.text.slice(0, 500)); // DEBUG : voir un extrait de la page
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('Gestion des Candidatures'); 
        // Extrait un userId depuis un lien contact, exemple dans le HTML :
      const match = res.text.match(/\/recruteur\/candidature\/contact\/(\d+)/);
      expect(match).not.toBeNull();
      userId = match[1]; // récupère un userId valide
      done();
      })
      .catch(done);
  });

  test('GET /recruteur/candidature/contact/:userId devrait afficher les infos de contact du candidat', done => {
    if (!offreId) return done(new Error('offreId non défini'));
    if (!userId) return done(new Error('userId non défini'));
    agent
      .get(`/recruteur/candidature/contact/${userId}?offreId=${offreId}`)
      .then(res => {
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('Email'); // ou 'Telephone'
        done();
      })
      .catch(done);
  });
});

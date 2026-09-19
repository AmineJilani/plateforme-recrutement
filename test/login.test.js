const request = require('supertest');
const app = require('../src/app'); 

describe('Test route de connexion', () => {
  test('Get/LOGIN devrait répondre avec le code HTTP 200', done => {
    request(app)
      .get('/login')  // Envoie une requête GET vers la route '/'
      .then(response => {
        expect(response.statusCode).toBe(200);  // Vérifie que le code de statut est 200
        done();
      });
  });

test('POST /login devrait connecter un utilisateur avec des informations valides', done => {
    const validUser = {
      email: 'alice.martin@techcorp.com',
      password: 'passAlice123'
    };
  
    request(app)
      .post('/login')
      .send(validUser)
      .then(response => {
        expect(response.statusCode).toBe(302);
        expect(response.header.location).toBe('/recruteur/dashboard');
        done();
      })
      .catch(err => {
        done(err); 
      });
  });
  

  test('POST /login devrait retourner une error si user(mail) existe pas ', done => {
    const invalidmailUser = {
      email: 'fauxmail@email.com',//mail qui n'existe pas dans la base
      password: 'passLuc456'//mot de passe existe
    };
  
    request(app)
      .post('/login')
      .send(invalidmailUser)
      .then(response => {
        expect(response.statusCode).toBe(404);
        expect(response.text).toBe('Utilisateur non trouvé');
        done();
      })
      .catch(err => {
        done(err); 
      });
  });


test('POST /login devrait retourner une error si user(password) existe pas ', done => {
    const invalidpwdUser = {
      email: 'eva.bernard@gmail.com',//mail qui existe
      password: 'fauxpwd'//mot de passe n'existe pas
    };
  
    request(app)
      .post('/login')
      .send(invalidpwdUser)
      .then(response => {
        expect(response.statusCode).toBe(404);
        expect(response.text).toBe('Mot de passe incorrect');
        done();
      })
      .catch(err => {
        done(err); 
      });
  });

});

require('dotenv').config({ override: true });
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express(); // ✅ Doit être déclaré UNE seule fois, ici en haut
const session = require('express-session'); // Assure-toi que express-session est bien importé

// Importation des routeurs
const loginRouter=require('./routes/login');
const registerRouter = require('./routes/register');
const candidatRouter = require('./routes/candidat');
const recruteurRouter= require('./routes/recruteur');
const administrateurRoutes = require('./routes/administrateur');

// Moteur de vue EJS
app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'ejs');
if (!process.env.SESSION_SECRET) {
  console.warn('⚠️  SESSION_SECRET non défini dans .env — utilisation d\'un secret de repli non sécurisé.');
}

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret_key', // La clé secrète pour sécuriser les sessions
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // pour les tests en mode non-HTTPS (en production, set à true)
}));
// Middlewares globaux
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.use('/',loginRouter);
app.use('/register', registerRouter);

app.use('/candidat', candidatRouter);
app.use('/recruteur', recruteurRouter);
app.use('/admin', administrateurRoutes);

app.use(express.static(path.join(__dirname, '..', 'public')))

// Gestion des 404
app.use(function(req, res, next) {
  next(createError(404));
});

// Gestion des erreurs
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// Démarrage du serveur
app.listen(3000, () => {
  console.log('Serveur démarré sur http://localhost:3000');
});

module.exports = app;

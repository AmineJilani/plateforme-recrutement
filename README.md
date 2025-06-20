FICHIER README


Organisation du dépôt Git : 

mon-projet/
├── model/                          # Modèles de données (schemas Mongoose ou équivalents)
│   ├── Candidature.js
│   ├── db.js
│   ├── DemandeOrganisations.js
│   ├── DemandeRecruteurs.js
│   ├── Dossier.js
│   ├── FicheDePoste.js
│   ├── OffreEmploi.js
│   ├── Organisation.js
│   └── Utilisateur.js
│
├── public/                         # Fichiers statiques accessibles par le client
│   ├── images/                     # Logos et images utilisées dans l'interface
│   │   ├── check-logo.png
│   │   ├── icone.png
│   │   ├── logo-LV.png
│   │   ├── logo-Phoenix.png
│   │   ├── logo-refus.jpg
│   │   └── logo-Safran.jpg
│   ├── javascripts/               # Scripts JavaScript côté client
│   │   ├── filtreCandidat.js
│   │   ├── filtresAdmin.js
│   │   └── filtresRecruteur.js
│   └── stylesheets/              # Feuilles de style CSS
│       └── style.css
│
├── routes/                         # Définition des routes de l'application
│   ├── administrateur.js
│   ├── candidat.js
│   ├── login.js
│   ├── recruteur.js
│   └── register.js
│
├── test/                           # Tests unitaires/fonctionnels
│   ├── login.test.js
│   ├── recruteur.test.js
│   ├── route.test.js
│   ├── session.test.js
│   └── test_security_login.test.js
│
├── upload/                         # Dossiers pour fichiers uploadés
│   └── ensembles_de_CV.pdf
│
├── views/                          # Templates EJS pour le rendu côté serveur
│   ├── admin/
│   │   ├── dashboard.ejs
│   │   └── demande-recruteur.ejs
│   ├── candidat/
│   │   ├── ajouter-organisation.ejs
│   │   ├── candidater.ejs
│   │   ├── dashboard.ejs
│   │   ├── devenir-recruteur.ejs
│   │   ├── fiche.ejs
│   │   ├── mescandidatures.ejs
│   │   ├── mesdemandes.ejs
│   │   └── modifier-candidature.ejs
│   ├── recruteur/
│   │   ├── ajoute-fiche.ejs
│   │   ├── ajouter-offre.ejs
│   │   ├── candidature-details.ejs
│   │   ├── dashboard.ejs
│   │   ├── devenir-admin.ejs
│   │   ├── gestion-candidatures.ejs
│   │   └── voir-fiche.ejs
│   ├── error.ejs
│   ├── login.ejs
│   └── register.ejs
│
├── app.js                          # Configuration de l'application Express
├── insert.ejs                      # Template spécifique pour l’insertion de données
├── package-lock.json               # Fichier de verrouillage des dépendances
├── package.json                    # Dépendances et scripts du projet
├── server.js                       # Lancement du serveur
└── test-db.js                      # Script de test pour la base de données


model/ : contient les définitions des modèles de données utilisés par l’application.

public/ : tout ce qui est visible statiquement par le navigateur (images, CSS, JS).

routes/ : chaque fichier représente un groupe de routes qui vont servir les différents rôles de notre application.

views/ : organisation claire selon le type d’utilisateur (admin, candidat, recruteur).

app.js et server.js : fichiers principaux de configuration et de lancement du serveur.

test/ : tests structurés par fonctionnalité.

upload/ : dossier pour les fichiers transmis par les utilisateurs.




Commits : 

Avant d'utiliser Gitlab, la plupart du code a été réalisé de notre côté, puis tout est restructuré et lancé sur la machine
d'Amine. Nous avons commencé à utiliser GitLab un peu tard, lors de la finalisation du TD3

Voici les commit les plus notables : 

- entre "premier commit - b27a75d56ea3462041d24852568c6c395a95b87a" et "je fais quelques tests - faa18a6afb54be21d29ce8d142c9ef4ad492cf0a" : réalisation de multiples tests pour prendre en main git

- entre "TD5 début - dc901f6b0837fd57026f1ea91fda696981fdf760" et "legeres modifications - 91227039242607cdffff5a58ce0f9c615effffd6" : test d'implémentation de l'api dans notre projet pour la réalisation du TD5, puis suppression oar causes de conflits. De plus,
des modifications ont été apportées pour que l'application fonctionne sans problèmes.

- "commit - 98eb0e3a718376fb3239e1994ff6cccd2032217c" : implémentation du TD4 d'une seule traite + 3éme test de cybersécurité

- entre "maj multer - 4a5895f8e111af112370441b87e9ea5f817be855" et "deuxième test implémenté - 575cc1a4c38abfeba642e415b4f8fb5f77fbc5a3" : implémentation des 2 derniers tests de cybersécurité


Principes et bonnes pratiques suivies : 

- Séparation des responsabilités : routes/, model/, views/, public/ ; application du pattern Modèle-Vue-Contrôleur
pour avoir une vue claire du projet

- Dossier public/ : isolation des fichiers statiques

- Organisation des vues par rôle utilisateur : templates .ejs réparties en sous-dossiers pour améliorer la visibilité

- Présence de tests : tests automatisés qui permettent de tester la sécurité de notre site

- Utilisation de middlewares sûrs et fiables

- Structures de nos requêtes résistante aux différentes attaques extérieures
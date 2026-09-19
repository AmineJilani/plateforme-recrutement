# Plateforme de recrutement

Application web de recrutement avec trois rôles utilisateurs — **candidat**, **recruteur** et **administrateur** — permettant la publication d'offres d'emploi, le dépôt de candidatures avec pièces jointes, et le suivi des candidatures par les recruteurs.

## Contexte

Projet académique réalisé dans le cadre du module **SR10** à l'UTC (Université de Technologie de Compiègne).

## Stack technique

Backend Node.js / Express avec rendu de vues EJS côté serveur, et base de données MySQL locale.

| Dépendance | Version | Rôle |
|---|---|---|
| express | ^4.19.2 | Framework web |
| ejs | ^3.1.9 | Moteur de templates (rendu serveur) |
| mysql | ^2.18.1 | Driver MySQL |
| express-session | ^1.18.0 | Gestion de session |
| bcrypt | ^6.0.0 | Hachage des mots de passe |
| multer | ^2.4.0 | Upload de fichiers (CV, lettre de motivation) |
| cookie-parser | ^1.4.6 | Parsing des cookies |
| dotenv | ^16.4.5 | Chargement des variables d'environnement |
| http-errors | ^2.0.0 | Gestion des erreurs HTTP |
| morgan | ^1.10.0 | Logging des requêtes HTTP |

Dépendances de développement : `jest` ^29.7.0, `supertest` ^6.3.4.

## Architecture

```
├── src/
│   ├── app.js                    # Point d'entrée Express, montage des routeurs, session, middlewares
│   ├── config/
│   │   └── db.js                 # Pool de connexion MySQL (variables d'environnement)
│   ├── models/
│   │   ├── Utilisateur.js
│   │   ├── Organisation.js
│   │   ├── FicheDePoste.js
│   │   ├── OffreEmploi.js
│   │   ├── Candidature.js
│   │   └── Dossier.js
│   └── routes/
│       ├── login.js              # Connexion + déconnexion
│       ├── register.js           # Inscription (candidat)
│       ├── candidat.js           # Dashboard, fiche de poste, candidature + upload
│       ├── recruteur.js          # Dashboard, gestion des candidatures
│       └── administrateur.js     # Dashboard (lecture seule)
│
├── views/                        # Templates EJS, organisés par rôle
│   ├── login.ejs
│   ├── register.ejs
│   ├── error.ejs
│   ├── candidat/
│   ├── recruteur/
│   └── admin/
│
├── public/
│   └── images/                   # Assets statiques
│
├── db/
│   ├── schema.sql                # Schéma MySQL (tables, contraintes, FK)
│   └── NOTES.md                  # Choix de modélisation et points connus
│
├── scripts/
│   ├── seed-demo-data.js         # Jeu de données de démonstration (un compte par rôle)
│   └── rehash-passwords.js       # Migration one-shot : re-hash bcrypt des mots de passe en clair
│
├── docs/
│   └── uml.md                    # Diagrammes UML (classes + cas d'utilisation)
│
├── test/                         # Tests Jest / Supertest
│
├── uploads/                      # Fichiers déposés par les candidats (non versionné)
├── .env.example
└── package.json
```

Communication entre les couches : les routes Express appellent directement les fonctions exposées par les modèles (requêtes SQL paramétrées via le driver `mysql`), puis transmettent les résultats à `res.render()` pour un rendu EJS côté serveur. Aucune API JSON, aucun frontend séparé.

## Fonctionnalités par rôle

### Candidat
- Inscription (mot de passe haché avec **bcrypt**, 10 rounds) et connexion.
- Dashboard listant les offres d'emploi publiées.
- Consultation du détail d'une fiche de poste.
- Candidature à une offre avec upload de **CV** et **lettre de motivation** (PDF ou DOCX, 5 Mo max par fichier).

### Recruteur
- Connexion (compte créé par un administrateur, aucune inscription publique dédiée — voir Limites connues).
- Dashboard listant les offres d'emploi.
- Publication d'une offre : formulaire combiné créant la fiche de poste (rattachée à l'organisation du recruteur) et l'offre d'emploi associée en une seule soumission.
- Consultation des candidatures reçues pour une offre.
- Consultation de la fiche de contact d'un candidat ayant postulé.

### Administrateur
- Connexion.
- Dashboard listant les utilisateurs et les organisations.
- Gestion des utilisateurs : création (avec mot de passe haché bcrypt), modification (nom, coordonnées, **rôle**, organisation de rattachement), suppression. C'est le seul moyen actuel de créer un compte recruteur ou administrateur, ou de faire évoluer le rôle d'un candidat.
- Gestion des organisations : création, modification, suppression.

### Transverse
- Déconnexion (bouton présent sur chaque tableau de bord).
- Sessions gérées via `express-session`, secret chargé depuis `SESSION_SECRET` (variable d'environnement).

## Documentation

- [Diagrammes UML (classes + cas d'utilisation)](docs/uml.md)

## Installation et lancement

### Prérequis
- Node.js
- Une instance MySQL locale

### Étapes

1. Installer les dépendances :
   ```
   npm install
   ```

2. Importer le schéma dans MySQL :
   ```
   mysql -u root -p < db/schema.sql
   ```

3. Créer un utilisateur MySQL dédié à l'application (recommandé plutôt que d'utiliser `root`) :
   ```sql
   CREATE USER 'recrutement_app'@'localhost' IDENTIFIED BY 'un_mot_de_passe_solide';
   GRANT ALL PRIVILEGES ON DB_recrut.* TO 'recrutement_app'@'localhost';
   FLUSH PRIVILEGES;
   ```

4. Copier `.env.example` vers `.env` et renseigner les variables (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `SESSION_SECRET` — générer ce dernier avec `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).

5. Lancer le serveur :
   ```
   npm start
   ```
   L'application est accessible sur `http://localhost:3000`.

### Données de démonstration

Pour peupler la base avec un compte par rôle (candidat, recruteur, administrateur) et une offre d'emploi publiée :
```
npm run seed:demo
```

### Migration des mots de passe existants

Si la base contient des comptes créés avant l'introduction du hachage bcrypt (mots de passe stockés en clair), un script one-shot les re-hache automatiquement (idempotent — les mots de passe déjà hachés sont ignorés) :
```
npm run migrate:rehash-passwords
```

### Base existante créée avant l'auto-incrémentation des offres

Si votre base a été importée avant l'introduction de la création d'offre côté recruteur, `Id_poste` (table `fiche_de_poste`) et `Id_offre` (table `offre_emploi`) doivent être passés en `AUTO_INCREMENT` (les contraintes de clé étrangère doivent être retirées puis recréées le temps de la modification) :
```sql
ALTER TABLE offre_emploi DROP FOREIGN KEY fk_offre_fiche;
ALTER TABLE candidature DROP FOREIGN KEY fk_candidature_offre;

ALTER TABLE fiche_de_poste MODIFY COLUMN Id_poste INT AUTO_INCREMENT;
ALTER TABLE offre_emploi MODIFY COLUMN Id_offre INT AUTO_INCREMENT;

ALTER TABLE offre_emploi ADD CONSTRAINT fk_offre_fiche FOREIGN KEY (fiche_id) REFERENCES fiche_de_poste(Id_poste);
ALTER TABLE candidature ADD CONSTRAINT fk_candidature_offre FOREIGN KEY (offre_id) REFERENCES Offre_emploi(Id_offre);
```
(Une base importée directement depuis `db/schema.sql` dans sa version actuelle n'a pas besoin de cette étape.)

## Limites connues

- **Inscription recruteur/administrateur** : aucun parcours d'inscription public ne permet de créer directement un compte recruteur ou administrateur — seul un administrateur peut le faire (création directe en tant que tel, ou promotion d'un candidat existant via la modification de son rôle).
- **Organisation d'un recruteur** : la création d'offre nécessite que le recruteur soit rattaché à une organisation (`organisation_id`) ; un recruteur sans organisation ne peut pas publier d'offre tant qu'un administrateur ne le rattache pas à une organisation existante.
- **Upload de pièces jointes** : limité aux formats PDF et DOCX, 5 Mo maximum par fichier ; le CV et la lettre de motivation restent facultatifs à la soumission d'une candidature.
- **Suppression avec dépendances** : la suppression d'une organisation ou d'un utilisateur encore référencés par une fiche de poste ou une candidature échoue (contrainte de clé étrangère, sans cascade définie) — un message d'erreur générique est renvoyé plutôt qu'une suppression en cascade.
- **Tests (`test/`)** : non alignés avec l'état actuel du code. Certains supposent des données précises absentes de tout jeu de seed fourni (comptes, offres et candidatures spécifiques) ; d'autres contiennent des assertions obsolètes (ex. code HTTP ou route attendus qui ne correspondent plus au comportement réel de l'application). À revoir avant de s'appuyer dessus en CI.

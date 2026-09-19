# Notes sur la base de données

## Choix d'hébergement (historique)

Au début du projet, le choix avait été fait d'utiliser MySQL en local sur un serveur de développement, mais celui-ci
était inaccessible depuis l'extérieur pour permettre les tests. Les tables et la base ont donc été recréées sous
phpMyAdmin avec les identifiants de l'environnement SR10 (UTC), et `model/db.js` (devenu `src/config/db.js`) adapté
en conséquence. Ces identifiants étaient codés en dur dans le dépôt — ils ont été retirés et remplacés par des
variables d'environnement (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, voir `.env.example`), le serveur UTC
n'étant de toute façon plus accessible. Le projet tourne maintenant en local.

## Choix de modélisation

- L'attribut `organisation_id` de `Utilisateur` est passé de `NOT NULL` à `NULL` : utile à l'inscription, un compte
  est créé par défaut avec le rôle `candidat` (sans organisation), puis peut être mis à jour vers un rôle nécessitant
  une organisation.
- Ajout des attributs `nombre_candidature` et `date_publication` sur `Offre_emploi`.
- `candidature` a une clé primaire composite `(offre_id, user_id)` en métier (un candidat ne peut postuler qu'une
  fois à une offre), mais possède aussi une clé technique `Id_candidature` (auto-incrémentée) pour que `dossier`
  puisse référencer une candidature précise sans ambiguïté (voir `schema.sql`).

## Point ouvert : image manquante

`views/recruteur/dashboard.ejs` référence `/images/logo-Phoenix.png`, mais aucun rendu du projet ne contient de
fichier portant ce nom exact (l'ancien dossier "Rendu 2/Images" avait un `logo-phoenix-black-transp-500px.png`, dont
le nom ne correspond pas). Cette image est donc cassée (404) indépendamment de la réorganisation du dépôt — à
corriger en fournissant le bon fichier sous `public/images/logo-Phoenix.png`, ou en corrigeant la référence dans la vue.

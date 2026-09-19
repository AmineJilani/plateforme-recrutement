# Diagrammes UML — Plateforme de recrutement

## Diagramme de classes

Reflète le code réel de `src/models/` (attributs tirés de `db/schema.sql`, méthodes du code applicatif).

`Candidature` est modélisée comme une classe-association réalisant la relation many-to-many entre `Utilisateur` et `OffreEmploi` (contrainte `UNIQUE(offre_id, user_id)`). `Dossier` est une entité faible : elle n'a pas de clé primaire propre en base, et dépend entièrement de `candidature_id`.

`Id_poste` (FicheDePoste) et `Id_offre` (OffreEmploi) sont désormais auto-incrémentés (`AUTO_INCREMENT`), au même titre que `Utilisateur.Id` — nécessaire pour la création de fiche/offre côté recruteur sans génération manuelle d'identifiant.

> ✅ Bug corrigé : `OffreEmploi.create()` ne comptait que 6 placeholders SQL `?` pour 8 valeurs transmises, ce qui insérait une mauvaise valeur dans `fiche_id`. La méthode a été simplifiée (`Id_offre` auto-incrémenté retiré des paramètres, `nombre_candidature`/`date_publication` toujours fixés par le serveur) et est désormais utilisée par la route `POST /recruteur/nouvelle-offre`.

```mermaid
classDiagram
  class Organisation {
    +int Siren
    +string Nom
    +string adresse_admini
    +string type
    read(Siren)
    readall()
    create(Siren, Nom, adresse_admini, type)
    update(Siren, data)
    delete(Siren)
  }
  class Utilisateur {
    +int Id
    +string Nom
    +string Prenom
    +string Telephone
    +string email
    +string password
    +string role
    +int organisation_id
    read(email)
    readById(id)
    readall()
    create(...)
    update(id, data)
    delete(email)
    deleteById(id)
  }
  class FicheDePoste {
    +int Id_poste
    +string intitule
    +string statut_poste
    +string description
    +int organisation_id
    read(id)
    readWithDetails(id)
    readAll()
    create(...)
    update(id, data)
    delete(id)
  }
  class OffreEmploi {
    +int Id_offre
    +string Etat
    +date date_validite
    +int nbr_piece
    +int fiche_id
    read(id)
    readAll()
    create(Etat, date_validite, indication, nbr_piece, fiche_id)
    update(id, data)
    delete(id)
  }
  class Candidature {
    <<classe association>>
    +int Id_candidature
    +date date_candidature
    +int offre_id
    +int user_id
    +string status
    read(id)
    readAll()
    readAllByOffreId(offreId)
    getContactInfo(user_id)
    create(offre_id, user_id, date, status)
    updateEtat(offre_id, user_id, status)
    delete(offre_id, user_id)
  }
  class Dossier {
    <<entite faible>>
    +string type_fichier
    +string nom_fichier
    +int candidature_id
    create(type_fichier, nom_fichier, candidature_id)
    readAllByCandidature(candidature_id)
    delete(candidature_id)
  }
  Organisation "1" --> "0..*" Utilisateur : emploie
  Organisation "1" --> "1..*" FicheDePoste : publie
  FicheDePoste "1" --> "1..*" OffreEmploi : genere
  Utilisateur "1" --> "0..*" Candidature : soumet
  OffreEmploi "1" --> "0..*" Candidature : recoit
  Candidature "1" --> "0..2" Dossier : contient
```

## Diagramme de cas d'utilisation

Cas d'utilisation groupés par rôle, reflétant l'état réel de l'application (routes et vues effectivement câblées, pas les modèles seuls).

```mermaid
flowchart LR
  Candidat([Candidat]) --> C1(["Créer un compte / se connecter"])
  Candidat --> C2(["Consulter les offres publiées"])
  Candidat --> C3(["Voir le détail d'une fiche de poste"])
  Candidat --> C4(["Postuler avec CV et lettre jointe"])

  Recruteur([Recruteur]) --> R1(["Consulter les offres de son organisation"])
  Recruteur --> R2(["Publier une offre (fiche de poste + offre)"])
  Recruteur --> R3(["Voir les candidatures reçues par offre"])
  Recruteur --> R4(["Consulter la fiche de contact d'un candidat"])

  Administrateur([Administrateur]) --> A1(["Gérer les utilisateurs (créer / modifier rôle et organisation / supprimer)"])
  Administrateur --> A2(["Gérer les organisations (créer / modifier / supprimer)"])
```

create database DB_recrut;
use DB_recrut;
create table Organisation(
			Siren int primary key,
            Nom varchar(50) not null,
            adresse_admini varchar (50),
            type enum('association','entreprise')
);
			
create table Utilisateur(
			Id int auto_increment primary key,
            Nom varchar(50) not null,
            Prenom varchar(50) not null,
            Telephone varchar(20) not null,
            StatutConnexion VARCHAR(10),
            DateCreation date not null,
            email varchar(50) not null,
            password varchar(50) not null,
            organisation_id int null,
            role enum('candidat','administrateur','recreteur'),
            constraint fk_User_Organsation foreign key (organisation_id) references Organisation(Siren)
);

create table fiche_de_poste(
			Id_poste int primary key,
            intitule text,
            statut_poste varchar(50) not null,
            type_metier varchar(50),
            lieu varchar(50),
            rythme varchar(50),
            salaire varchar(10),
            description text not null,
            responsable_hier varchar(50),
			organisation_id int not null,
			constraint fk_fiche_Organsation foreign key (organisation_id) references Organisation(Siren)
);
create table Offre_emploi(
			Id_offre int primary key,
            Etat varchar (50),
            date_validite date not null,
            indication text,
            nbr_piece int not null,
            nombre_candidature int,
            date_publication datetime,
			fiche_id int not null,
			constraint fk_offre_fiche foreign key (fiche_id) references fiche_de_poste(Id_poste)
);
create table candidature(
		date_candidature date not null,
        offre_id int not null,
        user_id int not null,
		status ENUM('En attente', 'Retenue', 'Non retenue') NOT NULL DEFAULT 'En attente',

		constraint fk_candidature_user foreign key (user_id) references Utilisateur(Id),
		constraint fk_candidature_offre foreign key (offre_id) references Offre_emploi(Id_offre),
        primary key(offre_id,user_id)
);

create table dossier(
	type_fichier varchar(50),
    nom_fichier varchar(50),
    candidature_id INT NOT NULL, 
    CONSTRAINT fk_dossier_candidature FOREIGN KEY (candidature_id) REFERENCES candidature(offre_id) 
);

            

            
            
            
            
            
            

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const OffreEmploi = require('../models/OffreEmploi'); // vérifie le chemin
const FicheDePoste = require('../models/FicheDePoste'); // vérifie le chemin aussi
const Candidature = require('../models/Candidature');
const Dossier = require('../models/Dossier');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
];

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max par fichier
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error('Type de fichier non autorisé. Seuls les PDF et DOCX sont acceptés.'));
    }
    cb(null, true);
  }
});

function requireCandidat(req, res, next) {
  if (req.session.user && req.session.user.role === 'candidat') {
    next();
  } else {
    res.redirect('/');
  }
}

// Route du dashboard
router.get('/dashboard', requireCandidat, (req, res) => {
  OffreEmploi.readAll((err, offres) => {
    if (err) {
      console.error("Erreur lors de la récupération des offres :", err);
      return res.status(500).send("Erreur serveur");
    }
    console.log("Offres récupérées :", offres); // Ajouter ce log pour vérifier les données

    res.render('candidat/dashboard', {
      utilisateur: {
        nom: req.session.user.nom,
        prenom: req.session.user.prenom || ''
      },
      offres: offres
    });
  });
});

// Route détails fiche de poste
router.get('/fiche/:id', requireCandidat, (req, res) => {
  const ficheId = req.params.id;

  FicheDePoste.readWithDetails(ficheId, (err, fiche) => {
    if (err) {
      console.error("Erreur lors de la récupération de la fiche de poste :", err);
      return res.status(500).send("Erreur serveur");
    }
    if (!fiche) return res.status(404).send("Fiche de poste non trouvée");

    res.render('candidat/fiche', { fiche });
  });
}),

// Route pour afficher la page de candidature
router.get('/candidater/:id', requireCandidat, (req, res) => {
  const offreId = req.params.id;

  // Récupérer les détails de l'offre
  OffreEmploi.read(offreId, (err, offre) => {
    if (err) {
      console.error("Erreur lors de la récupération de l'offre :", err);
      return res.status(500).send("Erreur serveur");
    }
    if (!offre) {
      return res.status(404).send("Offre d'emploi non trouvée");
    }

    // Récupérer les informations de l'utilisateur connecté
    const utilisateur = req.session.user;

    // Rendre la page de candidature avec les informations nécessaires
    res.render('candidat/candidater', {
      offre: offre, // Passer l'offre d'emploi à la vue
      utilisateur: utilisateur // Passer les informations de l'utilisateur à la vue
    });
  });
}),

// Route pour soumettre une candidature
router.post('/soumettre-candidature', requireCandidat, (req, res) => {
  upload.fields([{ name: 'cv', maxCount: 1 }, { name: 'lettre', maxCount: 1 }])(req, res, (uploadErr) => {
    if (uploadErr) {
      if (uploadErr.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).send('Fichier trop volumineux (5 Mo maximum).');
      }
      return res.status(400).send(uploadErr.message);
    }

    const { offre_id } = req.body;
    const user_id = req.session.user.id;
    const date_candidature = new Date();

    // Créer la candidature dans la base de données
    Candidature.create(offre_id, user_id, date_candidature, 'En attente', (err, result) => {
      if (err) {
        console.error("Erreur lors de l'enregistrement de la candidature :", err);
        return res.status(500).send("Erreur serveur");
      }

      const candidatureId = result.insertId;
      const fichiers = [];
      if (req.files.cv) fichiers.push({ type_fichier: 'cv', file: req.files.cv[0] });
      if (req.files.lettre) fichiers.push({ type_fichier: 'lettre_motivation', file: req.files.lettre[0] });

      // Une candidature reste valide sans pièce jointe
      if (fichiers.length === 0) {
        return res.redirect('/candidat/dashboard');
      }

      let restants = fichiers.length;
      let echec = false;
      fichiers.forEach(({ type_fichier, file }) => {
        Dossier.create(type_fichier, file.filename, candidatureId, (err) => {
          if (err) {
            echec = true;
            console.error("Erreur lors de l'enregistrement du dossier :", err);
          }
          restants -= 1;
          if (restants === 0) {
            if (echec) return res.status(500).send("Erreur serveur lors de l'enregistrement des pièces jointes");
            res.redirect('/candidat/dashboard');
          }
        });
      });
    });
  });
});

module.exports = router;

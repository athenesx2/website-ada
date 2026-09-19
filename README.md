## Sommaire

1. [Fonctionnalités](#fonctionnalités)
2. [Architecture technique](#architecture-technique)
3. [Structure du projet](#structure-du-projet)
4. [Installation et lancement en développement](#installation-et-lancement-en-développement)
5. [Spécification de l'API Backend](#spécification-de-lapi-backend)
6. [Schéma de la base de données](#schéma-de-la-base-de-données)
7. [Checklist avant mise en production](#checklist-avant-mise-en-production)

---

## Fonctionnalités

- **Annuaire dynamique des membres (`annuaire.html`)** :
  - Recherche instantanée multi-critères (nom, prénom, numéro de personne, promotion, poste, entreprise, école, diplôme, domaine, ville, pays).
  - Panneau de filtres avancés dépliable avec badge de comptage des filtres actifs :
    - Filtre par **Promotion** (promotions numérotées de 1 à 13).
    - Filtre par **Entreprise** actuelle.
    - Filtres académiques par **École**, **Diplôme / Master** et **Domaine d'études**.
    - Filtres géographiques par **Ville** et **Pays**.
    - Filtres rapides par statut (**Étudiant**, **En recherche d'emploi**).
  - Tri alphabétique / numérique naturel ou chronologique par promotion (récente / ancienne).
  - Comptage dynamique des résultats, gestion des états de chargement et des erreurs API.
- **Fiches profils complètes (`profil.html`)** :
  - Bandeau d'en-tête unifié avec bannière dégradée, avatar circulaire et informations principales à gauche (Nom, Promotion, Emploi actuel, Ville).
  - Coordonnées directes alignées sur le côté droit du bandeau (Email, Téléphone, LinkedIn) selon les préférences de visibilité.
  - Sections de contenu modulaires : présentation (*À propos*), expériences professionnelles (*timeline*), formations académiques, compétences techniques et projets avec liens externes.
  - Design responsive adapté aux mobiles et tablettes.
- **Navigation fluide type SPA (`scripts/main-script.js`)** :
  - Chargement asynchrone des composants partagés (`header.html` et `footer.html`).
  - Navigation interne sans rechargement complet de la page grâce au remplacement dynamique du conteneur `<main>`.
  - Barre de progression visuelle lors des transitions de page.
  - Menu responsive adapté aux mobiles avec sous-menus dépliables.
- **Pages vitrines & Réseau** :
  - Accueil (`index.html`), carte des alumni (`carte.html`), annuaire entreprises (`entreprises.html`).
  - Événements (`event.html`), actualités MPCI (`actus.html`), réussites (`reussites.html`).

---

## Architecture technique

- **Frontend** :
  - HTML5 sémantique, CSS3 modulaire (responsive, variables, flexbox/grid).
  - JavaScript vanille (aucun framework lourd requis).
  - Icônes : FontAwesome.
- **Backend** :
  - Python 3.13.
  - Flask (micro-framework HTTP) & Flask-CORS.
- **Base de données** :
  - SQLite 3 avec respect des contraintes d'intégrité référentielle (`PRAGMA foreign_keys = ON`).
  - Gestion des migrations non-destructives et insertion de données de test via `app/manual_database.py`.

---

## Structure du projet

```text
website-ada/
├── app/
│   ├── app-annuaire.py       # Serveur API Flask (points d'entrée REST)
│   └── manual_database.py    # Schéma SQLite, migrations et fixtures de démo
├── scripts/
│   ├── main-script.js        # Gestion globale : Header/Footer, SPA, barre de progression, menu mobile
│   ├── annuaire-script.js    # Logique de l'annuaire : fetch API, filtres, tri et rendu
│   └── profil-script.js      # Logique de la page profil : rendu des sections et timeline
├── styles/
│   ├── style.css             # Styles globaux (layout, barre de chargement, reset)
│   ├── header-style.css      # Styles de l'en-tête et du menu mobile
│   ├── footer-style.css      # Styles du pied de page
│   ├── annuaire.css          # Styles de la grille de l'annuaire, boutons et filtres
│   └── profil.css            # Styles des fiches de profil et timelines
├── images/                   # Logos (ADA, MPCI, AMU, Centrale Méditerranée)
├── index.html                # Page d'accueil
├── annuaire.html             # Page de l'annuaire des membres
├── profil.html               # Page de consultation d'un profil alumni
├── carte.html                # Carte géographique des membres (en développement)
├── entreprises.html          # Annuaire des entreprises partenaires
├── event.html                # Événements organisés par l'association
├── actus.html                # Actualités de la licence MPCI
├── reussites.html            # Portraits et réussites d'alumni
├── header.html               # Fragment HTML réutilisable (en-tête)
├── footer.html               # Fragment HTML réutilisable (pied de page)
├── alumni.sqlite             # Fichier de base de données locale (ignoré par Git)
└── README.md                 # Documentation du projet
```

---

## Installation et lancement en développement

### 1. Prérequis

- Python 3.10+ (idéalement Python 3.13)
- Navigateur web moderne

### 2. Configuration de l'environnement virtuel Python

Activez l'environnement virtuel existant ou créez-en un nouveau :

```bash
# Activation du venv existant :
source venv/bin/activate

# Ou création d'un nouveau venv si nécessaire :
# python3 -m venv venv
# source venv/bin/activate
# pip install Flask flask-cors
```

### 3. Initialisation de la base de données

Pour créer le schéma de la base de données SQLite et y injecter un jeu de données de test réaliste :

```bash
python app/manual_database.py --demo
```

Cela crée (ou réinitialise) le fichier `alumni.sqlite` à la racine du projet avec 39 membres anonymisés (promotions 1 à 13, étudiants, personnes en recherche d'emploi, chercheurs et salariés).

### 4. Lancement de l'API Flask (Backend)

```bash
python app/app-annuaire.py
```

L'API est accessible par défaut sur `http://127.0.0.1:5000`.

### 5. Lancement du site web (Frontend)

Pour éviter les restrictions CORS liées au protocole `file://` et permettre le chargement asynchrone des fragments HTML (`header.html`, `footer.html`), servez les fichiers statiques via un serveur HTTP local :

```bash
# Dans un second terminal, à la racine du projet :
python3 -m http.server 8000
```

Ouvrez ensuite votre navigateur sur `http://localhost:8000`.

---

## Spécification de l'API Backend

### `GET /api/alumni`

Retourne la liste des membres avec leur emploi et formation les plus récents.

- **Réponse (200 OK)** :
  ```json
  [
    {
      "id": 1,
      "nom": "1",
      "prenom": "Personne",
      "promo": 1,
      "emploi": {
        "poste": "Directeur technique",
        "entreprise": "Entreprise 1"
      },
      "formation": {
        "ecole": "École 1",
        "diplome": "Diplôme d'ingénieur",
        "domaine": "Génie logiciel"
      },
      "ville": "Marseille",
      "pays": "France",
      "statuts": {
        "etudiant": false,
        "chercheur": false,
        "recherche_emploi": false
      }
    }
  ]
  ```

### `GET /api/alumni/<id>`

Retourne les informations détaillées d'un profil spécifique et ses sections ordonnées.

- **Paramètres** : `id` (entier) — Identifiant unique de l'alumni.
- **Réponse (200 OK)** :
  ```json
  {
    "id": 1,
    "nom": "1",
    "prenom": "Personne",
    "promo": 1,
    "ville": "Marseille",
    "avatar_url": null,
    "emploi_actuel": {
      "job": "Directeur technique",
      "company": "Entreprise 1",
      "start_date": "2024-01-15",
      "end_date": null
    },
    "coordonnees": {
      "email": "personne1@exemple.fr",
      "telephone": "+33 6 00 00 01 01",
      "linkedin": "https://linkedin.com/in/personne-1"
    },
    "sections": [
      {
        "type": "about",
        "title": "À propos",
        "position": 1,
        "content": "Directeur technique et diplômé MPCI..."
      },
      {
        "type": "jobs",
        "title": "Expériences professionnelles",
        "position": 2,
        "content": [...]
      }
    ]
  }
  ```
- **Code d'erreur** : `404 Not Found` si le profil n'existe pas.

---

## Schéma de la base de données

Le modèle relationnel est structuré autour des entités suivantes :

- **`alumnis`** : Données d'état civil de base (`id_alumni`, `name`, `firstname`, `promo`, `birthday`).
- **`profils`** : Informations de présentation publique (`bio`, `city`, `country`, `avatar_url`, `contact_email`, `contact_phone`, `linkedin_url`, drapeaux de visibilité et statuts étudiant/chercheur/chercheur d'emploi).
- **`profil_sections`** : Configuration modulaire des blocs du profil (`section_type`, `position`, `is_visible`).
- **`travail`** & **`entreprises`** : Historique professionnel lié aux entreprises.
- **`etudes`** & **`ecoles`** : Historique académique post-MPCI lié aux écoles et universités.
- **`competences`** & **`alumni_competences`** : Compétences techniques et scientifiques.
- **`projets`** : Projets personnels ou associatifs réalisés par les membres.
- **`utilisateurs`** : Gestion des comptes d'accès, permissions et SSO éventuel (`provider`, `provider_id`).

---

## Checklist avant mise en production

Avant de déployer le site sur un serveur public, veillez à effectuer les actions suivantes :

1. **Serveur d'application WSGI** :
   - Remplacer le serveur de développement Flask par un serveur WSGI de production performant et robuste (ex: **Gunicorn** sous Linux ou **Waitress** sous Windows).
   - Exemple avec Gunicorn :
     ```bash
     pip install gunicorn
     gunicorn -w 4 -b 127.0.0.1:5000 app.app-annuaire:app
     ```
2. **Désactiver le mode Debug** :
   - S'assurer que `debug=False` est appliqué dans [`app/app-annuaire.py`](file:///home/eytan/Bureau/AEA%20MPCI/website-ada/app/app-annuaire.py) ou via une variable d'environnement (`FLASK_DEBUG=0`).
3. **Configuration de l'URL d'API côté Frontend** :
   - Dans [`scripts/annuaire-script.js`](file:///home/eytan/Bureau/AEA%20MPCI/website-ada/scripts/annuaire-script.js) et [`scripts/profil-script.js`](file:///home/eytan/Bureau/AEA%20MPCI/website-ada/scripts/profil-script.js), remplacer l'URL locale `http://127.0.0.1:5000/api/...` par l'URL de production (ex: `https://asso-alumni.fr/api/...`).
   - *Recommandation* : externaliser l'URL de base dans un fichier de configuration dédié (ex: `scripts/config.js`) ou utiliser un chemin relatif (`/api/alumni`) si le frontend et le backend sont servis derrière le même domaine via reverse proxy.
4. **Sécurisation de la base SQLite** :
   - Déplacer `alumni.sqlite` hors du dossier racine accessible publiquement par le serveur web (dans un dossier parent sécurisé ou `/var/data/`), et mettre à jour `DB_PATH` dans `app/manual_database.py`.
5. **Reverse Proxy & HTTPS** :
   - Mettre en place Nginx ou Caddy en frontal pour gérer le chiffrement SSL/TLS (certificat Let's Encrypt), servir les fichiers statiques (HTML, CSS, JS, images) et rediriger `/api/` vers Gunicorn.
6. **Sauvegardes régulières** :
   - Automatiser une sauvegarde quotidienne du fichier SQLite.

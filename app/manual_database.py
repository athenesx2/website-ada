"""Schéma SQLite et données de démo anonymisées pour le portail des Alumni MPCI."""

import argparse
from pathlib import Path
import sqlite3

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DB_PATH = PROJECT_ROOT / "alumni.sqlite"


def get_connection() -> sqlite3.Connection:
    """Retourne une connexion configurée pour respecter les clés étrangères."""
    connection = sqlite3.connect(DB_PATH)
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def _column_names(connection: sqlite3.Connection, table_name: str) -> set[str]:
    return {row[1] for row in connection.execute(f"PRAGMA table_info({table_name})")}


def _add_column_if_missing(
    connection: sqlite3.Connection, table_name: str, column_name: str, definition: str
) -> None:
    if column_name not in _column_names(connection, table_name):
        connection.execute(f"ALTER TABLE {table_name} ADD COLUMN {definition}")


def init_db() -> None:
    """Crée le schéma actuel et met à niveau les anciennes bases sans les vider."""
    with get_connection() as connection:
        connection.executescript("""
            CREATE TABLE IF NOT EXISTS alumnis (
                id_alumni INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                firstname TEXT NOT NULL,
                promo INTEGER,
                birthday TEXT
            );

            CREATE TABLE IF NOT EXISTS utilisateurs (
                id_user INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                provider TEXT,
                provider_id TEXT,
                id_alumni INTEGER UNIQUE,
                permission INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (id_alumni) REFERENCES alumnis(id_alumni) ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS ecoles (
                id_school INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                city TEXT,
                country TEXT,
                description TEXT
            );

            CREATE TABLE IF NOT EXISTS entreprises (
                id_corp INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                city TEXT,
                description TEXT
            );

            CREATE TABLE IF NOT EXISTS etudes (
                id_etude INTEGER PRIMARY KEY AUTOINCREMENT,
                id_alumni INTEGER NOT NULL,
                id_school INTEGER NOT NULL,
                start_date TEXT,
                end_date TEXT,
                speciality TEXT,
                degree TEXT,
                is_visible INTEGER NOT NULL DEFAULT 1 CHECK (is_visible IN (0, 1)),
                display_order INTEGER NOT NULL DEFAULT 0,
                FOREIGN KEY (id_alumni) REFERENCES alumnis(id_alumni) ON DELETE CASCADE,
                FOREIGN KEY (id_school) REFERENCES ecoles(id_school) ON DELETE RESTRICT
            );

            CREATE TABLE IF NOT EXISTS travail (
                id_travail INTEGER PRIMARY KEY AUTOINCREMENT,
                id_alumni INTEGER NOT NULL,
                id_corp INTEGER NOT NULL,
                start_date TEXT,
                end_date TEXT,
                job TEXT,
                is_visible INTEGER NOT NULL DEFAULT 1 CHECK (is_visible IN (0, 1)),
                display_order INTEGER NOT NULL DEFAULT 0,
                FOREIGN KEY (id_alumni) REFERENCES alumnis(id_alumni) ON DELETE CASCADE,
                FOREIGN KEY (id_corp) REFERENCES entreprises(id_corp) ON DELETE RESTRICT
            );

            CREATE TABLE IF NOT EXISTS profils (
                id_profile INTEGER PRIMARY KEY AUTOINCREMENT,
                id_alumni INTEGER NOT NULL UNIQUE,
                bio TEXT,
                city TEXT,
                country TEXT,
                avatar_url TEXT,
                contact_email TEXT,
                contact_phone TEXT,
                linkedin_url TEXT,
                show_email INTEGER NOT NULL DEFAULT 0 CHECK (show_email IN (0, 1)),
                show_phone INTEGER NOT NULL DEFAULT 0 CHECK (show_phone IN (0, 1)),
                show_linkedin INTEGER NOT NULL DEFAULT 0 CHECK (show_linkedin IN (0, 1)),
                is_student INTEGER NOT NULL DEFAULT 0 CHECK (is_student IN (0, 1)),
                is_researcher INTEGER NOT NULL DEFAULT 0 CHECK (is_researcher IN (0, 1)),
                is_job_seeking INTEGER NOT NULL DEFAULT 0 CHECK (is_job_seeking IN (0, 1)),
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (id_alumni) REFERENCES alumnis(id_alumni) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS competences (
                id_skill INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE
            );

            CREATE TABLE IF NOT EXISTS alumni_competences (
                id_alumni INTEGER NOT NULL,
                id_skill INTEGER NOT NULL,
                display_order INTEGER NOT NULL DEFAULT 0,
                is_visible INTEGER NOT NULL DEFAULT 1 CHECK (is_visible IN (0, 1)),
                PRIMARY KEY (id_alumni, id_skill),
                FOREIGN KEY (id_alumni) REFERENCES alumnis(id_alumni) ON DELETE CASCADE,
                FOREIGN KEY (id_skill) REFERENCES competences(id_skill) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS projets (
                id_project INTEGER PRIMARY KEY AUTOINCREMENT,
                id_alumni INTEGER NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                url TEXT,
                display_order INTEGER NOT NULL DEFAULT 0,
                is_visible INTEGER NOT NULL DEFAULT 1 CHECK (is_visible IN (0, 1)),
                FOREIGN KEY (id_alumni) REFERENCES alumnis(id_alumni) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS profil_sections (
                id_alumni INTEGER NOT NULL,
                section_type TEXT NOT NULL CHECK (section_type IN (
                    'about', 'jobs', 'studies', 'skills', 'projects'
                )),
                position INTEGER NOT NULL,
                is_visible INTEGER NOT NULL DEFAULT 1 CHECK (is_visible IN (0, 1)),
                PRIMARY KEY (id_alumni, section_type),
                FOREIGN KEY (id_alumni) REFERENCES alumnis(id_alumni) ON DELETE CASCADE
            );
            """)

        _add_column_if_missing(connection, "utilisateurs", "provider", "provider TEXT")
        _add_column_if_missing(
            connection, "utilisateurs", "provider_id", "provider_id TEXT"
        )
        _add_column_if_missing(
            connection, "utilisateurs", "created_at", "created_at TEXT"
        )
        _add_column_if_missing(
            connection,
            "etudes",
            "is_visible",
            "is_visible INTEGER NOT NULL DEFAULT 1 CHECK (is_visible IN (0, 1))",
        )
        _add_column_if_missing(
            connection,
            "etudes",
            "display_order",
            "display_order INTEGER NOT NULL DEFAULT 0",
        )
        _add_column_if_missing(connection, "etudes", "degree", "degree TEXT")
        _add_column_if_missing(connection, "ecoles", "country", "country TEXT")
        _add_column_if_missing(connection, "profils", "country", "country TEXT")
        _add_column_if_missing(
            connection,
            "travail",
            "is_visible",
            "is_visible INTEGER NOT NULL DEFAULT 1 CHECK (is_visible IN (0, 1))",
        )
        _add_column_if_missing(
            connection,
            "travail",
            "display_order",
            "display_order INTEGER NOT NULL DEFAULT 0",
        )
        _add_column_if_missing(
            connection, "profils", "contact_email", "contact_email TEXT"
        )
        _add_column_if_missing(
            connection, "profils", "contact_phone", "contact_phone TEXT"
        )
        _add_column_if_missing(
            connection, "profils", "linkedin_url", "linkedin_url TEXT"
        )
        _add_column_if_missing(
            connection,
            "profils",
            "show_email",
            "show_email INTEGER NOT NULL DEFAULT 0 CHECK (show_email IN (0, 1))",
        )
        _add_column_if_missing(
            connection,
            "profils",
            "show_phone",
            "show_phone INTEGER NOT NULL DEFAULT 0 CHECK (show_phone IN (0, 1))",
        )
        _add_column_if_missing(
            connection,
            "profils",
            "show_linkedin",
            "show_linkedin INTEGER NOT NULL DEFAULT 0 CHECK (show_linkedin IN (0, 1))",
        )
        _add_column_if_missing(
            connection,
            "profils",
            "is_student",
            "is_student INTEGER NOT NULL DEFAULT 0 CHECK (is_student IN (0, 1))",
        )
        _add_column_if_missing(
            connection,
            "profils",
            "is_researcher",
            "is_researcher INTEGER NOT NULL DEFAULT 0 CHECK (is_researcher IN (0, 1))",
        )
        _add_column_if_missing(
            connection,
            "profils",
            "is_job_seeking",
            "is_job_seeking INTEGER NOT NULL DEFAULT 0 CHECK (is_job_seeking IN (0, 1))",
        )
        connection.execute(
            "UPDATE utilisateurs SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL"
        )
        connection.execute(
            """CREATE UNIQUE INDEX IF NOT EXISTS idx_utilisateurs_provider_identity
               ON utilisateurs(provider, provider_id)
               WHERE provider IS NOT NULL AND provider_id IS NOT NULL"""
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_etudes_alumni ON etudes(id_alumni)"
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_travail_alumni ON travail(id_alumni)"
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_projets_alumni ON projets(id_alumni)"
        )


def clean_database(connection: sqlite3.Connection) -> None:
    """Vide toutes les tables et supprime les tables obsolètes."""
    connection.execute("PRAGMA foreign_keys = OFF")
    tables_to_clear = [
        "profil_sections",
        "alumni_competences",
        "competences",
        "projets",
        "travail",
        "etudes",
        "profils",
        "utilisateurs",
        "alumnis",
        "entreprises",
        "ecoles",
    ]
    for table in tables_to_clear:
        connection.execute(f"DELETE FROM {table}")
    connection.execute(
        "DELETE FROM sqlite_sequence WHERE name IN ('alumnis', 'entreprises', 'ecoles', 'competences', 'projets')"
    )
    connection.execute("DROP TABLE IF EXISTS annuaire")
    connection.execute("DROP TABLE IF EXISTS école")
    connection.execute("DROP TABLE IF EXISTS étude")
    connection.execute("PRAGMA foreign_keys = ON")


def seed_demo_data(reset: bool = True) -> int:
    """Ajoute des données de test anonymisées pour l'annuaire MPCI.

    - Les personnes sont nommées 'Personne 1' à 'Personne 39'.
    - Les entreprises sont 'Entreprise 1' à 'Entreprise 8'.
    - Les écoles sont 'École 1' à 'École 4' et 'Université 1' à 'Université 4'.
    - Les promotions vont de 1 à 13 (exactement 3 alumni par promotion).
    - Comprend des étudiants, des chercheurs, des personnes en recherche d'emploi et des salariés.
    """
    init_db()

    # Définition des entreprises anonymisées
    companies_data = [
        (
            "Entreprise 1",
            "Marseille",
            "Spécialisée en ingénierie logicielle et systèmes",
        ),
        ("Entreprise 2", "Paris", "Technologies innovantes et conseil IT"),
        ("Entreprise 3", "Aix-en-Provence", "Cybersécurité et solutions cloud"),
        ("Entreprise 4", "Lyon", "Data science et analyse prédictive"),
        ("Entreprise 5", "Toulouse", "Aéronautique et systèmes embarqués"),
        ("Entreprise 6", "Sophia Antipolis", "Télécoms et réseaux avancés"),
        ("Entreprise 7", "Grenoble", "Recherche appliquée et microélectronique"),
        ("Entreprise 8", "Montpellier", "Intelligence artificielle et santé"),
    ]

    # Définition des écoles anonymisées
    schools_data = [
        ("École 1", "Marseille", "France", "Grande école d'ingénieurs généraliste"),
        (
            "École 2",
            "Lyon",
            "France",
            "Grande école d'ingénieurs en technologies du numérique",
        ),
        (
            "École 3",
            "Paris",
            "France",
            "Grande école spécialisée en modélisation et systèmes",
        ),
        (
            "Université 1",
            "Marseille",
            "France",
            "Université pluridisciplinaire d'excellence",
        ),
        (
            "Université 2",
            "Paris",
            "France",
            "Université de recherche en informatique et IA",
        ),
        (
            "Université 3",
            "Toulouse",
            "France",
            "Université en mathématiques et aéronautique",
        ),
        ("École 4", "Lausanne", "Suisse", "École polytechnique internationale"),
        ("Université 4", "Montréal", "Canada", "Pôle de recherche international en IA"),
    ]

    skills_list = [
        "Python",
        "SQL",
        "C++",
        "Machine Learning",
        "Cybersécurité",
        "Docker",
        "Git",
        "Mathématiques appliquées",
        "Intelligence Artificielle",
        "Deep Learning",
        "React",
        "Linux",
        "Data Visualisation",
        "Génie logiciel",
        "Cloud Computing",
    ]

    # Données des 39 alumni (3 par promotion, promo 1 à 13)
    # Format: (num, promo, job_title, company_idx, school_idx, degree, speciality, city, country, is_student, is_researcher, is_job_seeking)
    # Si job_title est None, l'alumni n'a pas d'emploi actuel (étudiant ou chômeur).
    members_spec = [
        # Promotion 1
        (
            1,
            1,
            "Directeur technique",
            1,
            1,
            "Diplôme d'ingénieur",
            "Génie logiciel",
            "Marseille",
            "France",
            0,
            0,
            0,
        ),
        (
            2,
            1,
            "Lead Data Scientist",
            4,
            2,
            "Diplôme d'ingénieur",
            "Data Science",
            "Lyon",
            "France",
            0,
            0,
            0,
        ),
        (
            3,
            1,
            "Architecte Cloud",
            3,
            4,
            "Master",
            "Informatique",
            "Aix-en-Provence",
            "France",
            0,
            0,
            0,
        ),
        # Promotion 2
        (
            4,
            2,
            "Consultant cybersécurité senior",
            3,
            5,
            "Master",
            "Cybersécurité",
            "Paris",
            "France",
            0,
            0,
            0,
        ),
        (
            5,
            2,
            "Ingénieur systèmes spatiaux",
            5,
            6,
            "Diplôme d'ingénieur",
            "Physique & Modélisation",
            "Toulouse",
            "France",
            0,
            0,
            0,
        ),
        (
            6,
            2,
            "Chef de projet IA",
            2,
            7,
            "Diplôme d'ingénieur",
            "Intelligence Artificielle",
            "Lausanne",
            "Suisse",
            0,
            0,
            0,
        ),
        # Promotion 3
        (
            7,
            3,
            "Ingénieur DevOps",
            1,
            1,
            "Diplôme d'ingénieur",
            "Informatique",
            "Marseille",
            "France",
            0,
            0,
            0,
        ),
        (
            8,
            3,
            "Chercheur en mathématiques appliquées",
            8,
            4,
            "Doctorat",
            "Mathématiques appliquées",
            "Montpellier",
            "France",
            0,
            1,
            0,
        ),
        (
            9,
            3,
            "Engineering Manager",
            2,
            3,
            "Diplôme d'ingénieur",
            "Génie logiciel",
            "Paris",
            "France",
            0,
            0,
            0,
        ),
        # Promotion 4
        (
            10,
            4,
            "Data Engineer",
            4,
            2,
            "Diplôme d'ingénieur",
            "Data Science",
            "Lyon",
            "France",
            0,
            0,
            0,
        ),
        (
            11,
            4,
            None,
            None,
            4,
            "Master",
            "Mathématiques appliquées",
            "Lyon",
            "France",
            0,
            0,
            1,
        ),  # En recherche d'emploi
        (
            12,
            4,
            "Ingénieur télécoms",
            6,
            1,
            "Diplôme d'ingénieur",
            "Informatique",
            "Sophia Antipolis",
            "France",
            0,
            0,
            0,
        ),
        # Promotion 5
        (
            13,
            5,
            "Développeur full-stack",
            1,
            1,
            "Diplôme d'ingénieur",
            "Génie logiciel",
            "Marseille",
            "France",
            0,
            0,
            0,
        ),
        (
            14,
            5,
            "Chercheur en physique numérique",
            7,
            3,
            "Doctorat",
            "Physique & Modélisation",
            "Grenoble",
            "France",
            0,
            1,
            0,
        ),
        (
            15,
            5,
            "Consultant data & IA",
            2,
            5,
            "Master",
            "Data Science",
            "Paris",
            "France",
            0,
            0,
            0,
        ),
        # Promotion 6
        (
            16,
            6,
            "Ingénieur systèmes embarqués",
            5,
            6,
            "Diplôme d'ingénieur",
            "Génie logiciel",
            "Toulouse",
            "France",
            0,
            0,
            0,
        ),
        (
            17,
            6,
            None,
            None,
            1,
            "Diplôme d'ingénieur",
            "Génie logiciel",
            "Toulouse",
            "France",
            0,
            0,
            1,
        ),  # En recherche d'emploi
        (
            18,
            6,
            "Expert cybersécurité",
            3,
            5,
            "Master",
            "Cybersécurité",
            "Aix-en-Provence",
            "France",
            0,
            0,
            0,
        ),
        # Promotion 7
        (
            19,
            7,
            "Chercheur en IA",
            2,
            8,
            "Doctorat",
            "Intelligence Artificielle",
            "Montréal",
            "Canada",
            0,
            1,
            0,
        ),
        (
            20,
            7,
            "Product Owner",
            4,
            2,
            "Diplôme d'ingénieur",
            "Informatique",
            "Lyon",
            "France",
            0,
            0,
            0,
        ),
        (
            21,
            7,
            "Ingénieur microélectronique",
            7,
            7,
            "Diplôme d'ingénieur",
            "Physique & Modélisation",
            "Grenoble",
            "France",
            0,
            0,
            0,
        ),
        # Promotion 8
        (
            22,
            8,
            "Ingénieur backend senior",
            1,
            1,
            "Diplôme d'ingénieur",
            "Génie logiciel",
            "Marseille",
            "France",
            0,
            0,
            0,
        ),
        (
            23,
            8,
            None,
            None,
            4,
            "Master",
            "Informatique",
            "Marseille",
            "France",
            0,
            0,
            1,
        ),  # En recherche d'emploi
        (
            24,
            8,
            "Data Scientist",
            8,
            4,
            "Master",
            "Data Science",
            "Montpellier",
            "France",
            0,
            0,
            0,
        ),
        # Promotion 9
        (
            25,
            9,
            "Ingénieur MLOps",
            2,
            5,
            "Master",
            "Intelligence Artificielle",
            "Paris",
            "France",
            0,
            0,
            0,
        ),
        (
            26,
            9,
            None,
            None,
            5,
            "Doctorat",
            "Mathématiques appliquées",
            "Paris",
            "France",
            1,
            1,
            0,
        ),  # Étudiant & Chercheur (Doctorat)
        (
            27,
            9,
            "Ingénieur cloud",
            6,
            1,
            "Diplôme d'ingénieur",
            "Informatique",
            "Sophia Antipolis",
            "France",
            0,
            0,
            0,
        ),
        # Promotion 10
        (
            28,
            10,
            "Ingénieur sécurité applicative",
            3,
            1,
            "Diplôme d'ingénieur",
            "Cybersécurité",
            "Aix-en-Provence",
            "France",
            0,
            0,
            0,
        ),
        (
            29,
            10,
            None,
            None,
            4,
            "Doctorat",
            "Informatique",
            "Marseille",
            "France",
            1,
            1,
            0,
        ),  # Étudiante & Chercheuse (Doctorat)
        (
            30,
            10,
            "Chercheur postdoctoral en IA",
            2,
            5,
            "Doctorat",
            "Intelligence Artificielle",
            "Paris",
            "France",
            0,
            1,
            0,
        ),
        # Promotion 11
        (
            31,
            11,
            None,
            None,
            7,
            "Diplôme d'ingénieur",
            "Informatique",
            "Lausanne",
            "Suisse",
            1,
            0,
            0,
        ),  # Étudiant (École d'ingénieurs)
        (
            32,
            11,
            None,
            None,
            5,
            "Master",
            "Cybersécurité",
            "Paris",
            "France",
            0,
            0,
            1,
        ),  # En recherche d'emploi
        (
            33,
            11,
            None,
            None,
            6,
            "Master",
            "Data Science",
            "Toulouse",
            "France",
            0,
            0,
            1,
        ),  # En recherche d'emploi
        # Promotion 12
        (
            34,
            12,
            None,
            None,
            2,
            "Diplôme d'ingénieur",
            "Génie logiciel",
            "Lyon",
            "France",
            1,
            0,
            0,
        ),  # Étudiant
        (
            35,
            12,
            None,
            None,
            8,
            "Master",
            "Data Science",
            "Montréal",
            "Canada",
            1,
            0,
            0,
        ),  # Étudiante
        (
            36,
            12,
            None,
            None,
            1,
            "Diplôme d'ingénieur",
            "Informatique",
            "Aix-en-Provence",
            "France",
            0,
            0,
            1,
        ),  # En recherche d'emploi
        # Promotion 13
        (
            37,
            13,
            None,
            None,
            4,
            "Master",
            "Informatique",
            "Marseille",
            "France",
            1,
            0,
            0,
        ),  # Étudiant (Master 1)
        (
            38,
            13,
            None,
            None,
            1,
            "Diplôme d'ingénieur",
            "Mathématiques appliquées",
            "Marseille",
            "France",
            1,
            0,
            0,
        ),  # Étudiante (École d'ingénieurs)
        (
            39,
            13,
            None,
            None,
            5,
            "Master",
            "Intelligence Artificielle",
            "Paris",
            "France",
            1,
            0,
            0,
        ),  # Étudiant (Master)
    ]

    with get_connection() as connection:
        if reset:
            clean_database(connection)

        # Insertion des entreprises
        company_ids = {}
        for name, city, desc in companies_data:
            cursor = connection.execute(
                "INSERT INTO entreprises (name, city, description) VALUES (?, ?, ?)",
                (name, city, desc),
            )
            company_ids[name] = cursor.lastrowid

        # Insertion des écoles
        school_ids = {}
        for name, city, country, desc in schools_data:
            cursor = connection.execute(
                "INSERT INTO ecoles (name, city, country, description) VALUES (?, ?, ?, ?)",
                (name, city, country, desc),
            )
            school_ids[name] = cursor.lastrowid

        # Insertion des compétences
        skill_ids = {}
        for skill in skills_list:
            cursor = connection.execute(
                "INSERT INTO competences (name) VALUES (?)",
                (skill,),
            )
            skill_ids[skill] = cursor.lastrowid

        added_members = 0

        # Insertion des membres
        for (
            num,
            promo,
            job,
            comp_idx,
            school_idx,
            degree,
            speciality,
            city,
            country,
            is_stud,
            is_res,
            is_job_seek,
        ) in members_spec:
            firstname = "Personne"
            name = str(num)

            cursor = connection.execute(
                "INSERT INTO alumnis (name, firstname, promo) VALUES (?, ?, ?)",
                (name, firstname, promo),
            )
            alumni_id = cursor.lastrowid
            added_members += 1

            # Emploi actuel si défini
            if job and comp_idx:
                comp_name = f"Entreprise {comp_idx}"
                connection.execute(
                    """INSERT INTO travail (id_alumni, id_corp, start_date, job)
                       VALUES (?, ?, ?, ?)""",
                    (alumni_id, company_ids[comp_name], "2024-01-15", job),
                )
            elif is_job_seek and num in (17, 23):
                # Ancien emploi terminé pour deux des chômeurs pour montrer l'historique
                comp_name = "Entreprise 5" if num == 17 else "Entreprise 3"
                connection.execute(
                    """INSERT INTO travail (id_alumni, id_corp, start_date, end_date, job)
                       VALUES (?, ?, ?, ?, ?)""",
                    (
                        alumni_id,
                        company_ids[comp_name],
                        "2020-09-01",
                        "2024-06-30",
                        "Ancien poste d'ingénieur",
                    ),
                )
            elif is_stud and num == 34:
                # Ancien stage d'été pour l'étudiant 34
                connection.execute(
                    """INSERT INTO travail (id_alumni, id_corp, start_date, end_date, job)
                       VALUES (?, ?, ?, ?, ?)""",
                    (
                        alumni_id,
                        company_ids["Entreprise 4"],
                        "2025-05-01",
                        "2025-08-31",
                        "Stagiaire R&D",
                    ),
                )

            # Profil
            bio = (
                f"Alumni MPCI, promotion {promo}. Passionné(e) par les sciences et le numérique."
                if num > 1
                else "Directeur technique et diplômé MPCI, spécialisé dans l'architecture logicielle "
                "et le passage à l'échelle. Toujours ravi d'échanger avec les promotions du cursus."
            )
            email = f"personne{num}@exemple.fr"
            phone = f"+33 6 00 00 {num:02d} {num:02d}"
            linkedin = f"https://linkedin.com/in/personne-{num}"

            connection.execute(
                """INSERT INTO profils (
                    id_alumni, bio, city, country, contact_email, contact_phone, linkedin_url,
                    show_email, show_phone, show_linkedin, is_student, is_researcher, is_job_seeking
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    alumni_id,
                    bio,
                    city,
                    country,
                    email,
                    phone,
                    linkedin,
                    1,
                    1 if num % 2 == 1 else 0,
                    1 if num % 3 != 0 else 0,
                    is_stud,
                    is_res,
                    is_job_seek,
                ),
            )

            # Sections du profil
            for position, section_type in enumerate(
                ("about", "jobs", "studies", "skills", "projects"), start=1
            ):
                connection.execute(
                    """INSERT INTO profil_sections (id_alumni, section_type, position)
                       VALUES (?, ?, ?)""",
                    (alumni_id, section_type, position),
                )

            # Études
            school_name = schools_data[school_idx - 1][0]
            start_study = 2010 + promo + 3
            end_study = start_study + (
                3 if degree == "Doctorat" else (2 if degree == "Master" else 3)
            )
            end_study_str = str(end_study) if not is_stud else None

            connection.execute(
                """INSERT INTO etudes (id_alumni, id_school, start_date, end_date, speciality, degree)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (
                    alumni_id,
                    school_ids[school_name],
                    str(start_study),
                    end_study_str,
                    speciality,
                    degree,
                ),
            )

            # Compétences associées (3 compétences par personne)
            selected_skills = [
                skills_list[(num * 3 + offset) % len(skills_list)]
                for offset in range(3)
            ]
            for order, sk in enumerate(selected_skills, start=1):
                connection.execute(
                    """INSERT INTO alumni_competences (id_alumni, id_skill, display_order)
                       VALUES (?, ?, ?)""",
                    (alumni_id, skill_ids[sk], order),
                )

            # Projet
            project_title = f"Projet applicatif {num}"
            project_desc = f"Développement d'une solution de modélisation et analyse en {speciality}."
            connection.execute(
                """INSERT INTO projets (id_alumni, title, description, display_order)
                   VALUES (?, ?, ?, ?)""",
                (alumni_id, project_title, project_desc, 1),
            )

    return added_members


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Initialise la base Alumni MPCI.")
    parser.add_argument(
        "--demo",
        action="store_true",
        help="ajoute des membres fictifs pour prévisualiser l'annuaire",
    )
    parser.add_argument(
        "--keep-existing",
        action="store_true",
        help="ne supprime pas les données existantes avant d'injecter la démo",
    )
    arguments = parser.parse_args()
    init_db()
    if arguments.demo:
        added = seed_demo_data(reset=not arguments.keep_existing)
        print(f"{added} membre(s) fictif(s) anonymisé(s) ajouté(s).")
    print(f"Base de données initialisée : {DB_PATH}")

import sqlite3

from flask import Flask, abort, jsonify
from flask_cors import CORS

from manual_database import get_connection, init_db

app = Flask(__name__)
CORS(app)

SECTION_LABELS = {
    "about": "À propos",
    "jobs": "Expériences professionnelles",
    "studies": "Formation",
    "skills": "Compétences",
    "projects": "Projets",
}


@app.route("/api/alumni", methods=["GET"])
def get_alumni():
    """Retourne les alumni et leur emploi actuel éventuel."""
    with get_connection() as connection:
        connection.row_factory = sqlite3.Row
        rows = connection.execute("""
            SELECT alumni.id_alumni, alumni.name, alumni.firstname, alumni.promo,
                   company.name AS company_name, job.job AS job_title,
                   profile.city, profile.country, profile.is_student,
                   profile.is_researcher, profile.is_job_seeking,
                   school.name AS school_name, study.degree, study.speciality
            FROM alumnis AS alumni
            LEFT JOIN profils AS profile ON profile.id_alumni = alumni.id_alumni
            LEFT JOIN travail AS job ON job.id_travail = (
                SELECT current_job.id_travail
                FROM travail AS current_job
                WHERE current_job.id_alumni = alumni.id_alumni
                  AND current_job.end_date IS NULL
                ORDER BY current_job.start_date DESC, current_job.id_travail DESC
                LIMIT 1
            )
            LEFT JOIN entreprises AS company ON company.id_corp = job.id_corp
            LEFT JOIN etudes AS study ON study.id_etude = (
                SELECT latest_study.id_etude
                FROM etudes AS latest_study
                WHERE latest_study.id_alumni = alumni.id_alumni
                ORDER BY latest_study.end_date IS NULL DESC,
                         latest_study.end_date DESC,
                         latest_study.start_date DESC,
                         latest_study.id_etude DESC
                LIMIT 1
            )
            LEFT JOIN ecoles AS school ON school.id_school = study.id_school
            ORDER BY CAST(alumni.name AS INTEGER), alumni.name COLLATE NOCASE, alumni.firstname COLLATE NOCASE
            """).fetchall()

    return jsonify(
        [
            {
                "id": row["id_alumni"],
                "nom": row["name"],
                "prenom": row["firstname"],
                "promo": row["promo"],
                "emploi": (
                    {"poste": row["job_title"], "entreprise": row["company_name"]}
                    if row["job_title"] or row["company_name"]
                    else None
                ),
                "formation": (
                    {
                        "ecole": row["school_name"],
                        "diplome": row["degree"],
                        "domaine": row["speciality"],
                    }
                    if row["school_name"] or row["degree"] or row["speciality"]
                    else None
                ),
                "ville": row["city"],
                "pays": row["country"],
                "statuts": {
                    "etudiant": bool(row["is_student"]),
                    "chercheur": bool(row["is_researcher"]),
                    "recherche_emploi": bool(row["is_job_seeking"]),
                },
            }
            for row in rows
        ]
    )


@app.route("/api/alumni/<int:alumni_id>", methods=["GET"])
def get_alumni_profile(alumni_id):
    """Retourne les sections publiques d'un profil alumni, dans leur ordre choisi."""
    with get_connection() as connection:
        connection.row_factory = sqlite3.Row
        member = connection.execute(
            """
            SELECT alumni.id_alumni, alumni.name, alumni.firstname, alumni.promo,
                   profile.bio, profile.city, profile.avatar_url,
                   profile.contact_email, profile.contact_phone, profile.linkedin_url,
                   profile.show_email, profile.show_phone, profile.show_linkedin
            FROM alumnis AS alumni
            LEFT JOIN profils AS profile ON profile.id_alumni = alumni.id_alumni
            WHERE alumni.id_alumni = ?
            """,
            (alumni_id,),
        ).fetchone()
        if member is None:
            abort(404, description="Profil alumni introuvable.")

        sections = connection.execute(
            """SELECT section_type, position, is_visible
               FROM profil_sections WHERE id_alumni = ?""",
            (alumni_id,),
        ).fetchall()
        section_settings = {
            row["section_type"]: {
                "position": row["position"],
                "is_visible": row["is_visible"],
            }
            for row in sections
        }

        jobs = connection.execute(
            """SELECT job.job, job.start_date, job.end_date, company.name AS company
               FROM travail AS job
               JOIN entreprises AS company ON company.id_corp = job.id_corp
               WHERE job.id_alumni = ? AND job.is_visible = 1
               ORDER BY job.display_order, job.end_date IS NULL DESC, job.start_date DESC""",
            (alumni_id,),
        ).fetchall()
        studies = connection.execute(
            """SELECT study.speciality, study.start_date, study.end_date, school.name AS school
               FROM etudes AS study
               JOIN ecoles AS school ON school.id_school = study.id_school
               WHERE study.id_alumni = ? AND study.is_visible = 1
               ORDER BY study.display_order, study.end_date IS NULL DESC, study.start_date DESC""",
            (alumni_id,),
        ).fetchall()
        skills = connection.execute(
            """SELECT skill.name FROM alumni_competences AS alumni_skill
               JOIN competences AS skill ON skill.id_skill = alumni_skill.id_skill
               WHERE alumni_skill.id_alumni = ? AND alumni_skill.is_visible = 1
               ORDER BY alumni_skill.display_order, skill.name COLLATE NOCASE""",
            (alumni_id,),
        ).fetchall()
        projects = connection.execute(
            """SELECT title, description, url FROM projets
               WHERE id_alumni = ? AND is_visible = 1
               ORDER BY display_order, id_project""",
            (alumni_id,),
        ).fetchall()

    section_data = {
        "about": member["bio"],
        "jobs": [dict(row) for row in jobs],
        "studies": [dict(row) for row in studies],
        "skills": [row["name"] for row in skills],
        "projects": [dict(row) for row in projects],
    }
    current_job = next((dict(job) for job in jobs if job["end_date"] is None), None)
    public_sections = []
    for default_position, section_type in enumerate(SECTION_LABELS, start=1):
        setting = section_settings.get(
            section_type, {"position": default_position, "is_visible": 1}
        )
        content = section_data[section_type]
        if setting["is_visible"] and content:
            public_sections.append(
                {
                    "type": section_type,
                    "title": SECTION_LABELS[section_type],
                    "position": setting["position"],
                    "content": content,
                }
            )

    public_sections.sort(key=lambda section: section["position"])
    return jsonify(
        {
            "id": member["id_alumni"],
            "nom": member["name"],
            "prenom": member["firstname"],
            "promo": member["promo"],
            "ville": member["city"],
            "avatar_url": member["avatar_url"],
            "emploi_actuel": current_job,
            "coordonnees": {
                "email": member["contact_email"] if member["show_email"] else None,
                "telephone": member["contact_phone"] if member["show_phone"] else None,
                "linkedin": member["linkedin_url"] if member["show_linkedin"] else None,
            },
            "sections": public_sections,
        }
    )


if __name__ == "__main__":
    init_db()
    app.run(port=5000, debug=True)

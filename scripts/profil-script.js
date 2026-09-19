const ALUMNI_PROFILE_API_URL = "http://127.0.0.1:5000/api/alumni/";

function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
}

function formatPeriod(startDate, endDate) {
    if (!startDate && !endDate) return "";
    return `${startDate || ""} — ${endDate || "Aujourd’hui"}`.trim();
}

function renderTimeline(items, headingKey, organizationKey) {
    const list = createElement("div", "profile-timeline");
    items.forEach((item) => {
        const entry = createElement("article", "profile-timeline-item");
        entry.appendChild(createElement("h3", "profile-item-title", item[headingKey]));
        entry.appendChild(createElement("p", "profile-item-organization", item[organizationKey]));
        const period = formatPeriod(item.start_date, item.end_date);
        if (period) entry.appendChild(createElement("p", "profile-item-period", period));
        list.appendChild(entry);
    });
    return list;
}

function renderSection(section) {
    const container = createElement("section", "profile-section");
    container.appendChild(createElement("h2", "profile-section-title", section.title));

    if (section.type === "about") {
        container.appendChild(createElement("p", "profile-bio", section.content));
    } else if (section.type === "jobs") {
        container.appendChild(renderTimeline(section.content, "job", "company"));
    } else if (section.type === "studies") {
        container.appendChild(renderTimeline(section.content, "speciality", "school"));
    } else if (section.type === "skills") {
        const skills = createElement("ul", "profile-skills");
        section.content.forEach((skill) => skills.appendChild(createElement("li", "profile-skill", skill)));
        container.appendChild(skills);
    } else if (section.type === "projects") {
        const projects = createElement("div", "profile-projects");
        section.content.forEach((project) => {
            const item = createElement("article", "profile-project");
            item.appendChild(createElement("h3", "profile-item-title", project.title));
            if (project.description) item.appendChild(createElement("p", "profile-project-description", project.description));
            if (project.url) {
                const link = createElement("a", "profile-project-link", "Voir le projet");
                link.href = project.url;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                item.appendChild(link);
            }
            projects.appendChild(item);
        });
        container.appendChild(projects);
    }

    return container;
}

function renderProfile(profile) {
    const content = document.getElementById("profile-content");
    if (!content) return;

    content.replaceChildren();
    content.setAttribute("aria-busy", "false");

    const backLink = createElement("a", "profile-back", "← Retour à l’annuaire");
    backLink.href = "annuaire.html";
    content.appendChild(backLink);

    // Conteneur unique du bandeau : bannière en haut, identité à gauche et coordonnées à droite
    const headerCard = createElement("div", "profile-header-card");
    headerCard.appendChild(createElement("div", "profile-banner"));

    const overview = createElement("header", "profile-overview");

    // Bloc gauche : Avatar et Identité
    const mainInfo = createElement("div", "profile-overview-main");
    const avatar = createElement("div", "profile-avatar", `${profile.prenom?.[0] || ""}${profile.nom?.[0] || ""}`.toUpperCase());
    avatar.setAttribute("aria-hidden", "true");
    mainInfo.appendChild(avatar);

    const identity = createElement("div", "profile-identity");
    identity.appendChild(createElement("h1", "profile-name", `${profile.prenom} ${profile.nom}`));
    if (profile.promo !== null && profile.promo !== undefined) {
        identity.appendChild(createElement("p", "profile-promo", `Promotion ${profile.promo}`));
    }
    if (profile.emploi_actuel?.job) {
        const jobP = createElement("p", "profile-current-job", profile.emploi_actuel.job);
        if (profile.emploi_actuel?.company) {
            jobP.textContent = `${profile.emploi_actuel.job} chez ${profile.emploi_actuel.company}`;
        }
        identity.appendChild(jobP);
    } else if (profile.emploi_actuel?.company) {
        identity.appendChild(createElement("p", "profile-current-company", profile.emploi_actuel.company));
    }
    if (profile.ville) identity.appendChild(createElement("p", "profile-city", profile.ville));
    mainInfo.appendChild(identity);
    overview.appendChild(mainInfo);

    // Bloc droit : Coordonnées dans le même bandeau du côté droit
    const contacts = Object.entries(profile.coordonnees || {}).filter(([, value]) => value);
    if (contacts.length > 0) {
        const contactBox = createElement("div", "profile-overview-contact");
        const contactList = createElement("ul", "profile-contact-list");
        const icons = {
            email: "fa-solid fa-envelope",
            telephone: "fa-solid fa-phone",
            linkedin: "fa-brands fa-linkedin"
        };

        contacts.forEach(([type, value]) => {
            const item = createElement("li", "profile-contact-item");
            const icon = createElement("i", icons[type] || "fa-solid fa-link");
            icon.setAttribute("aria-hidden", "true");
            item.appendChild(icon);

            const link = createElement("a", "profile-contact-link", type === "linkedin" && value.startsWith("http") ? "LinkedIn" : value);
            link.href = type === "email" ? `mailto:${value}` : type === "telephone" ? `tel:${value}` : value;
            if (type === "linkedin") {
                link.target = "_blank";
                link.rel = "noopener noreferrer";
            }
            item.appendChild(link);
            contactList.appendChild(item);
        });
        contactBox.appendChild(contactList);
        overview.appendChild(contactBox);
    }

    headerCard.appendChild(overview);
    content.appendChild(headerCard);

    profile.sections.forEach((section) => content.appendChild(renderSection(section)));
}

async function initProfil() {
    const content = document.getElementById("profile-content");
    if (!content || content.dataset.initialized === "true") return;
    content.dataset.initialized = "true";

    const alumniId = new URLSearchParams(window.location.search).get("id");
    if (!alumniId || !/^\d+$/.test(alumniId)) {
        content.textContent = "Profil introuvable.";
        content.setAttribute("aria-busy", "false");
        return;
    }

    try {
        const response = await fetch(`${ALUMNI_PROFILE_API_URL}${alumniId}`);
        if (!response.ok) throw new Error(`Réponse HTTP ${response.status}`);
        renderProfile(await response.json());
    } catch (error) {
        console.error("Erreur de chargement du profil :", error);
        content.textContent = "Ce profil est momentanément indisponible.";
        content.setAttribute("aria-busy", "false");
    }
}

window.initProfil = initProfil;
document.addEventListener("DOMContentLoaded", initProfil);
document.addEventListener("page:loaded", initProfil);

const ALUMNI_API_URL = "http://127.0.0.1:5000/api/alumni";

let alumni = [];

function normalize(value) {
    return (value || "")
        .toLocaleLowerCase("fr")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function createAlumniCard(member) {
    const card = document.createElement("a");
    card.className = "alumni-row";
    card.href = `profil.html?id=${member.id}`;

    // Avatar circulaire avec initiales
    const avatar = document.createElement("div");
    avatar.className = "alumni-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = `${member.prenom?.[0] || ""}${member.nom?.[0] || ""}`.toUpperCase();
    card.appendChild(avatar);

    const identity = document.createElement("div");
    identity.className = "alumni-identity";

    // En-tête : Nom & Badges de statut
    const topRow = document.createElement("div");
    topRow.className = "alumni-top-row";

    const name = document.createElement("h3");
    name.className = "alumni-card-name";
    name.textContent = `${member.prenom} ${member.nom}`;
    topRow.appendChild(name);

    if (member.statuts) {
        const badgesContainer = document.createElement("div");
        badgesContainer.className = "alumni-badges";

        if (member.statuts.etudiant) {
            const b = document.createElement("span");
            b.className = "status-badge badge-student";
            b.textContent = "Étudiant";
            badgesContainer.appendChild(b);
        }
        if (member.statuts.recherche_emploi) {
            const b = document.createElement("span");
            b.className = "status-badge badge-job-seeking";
            b.textContent = "En recherche d'emploi";
            badgesContainer.appendChild(b);
        }
        if (badgesContainer.children.length > 0) {
            topRow.appendChild(badgesContainer);
        }
    }
    identity.appendChild(topRow);

    // Activité principale (Poste / Entreprise ou Formation)
    if (member.emploi?.poste || member.emploi?.entreprise) {
        const job = document.createElement("p");
        job.className = "alumni-card-job";
        const parts = [];
        if (member.emploi.poste) parts.push(member.emploi.poste);
        if (member.emploi.entreprise) {
            parts.push(parts.length > 0 ? `chez ${member.emploi.entreprise}` : member.emploi.entreprise);
        }
        job.textContent = parts.join(" ");
        identity.appendChild(job);
    } else if (member.formation?.diplome || member.formation?.ecole || member.formation?.domaine) {
        const study = document.createElement("p");
        study.className = "alumni-card-study";
        const studyParts = [member.formation.diplome, member.formation.domaine, member.formation.ecole].filter(Boolean);
        study.textContent = studyParts.join(" · ");
        identity.appendChild(study);
    }

    // Ligne métadonnées (Promotion, École, Localisation)
    const metaRow = document.createElement("div");
    metaRow.className = "alumni-card-meta";

    if (member.promo !== null && member.promo !== undefined) {
        const promo = document.createElement("span");
        promo.className = "alumni-card-promo";
        promo.textContent = `Promotion ${member.promo}`;
        metaRow.appendChild(promo);
    }

    if (member.emploi?.poste && (member.formation?.ecole || member.formation?.diplome)) {
        const schoolMeta = document.createElement("span");
        schoolMeta.className = "alumni-card-school";
        schoolMeta.textContent = ` · ${member.formation.ecole || member.formation.diplome}`;
        metaRow.appendChild(schoolMeta);
    }

    if (member.ville || member.pays) {
        const location = document.createElement("span");
        location.className = "alumni-card-location";
        const locText = [member.ville, member.pays].filter(Boolean).join(", ");
        location.innerHTML = ` · <i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${locText}`;
        metaRow.appendChild(location);
    }

    if (metaRow.children.length > 0) {
        identity.appendChild(metaRow);
    }

    card.appendChild(identity);
    return card;
}

function renderAlumni(members) {
    const list = document.getElementById("alumni-list");
    const count = document.getElementById("directory-count");
    if (!list || !count) return;

    list.replaceChildren();
    list.setAttribute("aria-busy", "false");
    count.textContent = `${members.length} membre${members.length > 1 ? "s" : ""}`;

    if (members.length === 0) {
        const message = document.createElement("p");
        message.className = "directory-message";
        message.textContent = "Aucun membre ne correspond à votre recherche.";
        list.appendChild(message);
        return;
    }

    members.forEach((member) => list.appendChild(createAlumniCard(member)));
}

function filterAlumni(query) {
    const normalizedQuery = normalize(query.trim());
    const promoFilter = document.getElementById("alumni-promo-filter")?.value || "";
    const companyFilter = document.getElementById("alumni-company-filter")?.value || "";
    const schoolFilter = document.getElementById("alumni-school-filter")?.value || "";
    const degreeFilter = document.getElementById("alumni-degree-filter")?.value || "";
    const domainFilter = document.getElementById("alumni-domain-filter")?.value || "";
    const cityFilter = document.getElementById("alumni-city-filter")?.value || "";
    const countryFilter = document.getElementById("alumni-country-filter")?.value || "";

    const isStudent = Boolean(document.getElementById("filter-status-student")?.checked);
    const isJobSeeking = Boolean(document.getElementById("filter-status-job-seeking")?.checked);

    return alumni.filter((member) => {
        // Recherche textuelle libre
        const searchableContent = [
            member.nom,
            member.prenom,
            `${member.prenom} ${member.nom}`,
            `${member.nom} ${member.prenom}`,
            member.promo?.toString(),
            member.emploi?.poste,
            member.emploi?.entreprise,
            member.formation?.ecole,
            member.formation?.diplome,
            member.formation?.domaine,
            member.ville,
            member.pays,
        ].map(normalize).join(" ");

        const matchesQuery = !normalizedQuery || searchableContent.includes(normalizedQuery);

        // Filtres dropdowns
        const matchesPromo = !promoFilter || member.promo?.toString() === promoFilter;
        const matchesCompany = !companyFilter || member.emploi?.entreprise === companyFilter;
        const matchesSchool = !schoolFilter || member.formation?.ecole === schoolFilter;
        const matchesDegree = !degreeFilter || member.formation?.diplome === degreeFilter;
        const matchesDomain = !domainFilter || member.formation?.domaine === domainFilter;
        const matchesCity = !cityFilter || member.ville === cityFilter;
        const matchesCountry = !countryFilter || member.pays === countryFilter;

        // Filtres checkboxes
        const matchesStudent = !isStudent || Boolean(member.statuts?.etudiant);
        const matchesJobSeeking = !isJobSeeking || Boolean(member.statuts?.recherche_emploi);

        return matchesQuery
            && matchesPromo
            && matchesCompany
            && matchesSchool
            && matchesDegree
            && matchesDomain
            && matchesCity
            && matchesCountry
            && matchesStudent
            && matchesJobSeeking;
    });
}

function sortAlumni(members) {
    const sort = document.getElementById("alumni-sort")?.value || "name";
    return [...members].sort((first, second) => {
        if (sort === "promo-desc") return (second.promo || 0) - (first.promo || 0);
        if (sort === "promo-asc") return (first.promo || Number.MAX_SAFE_INTEGER) - (second.promo || Number.MAX_SAFE_INTEGER);
        return `${first.nom} ${first.prenom}`.localeCompare(`${second.nom} ${second.prenom}`, "fr", { numeric: true });
    });
}

function updateActiveFiltersCount() {
    const filterIds = [
        "alumni-promo-filter",
        "alumni-company-filter",
        "alumni-school-filter",
        "alumni-degree-filter",
        "alumni-domain-filter",
        "alumni-city-filter",
        "alumni-country-filter",
    ];

    let activeCount = 0;
    filterIds.forEach((id) => {
        if (document.getElementById(id)?.value) activeCount++;
    });

    ["filter-status-student", "filter-status-job-seeking"].forEach((id) => {
        if (document.getElementById(id)?.checked) activeCount++;
    });

    const badge = document.getElementById("filters-badge");
    const toggleBtn = document.getElementById("toggle-filters-btn");

    if (badge) {
        if (activeCount > 0) {
            badge.textContent = activeCount;
            badge.style.display = "inline-flex";
        } else {
            badge.style.display = "none";
        }
    }

    if (toggleBtn) {
        toggleBtn.classList.toggle("has-active-filters", activeCount > 0);
    }
}

function updateDirectory() {
    const search = document.getElementById("alumni-search");
    const filtered = filterAlumni(search?.value || "");
    renderAlumni(sortAlumni(filtered));
    updateActiveFiltersCount();
}

function populateSelect(selectId, values, defaultLabel) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.replaceChildren(new Option(defaultLabel, ""));
    values.forEach((item) => {
        if (typeof item === "object" && item !== null) {
            select.add(new Option(item.label, item.value));
        } else {
            select.add(new Option(item, item));
        }
    });
}

function populateFilters() {
    const promotions = [...new Set(alumni.map((m) => m.promo).filter((p) => p !== null && p !== undefined))]
        .sort((a, b) => b - a)
        .map((p) => ({ label: `Promotion ${p}`, value: String(p) }));

    const companies = [...new Set(alumni.map((m) => m.emploi?.entreprise).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, "fr", { numeric: true }));

    const schools = [...new Set(alumni.map((m) => m.formation?.ecole).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, "fr", { numeric: true }));

    const degrees = [...new Set(alumni.map((m) => m.formation?.diplome).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, "fr", { numeric: true }));

    const domains = [...new Set(alumni.map((m) => m.formation?.domaine).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, "fr", { numeric: true }));

    const cities = [...new Set(alumni.map((m) => m.ville).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, "fr", { numeric: true }));

    const countries = [...new Set(alumni.map((m) => m.pays).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, "fr", { numeric: true }));

    populateSelect("alumni-promo-filter", promotions, "Toutes");
    populateSelect("alumni-company-filter", companies, "Toutes");
    populateSelect("alumni-school-filter", schools, "Toutes");
    populateSelect("alumni-degree-filter", degrees, "Tous");
    populateSelect("alumni-domain-filter", domains, "Tous");
    populateSelect("alumni-city-filter", cities, "Toutes");
    populateSelect("alumni-country-filter", countries, "Tous");
}

function resetAllFilters() {
    const filterIds = [
        "alumni-promo-filter",
        "alumni-company-filter",
        "alumni-school-filter",
        "alumni-degree-filter",
        "alumni-domain-filter",
        "alumni-city-filter",
        "alumni-country-filter",
    ];

    filterIds.forEach((id) => {
        const select = document.getElementById(id);
        if (select) select.value = "";
    });

    ["filter-status-student", "filter-status-job-seeking"].forEach((id) => {
        const checkbox = document.getElementById(id);
        if (checkbox) checkbox.checked = false;
    });

    updateDirectory();
}

function toggleFiltersPanel(forceState) {
    const panel = document.getElementById("filters-panel");
    const toggleBtn = document.getElementById("toggle-filters-btn");
    if (!panel || !toggleBtn) return;

    const shouldOpen = forceState !== undefined ? forceState : panel.hidden;

    panel.hidden = !shouldOpen;
    toggleBtn.classList.toggle("is-open", shouldOpen);
    toggleBtn.setAttribute("aria-expanded", String(shouldOpen));
}

async function chargerAlumni() {
    const list = document.getElementById("alumni-list");
    const count = document.getElementById("directory-count");
    if (!list || !count) return;

    try {
        const response = await fetch(ALUMNI_API_URL);
        if (!response.ok) throw new Error(`Réponse HTTP ${response.status}`);

        alumni = await response.json();
        populateFilters();
        updateDirectory();
    } catch (error) {
        console.error("Erreur de connexion à l'API :", error);
        list.setAttribute("aria-busy", "false");
        list.replaceChildren();
        const message = document.createElement("p");
        message.className = "directory-message directory-message-error";
        message.textContent = "L'annuaire est momentanément indisponible. Réessayez dans un instant.";
        list.appendChild(message);
        count.textContent = "";
    }
}

function initAnnuaire() {
    const search = document.getElementById("alumni-search");
    if (!search || search.dataset.initialized === "true") return;

    search.dataset.initialized = "true";

    // Recherche et tri
    search.addEventListener("input", updateDirectory);
    document.getElementById("alumni-sort")?.addEventListener("change", updateDirectory);

    // Bouton pour afficher/masquer le panneau de filtres
    const toggleBtn = document.getElementById("toggle-filters-btn");
    toggleBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFiltersPanel();
    });

    // Filtres sélecteurs
    const filterIds = [
        "alumni-promo-filter",
        "alumni-company-filter",
        "alumni-school-filter",
        "alumni-degree-filter",
        "alumni-domain-filter",
        "alumni-city-filter",
        "alumni-country-filter",
    ];
    filterIds.forEach((id) => {
        document.getElementById(id)?.addEventListener("change", updateDirectory);
    });

    // Filtres cases à cocher
    ["filter-status-student", "filter-status-job-seeking"].forEach((id) => {
        document.getElementById(id)?.addEventListener("change", updateDirectory);
    });

    // Bouton de réinitialisation
    document.getElementById("reset-alumni-filters")?.addEventListener("click", resetAllFilters);

    // Fermeture du panneau en cliquant en dehors
    document.addEventListener("click", (e) => {
        const panel = document.getElementById("filters-panel");
        const toggleBtn = document.getElementById("toggle-filters-btn");
        if (panel && !panel.hidden && !panel.contains(e.target) && !toggleBtn.contains(e.target)) {
            toggleFiltersPanel(false);
        }
    });

    // Fermeture du panneau avec la touche Échap
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            const panel = document.getElementById("filters-panel");
            if (panel && !panel.hidden) {
                toggleFiltersPanel(false);
            }
        }
    });

    // Chargement initial des données
    chargerAlumni();
}

window.initAnnuaire = initAnnuaire;
document.addEventListener("DOMContentLoaded", initAnnuaire);
document.addEventListener("page:loaded", initAnnuaire);

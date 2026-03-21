/**
 * scripts/main-script.js
 */

/**
 * Charge le Header, injecte les données du menu et initialise les événements.
 */
// Modifie tes fonctions de chargement existantes :
function loadHeader() {
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
            // --- Configuration des données du menu ---
            const menuData = [
                {  
                    title: 'Faire un don',
                    url: '#1',
                    links: []
                },
                {  
                    title: 'Réseau',
                    url: 'reseau.html',
                    links: [
                        { text: "Annuaires", href: 'annuaire.html' },
                        { text: "Contacts Entreprises", href: 'entreprises.html' },
                        { text: "Carte des Alumnis", href: 'carte.html' }
                    ]
                },
                {
                    title: 'Événements',
                    url: '#3',
                    links: [
                        { text: "Événements de l'association", href: '#' },
                        { text: 'Actus MPCI', href: '#' },
                        { text: 'Réussites d\'alumni', href: '#' }
                    ]
                },
                {
                    title: 'Carrière',
                    url: '#4',
                    links: [
                        { text: 'Offres de stage/emploi', href: '#' },
                        { text: 'Espace recruteur', href: '#' },
                        { text: 'Témoignage Métiers', href: '#' }
                    ]
                },
                {
                    title: "L'association",
                    url: '#5',
                    links: [
                        { text: 'Le bureau', href: '#' },
                        { text: "Petit mot sur l'asso", href: '#' },
                        { text: 'Contacts', href: '#' }
                    ]
                }
            ];

            initMobileMenu(menuData);
        })
        .catch(err => console.error("Erreur Header :", err));
}

/**
 * Génère dynamiquement le menu mobile et gère les interactions (ouverture/fermeture).
 * @param {Array} menuData - Liste des catégories et liens du menu.
 */
function initMobileMenu(menuData) {
    const mobileMenu = document.getElementById('mobile-menu');
    const menuBtn = document.getElementById('list-btn');

    if (!mobileMenu) return;

    // Génération du contenu HTML du menu
    mobileMenu.innerHTML = ''; // Nettoyage préalable

    menuData.forEach(section => {
        // Conteneur de la ligne (Titre + Icône)
        const buttonWrap = document.createElement('div');
        buttonWrap.className = 'mobile-dropdown-button';

        // Lien de titre de section
        const textA = document.createElement('a');
        textA.className = 'mobile-dropdown-button-text';
        textA.href = section.url;
        textA.textContent = section.title;

        // Bouton icône pour déplier
        const iconA = document.createElement('a');
        iconA.className = 'mobile-dropdown-button-icon toggle-btn';
        iconA.id = 'list-' + section.title;
        iconA.innerHTML = '<i class="fa-solid fa-angle-down"></i> <i class="fa-solid fa-angle-up"></i>';
        
        // CONDITION : On ne l'affiche que s'il y a des liens
        if (section.links.length === 0) {
            iconA.style.display = 'none'; // Cache l'icône
        }

        // Sous-menu contenant les liens
        const subMenu = document.createElement('div');
        subMenu.className = 'dropdown-dropdown'; 
        
        section.links.forEach(link => {
            const a = document.createElement('a');
            a.href = link.href;
            a.textContent = link.text;
            subMenu.appendChild(a);
        });

        // Assemblage des éléments
        buttonWrap.appendChild(textA);
        buttonWrap.appendChild(iconA);
        mobileMenu.appendChild(buttonWrap);
        mobileMenu.appendChild(subMenu);

        // Gestion du clic sur l'icône de dropdown 
        iconA.addEventListener('click', (e) => {
            e.stopPropagation();
            subMenu.classList.toggle('active');
            iconA.classList.toggle('is-open');
        });
    });

    // Gestion de l'ouverture globale du menu mobile
    if (menuBtn) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileMenu.classList.toggle('active');
            menuBtn.classList.toggle('is-open');
        });
    }

    // Fermeture globale au clic n'importe où ailleurs sur la page
    document.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        if (menuBtn) menuBtn.classList.remove('is-open');
        
        // On referme aussi tous les sous-menus ouverts
        mobileMenu.querySelectorAll('.dropdown-dropdown.active').forEach(el => el.classList.remove('active'));
        mobileMenu.querySelectorAll('.toggle-btn.is-open').forEach(el => el.classList.remove('is-open'));
    });
}

/**
 * Charge le Footer de manière asynchrone.
 */
function loadFooter() {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (!footerPlaceholder) return;

    fetch('footer.html')
        .then(response => {
            if (!response.ok) throw new Error("Fichier footer.html introuvable");
            return response.text();
        })
        .then(data => {
            footerPlaceholder.innerHTML = data;
        })
        .catch(err => console.error("Erreur Footer :", err));
}

/**
 * Gère la barre de progression et l'overlay
 * @param {number} percent - Pourcentage de progression
 * @param {boolean} useOverlay - Si vrai, gère l'opacité de l'écran blanc
 */
function updateProgress(percent, useOverlay = false) {
    const bar = document.getElementById('progress-bar');
    if (!bar) return;
    if (percent > 0 && percent <= 100) {
        // On active la transition pour que la barre "glisse" vers l'avant
        bar.style.transition = "width 0.4s ease";
        bar.style.width = percent + "%";
    }
    if (percent >= 100) {
        setTimeout(() => {
            if (useOverlay) {
                const overlay = document.getElementById('loading-overlay');
                if (overlay) {
                    overlay.style.opacity = '0';
                    setTimeout(() => overlay.style.display = 'none', 500);
                }
            }
            // Reset de la barre pour la prochaine navigation
            setTimeout(() => { bar.style.transition = "none"
                 bar.style.width = "0%"; }, 400);
        }, 10);
    }
}

/**
 * Navigation fluide (SPA) entre les pages internes
 */
function initSpaNavigation() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && link.href.includes(window.location.origin) && !link.hash) {
            e.preventDefault();
            const targetUrl = link.href;

            updateProgress(20, false); // Pas d'overlay ici, on reste sur l'ancienne page

            fetch(targetUrl)
                .then(response => response.text())
                .then(html => {
                    updateProgress(60, false);
                    
                    const parser = new DOMParser();
                    const newDoc = parser.parseFromString(html, 'text/html');
                    const newMain = newDoc.querySelector('main').innerHTML;
                    
                    document.querySelector('main').innerHTML = newMain;
                    window.history.pushState({}, '', targetUrl);
                    window.scrollTo(0, 0);
                    
                    updateProgress(100, false);
                })
                .catch(() => window.location.href = targetUrl);
        }
    });
}

// Chargement initial (Premier accès ou Refresh)
window.addEventListener('DOMContentLoaded', () => {
    // Ici on utilise TRUE pour l'overlay car c'est un chargement complet de page
    const bar = document.getElementById('progress-bar');
    updateProgress(10, true); 
    
    Promise.all([loadHeader()]).then(() => {
        updateProgress(60, true);
    });
     Promise.all([loadFooter()]).then(() => {
        updateProgress(100, true);
    });

    initSpaNavigation();
});

// Appel de la fonction au chargement initial
window.addEventListener('DOMContentLoaded', () => {
    loadHeader();
    loadFooter();
    initSpaNavigation();
});
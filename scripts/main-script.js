/**
 * scripts/main-script.js
 */

/**
 * Charge le Header, injecte les données du menu et initialise les événements.
 */
function loadHeader() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (!headerPlaceholder) return;

    // --- Chargement du contenu HTML du header ---
    fetch('header.html')
        .then(response => {
            if (!response.ok) throw new Error("Fichier header.html introuvable");
            return response.text();
        })
        .then(data => {
            headerPlaceholder.innerHTML = data;
            
            // --- Configuration des données du menu ---
            const menuData = [
                {  
                    title: 'Faire un don',
                    url: '#1',
                    links: []
                },
                {  
                    title: 'Réseau',
                    url: '#2',
                    links: [
                        { text: "Annuaires", href: '#' },
                        { text: "Contacts Entreprises", href: '#' },
                        { text: "Carte des Alumnis", href: '#' }
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

// Initialisation au chargement du DOM
window.addEventListener('DOMContentLoaded', () => {
    loadHeader();
    loadFooter();
});
// scripts/main-script.js

// Cette fonction charge le header et initialise les événements
function loadHeader() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    
    if (!headerPlaceholder) return;

    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            headerPlaceholder.innerHTML = data;

            // Une fois le HTML injecté, on attache l'événement au bouton burger
            const mobileMenu = document.getElementById('mobile-menu');
            const menuBtn = document.getElementById('list-btn');

            // Source unique des menus : un seul objet décrivant toutes les sections
            const menuData = [
                {
                    title: 'Réseau',
                    links: [
                        { text: "Annuaires", href: '#' },
                        { text: "Contacts Entreprises", href: '#' },
                        { text: "Carte des Alumnis", href: '#' }
                    ]
                },
                {
                    title: 'Événements',
                    links: [
                        { text: "Événements de l'association", href: '#' },
                        { text: 'Actus MPCI', href: '#' },
                        { text: 'Réussites d\'alumni', href: '#' }
                    ]
                },
                {
                    title: 'Carrière',
                    links: [
                        { text: 'Offres de stage/emploi', href: '#' },
                        { text: 'Espace recruteur', href: '#' },
                        { text: 'Témoignage Métiers', href: '#' }
                    ]
                },
                {
                    title: "L'association",
                    links: [
                        { text: 'Le bureau', href: '#' },
                        { text: "Petit mot sur l'asso", href: '#' },
                        { text: 'Contacts', href: '#' }
                    ]
                }
            ];
            

            // rendu du menu mobile (génère les mêmes sections)
            const mobileContainer = mobileMenu; // #mobile-menu
            if (mobileContainer) {
                // clear existing (if any)
                mobileContainer.innerHTML = '';
                menuData.forEach(section => {
                    const id = 'list-' + section.title;

                    const buttonWrap = document.createElement('div');
                    buttonWrap.className = 'mobile-dropdown-button';

                    const textA = document.createElement('a');
                    textA.className = 'mobile-dropdown-button-text';
                    textA.href = '#';
                    textA.textContent = section.title;

                    const iconA = document.createElement('a');
                    iconA.className = 'mobile-dropdown-button-icon toggle-btn';
                    iconA.id = id; // id kept for reference but CSS now uses .toggle-btn
                    iconA.innerHTML = '<i class="fa-solid fa-angle-down"></i> <i class="fa-solid fa-angle-up"></i>';

                    // sous-menu
                    const sub = document.createElement('div');
                    sub.className = 'dropdown-dropdown';
                    sub.id = section.title + '-menu';
                    section.links.forEach(l => {
                        const a = document.createElement('a');
                        a.href = l.href;
                        a.textContent = l.text;
                        sub.appendChild(a);
                    });

                    buttonWrap.appendChild(textA);
                    buttonWrap.appendChild(iconA);
                    mobileContainer.appendChild(buttonWrap);
                    mobileContainer.appendChild(sub);

                    // comportement: clic sur l'icône ouvre/ferme le sous-menu
                    iconA.addEventListener('click', (e) => {
                        e.stopPropagation();
                        sub.classList.toggle('active');
                        iconA.classList.toggle('is-open');
                    });
                });

                document.addEventListener('click', () => {
                    mobileContainer.classList.remove('active');
                    if (menuBtn) menuBtn.classList.remove('is-open');
                    // fermer tous les sous-menus
                    mobileContainer.querySelectorAll('.dropdown-dropdown.active').forEach(el => el.classList.remove('active'));
                    mobileContainer.querySelectorAll('.toggle-btn.is-open').forEach(el => el.classList.remove('is-open'));
                });
            }

            // burger
            if (menuBtn && mobileMenu) {
                menuBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    mobileMenu.classList.toggle('active');
                    menuBtn.classList.toggle('is-open');
                });
            }
        })
        .catch(err => console.error("Erreur header:", err));
}



function loadFooter() {
    const footerPlaceholder = document.getElementById('footer-placeholder');

    if (!footerPlaceholder) return;

    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            footerPlaceholder.innerHTML = data;

          
        })
        .catch(err => console.error("Erreur footer:", err));
}


window.addEventListener('DOMContentLoaded', loadHeader);
window.addEventListener('DOMContentLoaded', loadFooter);
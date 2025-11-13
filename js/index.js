
        document.addEventListener('DOMContentLoaded', function() {
            const nav = document.querySelector('.sidebar-nav');
            const links = nav.querySelectorAll('a');
            const marker = document.querySelector('.menu-marker');
            const markerInner = document.querySelector('.marker-inner');
            const iframe = document.getElementById('viewer');
            const sidebar = document.querySelector('.sidebar');
            const mobileToggle = document.querySelector('.mobile-toggle');
            const overlay = document.querySelector('.overlay');

            function getOffsetWithinNav(el) {
                const navRect = nav.getBoundingClientRect();
                const elRect = el.getBoundingClientRect();
                return elRect.top - navRect.top + nav.scrollTop;
            }

            function moveMarkerTo(el) {
                if (!el) return;
                const offset = getOffsetWithinNav(el);
                marker.style.transform = `translateY(${offset}px)`;
                marker.style.height = `${el.offsetHeight}px`;
            }

            const initial = nav.querySelector('a.active') || nav.querySelector('a');
            if (initial) moveMarkerTo(initial);

            function setActive(link) {
                links.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }

            const parents = nav.querySelectorAll('.has-children');
            parents.forEach(parent => {
                const anchor = parent.querySelector('a');
                const subList = parent.querySelector('.sub-list');

                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    const isExpanded = parent.classList.toggle('expanded');
                    subList.style.maxHeight = isExpanded ? subList.scrollHeight + 'px' : '0px';
                    setActive(anchor);
                    moveMarkerTo(anchor);
                    markerInner.classList.remove('is-wobbling');
                    void markerInner.offsetWidth;
                    markerInner.classList.add('is-wobbling');

                    // CARGAR el iframe solicitado cuando se presione "Sustancias Químicas en Planta"
                    // (si hay más parents y quieres distintos srcs, adapta aquí usando parent.id u otro atributo)
                    // en este caso, siempre cargamos ./ESTACIONES/ESTACIONES.html
                    iframe.src = './ESTACIONES/ESTACIONES.html';

                    // en móvil, cerrar el menú al seleccionar (si deseas que no cierre, quita esto)
                    if (window.matchMedia && window.matchMedia('(max-width: 900px)').matches) {
                        // dejamos una pequeña demora para que la transición sea perceptible
                        setTimeout(() => {
                            sidebar.classList.remove('open');
                            overlay.classList.remove('visible');
                            document.body.classList.remove('no-scroll');
                        }, 180);
                    }
                });

                const subLinks = subList.querySelectorAll('a');
                subLinks.forEach(slink => {
                    slink.addEventListener('click', function(ev) {
                        ev.preventDefault();
                        setActive(slink);
                        moveMarkerTo(slink);
                        markerInner.classList.remove('is-wobbling');
                        void markerInner.offsetWidth;
                        markerInner.classList.add('is-wobbling');

                        // en móvil, cerrar el menú al seleccionar sub-item
                        if (window.matchMedia && window.matchMedia('(max-width: 900px)').matches) {
                            sidebar.classList.remove('open');
                            overlay.classList.remove('visible');
                            document.body.classList.remove('no-scroll');
                        }
                    });
                });
            });

            links.forEach(link => {
                if (link.closest('.has-children')) return;
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    setActive(link);
                    moveMarkerTo(link);
                    markerInner.classList.remove('is-wobbling');
                    void markerInner.offsetWidth;
                    markerInner.classList.add('is-wobbling');
                    const src = link.getAttribute('data-src');
                    iframe.src = src || '';

                    // en móvil, cerrar el menú al seleccionar item
                    if (window.matchMedia && window.matchMedia('(max-width: 900px)').matches) {
                        sidebar.classList.remove('open');
                        overlay.classList.remove('visible');
                        document.body.classList.remove('no-scroll');
                    }
                });
            });

            window.addEventListener('resize', () => {
                const active = nav.querySelector('a.active');
                if (active) moveMarkerTo(active);
                // si se redimensiona a escritorio, asegurar sidebar visible y quitar bloqueo
                if (!window.matchMedia || !window.matchMedia('(max-width: 900px)').matches) {
                    sidebar.classList.remove('open');
                    overlay.classList.remove('visible');
                    document.body.classList.remove('no-scroll');
                }
            });

            // --- funciones para abrir/cerrar sidebar movil ---
            function openSidebar() {
                sidebar.classList.add('open');
                overlay.classList.add('visible');
                document.body.classList.add('no-scroll');
                // forzar reposicionado del marker si es necesario
                const active = nav.querySelector('a.active');
                if (active) moveMarkerTo(active);
            }

            function closeSidebar() {
                sidebar.classList.remove('open');
                overlay.classList.remove('visible');
                document.body.classList.remove('no-scroll');
            }

            mobileToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                if (sidebar.classList.contains('open')) {
                    closeSidebar();
                } else {
                    openSidebar();
                }
            });

            overlay.addEventListener('click', function() {
                closeSidebar();
            });

            // cerrar con ESC
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' || e.key === 'Esc') {
                    closeSidebar();
                }
            });

            // cerrar si el usuario hace click en un link fuera del nav (solo en móvil)
            document.addEventListener('click', function(e) {
                if (!sidebar.contains(e.target) && !mobileToggle.contains(e.target) && window.matchMedia && window.matchMedia('(max-width: 900px)').matches) {
                    closeSidebar();
                }
            });

            // Inicialización: si estamos en móvil, dejamos el menú cerrado por defecto
            if (window.matchMedia && window.matchMedia('(max-width: 900px)').matches) {
                sidebar.classList.remove('open');
            }
        });

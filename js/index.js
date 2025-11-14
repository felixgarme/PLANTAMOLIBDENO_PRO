// Señal por consola: sidebarSignal('hide')  // usa la consola (F12) y llama a sidebarSignal con 'hide'|'close'|'open'|'restore'|'toggle'

document.addEventListener('DOMContentLoaded', () => {
  // ----- elementos -----
  const menuContainer = document.getElementById('menuContainer');
  const iframe = document.getElementById('viewer');
  const overlay = document.getElementById('overlay');
  const toggle = document.getElementById('mobileToggle');
  const nav = document.querySelector('.sidebar-nav');
  const marker = document.querySelector('.menu-marker');
  const markerInner = document.querySelector('.marker-inner');

  // ----- helpers -----
  function isMobile() {
    return window.matchMedia('(max-width:900px)').matches;
  }

  function getOffset(el) {
    const navRect = nav.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    return elRect.top - navRect.top + nav.scrollTop;
  }

  function moveMarker(el) {
    if (!el) return;
    marker.style.transform = `translateY(${getOffset(el)}px)`;
    marker.style.height = `${el.offsetHeight}px`;
  }

  function setActive(a) {
    nav.querySelectorAll('a').forEach(x => x.classList.remove('active'));
    a.classList.add('active');
  }

  // ----- renderizado del menú -----
  function renderMenu(cfg) {
    menuContainer.innerHTML = '';
    (cfg || []).forEach(item => {
      if (!item.isParent) {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#" data-src="${item.src || ''}" data-collapse="${!!item.collapseOnClick}"><i class="fa-solid ${item.icon || ''}"></i> ${item.label}</a>`;
        menuContainer.appendChild(li);
        return;
      }
      const li = document.createElement('li');
      li.classList.add('has-children');
      const children = (item.children || []).map(c => `<li><a href="#" class="sub-item" data-src="${c.src || ''}" data-collapse="${!!c.collapseOnClick}">${c.label}</a></li>`).join('');
      li.innerHTML = `<a href="#" data-collapse="${!!item.collapseOnClick}"><i class="fa-solid ${item.icon || ''}"></i> ${item.label} <span class="caret">▶</span></a><ul class="sub-list">${children}</ul>`;
      menuContainer.appendChild(li);
    });
  }

  renderMenu(window.menuConfig || []);

  // ----- controles del sidebar -----
  function openSidebar() {
    document.body.classList.add('sidebar-open');
    if (isMobile()) {
      overlay.classList.add('visible');
      document.body.classList.add('no-scroll');
    } else {
      overlay.classList.remove('visible');
      document.body.classList.remove('no-scroll');
    }
    document.body.classList.remove('sidebar-collapsed');
    toggle.setAttribute('aria-expanded', 'true');
  }

  function closeSidebar() {
    document.body.classList.remove('sidebar-open');
    overlay.classList.remove('visible');
    document.body.classList.remove('no-scroll');
    toggle.setAttribute('aria-expanded', 'false');
  }

  function collapseSidebar() {
    document.body.classList.add('sidebar-collapsed');
    document.body.classList.remove('sidebar-open');
    overlay.classList.remove('visible');
    document.body.classList.remove('no-scroll');
    toggle.setAttribute('aria-expanded', 'false');
  }

  function restoreSidebar() {
    document.body.classList.remove('sidebar-collapsed');
    overlay.classList.remove('visible');
    document.body.classList.remove('no-scroll');
    toggle.setAttribute('aria-expanded', 'true');
  }

  // estado inicial según ancho
  if (isMobile()) collapseSidebar();
  else restoreSidebar();

  // ----- eventos del menú -----
  menuContainer.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    e.preventDefault();

    const li = a.parentElement;
    const src = a.dataset.src || '';
    const collapse = a.dataset.collapse === 'true';

    if (li && li.classList.contains('has-children')) {
      const expanded = li.classList.toggle('expanded');
      const sub = li.querySelector('.sub-list');
      sub.style.maxHeight = expanded ? sub.scrollHeight + 'px' : '0';
      if (src) iframe.src = src;
      setActive(a);
      moveMarker(a);
      markerInner.classList.remove('is-wobbling');
      void markerInner.offsetWidth;
      markerInner.classList.add('is-wobbling');
      if (collapse) setTimeout(collapseSidebar, 120);
      return;
    }

    if (src) iframe.src = src;
    setActive(a);
    moveMarker(a);
    markerInner.classList.remove('is-wobbling');
    void markerInner.offsetWidth;
    markerInner.classList.add('is-wobbling');
    if (collapse) setTimeout(collapseSidebar, 120);
    else restoreSidebar();
  });

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (document.body.classList.contains('sidebar-collapsed')) {
      restoreSidebar();
      openSidebar();
      return;
    }
    if (document.body.classList.contains('sidebar-open')) closeSidebar();
    else openSidebar();
  });

  overlay.addEventListener('click', () => {
    closeSidebar();
    if (isMobile()) collapseSidebar();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (document.body.classList.contains('sidebar-open')) {
        closeSidebar();
        if (isMobile()) collapseSidebar();
      } else if (!document.body.classList.contains('sidebar-collapsed')) {
        collapseSidebar();
      }
    }
  });

  document.addEventListener('click', (e) => {
    if (isMobile() && !document.getElementById('sidebar').contains(e.target) && !toggle.contains(e.target)) {
      closeSidebar();
      collapseSidebar();
    }
  });

  window.addEventListener('resize', () => {
    if (isMobile()) collapseSidebar();
    else restoreSidebar();
    const a = nav.querySelector('a.active');
    if (a) moveMarker(a);
    document.querySelectorAll('.has-children .sub-list').forEach(ul => {
      if (ul.parentElement.classList.contains('expanded')) ul.style.maxHeight = ul.scrollHeight + 'px';
      else ul.style.maxHeight = '0';
    });
  });

  // ----- señal global única para controlar el sidebar -----
  function sidebarSignal(signal) {
    if (!signal) return;
    const cmd = String(signal).toLowerCase();
    switch (cmd) {
      case 'hide':
      case 'collapse':
        closeSidebar();
        collapseSidebar();
        break;
      case 'close':
        closeSidebar();
        break;
      case 'open':
      case 'show':
        restoreSidebar();
        openSidebar();
        break;
      case 'restore':
      case 'expand':
        restoreSidebar();
        break;
      case 'toggle':
        if (document.body.classList.contains('sidebar-collapsed')) {
          restoreSidebar();
          openSidebar();
        } else collapseSidebar();
        break;
      default:
        // comando desconocido - silencioso (sin eliminar nada)
        break;
    }
  }
  window.sidebarSignal = window.sidebarSignal || function(cmd){
    sidebarSignal(cmd);
  };


  // ----- inicialización final -----
  setTimeout(() => {
    const first = nav.querySelector('a');
    if (first) {
      first.click(); // simula click en la primera opción al cargar
      moveMarker(first);
    }
  }, 60);
});

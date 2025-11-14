window.menuConfig = [
  { id: "p01", label: "Principios Operacionales", icon: "fa-gears", src: "./iframes/principios.html", collapseOnClick: false },
  { id: "p02", label: "Peligros Químicos y Nociones de Toxicidad", icon: "fa-biohazard", src: "./ESTACIONES/index.html", collapseOnClick: false },
  { id: "p03", label: "Sustancias Químicas en Planta", icon: "fa-flask-vial", isParent: true, collapseOnClick: false, children: [
      { id: "p03-1", label: "3.1. Hidrosulfuro de Sodio (NaHS)", src: "./iframes/nahs.html", collapseOnClick: true },
      { id: "p03-2", label: "3.2. Ácido Sulfúrico (H2SO4)", src: "./iframes/h2so4.html", collapseOnClick: true },
      { id: "p03-3", label: "3.3. Sulfuro de Hidrógeno (H2S)", src: "./iframes/h2s.html", collapseOnClick: true },
      { id: "p03-4", label: "3.4. Control de Riesgos", src: "./iframes/riesgos.html", collapseOnClick: true }
    ]
  },
  { id: "p04", label: "Equipos de Protección Personal EPP", icon: "fa-user-shield", src: "./iframes/epp.html", collapseOnClick: true },
  { id: "p05", label: "Detectores de Gases", icon: "fa-tower-broadcast", src: "./iframes/detectores.html", collapseOnClick: false },
  { id: "p06", label: "Control & Evacuación", icon: "fa-shield-halved", src: "./PLANTA_MOLIBDENO/Planta.html", collapseOnClick: true }
];

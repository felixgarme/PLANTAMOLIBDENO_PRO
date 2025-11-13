/**
 * v3d-caminoFlechas-v6.js
 * - Permite crear múltiples caminos simultáneamente sin borrarse entre sí.
 * - API flexible: crearCaminoFlechas(id, nombres, opciones) o crearCaminoFlechas(nombres, opciones).
 * - eliminarCaminoFlechas(id) elimina uno; eliminarCaminoFlechas() elimina todos.
 * - Camino suavizado (CatmullRom), faja corrediza, auto-scale controlado.
 */

(function () {
  if (window.__v3d_caminoFlechas_v6_inited) return;
  window.__v3d_caminoFlechas_v6_inited = true;

  let appRef = null;
  const paths = new Map(); // id -> { group, curve, totalLength, arrows: [{mesh,s}], options, baseGeom }
  let rafId = null;
  const globalClock = new v3d.Clock();

  const defaults = {
    color: 0x00ffcc,
    ancho: 2,
    largoFlecha: 3,
    separacion: 7.0,
    velocidad: 6.0,
    yOffset: 0.02,
    baseOpacity: 1.0,
    blendingAdditive: true,
    minArrows: 8,
    tension: 0.5,
    curveSamples: 200,
    autoScaleByCamera: true,
    autoScaleFactor: 0.3,
    minScale: 2,
    maxScale: 3
  };

  function getApp() {
    if (appRef && appRef.scene) return appRef;
    if (window.app && window.app.scene) { appRef = window.app; return appRef; }
    if (window.v3d && v3d.apps && v3d.apps.size > 0) {
      appRef = Array.from(v3d.apps.values())[0];
      return appRef;
    }
    return null;
  }

  async function ensureAppReady(timeout = 8000) {
    return new Promise((resolve) => {
      const start = performance.now();
      (function check() {
        const app = getApp();
        if (app) return resolve(app);
        if (performance.now() - start > timeout) return resolve(null);
        setTimeout(check, 200);
      })();
    });
  }

  // crea triángulo plano apuntando a +Z (Y=0)
  function crearTrianguloPlano(width, length) {
    const halfW = width / 2;
    const halfL = length / 2;
    const positions = new Float32Array([
      0, 0,  halfL,
     -halfW, 0, -halfL,
      halfW, 0, -halfL
    ]);
    const geom = new v3d.BufferGeometry();
    geom.setAttribute('position', new v3d.BufferAttribute(positions, 3));
    geom.setIndex([0,1,2]);
    geom.computeVertexNormals();
    return geom;
  }

  // construye curve CatmullRom y fuerza sampling para getLength
  function buildCurve(points, tension, samples) {
    let pts = points.slice();
    if (pts.length === 2) {
      const mid = pts[0].clone().lerp(pts[1], 0.5);
      pts = [pts[0].clone(), mid, pts[1].clone()];
    }
    const c = new v3d.CatmullRomCurve3(pts, false, 'catmullrom', tension);
    c.getLengths(samples);
    return c;
  }

  // obtiene pos y tangente para s (distancia) sobre la curva (usa u = s/totalLength)
  function getPointAndTangentAtSForCurve(curveObj, totalLen, s) {
    if (!curveObj || totalLen <= 0) return null;
    let u = (s % totalLen) / totalLen;
    if (u < 0) u += 1;
    const pos = curveObj.getPointAt(u, new v3d.Vector3());
    const tan = curveObj.getTangentAt(u, new v3d.Vector3());
    return { pos, tangent: tan };
  }

  // anim loop que actualiza todos los caminos
  function startGlobalLoop() {
    if (rafId) return;
    globalClock.start();
    function loop() {
      const app = getApp();
      if (!app) { rafId = null; return; }
      const delta = globalClock.getDelta();

      // cámara (para auto-scale)
      const cam = app._camera || app.camera || (app.views && app.views.length ? app.views[0].camera : null);

      // actualizar cada path
      paths.forEach((P, id) => {
        if (!P.curve || P.totalLength <= 1e-6) return;
        for (let i = 0; i < P.arrows.length; i++) {
          const a = P.arrows[i];
          a.s += P.options.velocidad * delta;
          // wrap
          if (a.s >= P.totalLength) a.s -= P.totalLength * Math.floor(a.s / P.totalLength);

          const pt = getPointAndTangentAtSForCurve(P.curve, P.totalLength, a.s);
          if (!pt) continue;

          // posición y offset
          a.mesh.position.copy(pt.pos);
          a.mesh.position.y += P.options.yOffset;

          // orientar +Z hacia tangente (suave por ser curva)
          const q = new v3d.Quaternion();
          q.setFromUnitVectors(new v3d.Vector3(0,0,1), pt.tangent);
          a.mesh.quaternion.slerp(q, 1.0);

          // auto-scale inverso con límites
          let scaleFactor = 1.0;
          if (P.options.autoScaleByCamera && cam && cam.position) {
            const dist = cam.position.distanceTo(a.mesh.position);
            const inv = 1 / (1 + P.options.autoScaleFactor * dist);
            scaleFactor = Math.max(P.options.minScale, Math.min(P.options.maxScale, inv * P.options.maxScale));
          } else {
            scaleFactor = P.options.maxScale;
          }

          // ligera oscilación para dinamismo
          const osc = 1.0 + 0.04 * Math.sin((a.s / P.totalLength) * Math.PI * 4 + performance.now() * 0.001);
          const finalScale = a.mesh.userData.baseScale * scaleFactor * osc;
          a.mesh.scale.setScalar(finalScale);

          // opacidad según distancia
          if (a.mesh.material && a.mesh.material.transparent) {
            if (P.options.autoScaleByCamera && cam && cam.position) {
              const dist = cam.position.distanceTo(a.mesh.position);
              const o = Math.max(0.12, Math.min(1.0, 1 / (1 + 0.006 * dist)));
              a.mesh.material.opacity = o * P.options.baseOpacity;
            } else {
              a.mesh.material.opacity = P.options.baseOpacity;
            }
          }
        }
      });

      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);
  }

  // crear camino: acepta (id, nombres, opciones) o (nombres, opciones)
  async function crearCaminoFlechas(arg1, arg2, arg3) {
    const app = await ensureAppReady();
    if (!app) { console.warn("[caminoFlechas-v6] App Verge3D no encontrada."); return null; }

    // interpretar argumentos
    let id = null, nombres = null, opciones = null;
    if (typeof arg1 === 'string' && Array.isArray(arg2)) {
      id = arg1;
      nombres = arg2;
      opciones = arg3 || {};
    } else if (Array.isArray(arg1)) {
      nombres = arg1;
      opciones = arg2 || {};
      id = `camino_${Date.now()}_${Math.floor(Math.random()*9999)}`;
    } else {
      console.warn("[caminoFlechas-v6] Firma inválida. Usa crearCaminoFlechas(id, nombres, opciones) o crearCaminoFlechas(nombres, opciones).");
      return null;
    }

    if (paths.has(id)) {
      console.warn(`[caminoFlechas-v6] Ya existe un camino con id="${id}". Usa otro id o elimina el existente primero.` );
      return null;
    }

    // mezclar opciones
    const opt = Object.assign({}, defaults, opciones);

    // buscar objetos por nombre y obtener posiciones mundiales
    const puntosObjs = nombres.map(n => app.scene.getObjectByName(n)).filter(o => !!o);
    if (puntosObjs.length < 2) { console.warn("[caminoFlechas-v6] Se necesitan al menos 2 objetos válidos."); return null; }
    const points = puntosObjs.map(o => { const v = new v3d.Vector3(); o.getWorldPosition(v); return v; });

    // construir curva y longitud
    const curve = buildCurve(points, opt.tension, opt.curveSamples);
    const totalLength = curve.getLength();
    if (totalLength <= 1e-5) { console.warn("[caminoFlechas-v6] Longitud del camino nula."); return null; }

    // crear grupo
    const group = new v3d.Group();
    group.name = `caminoFlechas_${id}`;
    app.scene.add(group);

    // crear geom y mat base (per-path para facilitar dispose)
    const baseGeom = crearTrianguloPlano(opt.ancho, opt.largoFlecha);
    const matBase = new v3d.MeshBasicMaterial({
      color: opt.color,
      transparent: true,
      opacity: opt.baseOpacity,
      depthWrite: false,
      side: v3d.DoubleSide,
      blending: opt.blendingAdditive ? v3d.AdditiveBlending : v3d.NormalBlending
    });

    // calcular número flechas
    const count = Math.max(opt.minArrows, Math.round(totalLength / opt.separacion));
    const spacing = totalLength / count;

    const arrowsLocal = [];
    for (let i = 0; i < count; i++) {
      const s = i * spacing;
      const u = (s % totalLength) / totalLength;
      const pos = curve.getPointAt(u, new v3d.Vector3());
      const tan = curve.getTangentAt(u, new v3d.Vector3());
      const mesh = new v3d.Mesh(baseGeom, matBase.clone());
      mesh.position.copy(pos);
      mesh.position.y += opt.yOffset;
      const q = new v3d.Quaternion();
      q.setFromUnitVectors(new v3d.Vector3(0,0,1), tan);
      mesh.quaternion.copy(q);
      mesh.userData = { s, baseScale: 1.0 };
      group.add(mesh);
      arrowsLocal.push({ mesh, s });
    }

    // guardar en map
    paths.set(id, { group, curve, totalLength, arrows: arrowsLocal, options: opt, baseGeom });

    // arrancar loop global si no está
    startGlobalLoop();

    console.log(`[caminoFlechas-v6] Creado camino id="${id}" (${nombres.join(' → ')}) len=${totalLength.toFixed(2)} flechas=${arrowsLocal.length}`);
    return id;
  }

  // eliminar: si id proporcionado elimina ese camino; si no, elimina todos
  function eliminarCaminoFlechas(id) {
    const app = getApp();
    if (!id) {
      // eliminar todos
      paths.forEach((P, k) => {
        try { if (P.group && P.group.parent) P.group.parent.remove(P.group); } catch(e){}
        // dispose mats/geoms
        if (P.group) {
          const geoms = new Set(), mats = new Set();
          P.group.traverse(o => {
            if (o.isMesh) {
              if (o.geometry) geoms.add(o.geometry);
              if (o.material) mats.add(o.material);
            }
          });
          mats.forEach(m => { try { m.dispose(); } catch(e){} });
          geoms.forEach(g => { try { g.dispose(); } catch(e){} });
        }
        // dispose baseGeom if present
        if (P.baseGeom) { try { P.baseGeom.dispose(); } catch(e){} }
      });
      paths.clear();
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      console.log("[caminoFlechas-v6] Todos los caminos eliminados.");
      return;
    }

    // eliminar solo id
    const P = paths.get(id);
    if (!P) { console.warn(`[caminoFlechas-v6] No existe camino con id="${id}".`); return; }
    try { if (P.group && P.group.parent) P.group.parent.remove(P.group); } catch(e){}
    const geoms = new Set(), mats = new Set();
    if (P.group) {
      P.group.traverse(o => {
        if (o.isMesh) {
          if (o.geometry) geoms.add(o.geometry);
          if (o.material) mats.add(o.material);
        }
      });
      mats.forEach(m => { try { m.dispose(); } catch(e){} });
      geoms.forEach(g => { try { g.dispose(); } catch(e){} });
    }
    if (P.baseGeom) { try { P.baseGeom.dispose(); } catch(e){} }
    paths.delete(id);
    // si no quedan caminos, parar loop
    if (paths.size === 0 && rafId) { cancelAnimationFrame(rafId); rafId = null; }
    console.log(`[caminoFlechas-v6] Camino id="${id}" eliminado.`);
  }

  // exponer API
  window.crearCaminoFlechas = crearCaminoFlechas;
  window.eliminarCaminoFlechas = eliminarCaminoFlechas;

  console.log("%c[caminoFlechas-v6] listo. Uso: crearCaminoFlechas(id?,['A','B'],opts) / eliminarCaminoFlechas(id?)", "color:#7fffd4;font-weight:bold;");
})();

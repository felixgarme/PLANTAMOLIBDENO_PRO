/**
 * v3d-resaltarAlarma.js 🔥 Visible aunque esté tapado
 * Uso:
 *   resaltarAlarma("obj1","obj2");
 *   detenerAlarma("obj1");
 *   detenerAlarma(); // detiene todas
 */

(function(){
  if(window.__v3d_resaltarAlarma_inited) return;
  window.__v3d_resaltarAlarma_inited = true;

  let appRef = null;
  const alarmas = new Map();
  let loopId = null;
  const clock = new v3d.Clock();

  const config = {
    colorAlarma: new v3d.Color(1, 0, 0),
    velocidad: 6.5,
    intensidad: 2.2,
    opacidadMin: 0.1,
    opacidadMax: 1.0
  };

  // 🔹 Buscar app activa
  function getApp(){
    if(appRef && appRef.scene) return appRef;
    if(window.app && window.app.scene){ appRef = window.app; return appRef; }
    if(window.v3d && v3d.apps && v3d.apps.size>0){
      appRef = Array.from(v3d.apps.values())[0];
      return appRef;
    }
    return null;
  }

  async function ensureAppReady(timeout=6000){
    return new Promise(resolve=>{
      const start=performance.now();
      (function check(){
        const app=getApp();
        if(app) return resolve(app);
        if(performance.now()-start>timeout) return resolve(null);
        setTimeout(check,200);
      })();
    });
  }

  // 🔹 Material rojo visible desde cualquier lugar
  function crearMaterialAlarma(){
    return new v3d.MeshBasicMaterial({
      color: config.colorAlarma,
      transparent: true,
      opacity: config.opacidadMax,
      depthWrite: false,
      depthTest: false,         // 👈 esto lo hace visible aun si está detrás
      blending: v3d.AdditiveBlending,
      side: v3d.DoubleSide      // 👈 visible por ambos lados
    });
  }

  // 🔹 Activar alarma sobre una lista de objetos
  async function resaltarAlarma(...nombres){
    const app = await ensureAppReady();
    if(!app){ 
      console.warn("%c[resaltarAlarma] ❌ No se encontró la app Verge3D","color:red;font-weight:bold;");
      return; 
    }

    let encontrados = 0;

    nombres.forEach(nombre=>{
      const obj = app.scene.getObjectByName(nombre);
      if(!obj){
        console.warn(`%c[resaltarAlarma] ⚠️ Objeto no encontrado: ${nombre}`,"color:red;font-weight:bold;");
        try { new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=").play(); } catch(e){}
        return;
      }

      encontrados++;
      if(alarmas.has(nombre)) return;

      const matOriginal = obj.material;
      const matAlarma = crearMaterialAlarma();
      obj.material = matAlarma;

      alarmas.set(nombre, {
        obj,
        matOriginal,
        matAlarma,
        t: Math.random()*Math.PI*2
      });
    });

    if(encontrados > 0 && !loopId) loop();
  }

  // 🔹 Detener alarmas
  function detenerAlarma(...nombres){
    if(nombres.length === 0){
      for(const [_,data] of alarmas){
        restaurarMaterial(data);
      }
      alarmas.clear();
      if(loopId){ cancelAnimationFrame(loopId); loopId=null; }
      console.log("%c[resaltarAlarma] 🔕 Todas las alarmas detenidas","color:#aaa;");
      return;
    }

    nombres.forEach(nombre=>{
      const data = alarmas.get(nombre);
      if(data){
        restaurarMaterial(data);
        alarmas.delete(nombre);
      }
    });

    if(alarmas.size === 0 && loopId){ cancelAnimationFrame(loopId); loopId=null; }
  }

  // 🔹 Restaurar material original
  function restaurarMaterial(data){
    if(data.obj && data.matOriginal){
      data.obj.material = data.matOriginal;
    }
    if(data.matAlarma) data.matAlarma.dispose();
  }

  // 🔹 Efecto de parpadeo rojo fuerte
  function loop(){
    const delta = clock.getDelta();
    for(const [_, data] of alarmas){
      data.t += delta * config.velocidad;
      const s = 0.5 + 0.5 * Math.sin(data.t);
      const op = config.opacidadMin + (config.opacidadMax - config.opacidadMin) * s;
      data.matAlarma.opacity = op * config.intensidad;
    }
    loopId = requestAnimationFrame(loop);
  }

  window.resaltarAlarma = resaltarAlarma;
  window.detenerAlarma = detenerAlarma;

  console.log("%c[v3d-resaltarAlarma.js listo] Usa resaltarAlarma('obj1','obj2');","color:#ff4444;font-weight:bold;");
})();

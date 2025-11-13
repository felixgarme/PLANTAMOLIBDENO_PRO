/**
 * v3d-audioSolo.js 🎧
 * Reproduce solo el audio de un video (.mp4) o un archivo de sonido (.mp3).
 *
 * Uso:
 *   audio("../media/a.mp4");   // con botón para ver video
 *   audio("../media/b.mp3");   // solo sonido
 *   quitarAudios();            // detiene y elimina todos los audios
 */

(function(){
  if(window.__v3d_audioSolo_inited) return;
  window.__v3d_audioSolo_inited = true;

  const audiosActivos = [];
  let botonMute = null;
  let muteado = false;

  // 🔹 Crear botón flotante centrado en la derecha
  function crearBotonMute(){
    if(botonMute) return;

    botonMute = document.createElement("button");
    const iconoImg = document.createElement("img");
    iconoImg.src = "../img/volumen_on.png";
    iconoImg.style.width = "100%";
    iconoImg.style.height = "100%";
    iconoImg.style.objectFit = "contain";
    iconoImg.style.pointerEvents = "none";
    botonMute.appendChild(iconoImg);

    botonMute.style.position = "fixed";
    botonMute.style.top = "calc(50% - 30px)";
    botonMute.style.right = "15px";
    botonMute.style.transform = "translateY(-50%)";
    botonMute.style.zIndex = "99999";
    botonMute.style.border = "none";
    botonMute.style.borderRadius = "50%";
    botonMute.style.width = "50px";
    botonMute.style.height = "50px";
    botonMute.style.cursor = "pointer";
    botonMute.style.background = "#E5EFF9";
    botonMute.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
    botonMute.style.transition = "all 0.25s ease";
    botonMute.style.opacity = "1";

    botonMute.onmouseenter = () => botonMute.style.transform = "translateY(-50%) scale(1.1)";
    botonMute.onmouseleave = () => botonMute.style.transform = "translateY(-50%) scale(1)";

    botonMute.onclick = ()=>{
      muteado = !muteado;
      audiosActivos.forEach(v=> v.muted = muteado );
      botonMute.style.background = muteado ? "#031794" : "#E5EFF9";
      iconoImg.src = muteado ? "../img/volumen_off.png" : "../img/volumen_on.png";
    };

    document.body.appendChild(botonMute);
  }

  // 🔹 Crea un botón para ver el video (si es mp4)
  function crearBotonVerVideo(ruta, elementoVideo){
    const btnVer = document.createElement("button");
    const iconoVer = document.createElement("img");
    iconoVer.src = "../img/video_off.png";
    iconoVer.style.width = "100%";
    iconoVer.style.height = "100%";
    iconoVer.style.objectFit = "contain";
    iconoVer.style.pointerEvents = "none";
    btnVer.appendChild(iconoVer);

    btnVer.style.position = "fixed";
    btnVer.style.top = "calc(50% + 40px)";
    btnVer.style.right = "15px";
    btnVer.style.transform = "translateY(-50%)";
    btnVer.style.zIndex = "99999";
    btnVer.style.border = "none";
    btnVer.style.borderRadius = "50%";
    btnVer.style.width = "50px";
    btnVer.style.height = "50px";
    btnVer.style.cursor = "pointer";
    btnVer.style.background = "#E5EFF9";
    btnVer.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
    btnVer.style.transition = "all 0.25s ease";
    btnVer.style.opacity = "1";

    btnVer.setAttribute("data-video-ver", ruta);
    btnVer.onclick = ()=>{
      btnVer.style.background = "#031794";
      iconoVer.src = "../img/video_on.png";
      mostrarVideoPopup(ruta, elementoVideo);
      setTimeout(()=>{
        btnVer.style.background = "#E5EFF9";
        iconoVer.src = "../img/video_off.png";
      },800);
    };

    document.body.appendChild(btnVer);
  }

  // 🔹 Mostrar el video en un popup centrado
  function mostrarVideoPopup(ruta, elementoOriginal){
    // Mutea el audio principal al abrir el video
    elementoOriginal.muted = true;
    muteado = true;
    if(botonMute){
      botonMute.style.background = "#031794";
      botonMute.querySelector("img").src = "../img/volumen_off.png";
    }

    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.background = "rgba(0,0,0,0.8)";
    overlay.style.zIndex = "100000";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";

    const vidPopup = document.createElement("video");
    vidPopup.src = ruta;
    vidPopup.controls = true;
    vidPopup.autoplay = true;
    vidPopup.playsInline = true;
    vidPopup.style.maxWidth = "80%";
    vidPopup.style.maxHeight = "80%";
    vidPopup.style.border = "2px solid rgba(255,255,255,0.7)";
    vidPopup.style.borderRadius = "12px";
    vidPopup.style.boxShadow = "0 0 20px rgba(255,255,255,0.4)";

    const btnCerrar = document.createElement("button");
    btnCerrar.textContent = "✖";
    btnCerrar.style.position = "absolute";
    btnCerrar.style.top = "20px";
    btnCerrar.style.right = "30px";
    btnCerrar.style.fontSize = "26px";
    btnCerrar.style.border = "none";
    btnCerrar.style.background = "transparent";
    btnCerrar.style.color = "#fff";
    btnCerrar.style.cursor = "pointer";
    btnCerrar.style.textShadow = "0 0 6px rgba(0,0,0,0.6)";

    btnCerrar.onclick = ()=>{
      vidPopup.pause();
      overlay.remove();
      elementoOriginal.muted = muteado;
    };

    overlay.appendChild(vidPopup);
    overlay.appendChild(btnCerrar);
    document.body.appendChild(overlay);
  }

  // 🔹 Reproduce el audio desde archivo o video
  function audio(ruta){
    crearBotonMute();

    let elemento;

    if(ruta.toLowerCase().endsWith(".mp3")){
      elemento = document.createElement("audio");
    } else {
      elemento = document.createElement("video");
      elemento.style.display = "none";
    }

    elemento.src = ruta;
    elemento.loop = true;
    elemento.autoplay = true;
    elemento.muted = muteado;
    elemento.volume = 1.0;
    elemento.playsInline = true;

    const iniciar = ()=>{
      elemento.play().catch(()=>{});
      document.removeEventListener("click", iniciar);
    };
    document.addEventListener("click", iniciar);

    document.body.appendChild(elemento);
    audiosActivos.push(elemento);

    if(ruta.toLowerCase().endsWith(".mp4")){
      crearBotonVerVideo(ruta, elemento);
    }

    console.log(`%c[audioSolo] ▶️ Reproduciendo: ${ruta}`,"color:#0f0;");
  }

  // 🔹 Quita y detiene todos los audios activos
  function quitarAudios(){
    audiosActivos.forEach(v=>{
      v.pause();
      v.remove();
    });
    audiosActivos.length = 0;

    if(botonMute){ botonMute.remove(); botonMute = null; }
    const btnsVer = document.querySelectorAll("button[data-video-ver]");
    btnsVer.forEach(b=>b.remove());

    console.log("%c[audioSolo] ⏹️ Todos los audios detenidos","color:#f44;");
  }

  window.audio = audio;
  window.quitarAudios = quitarAudios;

  console.log("%c[v3d-audioSolo.js listo] Usa audio('ruta.mp4' o '.mp3');","color:#ff5555;font-weight:bold;");
})();

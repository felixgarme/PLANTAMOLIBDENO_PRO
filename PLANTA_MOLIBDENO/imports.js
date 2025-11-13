console.log("Imports Change");

// OPTIMIZACION//////////////////////////////////////////////////////////////////////////////////////

// app.renderer.setPixelRatio(window.devicePixelRatio * 2); // más alta densidad

// import("../js/optimizacion.js");
import("../js/optimizacion2.js");

// import("../js/optimizacion4.js");


// CAMARA//////////////////////////////////////////////////////////////////////////////////////

import("../js/RotateObj.js");//Rotar pantalla movil
import("../js/distancia.js");//Distancia de dibujado de la camara
import("../js/escalaCamara.js");//POV camara
import("../js/camara.js");
// import("../js/person.js");
// import("../js/LimiteSuelo.js");
import("../js/zoomCamara.js");//Zoom de la camara MAXIMO

// import("../js/CamaraLibre.js");
import("../js/plantas.js");

//HERRAMIENTAS//////////////////////////////////////////////////////////////////////////////////////

import("../js/objsInfo.js");//Informacion de los objetos y de la camara
// import("../js/fps.js");//Mostrar los FPS
import("../js/crearTexto.js");//Raycaster para seleccionar objetos
import("../js/caminos.js");
import("../js/resaltadoEdificios.js");

//PROCESO///////////////////////////////////////////////////////////////////////////////////////////

import("../js/Proceso/Proceso1.js");
// import("../js/Proceso/ProcesoB2.js");
import("../js/Proceso/Proceso Ondas.js");
// import("../js/Proceso/ProcesoC3.js");
import("../js/Proceso/BotonLibre.js");
import("../js/Proceso/Audios.js");

//Terminado///////////////////////////////////////////////////////////////////////////////////////////
v3d.puzzles.procedures["inicio"]();



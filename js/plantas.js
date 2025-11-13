// --- CONFIGURACIÓN ---
const CAMERA_NAME = 'Camera'; // Cambia si tu cámara tiene otro nombre
const MAX_DISTANCE = 1; // distancia máxima para mostrar plantas

// --- CÓDIGO ---
const app = v3d.apps && v3d.apps.size > 0 ? v3d.apps.values().next().value : null;

if (app && app.scene && app.camera) {
    const camera = app.scene.getObjectByName(CAMERA_NAME) || app.camera;

    function updatePlantVisibility() {
        app.scene.traverse(function(obj) {
            if (obj.isMesh && obj.name.startsWith("planta")) {
                const distance = camera.position.distanceTo(obj.position);
                obj.visible = (distance <= MAX_DISTANCE);
            }
        });
    }

    app.renderCallbacks.push(updatePlantVisibility);

} else {
    console.warn("❗ No se encontró la instancia de Verge3D o la cámara. Asegúrate de ejecutar este bloque después de cargar la escena.");
}

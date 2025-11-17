/**
 * Combined Distance + Frustum Culling for Verge3D
 * - Soporta exclusión por nombre y por grupos (si un ancestro está excluido, sus hijos también).
 * - Soporta comodín '*' (ej: "Mesh.227*").
 */

(function(){

if (!window.v3d || !v3d.apps || !v3d.apps[0]) {
    console.warn('[combinedCulling] v3d/app no disponible.');
    return;
}

var app = v3d.apps[0];

if (app.__combinedCullingAdded) {
    console.log('[combinedCulling] ya añadido, saliendo.');
    return;
}
app.__combinedCullingAdded = true;

// =========================
// CONFIG
// =========================
var maxDistance = 100;
var updateEveryNFrames = 1;
var useFrustum = true;
var useDistance = true;

// Lista de exclusión: puede contener nombres exactos o con '*' (wildcard)
var excludedNames = [
    "Mesh.227_0",
    "Mesh.227_1_1",
    "edificio",
    "pCube15",
    "polySurface1146",
    "Mesh.487_1_1",
    "Mesh.487_2_2",
    "Mesh.487_0",
    "polySurface341.001",
    "polySurface341",
    "extension_mesh_2672",
    "polySurface342.001",
    "polySurface342",
    "extension_mesh_696",
    "Mesh.7991_0",
    "Mesh.966_0",
	"techo_mesh1",
	"extension_mesh_402",
	"pCube479",
	"extension_mesh_1088",
	"polySurface1072",
	"extension_mesh_251",
	"extension_mesh_1987",
	"extension_mesh_275",
	"pCube472",
	"Ax1",
	"Ax2",
	"Ax3",
	"Ax4",
	"Ax5",
	"Ax6",
	"Ax7",
	"Ax8",
	"Ax9",
	"Ax10",
	"Ax11",
	"Ax12",
	"Ax13",
	"Ax14",
	"Rectangle3122.003",
	"est",
	"polySurface1171",
	"polySurface1146",
	"extension_mesh_1626",
	"estructura_mesh_560",
	"extension_mesh_1149",
	"extension_mesh_565",
	"extension_mesh_1623",
	"estructura_mesh_509",
	"Cylinder2739",
	"Cylinder2738",
	"pCube471.001",
	"extension_mesh_112",
	"extension_mesh_1111",
	"extension_mesh_2301",
	"extension_mesh_907",
	"estructura_mesh_465",
	"estructura_mesh_217",
	"pCube473",
	"estructura_mesh_203",
	"extension_mesh_528",
	"estructura_mesh_1167",
	"extension_mesh_2558",
	"extension_mesh_104",
	"xa",
	"pol"

];

// =========================
// estructuras reutilizables
// =========================
var tmpCamPos = new v3d.Vector3();
var tmpCenter = new v3d.Vector3();
var tmpWorldBox = new v3d.Box3();
var geomBoxMap = new WeakMap();
var trackedMeshes = [];
var frameCounter = 0;

// Compilado de patterns (RegExp) desde excludedNames
var excludedRegexes = [];
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function buildExcludedRegexes() {
    excludedRegexes.length = 0;
    for (var i = 0; i < excludedNames.length; i++) {
        var name = (excludedNames[i] || '').toString();
        if (name.indexOf('*') !== -1) {
            // transformar wildcard * -> .* y anclar inicio/fin
            var re = '^' + escapeRegExp(name).replace(/\\\*/g, '.*') + '$';
            excludedRegexes.push(new RegExp(re));
        } else {
            // exact match (anchored)
            excludedRegexes.push(new RegExp('^' + escapeRegExp(name) + '$'));
        }
    }
}

// Comprueba si un nombre coincide con alguna regex de exclusión
function isNameExcluded(name) {
    if (!name) return false;
    for (var i = 0; i < excludedRegexes.length; i++) {
        if (excludedRegexes[i].test(name)) return true;
    }
    return false;
}

// Comprueba si el objeto o alguno de sus ancestros está excluido
function isObjectExcludedByAncestors(obj) {
    var cur = obj;
    while (cur) {
        if (cur.name && isNameExcluded(cur.name)) return true;
        cur = cur.parent;
    }
    return false;
}

// =========================
// RECOLECTAR MESHES VALIDOS
// =========================
function buildTrackedMeshes() {
    trackedMeshes.length = 0;
    geomBoxMap = new WeakMap();

    if (!Array.isArray(excludedRegexes) || excludedRegexes.length === 0) {
        buildExcludedRegexes();
    }

    app.scene.traverse(function(obj){
        // Si este objeto o alguno de sus ancestros está en la lista de exclusión -> saltar
        if (isObjectExcludedByAncestors(obj)) return;

        if (!obj.isMesh) return;
        if (!obj.geometry || !obj.geometry.isBufferGeometry) return;

        var posAttr = obj.geometry.attributes && obj.geometry.attributes.position;
        if (!posAttr || posAttr.count < 12) return;

        if (!obj.geometry.boundingBox) {
            try { obj.geometry.computeBoundingBox(); } catch(e) { }
        }

        if (obj.geometry.boundingBox) {
            geomBoxMap.set(obj, obj.geometry.boundingBox.clone());
        } else {
            geomBoxMap.set(obj, null);
        }

        // marcamos frustumCulled solo para los meshes que vamos a manejar
        obj.frustumCulled = true;
        trackedMeshes.push(obj);
    });

    console.log('[combinedCulling] meshes rastreadas:', trackedMeshes.length);
}

// Inicializar regexes y meshes
buildExcludedRegexes();
buildTrackedMeshes();

// =========================
// LÓGICA DE CULLING
// =========================
function combinedCulling() {
    frameCounter++;
    if (frameCounter % updateEveryNFrames !== 0) return;

    var cam = app.camera;
    if (!cam) return;

    cam.getWorldPosition(tmpCamPos);

    var frustum = null;
    if (useFrustum) {
        frustum = new v3d.Frustum();
        var camMatrix = new v3d.Matrix4().multiplyMatrices(
            cam.projectionMatrix,
            cam.matrixWorldInverse
        );
        frustum.setFromProjectionMatrix(camMatrix);
    }

    for (var i = 0; i < trackedMeshes.length; i++) {
        var mesh = trackedMeshes[i];
        if (!mesh) continue;

        var geomBox = geomBoxMap.get(mesh);
        if (geomBox) {
            tmpWorldBox.copy(geomBox).applyMatrix4(mesh.matrixWorld);
        } else {
            tmpWorldBox.setFromObject(mesh);
        }

        tmpWorldBox.getCenter(tmpCenter);
        var dist = tmpCamPos.distanceTo(tmpCenter);

        var visible = true;
        if (useDistance && dist >= maxDistance) visible = false;
        if (visible && useFrustum && !frustum.intersectsBox(tmpWorldBox)) visible = false;

        mesh.visible = visible;
    }
}

// =========================
// ENGANCHAR AL LOOP
// =========================
if (Array.isArray(app.renderCallbacks)) {
    app.renderCallbacks.push(function(delta){ combinedCulling(); });
} else if (typeof app.addEventListener === 'function') {
    app.addEventListener('afterRender', combinedCulling);
} else {
    console.warn('[combinedCulling] no pude engancharme al loop de render.');
}

// =========================
// API PÚBLICA
// =========================
app.__combinedCulling = {
    rebuild: buildTrackedMeshes,
    setMaxDistance: function(d){ maxDistance = d; },
    setUpdateEveryNFrames: function(n){ updateEveryNFrames = Math.max(1, Math.floor(n)); },
    enableFrustum: function(b){ useFrustum = !!b; },
    enableDistance: function(b){ useDistance = !!b; },

    // Añade un nombre/patrón a la lista de exclusión y reconstruye
    exclude: function(name){
        if (!name) return;
        excludedNames.push(name);
        buildExcludedRegexes();
        buildTrackedMeshes();
    },

    // Quita un nombre/patrón de la lista de exclusión (elimina todas las coincidencias exactas)
    include: function(name){
        if (!name) return;
        for (var i = excludedNames.length - 1; i >= 0; i--) {
            if (excludedNames[i] === name) excludedNames.splice(i, 1);
        }
        buildExcludedRegexes();
        buildTrackedMeshes();
    },

    // Reemplaza la lista de exclusion por un array nuevo
    setExcludedNames: function(arr){
        if (!Array.isArray(arr)) return;
        excludedNames = arr.slice();
        buildExcludedRegexes();
        buildTrackedMeshes();
    },

    // Devuelve la lista actual (útil para debugging)
    getExcludedNames: function(){ return excludedNames.slice(); }
};

console.log('[combinedCulling] añadido correctamente. maxDistance=', maxDistance, 'updateEveryNFrames=', updateEveryNFrames);

})();

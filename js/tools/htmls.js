// v3d-iframe-overlay.js
// Uso: importa este archivo en tu proyecto Verge3D (por ejemplo import("../js/tools/v3d-iframe-overlay.js");)
// Luego llama: html("../iframes/example.html"); y closehtml();


(function () {
if (window.v3dHtmlOverlayInit) return;
window.v3dHtmlOverlayInit = true;


// CSS del overlay
const CSS = `
#v3d-iframe-overlay{display:none;position:fixed;inset:0;z-index:99999;align-items:center;justify-content:center;}
#v3d-iframe-overlay.show{display:flex;}
#v3d-iframe-overlay .v3d-iframe-backdrop{position:absolute;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(2px);opacity:0;transition:opacity .22s ease}
#v3d-iframe-overlay.show .v3d-iframe-backdrop{opacity:1}
#v3d-iframe-overlay .v3d-iframe-container{position:relative;max-width:90vw;max-height:90vh;width:900px;height:600px;border-radius:10px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,.6);transform:translateY(8px);opacity:0;transition:opacity .22s ease, transform .22s ease;background:#fff}
#v3d-iframe-overlay.show .v3d-iframe-container{transform:none;opacity:1}
#v3d-iframe-overlay .v3d-iframe-frame{width:100%;height:100%;border:0;display:block}
#v3d-iframe-overlay .v3d-iframe-close{position:absolute;top:10px;right:10px;z-index:2;border:none;background:rgba(0,0,0,0.5);color:#fff;font-size:20px;width:36px;height:36px;border-radius:50%;cursor:pointer}
@media (max-width:700px){
#v3d-iframe-overlay .v3d-iframe-container{width:95vw;height:70vh;border-radius:6px}
}
`;


// Crear style
function injectStyle(){
if (document.getElementById('v3d-iframe-overlay-style')) return;
const style = document.createElement('style');
style.id = 'v3d-iframe-overlay-style';
style.innerHTML = CSS;
document.head.appendChild(style);
}


// Crear DOM del overlay
function buildOverlay(){
if (document.getElementById('v3d-iframe-overlay')) return document.getElementById('v3d-iframe-overlay');


const overlay = document.createElement('div');
overlay.id = 'v3d-iframe-overlay';
overlay.setAttribute('aria-hidden', 'true');


overlay.innerHTML = `
<div class="v3d-iframe-backdrop" tabindex="-1"></div>
<div class="v3d-iframe-container" role="dialog" aria-modal="true">
<button class="v3d-iframe-close" title="Cerrar">×</button>
<iframe class="v3d-iframe-frame" src="about:blank" sandbox="allow-scripts allow-same-origin allow-popups"></iframe>
</div>
`;


document.body.appendChild(overlay);


// listeners
const backdrop = overlay.querySelector('.v3d-iframe-backdrop');
const closeBtn = overlay.querySelector('.v3d-iframe-close');


backdrop.addEventListener('click', () => window.closehtml && window.closehtml());
closeBtn.addEventListener('click', () => window.closehtml && window.closehtml());


// close on ESC
document.addEventListener('keydown', (e) => {
if (!overlay.classList.contains('show')) return;
if (e.key === 'Escape' || e.key === 'Esc') {
e.preventDefault();
window.closehtml && window.closehtml();
}
});


return overlay;
}


})();
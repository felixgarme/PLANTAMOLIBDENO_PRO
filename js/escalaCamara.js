// === Botón + cuadro para cambiar el FOV (zoom) de la cámara ===

// Obtener referencia a la cámara actual
var app = v3d.apps[0];
var camera = app.camera;

// Establecer FOV por defecto
camera.fov = 50;
camera.updateProjectionMatrix();

// Crear contenedor principal
var uiContainer = document.createElement('div');
uiContainer.style.position = 'fixed';
uiContainer.style.top = '10px'; // 30% menos
uiContainer.style.right = '60px'; // 30% menos
uiContainer.style.zIndex = '10000';
uiContainer.style.fontFamily = 'sans-serif';
document.body.appendChild(uiContainer);

// --- Botón principal ---
var btn = document.createElement('button');
btn.textContent = ' Zoom';
btn.style.padding = '7px 10px'; // reducido 30%
btn.style.border = '1px solid #6B8BDE';
btn.style.borderRadius = '35px'; // 30% menos de 50px
btn.style.background = '#E5EFF9';
btn.style.boxShadow = '0px 3px 13px 1.4px #6B8BDE66'; // suavizado proporcional
btn.style.cursor = 'pointer';
btn.style.width = '103px'; // 70% de 147px
btn.style.height = '41px'; // 70% de 59px
btn.style.opacity = '1';
btn.style.display = 'flex';
btn.style.alignItems = 'center';
btn.style.justifyContent = 'center';
btn.style.gap = '5.6px'; // 70% de 8px

// --- Tipografía personalizada ---
btn.style.fontFamily = '"AA Smart Sans", sans-serif';
btn.style.fontWeight = '600';
btn.style.fontStyle = 'normal';
btn.style.fontSize = '14px'; // 70% de 20px
btn.style.lineHeight = '85px'; // 70% de 121px
btn.style.letterSpacing = '0';
btn.style.textAlign = 'center';
btn.style.verticalAlign = 'middle';
btn.style.color = '#031795'; // color del texto

uiContainer.appendChild(btn);

// --- Imagen de lupa al principio ---
var img = document.createElement('img');
img.src = '../img/lupa.png'; // ruta actualizada
img.style.width = '14px'; // 70% de 20px
img.style.height = '14px';
img.style.objectFit = 'contain';
btn.prepend(img);

// --- Cuadro flotante ---
var panel = document.createElement('div');
panel.style.position = 'absolute';
// 🔹 Aumentamos la separación entre el botón y el cuadro
panel.style.top = '55px'; // antes: 35px → más separado del botón
panel.style.right = '0';
panel.style.width = '140px'; // 70% de 200px
panel.style.padding = '7px'; // 70% de 10px
panel.style.borderRadius = '7px'; // 70% de 10px
panel.style.background = 'rgba(0,0,0,0.8)';
panel.style.color = 'white';
panel.style.display = 'none';
panel.style.boxShadow = '0 1.4px 5.6px rgba(0,0,0,0.5)'; // suavizado proporcional
uiContainer.appendChild(panel);

// Etiqueta
var label = document.createElement('div');
label.textContent = 'Campo de visión (FOV)';
label.style.fontSize = '10px'; // 70% de 14px
label.style.marginBottom = '4px'; // 70% de 6px
panel.appendChild(label);

// Slider
var slider = document.createElement('input');
slider.type = 'range';
slider.min = '20';
slider.max = '80';
slider.value = camera.fov.toFixed(0);
slider.style.width = '100%';
panel.appendChild(slider);

// Valor actual
var valLabel = document.createElement('div');
valLabel.textContent = slider.value;
valLabel.style.textAlign = 'center';
valLabel.style.marginTop = '3px'; // 70% de 4px
panel.appendChild(valLabel);

// Evento para abrir/cerrar el panel
btn.addEventListener('click', function() {
  panel.style.display = (panel.style.display === 'none') ? 'block' : 'none';
});

// Actualizar el FOV al mover el deslizador
slider.addEventListener('input', function() {
  var newFov = parseFloat(slider.value);
  camera.fov = newFov;
  camera.updateProjectionMatrix();
  valLabel.textContent = newFov.toFixed(0);
});

// ========================================================================
// FUNCIÓN GLOBAL:
// humo(objName, color, size, count, alturaMax, velocidad, dispersion, orientacion)
// Ejemplo:
//
// humo("pCylinder206", "#2bbf24", 0.2, 300, 5.8, 0.2, 0.4, "arriba");
// humo("pCylinder206", "white", 0.15, 80, 2, 0.02, 0.3, "abajo");
// ========================================================================
window.humo = function(
    objName,
    color = "#ffffff",
    size = 0.15,
    count = 40,
    alturaMax = 1.2,
    velocidad = 0.003,
    dispersion = 0.25,
    orientacion = "arriba"      // ← NUEVO
){
    try {
        let v3d = window.v3d;
        let app = window.app;

        if (!v3d || !app) {
            console.error("❌ Verge3D no está listo.");
            return;
        }

        const scene = app.scene;

        // Buscar el objeto base
        const base = scene.getObjectByName(objName);
        if (!base) {
            console.error("❌ No se encontró:", objName);
            return;
        }

        console.log(`✔ Generando humo en ${objName} (${orientacion})`);

        // --------------------------------------------------------
        // SISTEMA DE PARTÍCULAS
        // --------------------------------------------------------
        const positions = new Float32Array(count * 3);
        const velocities = [];
        const baseX = base.position.x;
        const baseY = base.position.y + 0.05;
        const baseZ = base.position.z;

        // Dirección vertical según orientación
        const dir = (orientacion === "abajo") ? -1 : 1;

        const geometry = new v3d.BufferGeometry();
        geometry.setAttribute("position", new v3d.BufferAttribute(positions, 3));

        const material = new v3d.PointsMaterial({
            color: new v3d.Color(color),
            size: size,
            transparent: true,
            opacity: 0.9,
            depthWrite: false
        });

        const points = new v3d.Points(geometry, material);
        scene.add(points);

        // --------------------------------------------------------
        // INICIALIZAR PARTICULA (punta en la base)
        // --------------------------------------------------------
        function resetParticle(i) {
            const idx = i * 3;

            positions[idx]   = baseX;
            positions[idx+1] = baseY;
            positions[idx+2] = baseZ;

            velocities[i] = {
                y: dir * (velocidad + Math.random() * velocidad * 1.3)
            };
        }

        for (let i = 0; i < count; i++) resetParticle(i);
        geometry.attributes.position.needsUpdate = true;

        // --------------------------------------------------------
        // ANIMACIÓN (cono creciente)
        // --------------------------------------------------------
        app.addEventListener("beforeRender", ()=> {

            for (let i = 0; i < count; i++) {

                const idx = i * 3;

                // progreso vertical de 0 a 1 (funciona para arriba y abajo)
                const alturaRelativa =
                    Math.abs((positions[idx+1] - baseY) / alturaMax);

                const factor = Math.min(Math.max(alturaRelativa, 0), 1);

                // Dispersión crece con la altura
                const disp = dispersion * factor;

                // Mover verticalmente según orientacion
                positions[idx+1] += velocities[i].y;

                // Expansión horizontal
                positions[idx] += (Math.random()*disp*2 - disp) * 0.05;
                positions[idx+2] += (Math.random()*disp*2 - disp) * 0.05;

                // Cuando llega al límite, reiniciar
                const limite = baseY + (alturaMax * dir);

                if (
                    (dir === 1 && positions[idx+1] > limite) ||
                    (dir === -1 && positions[idx+1] < limite)
                ) {
                    resetParticle(i);
                }
            }

            geometry.attributes.position.needsUpdate = true;
        });

        console.log(`🚀 Humo activado (${orientacion}) para ${objName}`);

    } catch (e) {
        console.error("❌ Error en humo():", e);
    }
};

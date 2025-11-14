app.scene.traverse(function(obj){
    if (obj.isCamera) {
        obj.near = 0.1;
        obj.far = 30; // aumenta este valor
        obj.updateProjectionMatrix();
    }
});
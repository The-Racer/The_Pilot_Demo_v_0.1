var createScene = function () {
    var scene = new BABYLON.Scene(engine);

    // 1. Ativar Gravidade e Colisões na Cena
    scene.collisionsEnabled = true;
    scene.gravity = new BABYLON.Vector3(0, -0.9, 0);

    // 2. Câmera com Colisão (para não atravessar o chão)
    var camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 20, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);
    camera.checkCollisions = true;
    camera.applyGravity = true;

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // 3. O Chão (Precisa de colisão para o carro não cair no infinito)
    var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 60, height: 60}, scene);
    ground.checkCollisions = true; 

    // 4. Prédio Roxo (O obstáculo)
    var building = BABYLON.MeshBuilder.CreateBox("building", {width: 4, height: 15, depth: 4}, scene);
    building.position = new BABYLON.Vector3(10, 7.5, 10);
    building.checkCollisions = true; // ATIVA A PAREDE SOLIDA
    
    var buildMat = new BABYLON.StandardMaterial("buildMat", scene);
    buildMat.diffuseColor = new BABYLON.Color3(0.5, 0, 1);
    building.material = buildMat;

    // 5. Carregando seu Carro com Colisão
    BABYLON.SceneLoader.ImportMesh("", "https://assets.babylonjs.com/meshes/", "car.glb", scene, function (meshes) {
        var car = meshes[0];
        car.position.y = 0.5;
        car.scaling = new BABYLON.Vector3(3, 3, 3);
        
        // Faz o carro respeitar as leis da física
        car.checkCollisions = true;
        car.applyGravity = true;
    });

    return scene;
};
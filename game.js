const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    // Câmera que segue o carro de longe
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // Criando o chão para as "estripulias"
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 100, height: 100}, scene);
    const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.1, 0.5, 0.2); // Verde para parecer grama/pista
    ground.material = groundMat;

    // Sistema de Teclado
    const inputMap = {};
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
        inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
        inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));

    // Carregando o seu carro do Vectary
    BABYLON.SceneLoader.ImportMesh("", "assets/", "Carro_v1_teste.glb", scene, function (meshes) {
        const car = meshes[0];
        car.position.y = 0.5;

        let speed = 0;
        
        scene.onBeforeRenderObservable.add(() => {
            // Controles
            if (inputMap["ArrowUp"] || inputMap["w"]) speed = 0.2;
            else if (inputMap["ArrowDown"] || inputMap["s"]) speed = -0.1;
            else speed *= 0.9; // Desaceleração

            if (inputMap["ArrowLeft"] || inputMap["a"]) car.rotation.y -= 0.05;
            if (inputMap["ArrowRight"] || inputMap["d"]) car.rotation.y += 0.05;

            car.moveWithCollisions(car.forward.scaleInPlace(speed));
        });
    });

    return scene;
};

const scene = createScene();
engine.runRenderLoop(() => { scene.render(); });
window.addEventListener("resize", () => { engine.resize(); });
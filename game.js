const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.05, 0.05, 0.05);

    // Câmera e Luz
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 12, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    // --- CHÃO (ASFALTO) ---
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 200, height: 200}, scene);
    const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    ground.material = groundMat;

    let chassi, rodas = [];
    let inputMap = {};

    engine.displayLoadingUI();

    // --- CARREGANDO O CARRO ---
    BABYLON.SceneLoader.ImportMeshAsync("", "assets/", "carro.glb", scene).then((result) => {
        // Tenta achar o chassi por nome, se não achar, pega o primeiro objeto grande
        chassi = result.meshes.find(m => m.name.toLowerCase().includes("chassis")) || result.meshes[1];
        rodas = result.meshes.filter(m => m.name.toLowerCase().includes("wheel"));

        if (chassi) {
            chassi.position.y = 0.6; // Ajuste para não ficar enterrado
            camera.lockedTarget = chassi;
            console.log("The Pilot: Carro carregado!");
        }
        engine.hideLoadingUI();
    }).catch((err) => {
        console.error("Erro no GLB:", err);
        engine.hideLoadingUI(); // Tira o load mesmo se der erro
    });

    // Controles WASD
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
        inputMap[evt.sourceEvent.key.toLowerCase()] = true;
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
        inputMap[evt.sourceEvent.key.toLowerCase()] = false;
    }));

    // Física Arcade
    let speed = 0;
    scene.onBeforeRenderObservable.add(() => {
        if (!chassi) return;

        if (inputMap["w"]) speed = Math.min(speed + 0.01, 0.5);
        else if (inputMap["s"]) speed = Math.max(speed - 0.01, -0.2);
        else speed *= 0.95;

        if (Math.abs(speed) > 0.01) {
            const dir = speed > 0 ? 1 : -1;
            if (inputMap["a"]) chassi.rotation.y -= 0.04 * dir;
            if (inputMap["d"]) chassi.rotation.y += 0.04 * dir;
        }

        chassi.movePOV(0, 0, speed);
        rodas.forEach(r => { if(r) r.rotation.x += speed * 2; });
    });

    return scene;
};

const scene = createScene();
engine.runRenderLoop(() => { scene.render(); });
window.addEventListener("resize", () => { engine.resize(); });
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

// bump the number after ?v= every time you change player.js
// (GitHub Pages + browsers cache imports hard, this forces a fresh copy)
import {
    createPlayer,
    updatePlayer
} from './player.js?v=2';

// ==========================================
// 1. SCENE
// ==========================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x101525);
scene.fog = new THREE.Fog(0x101525, 35, 120);

// ==========================================
// 2. CAMERA
// ==========================================

const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    500
);

camera.position.set(0, 5, 9);

// ==========================================
// 3. RENDERER
// ==========================================

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 1.5)
);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.getElementById('game-container')
    .appendChild(renderer.domElement);

// ==========================================
// 4. LIGHTING (tuned for toon shading)
// ==========================================
// ambient is kept low so the 3 shading steps on the character stay visible.
// before: both lights at 2 = washed out, no contrast.

const ambient = new THREE.HemisphereLight(
    0xdfe6ff,
    0x30304f,
    0.8
);

scene.add(ambient);

const sunlight = new THREE.DirectionalLight(
    0xffffff,
    2.8
);

const sunOffset = new THREE.Vector3(15, 25, 10);

sunlight.position.copy(sunOffset);
sunlight.castShadow = true;

// shadow area follows the player (default area is tiny and stays at origin)
sunlight.shadow.mapSize.set(2048, 2048);
sunlight.shadow.camera.left = -14;
sunlight.shadow.camera.right = 14;
sunlight.shadow.camera.top = 14;
sunlight.shadow.camera.bottom = -14;
sunlight.shadow.camera.near = 1;
sunlight.shadow.camera.far = 80;
sunlight.shadow.bias = -0.0005;
sunlight.shadow.normalBias = 0.03;

scene.add(sunlight);
scene.add(sunlight.target);

// ==========================================
// 5. ENVIRONMENT
// ==========================================

const groundGeometry = new THREE.PlaneGeometry(
    200,
    200
);

const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x252b38,
    roughness: 0.9
});

const ground = new THREE.Mesh(
    groundGeometry,
    groundMaterial
);

ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;

scene.add(ground);

// DEVELOPMENT GRID

const grid = new THREE.GridHelper(
    200,
    100,
    0x6655aa,
    0x34394b
);

grid.position.y = 0.02;

scene.add(grid);

// ==========================================
// 6. PLAYER
// ==========================================

const player = createPlayer(scene);

// ==========================================
// 7. INPUT SYSTEM
// ==========================================

const keys = {};

window.addEventListener('keydown', (event) => {
    keys[event.code] = true;
});

window.addEventListener('keyup', (event) => {
    keys[event.code] = false;
});

window.addEventListener('blur', () => {
    Object.keys(keys).forEach(key => {
        keys[key] = false;
    });
});

// ==========================================
// 8. CAMERA FOLLOW
// ==========================================

const cameraOffset = new THREE.Vector3(0, 5, 9);

function updateCamera(delta) {

    const targetPosition = player.position
        .clone()
        .add(cameraOffset);

    const smoothness = 1 - Math.exp(-6 * delta);

    camera.position.lerp(
        targetPosition,
        smoothness
    );

    camera.lookAt(
        player.position.x,
        player.position.y + 1.5,
        player.position.z
    );
}

// keep the sun + its shadow box centered on the player
function updateSun() {
    sunlight.target.position.copy(player.position);
    sunlight.position.copy(player.position).add(sunOffset);
}

// ==========================================
// 9. HUD
// ==========================================

const loadingScreen = document.getElementById('loading');

if (loadingScreen) {
    loadingScreen.style.display = 'none';
}

// ==========================================
// 10. GAME LOOP
// ==========================================

const clock = new THREE.Clock();

function animate() {

    requestAnimationFrame(animate);

    const delta = Math.min(
        clock.getDelta(),
        0.05
    );

    updatePlayer(player, keys, delta);

    updateCamera(delta);
    updateSun();

    renderer.render(scene, camera);
}

animate();

// ==========================================
// 11. WINDOW RESIZE
// ==========================================

window.addEventListener('resize', () => {

    camera.aspect =
        window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
});

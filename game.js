
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

import {
    createPlayer,
    updatePlayer
} from './player.js';

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

document.getElementById('game-container')
    .appendChild(renderer.domElement);

// ==========================================
// 4. LIGHTING
// ==========================================

const ambient = new THREE.HemisphereLight(
    0xffffff,
    0x30304f,
    2
);

scene.add(ambient);

const sunlight = new THREE.DirectionalLight(
    0xffffff,
    2
);

sunlight.position.set(15, 25, 10);
sunlight.castShadow = true;

scene.add(sunlight);

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
        player.position.y + 1,
        player.position.z
    );
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

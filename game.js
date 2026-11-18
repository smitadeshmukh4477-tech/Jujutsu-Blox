
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

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

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
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

const groundGeometry = new THREE.PlaneGeometry(200, 200);

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

// Grid for development
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

const player = new THREE.Group();

const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.45, 1, 4, 8),
    new THREE.MeshStandardMaterial({
        color: 0x5544bb,
        roughness: 0.55
    })
);

body.position.y = 1;
body.castShadow = true;

player.add(body);

// Head
const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 16, 16),
    new THREE.MeshStandardMaterial({
        color: 0xf0d0bc
    })
);

head.position.y = 2;
head.castShadow = true;

player.add(head);

player.position.set(0, 0, 0);
scene.add(player);

// ==========================================
// 7. MOVEMENT
// ==========================================

const keys = {};

window.addEventListener('keydown', (event) => {
    keys[event.code] = true;
});

window.addEventListener('keyup', (event) => {
    keys[event.code] = false;
});

const clock = new THREE.Clock();

function updatePlayer(delta) {
    const direction = new THREE.Vector3();

    if (keys['KeyW']) direction.z -= 1;
    if (keys['KeyS']) direction.z += 1;
    if (keys['KeyA']) direction.x -= 1;
    if (keys['KeyD']) direction.x += 1;

    if (direction.lengthSq() > 0) {
        direction.normalize();

        player.position.x += direction.x * 8 * delta;
        player.position.z += direction.z * 8 * delta;

        player.rotation.y = Math.atan2(
            direction.x,
            direction.z
        );
    }
}

// ==========================================
// 8. CAMERA FOLLOW
// ==========================================

function updateCamera() {
    const offset = new THREE.Vector3(0, 5, 9);

    const targetPosition = player.position.clone().add(offset);

    camera.position.lerp(targetPosition, 0.08);

    camera.lookAt(
        player.position.x,
        player.position.y + 1,
        player.position.z
    );
}

// ==========================================
// 9. HUD
// ==========================================

document.getElementById('loading').style.display = 'none';

// ==========================================
// 10. GAME LOOP
// ==========================================

function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.05);

    updatePlayer(delta);
    updateCamera();

    renderer.render(scene, camera);
}

animate();

// ==========================================
// 11. WINDOW RESIZE
// ==========================================

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
});


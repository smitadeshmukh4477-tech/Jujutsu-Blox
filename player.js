
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

// ==========================================
// JUJUTSU BLOX - PLAYER SYSTEM
// ANIME CHARACTER EDITION
// ==========================================

const PLAYER_CONFIG = {
    speed: 8,
    sprintSpeed: 13,
    rotationSpeed: 12,
    spawnPosition: new THREE.Vector3(0, 0, 0)
};

// ==========================================
// MATERIALS
// ==========================================

const materials = {
    skin: new THREE.MeshStandardMaterial({
        color: 0xf0c6a5,
        roughness: 0.85
    }),

    uniform: new THREE.MeshStandardMaterial({
        color: 0x171725,
        roughness: 0.75
    }),

    uniformDark: new THREE.MeshStandardMaterial({
        color: 0x090914,
        roughness: 0.8
    }),

    hair: new THREE.MeshStandardMaterial({
        color: 0xff6699,
        roughness: 0.9
    }),

    eyes: new THREE.MeshStandardMaterial({
        color: 0x21101b
    }),

    white: new THREE.MeshStandardMaterial({
        color: 0xffffff
    }),

    buttons: new THREE.MeshStandardMaterial({
        color: 0xb7a4c9,
        metalness: 0.5,
        roughness: 0.4
    })
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function createMesh(geometry, material, position, parent) {
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(
        position.x,
        position.y,
        position.z
    );

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    parent.add(mesh);

    return mesh;
}

function createSpike(parent, position, direction, size) {
    const geometry = new THREE.ConeGeometry(
        size * 0.42,
        size,
        7
    );

    const spike = createMesh(
        geometry,
        materials.hair,
        position,
        parent
    );

    const target = new THREE.Vector3(
        direction.x,
        direction.y,
        direction.z
    ).normalize();

    spike.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        target
    );

    return spike;
}

// ==========================================
// 1. CREATE PLAYER
// ==========================================

export function createPlayer(scene) {

    const player = new THREE.Group();

    player.name = 'Player';

    // CHARACTER PARTS GROUP

    const character = new THREE.Group();

    character.name = 'CharacterModel';

    player.add(character);

    // ======================================
    // TORSO
    // ======================================

    const torso = createMesh(
        new THREE.BoxGeometry(0.76, 0.85, 0.42),
        materials.uniform,
        { x: 0, y: 1.18, z: 0 },
        character
    );

    torso.name = 'Torso';

    // Rounded-looking shoulders

    for (const side of [-1, 1]) {
        createMesh(
            new THREE.SphereGeometry(0.23, 12, 12),
            materials.uniform,
            { x: side * 0.36, y: 1.49, z: 0 },
            character
        );
    }

    // NECK

    createMesh(
        new THREE.CylinderGeometry(0.13, 0.15, 0.2, 12),
        materials.skin,
        { x: 0, y: 1.68, z: 0 },
        character
    );

    // COLLAR

    const collar = createMesh(
        new THREE.BoxGeometry(0.32, 0.13, 0.45),
        materials.uniformDark,
        { x: 0, y: 1.57, z: 0.02 },
        character
    );

    collar.rotation.x = -0.15;

    // UNIFORM BUTTONS

    for (let i = 0; i < 3; i++) {
        createMesh(
            new THREE.SphereGeometry(0.035, 8, 8),
            materials.buttons,
            { x: 0, y: 1.38 - i * 0.18, z: 0.216 },
            character
        );
    }

    // BELT

    createMesh(
        new THREE.BoxGeometry(0.76, 0.12, 0.44),
        materials.uniformDark,
        { x: 0, y: 0.72, z: 0 },
        character
    );

    // ======================================
    // HEAD
    // ======================================

    const head = new THREE.Group();

    head.name = 'Head';

    head.position.y = 1.99;

    character.add(head);

    createMesh(
        new THREE.SphereGeometry(0.31, 24, 24),
        materials.skin,
        { x: 0, y: 0, z: 0 },
        head
    );

    // EARS

    for (const side of [-1, 1]) {
        createMesh(
            new THREE.SphereGeometry(0.075, 12, 12),
            materials.skin,
            { x: side * 0.3, y: -0.02, z: 0 },
            head
        );
    }

    // EYES

    for (const side of [-1, 1]) {

        createMesh(
            new THREE.SphereGeometry(0.045, 12, 12),
            materials.white,
            { x: side * 0.12, y: 0.045, z: 0.265 },
            head
        );

        createMesh(
            new THREE.SphereGeometry(0.023, 10, 10),
            materials.eyes,
            { x: side * 0.12, y: 0.045, z: 0.303 },
            head
        );

        // EYEBROWS

        const eyebrow = createMesh(
            new THREE.BoxGeometry(0.105, 0.025, 0.035),
            materials.hair,
            { x: side * 0.12, y: 0.12, z: 0.27 },
            head
        );

        eyebrow.rotation.z = side * -0.12;
    }

    // NOSE

    createMesh(
        new THREE.SphereGeometry(0.035, 10, 10),
        materials.skin,
        { x: 0, y: -0.035, z: 0.295 },
        head
    );

    // MOUTH

    const mouth = createMesh(
        new THREE.BoxGeometry(0.09, 0.012, 0.015),
        materials.eyes,
        { x: 0, y: -0.14, z: 0.298 },
        head
    );

    // ======================================
    // ANIME HAIR
    // ======================================

    // Main hair cap

    createMesh(
        new THREE.SphereGeometry(
            0.325,
            20,
            16,
            0,
            Math.PI * 2,
            0,
            Math.PI * 0.55
        ),
        materials.hair,
        { x: 0, y: 0.08, z: -0.015 },
        head
    );

    // Top spikes

    createSpike(
        head,
        { x: 0, y: 0.39, z: -0.02 },
        { x: 0, y: 1, z: 0 },
        0.42
    );

    createSpike(
        head,
        { x: -0.17, y: 0.27, z: 0.02 },
        { x: -0.5, y: 1, z: 0.1 },
        0.38
    );

    createSpike(
        head,
        { x: 0.17, y: 0.27, z: 0.02 },
        { x: 0.5, y: 1, z: 0.1 },
        0.38
    );

    createSpike(
        head,
        { x: -0.25, y: 0.16, z: 0.05 },
        { x: -1, y: 0.4, z: 0.2 },
        0.32
    );

    createSpike(
        head,
        { x: 0.25, y: 0.16, z: 0.05 },
        { x: 1, y: 0.4, z: 0.2 },
        0.32
    );

    // Back hair

    for (let i = 0; i < 3; i++) {
        createSpike(
            head,
            {
                x: (i - 1) * 0.15,
                y: 0.12,
                z: -0.24
            },
            {
                x: (i - 1) * 0.5,
                y: 0.1,
                z: -1
            },
            0.38
        );
    }

    // ======================================
    // ARMS
    // ======================================

    const armPivots = [];

    for (const side of [-1, 1]) {

        const arm = new THREE.Group();

        arm.position.set(
            side * 0.43,
            1.48,
            0
        );

        arm.name = side === -1 ? 'LeftArm' : 'RightArm';

        character.add(arm);

        // Upper arm

        createMesh(
            new THREE.CapsuleGeometry(0.14, 0.43, 4, 8),
            materials.uniform,
            { x: 0, y: -0.32, z: 0 },
            arm
        );

        // Hand

        createMesh(
            new THREE.SphereGeometry(0.115, 12, 12),
            materials.skin,
            { x: 0, y: -0.69, z: 0.015 },
            arm
        );

        armPivots.push(arm);
    }

    // ======================================
    // LEGS
    // ======================================

    const legPivots = [];

    for (const side of [-1, 1]) {

        const leg = new THREE.Group();

        leg.position.set(
            side * 0.2,
            0.72,
            0
        );

        leg.name = side === -1 ? 'LeftLeg' : 'RightLeg';

        character.add(leg);

        // Pants

        createMesh(
            new THREE.CapsuleGeometry(0.17, 0.48, 4, 8),
            materials.uniform,
            { x: 0, y: -0.35, z: 0 },
            leg
        );

        // Shoes

        createMesh(
            new THREE.BoxGeometry(0.3, 0.17, 0.43),
            materials.uniformDark,
            { x: 0, y: -0.73, z: 0.09 },
            leg
        );

        legPivots.push(leg);
    }

    // ======================================
    // SPAWN POSITION
    // ======================================

    player.position.copy(
        PLAYER_CONFIG.spawnPosition
    );

    // ======================================
    // PLAYER DATA
    // ======================================

    player.userData = {

        health: 100,
        maxHealth: 100,

        cursedEnergy: 100,
        maxCursedEnergy: 100,

        level: 1,
        experience: 0,

        isMoving: false,
        isSprinting: false,

        isAttacking: false,
        isBlocking: false,

        character: character,
        head: head,
        arms: armPivots,
        legs: legPivots
    };

    scene.add(player);

    return player;
}

// ==========================================
// 2. PLAYER MOVEMENT
// ==========================================

export function updatePlayer(player, keys, delta) {

    const direction = new THREE.Vector3();

    if (keys['KeyW']) direction.z -= 1;
    if (keys['KeyS']) direction.z += 1;

    if (keys['KeyA']) direction.x -= 1;
    if (keys['KeyD']) direction.x += 1;

    const isMoving = direction.lengthSq() > 0;

    player.userData.isMoving = isMoving;

    if (!isMoving) {
        player.userData.isSprinting = false;
        return;
    }

    direction.normalize();

    const isSprinting =
        keys['ShiftLeft'] ||
        keys['ShiftRight'];

    player.userData.isSprinting = isSprinting;

    const speed = isSprinting
        ? PLAYER_CONFIG.sprintSpeed
        : PLAYER_CONFIG.speed;

    player.position.x +=
        direction.x * speed * delta;

    player.position.z +=
        direction.z * speed * delta;

    const targetRotation = Math.atan2(
        direction.x,
        direction.z
    );

    let rotationDifference =
        targetRotation - player.rotation.y;

    rotationDifference = Math.atan2(
        Math.sin(rotationDifference),
        Math.cos(rotationDifference)
    );

    player.rotation.y +=
        rotationDifference *
        Math.min(1, PLAYER_CONFIG.rotationSpeed * delta);
}

// ==========================================
// 3. PLAYER HEALTH
// ==========================================

export function damagePlayer(player, damage) {

    const data = player.userData;

    data.health = Math.max(
        0,
        data.health - damage
    );

    return data.health;
}

// ==========================================
// 4. PLAYER HEALING
// ==========================================

export function healPlayer(player, amount) {

    const data = player.userData;

    data.health = Math.min(
        data.maxHealth,
        data.health + amount
    );

    return data.health;
}

// ==========================================
// 5. CURSED ENERGY
// ==========================================

export function consumeCursedEnergy(player, amount) {

    const data = player.userData;

    if (data.cursedEnergy < amount) {
        return false;
    }

    data.cursedEnergy -= amount;

    return true;
}

export function regenerateCursedEnergy(player, amount) {

    const data = player.userData;

    data.cursedEnergy = Math.min(
        data.maxCursedEnergy,
        data.cursedEnergy + amount
    );

    return data.cursedEnergy;
}

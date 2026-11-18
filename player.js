
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

// ==========================================
// JUJUTSU BLOX - CHARACTER 2.0
// ==========================================

const CONFIG = {
    speed: 8,
    sprintSpeed: 13,
    rotationSpeed: 12,
    spawnPosition: new THREE.Vector3(0, 0, 0)
};

// ==========================================
// MATERIALS
// ==========================================

const mat = {
    skin: new THREE.MeshStandardMaterial({ color: 0xe8b995, roughness: 0.8 }),
    uniform: new THREE.MeshStandardMaterial({ color: 0x171725, roughness: 0.7 }),
    uniformLight: new THREE.MeshStandardMaterial({ color: 0x29293d, roughness: 0.7 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x090b15, roughness: 0.8 }),
    hair: new THREE.MeshStandardMaterial({ color: 0xf05b91, roughness: 0.8 }),
    hairLight: new THREE.MeshStandardMaterial({ color: 0xff8eb5, roughness: 0.8 }),
    eyes: new THREE.MeshStandardMaterial({ color: 0x271321 }),
    white: new THREE.MeshStandardMaterial({ color: 0xffffff }),
    gold: new THREE.MeshStandardMaterial({ color: 0xd4a64d, metalness: 0.65, roughness: 0.35 }),
    sole: new THREE.MeshStandardMaterial({ color: 0x30303b })
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function mesh(geometry, material, position, parent) {
    const object = new THREE.Mesh(geometry, material);

    object.position.set(position.x, position.y, position.z);

    object.castShadow = true;
    object.receiveShadow = true;

    parent.add(object);
    return object;
}

function box(parent, material, position, size, bevel = 0) {
    const geometry = new THREE.BoxGeometry(
        size.x,
        size.y,
        size.z
    );

    const object = mesh(geometry, material, position, parent);

    return object;
}

function sphere(parent, material, position, scale) {
    const object = mesh(
        new THREE.SphereGeometry(1, 20, 16),
        material,
        position,
        parent
    );

    object.scale.set(scale.x, scale.y, scale.z);
    return object;
}

function spike(parent, position, direction, size, material = mat.hair) {
    const object = mesh(
        new THREE.ConeGeometry(size * 0.42, size, 8),
        material,
        position,
        parent
    );

    object.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(
            direction.x,
            direction.y,
            direction.z
        ).normalize()
    );

    return object;
}

// ==========================================
// CHARACTER CREATION
// ==========================================

export function createPlayer(scene) {

    const player = new THREE.Group();
    player.name = 'Player';

    const character = new THREE.Group();
    character.name = 'CharacterModel';

    player.add(character);

    // ======================================
    // TORSO
    // ======================================

    mesh(
        new THREE.CapsuleGeometry(0.37, 0.65, 5, 12),
        mat.uniform,
        { x: 0, y: 1.35, z: 0 },
        character
    );

    // Chest jacket

    box(
        character,
        mat.uniformLight,
        { x: 0, y: 1.55, z: 0.355 },
        { x: 0.58, y: 0.4, z: 0.055 }
    );

    // Jacket lapels

    for (const side of [-1, 1]) {
        const lapel = box(
            character,
            mat.dark,
            { x: side * 0.105, y: 1.68, z: 0.39 },
            { x: 0.12, y: 0.35, z: 0.07 }
        );

        lapel.rotation.z = side * -0.25;

        // Shoulder armor details

        const shoulder = sphere(
            character,
            mat.uniformLight,
            { x: side * 0.37, y: 1.73, z: 0 },
            { x: 0.23, y: 0.19, z: 0.25 }
        );

        // Gold shoulder insignia

        sphere(
            character,
            mat.gold,
            { x: side * 0.39, y: 1.77, z: 0.205 },
            { x: 0.065, y: 0.065, z: 0.025 }
        );
    }

    // High collar

    const collar = mesh(
        new THREE.CylinderGeometry(0.19, 0.21, 0.23, 12, 1, true),
        mat.dark,
        { x: 0, y: 1.88, z: 0 },
        character
    );

    // Buttons

    for (let i = 0; i < 3; i++) {
        sphere(
            character,
            mat.gold,
            { x: 0, y: 1.56 - i * 0.16, z: 0.415 },
            { x: 0.035, y: 0.035, z: 0.018 }
        );
    }

    // Belt

    box(
        character,
        mat.dark,
        { x: 0, y: 0.91, z: 0 },
        { x: 0.73, y: 0.14, z: 0.43 }
    );

    box(
        character,
        mat.gold,
        { x: 0, y: 0.91, z: 0.222 },
        { x: 0.14, y: 0.12, z: 0.025 }
    );

    // Side equipment pouches

    for (const side of [-1, 1]) {
        box(
            character,
            mat.uniformLight,
            { x: side * 0.33, y: 0.91, z: 0.05 },
            { x: 0.15, y: 0.19, z: 0.2 }
        );
    }

    // ======================================
    // HEAD
    // ======================================

    const head = new THREE.Group();
    head.name = 'Head';
    head.position.y = 2.22;

    character.add(head);

    sphere(
        head,
        mat.skin,
        { x: 0, y: 0, z: 0 },
        { x: 0.32, y: 0.39, z: 0.3 }
    );

    // Ears

    for (const side of [-1, 1]) {
        sphere(
            head,
            mat.skin,
            { x: side * 0.31, y: -0.025, z: 0 },
            { x: 0.075, y: 0.11, z: 0.09 }
        );
    }

    // Eyes

    for (const side of [-1, 1]) {

        sphere(
            head,
            mat.white,
            { x: side * 0.125, y: 0.045, z: 0.267 },
            { x: 0.073, y: 0.063, z: 0.035 }
        );

        sphere(
            head,
            mat.eyes,
            { x: side * 0.125, y: 0.045, z: 0.298 },
            { x: 0.031, y: 0.043, z: 0.015 }
        );

        sphere(
            head,
            mat.white,
            { x: side * 0.115, y: 0.065, z: 0.312 },
            { x: 0.012, y: 0.015, z: 0.008 }
        );

        // Eyebrows

        const brow = box(
            head,
            mat.hair,
            { x: side * 0.125, y: 0.135, z: 0.27 },
            { x: 0.13, y: 0.025, z: 0.035 }
        );

        brow.rotation.z = side * -0.13;
    }

    // Nose

    sphere(
        head,
        mat.skin,
        { x: 0, y: -0.045, z: 0.3 },
        { x: 0.035, y: 0.055, z: 0.035 }
    );

    // Mouth

    box(
        head,
        mat.eyes,
        { x: 0, y: -0.18, z: 0.292 },
        { x: 0.09, y: 0.012, z: 0.012 }
    );

    // ======================================
    // HAIR
    // ======================================

    // Main hair volume

    sphere(
        head,
        mat.hair,
        { x: 0, y: 0.23, z: -0.025 },
        { x: 0.34, y: 0.27, z: 0.32 }
    );

    // Top spikes

    const hairSpikes = [
        [-0.23, 0.27, 0, -0.7, 0.8, 0.1, 0.37],
        [-0.12, 0.39, -0.03, -0.3, 1, 0, 0.42],
        [0, 0.43, -0.02, 0, 1, 0, 0.48],
        [0.13, 0.36, -0.03, 0.4, 1, 0, 0.43],
        [0.25, 0.25, 0, 0.8, 0.7, 0.1, 0.37],
        [-0.28, 0.12, 0.04, -1, 0.3, 0.2, 0.31],
        [0.28, 0.12, 0.04, 1, 0.3, 0.2, 0.31],
        [-0.12, 0.25, 0.19, -0.5, 0.5, 0.8, 0.29],
        [0.12, 0.25, 0.19, 0.5, 0.5, 0.8, 0.29]
    ];

    for (const s of hairSpikes) {
        spike(
            head,
            { x: s[0], y: s[1], z: s[2] },
            { x: s[3], y: s[4], z: s[5] },
            s[6]
        );
    }

    // Back hair

    for (let i = -1; i <= 1; i++) {
        spike(
            head,
            { x: i * 0.16, y: 0.06, z: -0.23 },
            { x: i * 0.4, y: 0.1, z: -1 },
            0.34,
            mat.hairLight
        );
    }

    // ======================================
    // ARMS
    // ======================================

    const arms = [];

    for (const side of [-1, 1]) {

        const arm = new THREE.Group();

        arm.position.set(side * 0.43, 1.68, 0);

        arm.name = side === -1 ? 'LeftArm' : 'RightArm';

        character.add(arm);

        // Upper arm

        mesh(
            new THREE.CapsuleGeometry(0.145, 0.35, 5, 10),
            mat.uniform,
            { x: 0, y: -0.3, z: 0 },
            arm
        );

        // Elbow detail

        sphere(
            arm,
            mat.uniformLight,
            { x: 0, y: -0.53, z: 0 },
            { x: 0.14, y: 0.13, z: 0.14 }
        );

        // Forearm

        mesh(
            new THREE.CapsuleGeometry(0.12, 0.27, 4, 10),
            mat.uniformDark,
            { x: 0, y: -0.68, z: 0 },
            arm
        );

        // Wrist cuff

        mesh(
            new THREE.CylinderGeometry(0.125, 0.125, 0.09, 12),
            mat.uniformLight,
            { x: 0, y: -0.83, z: 0 },
            arm
        );

        // Hand

        sphere(
            arm,
            mat.skin,
            { x: 0, y: -0.96, z: 0.015 },
            { x: 0.105, y: 0.13, z: 0.11 }
        );

        arms.push(arm);
    }

    // ======================================
    // LEGS
    // ======================================

    const legs = [];

    for (const side of [-1, 1]) {

        const leg = new THREE.Group();

        leg.position.set(side * 0.2, 0.91, 0);

        leg.name = side === -1 ? 'LeftLeg' : 'RightLeg';

        character.add(leg);

        // Pants

        mesh(
            new THREE.CapsuleGeometry(0.17, 0.46, 5, 10),
            mat.uniform,
            { x: 0, y: -0.35, z: 0 },
            leg
        );

        // Knee panel

        box(
            leg,
            mat.uniformLight,
            { x: 0, y: -0.37, z: 0.15 },
            { x: 0.22, y: 0.15, z: 0.035 }
        );

        // Lower leg

        mesh(
            new THREE.CylinderGeometry(0.12, 0.14, 0.3, 10),
            mat.uniformDark,
            { x: 0, y: -0.64, z: 0 },
            leg
        );

        // Boot

        box(
            leg,
            mat.dark,
            { x: 0, y: -0.84, z: 0.09 },
            { x: 0.3, y: 0.2, z: 0.43 }
        );

        // Boot sole

        box(
            leg,
            mat.sole,
            { x: 0, y: -0.945, z: 0.1 },
            { x: 0.31, y: 0.045, z: 0.44 }
        );

        legs.push(leg);
    }

    // ======================================
    // PLAYER DATA
    // ======================================

    player.position.copy(CONFIG.spawnPosition);

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

        character,
        head,
        arms,
        legs,

        animationTime: 0
    };

    scene.add(player);

    return player;
}

// ==========================================
// PLAYER MOVEMENT + ANIMATION
// ==========================================

export function updatePlayer(player, keys, delta) {

    const data = player.userData;

    const direction = new THREE.Vector3();

    if (keys['KeyW']) direction.z -= 1;
    if (keys['KeyS']) direction.z += 1;
    if (keys['KeyA']) direction.x -= 1;
    if (keys['KeyD']) direction.x += 1;

    const isMoving = direction.lengthSq() > 0;

    const isSprinting =
        isMoving &&
        (keys['ShiftLeft'] || keys['ShiftRight']);

    data.isMoving = isMoving;
    data.isSprinting = isSprinting;

    if (isMoving) {

        direction.normalize();

        const speed = isSprinting
            ? CONFIG.sprintSpeed
            : CONFIG.speed;

        player.position.x += direction.x * speed * delta;
        player.position.z += direction.z * speed * delta;

        const targetRotation = Math.atan2(
            direction.x,
            direction.z
        );

        let difference = targetRotation - player.rotation.y;

        difference = Math.atan2(
            Math.sin(difference),
            Math.cos(difference)
        );

        player.rotation.y += difference *
            Math.min(1, CONFIG.rotationSpeed * delta);
    }

    // ======================================
    // ANIMATIONS
    // ======================================

    data.animationTime += delta;

    const t = data.animationTime;

    const movementAmount = isMoving ? 1 : 0;

    const sprintMultiplier = isSprinting ? 1.5 : 1;

    const swing = Math.sin(t * (isSprinting ? 13 : 9));

    // Walking legs

    data.legs[0].rotation.x =
        swing * 0.55 * movementAmount;

    data.legs[1].rotation.x =
        -swing * 0.55 * movementAmount;

    // Arm swinging

    data.arms[0].rotation.x =
        -swing * 0.4 * movementAmount;

    data.arms[1].rotation.x =
        swing * 0.4 * movementAmount;

    // Idle breathing / movement bounce

    data.character.position.y =
        Math.sin(t * 2.5) * 0.018 +
        Math.abs(swing) * 0.045 * movementAmount;

    // Head movement

    data.head.rotation.z =
        Math.sin(t * 1.5) * 0.025;

    // Slight sprint lean

    data.character.rotation.x =
        THREE.MathUtils.lerp(
            data.character.rotation.x,
            isSprinting ? -0.09 : 0,
            Math.min(1, delta * 5)
        );
}

// ==========================================
// HEALTH
// ==========================================

export function damagePlayer(player, damage) {
    const data = player.userData;

    data.health = Math.max(0, data.health - damage);

    return data.health;
}

export function healPlayer(player, amount) {
    const data = player.userData;

    data.health = Math.min(
        data.maxHealth,
        data.health + amount
    );

    return data.health;
}

// ==========================================
// CURSED ENERGY
// ==========================================

export function consumeCursedEnergy(player, amount) {
    const data = player.userData;

    if (data.cursedEnergy < amount) return false;

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

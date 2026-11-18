
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

// ==========================================
// JUJUTSU BLOX - PLAYER SYSTEM
// ==========================================

// PLAYER CONFIGURATION

const PLAYER_CONFIG = {
    speed: 8,
    sprintSpeed: 13,
    rotationSpeed: 12,
    spawnPosition: new THREE.Vector3(0, 0, 0)
};

// ==========================================
// 1. CREATE PLAYER
// ==========================================

export function createPlayer(scene) {

    const player = new THREE.Group();

    player.name = 'Player';

    // BODY

    const bodyGeometry = new THREE.CapsuleGeometry(
        0.45,
        1,
        4,
        8
    );

    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x252538,
        roughness: 0.6
    });

    const body = new THREE.Mesh(
        bodyGeometry,
        bodyMaterial
    );

    body.position.y = 1;
    body.castShadow = true;
    body.receiveShadow = true;

    player.add(body);

    // HEAD

    const headGeometry = new THREE.SphereGeometry(
        0.32,
        20,
        20
    );

    const headMaterial = new THREE.MeshStandardMaterial({
        color: 0xf0d0bc,
        roughness: 0.7
    });

    const head = new THREE.Mesh(
        headGeometry,
        headMaterial
    );

    head.position.y = 2;
    head.castShadow = true;

    player.add(head);

    // SPAWN POSITION

    player.position.copy(
        PLAYER_CONFIG.spawnPosition
    );

    // PLAYER DATA

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
        isBlocking: false
    };

    scene.add(player);

    return player;
}

// ==========================================
// 2. PLAYER MOVEMENT
// ==========================================

export function updatePlayer(player, keys, delta) {

    const direction = new THREE.Vector3();

    // MOVEMENT INPUT

    if (keys['KeyW']) direction.z -= 1;
    if (keys['KeyS']) direction.z += 1;

    if (keys['KeyA']) direction.x -= 1;
    if (keys['KeyD']) direction.x += 1;

    // MOVEMENT CHECK

    const isMoving = direction.lengthSq() > 0;

    player.userData.isMoving = isMoving;

    if (!isMoving) {
        player.userData.isSprinting = false;
        return;
    }

    // NORMALIZE MOVEMENT

    direction.normalize();

    // SPRINT

    const isSprinting =
        keys['ShiftLeft'] ||
        keys['ShiftRight'];

    player.userData.isSprinting = isSprinting;

    const speed = isSprinting
        ? PLAYER_CONFIG.sprintSpeed
        : PLAYER_CONFIG.speed;

    // APPLY MOVEMENT

    player.position.x +=
        direction.x * speed * delta;

    player.position.z +=
        direction.z * speed * delta;

    // PLAYER ROTATION

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

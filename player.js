import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

// ==========================================
// JUJUTSU BLOX - CHARACTER 3.0 (anime toon style)
// ==========================================
// ASSUMPTIONS (change if wrong):
// - character faces +Z, feet at y = 0, about 3 units tall
// - scene has at least one directional light (toon shading needs a light)
// - same exports as before so game.js keeps working

const CONFIG = {
    speed: 8,
    sprintSpeed: 13,
    rotationSpeed: 12,
    spawnPosition: new THREE.Vector3(0, 0, 0)
};

// look settings, tweak these
const LOOK = {
    outlineColor: 0x120d1c,
    outlineThickness: 0.02,   // world units
    skin: 0xf2c4a2,
    hair: 0xf2799f,
    hairLight: 0xffaac6,
    hairDark: 0xc4527a,
    iris: 0xb86a2e,
    uniform: 0x1b2038,
    uniformLight: 0x2f3658,
    gold: 0xe3b24f
};

// ==========================================
// TOON MATERIALS + OUTLINE
// ==========================================

// 3 step shading ramp (shadow / mid / lit)
const gradient = (() => {
    const tex = new THREE.DataTexture(new Uint8Array([125, 195, 255]), 3, 1, THREE.RedFormat);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    return tex;
})();

function toon(color, extra = {}) {
    return new THREE.MeshToonMaterial({ color, gradientMap: gradient, ...extra });
}

const mat = {
    skin: toon(LOOK.skin),
    uniform: toon(LOOK.uniform),
    uniformLight: toon(LOOK.uniformLight),
    uniformDS: toon(LOOK.uniform, { side: THREE.DoubleSide }),
    dark: toon(0x0b0d18),
    hair: toon(LOOK.hair, { side: THREE.DoubleSide }),
    hairLight: toon(LOOK.hairLight),
    hairDark: toon(LOOK.hairDark),
    gold: toon(LOOK.gold),
    red: toon(0xc8283c),
    sole: toon(0x3a3a4a),
    white: new THREE.MeshBasicMaterial({ color: 0xffffff }),
    iris: new THREE.MeshBasicMaterial({ color: LOOK.iris }),
    pupil: new THREE.MeshBasicMaterial({ color: 0x1c0f14 }),
    line: new THREE.MeshBasicMaterial({ color: 0x1c0f14 })
};

// inverted hull outline: back faces pushed out along smooth normals
const outlineMat = new THREE.MeshBasicMaterial({ color: LOOK.outlineColor, side: THREE.BackSide });
outlineMat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `vec3 transformed = position + normalize(normal) * ${LOOK.outlineThickness.toFixed(4)};`
    );
};

// average normals of vertices sharing a position so hard edges (boxes) get a clean outline
function smoothedClone(geometry) {
    const g = geometry.clone();
    const p = g.attributes.position;
    const n = g.attributes.normal;
    const key = (i) =>
        `${Math.round(p.getX(i) * 1000)},${Math.round(p.getY(i) * 1000)},${Math.round(p.getZ(i) * 1000)}`;
    const sums = new Map();

    for (let i = 0; i < p.count; i++) {
        const k = key(i);
        let v = sums.get(k);
        if (!v) { v = new THREE.Vector3(); sums.set(k, v); }
        v.x += n.getX(i); v.y += n.getY(i); v.z += n.getZ(i);
    }
    const out = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
        out.copy(sums.get(key(i))).normalize();
        n.setXYZ(i, out.x, out.y, out.z);
    }
    return g;
}

// ==========================================
// HELPERS
// ==========================================

const UP = new THREE.Vector3(0, 1, 0);

// ellipsoid with the scale baked in (keeps outline thickness even)
const ball = (sx, sy, sz = sx) => new THREE.SphereGeometry(1, 24, 18).scale(sx, sy, sz);
const slab = (x, y, z) => new THREE.BoxGeometry(x, y, z);
const cone = (size) => new THREE.ConeGeometry(size * 0.4, size, 8).translate(0, size / 2, 0);

function part(parent, geometry, material, pos = [0, 0, 0], opts = {}) {
    const m = new THREE.Mesh(geometry, material);
    m.position.set(pos[0], pos[1], pos[2]);
    if (opts.rot) m.rotation.set(opts.rot[0], opts.rot[1], opts.rot[2]);
    m.castShadow = true;
    m.receiveShadow = false; // avoids shadow acne on toon materials

    if (opts.outline !== false) {
        m.add(new THREE.Mesh(smoothedClone(geometry), outlineMat));
    }

    parent.add(m);
    return m;
}

function spike(parent, p, d, size, material = mat.hair) {
    const m = part(parent, cone(size), material, p);
    m.quaternion.setFromUnitVectors(UP, new THREE.Vector3(d[0], d[1], d[2]).normalize());
    return m;
}

// z of the torso surface at height y (for placing buttons etc)
function torsoZ(y) {
    const chest = Math.abs(y - 1.52) < 0.33
        ? 0.26 * Math.sqrt(1 - Math.pow((y - 1.52) / 0.33, 2)) : 0;
    const dy = Math.abs(y - 1.1) - 0.1;
    const abd = dy <= 0 ? 0.221 : 0.221 * Math.sqrt(Math.max(0, 1 - Math.pow(dy / 0.26, 2)));
    return Math.max(chest, abd * 0.95);
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

    // ---------- TORSO ----------
    part(character, new THREE.CapsuleGeometry(0.26, 0.2, 6, 14).scale(1.1, 1, 0.85), mat.uniform, [0, 1.1, 0]);
    part(character, ball(0.37, 0.33, 0.26), mat.uniform, [0, 1.52, 0]);

    // jacket placket + gold buttons
    [1.64, 1.48, 1.32, 1.16].forEach((y) => {
        part(character, slab(0.04, 0.14, 0.012), mat.dark, [0, y, torsoZ(y) + 0.002], { outline: false });
        part(character, ball(0.03, 0.03, 0.016), mat.gold, [0, y, torsoZ(y) + 0.012], { outline: false });
    });

    // shoulder pads + gold trim
    for (const side of [-1, 1]) {
        part(character, ball(0.19, 0.16, 0.19), mat.uniformLight, [side * 0.37, 1.73, 0]);
        part(character, ball(0.05, 0.05, 0.02), mat.gold, [side * 0.4, 1.76, 0.17], { outline: false });
    }

    // high collar with red lining ring
    part(character, new THREE.CylinderGeometry(0.17, 0.2, 0.2, 18, 1, true), mat.uniformDS, [0, 1.85, 0]);
    part(character, new THREE.TorusGeometry(0.18, 0.022, 8, 28), mat.red, [0, 1.95, 0], { rot: [Math.PI / 2, 0, 0], outline: false });

    // neck
    part(character, new THREE.CylinderGeometry(0.085, 0.09, 0.2, 12), mat.skin, [0, 1.95, 0], { outline: false });

    // hood bunched behind the neck
    part(character, ball(0.27, 0.2, 0.16), mat.uniform, [0, 1.8, -0.2]);

    // belt + buckle
    part(character, new THREE.CylinderGeometry(0.29, 0.29, 0.11, 22).scale(1, 1, 0.8), mat.dark, [0, 0.93, 0]);
    part(character, slab(0.12, 0.1, 0.03), mat.gold, [0, 0.93, 0.235], { outline: false });

    // hip pouches
    for (const side of [-1, 1]) {
        part(character, slab(0.12, 0.17, 0.18), mat.uniformLight, [side * 0.3, 0.9, 0.04]);
    }

    // ---------- HEAD ----------
    const head = new THREE.Group();
    head.name = 'Head';
    head.position.y = 2.3;
    character.add(head);

    part(head, ball(0.32, 0.39, 0.3), mat.skin);

    // ears
    for (const side of [-1, 1]) {
        part(head, ball(0.05, 0.085, 0.06), mat.skin, [side * 0.315, -0.03, -0.01]);
    }

    // nose + smile
    part(head, ball(0.026, 0.035, 0.03), mat.skin, [0, -0.07, 0.288], { outline: false });
    part(head, new THREE.TorusGeometry(0.045, 0.007, 6, 16, Math.PI), mat.line, [0, -0.145, 0.262],
        { rot: [0, 0, Math.PI], outline: false });

    // eyes (big anime eyes) + brows
    const eyes = [];
    for (const side of [-1, 1]) {
        const eye = new THREE.Group();
        eye.position.set(side * 0.125, 0.02, 0.262);
        eye.rotation.y = side * 0.38;
        head.add(eye);

        part(eye, ball(0.07, 0.078, 0.03), mat.white, [0, 0, 0], { outline: false });
        part(eye, ball(0.05, 0.062, 0.02), mat.iris, [0, -0.004, 0.02], { outline: false });
        part(eye, ball(0.026, 0.04, 0.012), mat.pupil, [0, -0.004, 0.03], { outline: false });
        part(eye, ball(0.014, 0.016, 0.008), mat.white, [-0.014, 0.026, 0.04], { outline: false });
        part(eye, ball(0.007, 0.008, 0.006), mat.white, [0.016, -0.03, 0.04], { outline: false });
        // upper lash line
        part(eye, slab(0.16, 0.022, 0.03), mat.line, [0, 0.074, 0.012],
            { rot: [0, 0, side * 0.12], outline: false });
        eyes.push(eye);

        part(head, slab(0.12, 0.022, 0.03), mat.hairDark, [side * 0.125, 0.15, 0.245],
            { rot: [0, side * 0.38, side * 0.2], outline: false });
    }

    // ---------- HAIR ----------
    const hair = new THREE.Group();
    head.add(hair);

    // cap tilted back so the forehead stays open
    const capGeo = new THREE.SphereGeometry(1, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.47).scale(0.35, 0.41, 0.345);
    part(hair, capGeo, mat.hair, [0, 0.03, -0.01], { rot: [-0.45, 0, 0] });

    // [x, y, z, dirX, dirY, dirZ, size, tone]
    const spikes = [
        // crown
        [0, 0.34, 0, 0, 1, 0.3, 0.38, 'hair'],
        [-0.15, 0.33, -0.05, -0.5, 1, 0.1, 0.36, 'hair'],
        [0.15, 0.33, -0.05, 0.5, 1, 0.1, 0.36, 'hair'],
        [-0.26, 0.25, -0.05, -1, 0.8, 0, 0.32, 'hair'],
        [0.26, 0.25, -0.05, 1, 0.8, 0, 0.32, 'hair'],
        [-0.08, 0.38, -0.1, -0.2, 1, -0.2, 0.34, 'hairLight'],
        [0.1, 0.38, -0.1, 0.25, 1, -0.15, 0.32, 'hairLight'],
        // back
        [0, 0.34, -0.2, 0, 0.8, -1, 0.4, 'hair'],
        [-0.16, 0.3, -0.2, -0.5, 0.7, -1, 0.34, 'hair'],
        [0.16, 0.3, -0.2, 0.5, 0.7, -1, 0.34, 'hair'],
        // nape (darker undercut)
        [-0.16, 0.1, -0.3, -0.3, -0.4, -1, 0.28, 'hairDark'],
        [0, 0.08, -0.3, 0, -0.4, -1, 0.3, 'hairDark'],
        [0.16, 0.1, -0.3, 0.3, -0.4, -1, 0.28, 'hairDark'],
        // fringe over the forehead
        [-0.14, 0.27, 0.2, -0.2, -0.75, 0.5, 0.15, 'hairLight'],
        [0, 0.28, 0.21, 0, -0.7, 0.55, 0.16, 'hairLight'],
        [0.14, 0.27, 0.2, 0.2, -0.75, 0.5, 0.15, 'hairLight'],
        [-0.25, 0.2, 0.14, -0.7, -0.7, 0.4, 0.14, 'hair'],
        [0.25, 0.2, 0.14, 0.7, -0.7, 0.4, 0.14, 'hair'],
        // sideburns
        [-0.3, 0.08, 0.06, -0.2, -1, 0.1, 0.16, 'hair'],
        [0.3, 0.08, 0.06, 0.2, -1, 0.1, 0.16, 'hair']
    ];

    for (const s of spikes) {
        spike(hair, [s[0], s[1], s[2]], [s[3], s[4], s[5]], s[6], mat[s[7]]);
    }

    // ---------- ARMS ----------
    const arms = [];

    for (const side of [-1, 1]) {
        const arm = new THREE.Group();
        arm.position.set(side * 0.4, 1.7, 0);
        arm.name = side === -1 ? 'LeftArm' : 'RightArm';
        character.add(arm);

        part(arm, new THREE.CapsuleGeometry(0.11, 0.3, 5, 10), mat.uniform, [0, -0.27, 0]);       // upper arm
        part(arm, ball(0.115, 0.1, 0.115), mat.uniformLight, [0, -0.5, 0]);                        // elbow
        part(arm, new THREE.CapsuleGeometry(0.095, 0.24, 4, 10), mat.uniform, [0, -0.66, 0]);     // forearm
        part(arm, new THREE.CylinderGeometry(0.105, 0.105, 0.07, 12), mat.uniformLight, [0, -0.84, 0]); // cuff
        part(arm, ball(0.085, 0.105, 0.09), mat.skin, [0, -0.95, 0.01]);                           // hand

        arms.push(arm);
    }

    // ---------- LEGS ----------
    const legs = [];

    for (const side of [-1, 1]) {
        const leg = new THREE.Group();
        leg.position.set(side * 0.17, 0.91, 0);
        leg.name = side === -1 ? 'LeftLeg' : 'RightLeg';
        character.add(leg);

        part(leg, new THREE.CapsuleGeometry(0.15, 0.4, 5, 10), mat.uniform, [0, -0.3, 0]);            // thigh
        part(leg, slab(0.2, 0.13, 0.03), mat.uniformLight, [0, -0.34, 0.14]);                          // knee pad
        part(leg, new THREE.CylinderGeometry(0.1, 0.12, 0.36, 12), mat.uniform, [0, -0.62, 0]);       // shin
        part(leg, slab(0.26, 0.18, 0.38), mat.dark, [0, -0.8, 0.07]);                                  // boot
        part(leg, slab(0.27, 0.04, 0.4), mat.sole, [0, -0.89, 0.08]);                                  // sole
        part(leg, slab(0.27, 0.025, 0.04), mat.gold, [0, -0.73, 0.2], { outline: false });             // boot trim

        legs.push(leg);
    }

    // ---------- PLAYER DATA ----------
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
        hair,
        eyes,
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
    const isSprinting = isMoving && (keys['ShiftLeft'] || keys['ShiftRight']);

    data.isMoving = isMoving;
    data.isSprinting = isSprinting;

    if (isMoving) {
        direction.normalize();

        const speed = isSprinting ? CONFIG.sprintSpeed : CONFIG.speed;

        player.position.x += direction.x * speed * delta;
        player.position.z += direction.z * speed * delta;

        const targetRotation = Math.atan2(direction.x, direction.z);

        let difference = targetRotation - player.rotation.y;
        difference = Math.atan2(Math.sin(difference), Math.cos(difference));

        player.rotation.y += difference * Math.min(1, CONFIG.rotationSpeed * delta);
    }

    // ---------- ANIMATION ----------
    data.animationTime += delta;

    const t = data.animationTime;
    const move = isMoving ? 1 : 0;
    const swing = Math.sin(t * (isSprinting ? 13 : 9));
    const ease = Math.min(1, delta * 10);

    // legs
    data.legs[0].rotation.x = THREE.MathUtils.lerp(data.legs[0].rotation.x, swing * 0.6 * move, ease);
    data.legs[1].rotation.x = THREE.MathUtils.lerp(data.legs[1].rotation.x, -swing * 0.6 * move, ease);

    // arms (+ small idle sway and slight outward angle)
    const idleArm = Math.sin(t * 1.8) * 0.04 * (1 - move);
    data.arms[0].rotation.x = THREE.MathUtils.lerp(data.arms[0].rotation.x, -swing * 0.45 * move + idleArm, ease);
    data.arms[1].rotation.x = THREE.MathUtils.lerp(data.arms[1].rotation.x, swing * 0.45 * move - idleArm, ease);
    data.arms[0].rotation.z = -0.07;
    data.arms[1].rotation.z = 0.07;

    // bounce (never dips below the ground)
    data.character.position.y =
        (Math.sin(t * 2.5) * 0.5 + 0.5) * 0.025 * (1 - move) +
        Math.abs(swing) * 0.05 * move;

    // lean forward when running (positive x tips the top toward +Z)
    data.character.rotation.x = THREE.MathUtils.lerp(
        data.character.rotation.x,
        isSprinting ? 0.14 : (isMoving ? 0.05 : 0),
        Math.min(1, delta * 6)
    );

    // head
    data.head.rotation.z = Math.sin(t * 1.5) * 0.025;
    data.head.rotation.x = THREE.MathUtils.lerp(data.head.rotation.x, isMoving ? -0.03 : 0, ease);

    // hair streams back a little when moving
    data.hair.rotation.x = THREE.MathUtils.lerp(
        data.hair.rotation.x,
        isSprinting ? -0.1 : (isMoving ? -0.04 : Math.sin(t * 2) * 0.012),
        Math.min(1, delta * 6)
    );

    // blink every few seconds
    const blink = (t % 3.8) < 0.12 ? 0.1 : 1;
    for (const eye of data.eyes) eye.scale.y = blink;
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
    data.health = Math.min(data.maxHealth, data.health + amount);
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
    data.cursedEnergy = Math.min(data.maxCursedEnergy, data.cursedEnergy + amount);
    return data.cursedEnergy;
}

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  createProceduralTexture,
  createRadialShadowTexture,
} from './webglUtils';

export type CameraPresetId = 'rooster' | 'flock' | 'coop' | 'overview';
export type LightingPresetId = 'morning' | 'golden' | 'dusk';

export interface KadaknathSceneController {
  setCameraPreset: (preset: CameraPresetId) => void;
  setLightingPreset: (mode: LightingPresetId) => void;
  setPaused: (paused: boolean) => void;
  resize: (width: number, height: number) => void;
  stepAndRender: (delta: number, elapsed: number) => void;
  dispose: () => void;
}

// Pre-allocated module-scope scratch objects (zero GC in render loop)
const _desiredCamPos = new THREE.Vector3();
const _desiredTarget = new THREE.Vector3();
const _bgColor = new THREE.Color();
const _targetBgColor = new THREE.Color();
const _dummyObj = new THREE.Object3D();
const _instanceColor = new THREE.Color();

export function groundHeightAt(x: number, z: number): number {
  const distSq = x * x + z * z;
  const gentleRoll = Math.sin(x * 0.22) * Math.cos(z * 0.22) * 0.06;
  const outerSlope = Math.max(0, (distSq - 36) * 0.008);
  return gentleRoll + outerSlope;
}

function createContactShadow(
  shadowTex: THREE.CanvasTexture,
  radius: number,
  disposables: Array<{ dispose: () => void }>
): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(radius * 2, radius * 2);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    depthWrite: false,
    opacity: 0.48,
  });
  disposables.push(geo, mat);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = 0.025;
  mesh.renderOrder = 1;
  return mesh;
}

/**
 * Composite 10-part Procedural Hero Kadaknath Rooster (bottom-center pivot at y = 0)
 */
function createKadaknathRooster(
  plumageMat: THREE.MeshPhysicalMaterial,
  skinMat: THREE.MeshStandardMaterial,
  beakMat: THREE.MeshStandardMaterial,
  shadowTex: THREE.CanvasTexture,
  disposables: Array<{ dispose: () => void }>
): { group: THREE.Group; headPivot: THREE.Group; tailPivot: THREE.Group } {
  const group = new THREE.Group();

  // 1. Sculpted Breast & Torso (LatheGeometry)
  const torsoPts = [
    new THREE.Vector2(0.01, 0.34),
    new THREE.Vector2(0.24, 0.38),
    new THREE.Vector2(0.36, 0.54),
    new THREE.Vector2(0.34, 0.78),
    new THREE.Vector2(0.22, 0.96),
    new THREE.Vector2(0.01, 1.02),
  ];
  const torsoGeo = new THREE.LatheGeometry(torsoPts, 28);
  torsoGeo.scale(0.86, 1.0, 1.18);
  const torso = new THREE.Mesh(torsoGeo, plumageMat);
  torso.castShadow = true;
  torso.receiveShadow = true;
  group.add(torso);
  disposables.push(torsoGeo);

  // 2. Iridescent Neck Hackle Collar (local pivot at base y = 0.86 so rotation doesn't swing neck over head)
  const neckPts = [
    new THREE.Vector2(0.22, 0.0),
    new THREE.Vector2(0.21, 0.12),
    new THREE.Vector2(0.15, 0.26),
    new THREE.Vector2(0.11, 0.36),
    new THREE.Vector2(0.02, 0.4),
  ];
  const neckGeo = new THREE.LatheGeometry(neckPts, 22);
  const neck = new THREE.Mesh(neckGeo, plumageMat);
  neck.position.set(0, 0.86, 0.12);
  neck.rotation.x = 0.14;
  neck.castShadow = true;
  group.add(neck);
  disposables.push(neckGeo);

  // Head pivot for subtle natural head bobbing
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 1.28, 0.21);
  group.add(headPivot);

  // 3. Head
  const headGeo = new THREE.SphereGeometry(0.135, 20, 18);
  headGeo.scale(0.88, 0.96, 1.12);
  const head = new THREE.Mesh(headGeo, plumageMat);
  head.castShadow = true;
  headPivot.add(head);
  disposables.push(headGeo);

  // 4. Serrated 5-Point Kadaknath Black Comb (Beveled ExtrudeGeometry)
  const combShape = new THREE.Shape();
  combShape.moveTo(-0.12, 0.04);
  combShape.lineTo(-0.14, 0.15);
  combShape.lineTo(-0.08, 0.11);
  combShape.lineTo(-0.05, 0.21);
  combShape.lineTo(0.0, 0.13);
  combShape.lineTo(0.04, 0.23);
  combShape.lineTo(0.08, 0.14);
  combShape.lineTo(0.13, 0.2);
  combShape.lineTo(0.15, 0.1);
  combShape.lineTo(0.11, 0.04);
  combShape.closePath();

  const combGeo = new THREE.ExtrudeGeometry(combShape, {
    depth: 0.028,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.01,
    bevelSegments: 2,
  });
  combGeo.rotateY(Math.PI / 2);
  combGeo.translate(-0.014, 0.07, 0.01);
  const comb = new THREE.Mesh(combGeo, skinMat);
  comb.castShadow = true;
  headPivot.add(comb);
  disposables.push(combGeo);

  // 5. Curved Beak
  const beakGeo = new THREE.ConeGeometry(0.045, 0.14, 12);
  beakGeo.rotateX(Math.PI / 2 + 0.15);
  const beak = new THREE.Mesh(beakGeo, beakMat);
  beak.position.set(0, -0.01, 0.18);
  headPivot.add(beak);
  disposables.push(beakGeo);

  // 6. Twin Dark Wattles
  const wattleGeo = new THREE.SphereGeometry(0.048, 12, 12);
  wattleGeo.scale(0.55, 1.35, 0.85);
  const leftWattle = new THREE.Mesh(wattleGeo, skinMat);
  leftWattle.position.set(0.036, -0.11, 0.09);
  const rightWattle = new THREE.Mesh(wattleGeo, skinMat);
  rightWattle.position.set(-0.036, -0.11, 0.09);
  headPivot.add(leftWattle, rightWattle);
  disposables.push(wattleGeo);

  // 7. Sweeping Sickle Tail Feathers (4 Curved TubeGeometry Arcs)
  const tailPivot = new THREE.Group();
  tailPivot.position.set(0, 0.82, -0.28);
  group.add(tailPivot);

  const tailCurves = [
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0.36, -0.24),
      new THREE.Vector3(0, 0.56, -0.54),
      new THREE.Vector3(0, 0.32, -0.78),
    ]),
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.05, -0.02, 0),
      new THREE.Vector3(0.11, 0.3, -0.22),
      new THREE.Vector3(0.14, 0.44, -0.48),
      new THREE.Vector3(0.12, 0.22, -0.68),
    ]),
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.05, -0.02, 0),
      new THREE.Vector3(-0.11, 0.3, -0.22),
      new THREE.Vector3(-0.14, 0.44, -0.48),
      new THREE.Vector3(-0.12, 0.22, -0.68),
    ]),
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.06, -0.02),
      new THREE.Vector3(0, 0.2, -0.22),
      new THREE.Vector3(0, 0.26, -0.46),
    ]),
  ];

  tailCurves.forEach((curve, idx) => {
    const tGeo = new THREE.TubeGeometry(curve, 20, idx === 0 ? 0.055 : 0.042, 8, false);
    tGeo.scale(0.55, 1.25, 1.0);
    const tMesh = new THREE.Mesh(tGeo, plumageMat);
    tMesh.castShadow = true;
    tailPivot.add(tMesh);
    disposables.push(tGeo);
  });

  // 8. Folded Left & Right Wings (ExtrudeGeometry)
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0.14);
  wingShape.quadraticCurveTo(0.24, 0.18, 0.36, -0.04);
  wingShape.quadraticCurveTo(0.2, -0.18, -0.04, -0.1);
  wingShape.closePath();

  const wingGeo = new THREE.ExtrudeGeometry(wingShape, {
    depth: 0.06,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.02,
    bevelSegments: 2,
  });
  wingGeo.rotateY(Math.PI / 2);

  const leftWing = new THREE.Mesh(wingGeo, plumageMat);
  leftWing.position.set(0.25, 0.66, 0.06);
  leftWing.rotation.z = -0.14;
  leftWing.castShadow = true;

  const rightWing = new THREE.Mesh(wingGeo, plumageMat);
  rightWing.position.set(-0.31, 0.66, 0.06);
  rightWing.rotation.z = 0.14;
  rightWing.castShadow = true;

  group.add(leftWing, rightWing);
  disposables.push(wingGeo);

  // 9. Scaled Legs & Grounded Claws (y = 0 flush!)
  const shankGeo = new THREE.CylinderGeometry(0.032, 0.024, 0.38, 10);
  const footGeo = new THREE.CylinderGeometry(0.055, 0.065, 0.035, 8);
  disposables.push(shankGeo, footGeo);

  [-0.12, 0.12].forEach((xOffset) => {
    const shank = new THREE.Mesh(shankGeo, skinMat);
    shank.position.set(xOffset, 0.2, 0.02);
    shank.castShadow = true;
    const foot = new THREE.Mesh(footGeo, skinMat);
    foot.position.set(xOffset, 0.018, 0.04);
    group.add(shank, foot);
  });

  // 10. Ground Contact Shadow
  group.add(createContactShadow(shadowTex, 0.56, disposables));

  return { group, headPivot, tailPivot };
}

/**
 * Composite 7-part Procedural Kadaknath Hen (bottom-center pivot at y = 0)
 */
function createKadaknathHen(
  plumageMat: THREE.MeshPhysicalMaterial,
  skinMat: THREE.MeshStandardMaterial,
  beakMat: THREE.MeshStandardMaterial,
  shadowTex: THREE.CanvasTexture,
  disposables: Array<{ dispose: () => void }>
): { group: THREE.Group; headPivot: THREE.Group } {
  const group = new THREE.Group();

  const bodyPts = [
    new THREE.Vector2(0.01, 0.26),
    new THREE.Vector2(0.24, 0.3),
    new THREE.Vector2(0.32, 0.46),
    new THREE.Vector2(0.28, 0.66),
    new THREE.Vector2(0.16, 0.78),
    new THREE.Vector2(0.01, 0.82),
  ];
  const bodyGeo = new THREE.LatheGeometry(bodyPts, 24);
  bodyGeo.scale(0.92, 0.95, 1.24);
  const body = new THREE.Mesh(bodyGeo, plumageMat);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);
  disposables.push(bodyGeo);

  const headPivot = new THREE.Group();
  headPivot.position.set(0, 0.86, 0.24);
  group.add(headPivot);

  const headGeo = new THREE.SphereGeometry(0.11, 18, 16);
  const head = new THREE.Mesh(headGeo, plumageMat);
  head.castShadow = true;
  headPivot.add(head);
  disposables.push(headGeo);

  const smallCombGeo = new THREE.BoxGeometry(0.03, 0.06, 0.11);
  const smallComb = new THREE.Mesh(smallCombGeo, skinMat);
  smallComb.position.set(0, 0.1, 0.01);
  headPivot.add(smallComb);
  disposables.push(smallCombGeo);

  const beakGeo = new THREE.ConeGeometry(0.036, 0.1, 10);
  beakGeo.rotateX(Math.PI / 2 + 0.2);
  const beak = new THREE.Mesh(beakGeo, beakMat);
  beak.position.set(0, -0.01, 0.13);
  headPivot.add(beak);
  disposables.push(beakGeo);

  const tailGeo = new THREE.ConeGeometry(0.16, 0.34, 12);
  tailGeo.rotateX(-Math.PI / 3);
  const tail = new THREE.Mesh(tailGeo, plumageMat);
  tail.position.set(0, 0.64, -0.34);
  tail.castShadow = true;
  group.add(tail);
  disposables.push(tailGeo);

  const legGeo = new THREE.CylinderGeometry(0.024, 0.02, 0.28, 8);
  disposables.push(legGeo);
  [-0.09, 0.09].forEach((xOff) => {
    const leg = new THREE.Mesh(legGeo, skinMat);
    leg.position.set(xOff, 0.14, 0.02);
    leg.castShadow = true;
    group.add(leg);
  });

  group.add(createContactShadow(shadowTex, 0.44, disposables));
  return { group, headPivot };
}

/**
 * Composite 5-part Fluffy Kadaknath Chick (bottom-center pivot at y = 0)
 */
function createKadaknathChick(
  downMat: THREE.MeshStandardMaterial,
  beakMat: THREE.MeshStandardMaterial,
  shadowTex: THREE.CanvasTexture,
  disposables: Array<{ dispose: () => void }>
): THREE.Group {
  const group = new THREE.Group();

  const bodyGeo = new THREE.SphereGeometry(0.13, 16, 14);
  bodyGeo.scale(0.92, 0.95, 1.12);
  const body = new THREE.Mesh(bodyGeo, downMat);
  body.position.set(0, 0.18, 0);
  body.castShadow = true;
  group.add(body);

  const headGeo = new THREE.SphereGeometry(0.085, 16, 14);
  const head = new THREE.Mesh(headGeo, downMat);
  head.position.set(0, 0.31, 0.09);
  head.castShadow = true;
  group.add(head);

  const beakGeo = new THREE.ConeGeometry(0.022, 0.055, 8);
  beakGeo.rotateX(Math.PI / 2 + 0.1);
  const beak = new THREE.Mesh(beakGeo, beakMat);
  beak.position.set(0, 0.3, 0.18);
  group.add(beak);

  const legGeo = new THREE.CylinderGeometry(0.012, 0.01, 0.1, 6);
  [-0.045, 0.045].forEach((xOff) => {
    const leg = new THREE.Mesh(legGeo, beakMat);
    leg.position.set(xOff, 0.05, 0);
    group.add(leg);
  });

  disposables.push(bodyGeo, headGeo, beakGeo, legGeo);
  group.add(createContactShadow(shadowTex, 0.2, disposables));
  return group;
}

/**
 * Composite 6-part Woven Straw Nest with Lathed Ovoid Kadaknath Eggs
 */
function createEggNestGroup(
  strawMat: THREE.MeshStandardMaterial,
  eggCreamMat: THREE.MeshPhysicalMaterial,
  eggTanMat: THREE.MeshPhysicalMaterial,
  shadowTex: THREE.CanvasTexture,
  disposables: Array<{ dispose: () => void }>
): THREE.Group {
  const group = new THREE.Group();

  const rimGeo = new THREE.TorusGeometry(0.42, 0.11, 14, 28);
  rimGeo.rotateX(Math.PI / 2);
  const rim = new THREE.Mesh(rimGeo, strawMat);
  rim.position.y = 0.11;
  rim.castShadow = true;
  rim.receiveShadow = true;
  group.add(rim);

  const baseGeo = new THREE.CylinderGeometry(0.38, 0.44, 0.12, 24);
  const base = new THREE.Mesh(baseGeo, strawMat);
  base.position.y = 0.06;
  base.receiveShadow = true;
  group.add(base);

  // Lathed ovoid egg profile
  const eggPts: THREE.Vector2[] = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    const y = t * 0.19;
    const r = Math.sin(t * Math.PI) * (0.075 - t * 0.014);
    eggPts.push(new THREE.Vector2(Math.max(0.002, r), y));
  }
  const eggGeo = new THREE.LatheGeometry(eggPts, 18);

  const eggOffsets = [
    { x: -0.1, z: -0.06, rx: 1.25, rz: 0.4, mat: eggCreamMat },
    { x: 0.11, z: -0.04, rx: 1.35, rz: -0.5, mat: eggTanMat },
    { x: -0.02, z: 0.11, rx: 1.4, rz: 0.15, mat: eggTanMat },
    { x: 0.12, z: 0.12, rx: 1.3, rz: -0.25, mat: eggCreamMat },
  ];

  eggOffsets.forEach((cfg) => {
    const egg = new THREE.Mesh(eggGeo, cfg.mat);
    egg.position.set(cfg.x, 0.14, cfg.z);
    egg.rotation.set(cfg.rx, 0, cfg.rz);
    egg.castShadow = true;
    group.add(egg);
  });

  disposables.push(rimGeo, baseGeo, eggGeo);
  group.add(createContactShadow(shadowTex, 0.56, disposables));
  return group;
}

/**
 * Composite 9-part Heritage Timber & Whitewashed Poultry Coop + Brass Feed Bowl
 */
function createHeritageCoopGroup(
  woodMat: THREE.MeshStandardMaterial,
  wallMat: THREE.MeshStandardMaterial,
  roofMat: THREE.MeshStandardMaterial,
  brassMat: THREE.MeshPhysicalMaterial,
  shadowTex: THREE.CanvasTexture,
  disposables: Array<{ dispose: () => void }>
): THREE.Group {
  const group = new THREE.Group();

  // 1. Stone Plinth Base (y = 0)
  const plinthGeo = new THREE.BoxGeometry(2.5, 0.18, 2.1);
  const plinth = new THREE.Mesh(plinthGeo, wallMat);
  plinth.position.y = 0.09;
  plinth.receiveShadow = true;
  plinth.castShadow = true;
  group.add(plinth);

  // 2. Whitewashed Coop Body
  const wallsGeo = new THREE.BoxGeometry(2.26, 1.35, 1.86);
  const walls = new THREE.Mesh(wallsGeo, wallMat);
  walls.position.y = 0.855;
  walls.castShadow = true;
  walls.receiveShadow = true;
  group.add(walls);

  // 3. Four Timber Corner Posts
  const postGeo = new THREE.BoxGeometry(0.14, 1.42, 0.14);
  [
    [-1.12, -0.92],
    [1.12, -0.92],
    [-1.12, 0.92],
    [1.12, 0.92],
  ].forEach(([px, pz]) => {
    const post = new THREE.Mesh(postGeo, woodMat);
    post.position.set(px, 0.88, pz);
    post.castShadow = true;
    group.add(post);
  });

  // 4. Pitched Terracotta Gable Roof (ExtrudeGeometry)
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-1.42, 0);
  roofShape.lineTo(0, 0.82);
  roofShape.lineTo(1.42, 0);
  roofShape.lineTo(1.32, -0.1);
  roofShape.lineTo(0, 0.66);
  roofShape.lineTo(-1.32, -0.1);
  roofShape.closePath();

  const roofGeo = new THREE.ExtrudeGeometry(roofShape, {
    depth: 2.24,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelSegments: 2,
  });
  roofGeo.translate(0, 1.52, -1.12);
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.castShadow = true;
  roof.receiveShadow = true;
  group.add(roof);

  // 5. Timber Ridge Beam
  const ridgeGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.34, 10);
  ridgeGeo.rotateX(Math.PI / 2);
  const ridge = new THREE.Mesh(ridgeGeo, woodMat);
  ridge.position.set(0, 2.32, 0);
  group.add(ridge);

  // 6. Wooden Coop Doorway Frame & Entrance
  const doorGeo = new THREE.BoxGeometry(0.56, 0.86, 0.08);
  const door = new THREE.Mesh(doorGeo, woodMat);
  door.position.set(0, 0.61, 0.94);
  group.add(door);

  // 7. Slatted Timber Ramp to Ground
  const rampGeo = new THREE.BoxGeometry(0.46, 0.05, 0.85);
  const ramp = new THREE.Mesh(rampGeo, woodMat);
  ramp.position.set(0, 0.14, 1.32);
  ramp.rotation.x = 0.24;
  ramp.castShadow = true;
  group.add(ramp);

  // 8. Brushed Brass Feed Bowl (LatheGeometry reflecting RoomEnvironment)
  const bowlPts = [
    new THREE.Vector2(0.01, 0.0),
    new THREE.Vector2(0.22, 0.0),
    new THREE.Vector2(0.28, 0.14),
    new THREE.Vector2(0.25, 0.14),
    new THREE.Vector2(0.19, 0.03),
    new THREE.Vector2(0.01, 0.03),
  ];
  const bowlGeo = new THREE.LatheGeometry(bowlPts, 24);
  const bowl = new THREE.Mesh(bowlGeo, brassMat);
  bowl.position.set(-1.35, 0.0, 1.15);
  bowl.castShadow = true;
  group.add(bowl);

  disposables.push(
    plinthGeo,
    wallsGeo,
    postGeo,
    roofGeo,
    ridgeGeo,
    doorGeo,
    rampGeo,
    bowlGeo
  );
  group.add(createContactShadow(shadowTex, 1.65, disposables));
  return group;
}

/**
 * Composite 5-part Neem Shade Tree (TubeGeometry trunk + multi-cluster foliage)
 */
function createNeemTree(
  woodMat: THREE.MeshStandardMaterial,
  foliageMat: THREE.MeshStandardMaterial,
  disposables: Array<{ dispose: () => void }>
): THREE.Group {
  const group = new THREE.Group();

  const trunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.08, 1.1, 0.05),
    new THREE.Vector3(-0.05, 2.2, -0.04),
    new THREE.Vector3(0.04, 3.1, 0.02),
  ]);
  const trunkGeo = new THREE.TubeGeometry(trunkCurve, 16, 0.18, 10, false);
  const trunk = new THREE.Mesh(trunkGeo, woodMat);
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  group.add(trunk);

  const canopyGeo = new THREE.IcosahedronGeometry(1.15, 2);
  const offsets = [
    { x: 0, y: 3.4, z: 0, s: 1.15 },
    { x: -0.85, y: 2.95, z: 0.4, s: 0.85 },
    { x: 0.85, y: 3.05, z: -0.35, s: 0.9 },
    { x: 0.25, y: 2.85, z: 0.8, s: 0.78 },
  ];
  offsets.forEach((o) => {
    const cluster = new THREE.Mesh(canopyGeo, foliageMat);
    cluster.position.set(o.x, o.y, o.z);
    cluster.scale.set(o.s, o.s * 0.76, o.s);
    cluster.castShadow = true;
    cluster.receiveShadow = true;
    group.add(cluster);
  });

  disposables.push(trunkGeo, canopyGeo);
  return group;
}

export function buildKadaknathDiorama(
  renderer: THREE.WebGLRenderer,
  containerWidth: number,
  containerHeight: number,
  isSoftwareGl: boolean
): KadaknathSceneController {
  const disposables: Array<{ dispose: () => void }> = [];

  const scene = new THREE.Scene();
  const initialFogHex = 0xe8dec3;
  scene.background = new THREE.Color(initialFogHex);
  scene.fog = new THREE.FogExp2(initialFogHex, 0.032);

  // Mandatory Studio Environment Reflection (RoomEnvironment)
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  pmremGenerator.dispose();
  disposables.push(envTex);

  const camera = new THREE.PerspectiveCamera(
    42,
    Math.max(1, containerWidth) / Math.max(1, containerHeight),
    0.1,
    90
  );
  camera.position.set(2.45, 1.62, 2.25);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = !isSoftwareGl;
  controls.dampingFactor = 0.06;
  controls.minDistance = 1.6;
  controls.maxDistance = 11.5;
  controls.maxPolarAngle = Math.PI / 2 - 0.04;
  controls.target.set(0.05, 0.92, 0.02);

  let transitioningCamera = false;
  controls.addEventListener('start', () => {
    transitioningCamera = false;
  });

  // 3-Point Warm/Cool Lighting Rig
  const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x6b583e, 0.85);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xffe7ba, 2.1);
  keyLight.position.set(5.5, 8.5, 5.0);
  keyLight.castShadow = !isSoftwareGl;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 26;
  const d = 7.5;
  keyLight.shadow.camera.left = -d;
  keyLight.shadow.camera.right = d;
  keyLight.shadow.camera.top = d;
  keyLight.shadow.camera.bottom = -d;
  keyLight.shadow.bias = -0.0005;
  keyLight.shadow.normalBias = 0.02;
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xffd27d, 0.9);
  rimLight.position.set(-5.0, 4.0, -4.5);
  scene.add(rimLight);

  // Procedural PBR Textures & Materials
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const woodTex = createProceduralTexture('wood', maxAniso, true);
  const woodBump = createProceduralTexture('wood', maxAniso, false);
  const strawTex = createProceduralTexture('straw', maxAniso, true);
  const strawBump = createProceduralTexture('straw', maxAniso, false);
  const groundTex = createProceduralTexture('ground', maxAniso, true);
  groundTex.repeat.set(8, 8);
  const shadowTex = createRadialShadowTexture();
  disposables.push(woodTex, woodBump, strawTex, strawBump, groundTex, shadowTex);

  // Iridescent Kadaknath Black Plumage (low roughness + physical iridescence)
  const plumageMat = new THREE.MeshPhysicalMaterial({
    color: 0x151918,
    roughness: 0.26,
    metalness: 0.16,
    iridescence: 0.92,
    iridescenceIOR: 1.42,
    iridescenceThicknessMinimum: 180,
    iridescenceThicknessMaximum: 420,
    clearcoat: 0.35,
    clearcoatRoughness: 0.28,
  });

  // Matte Charcoal Skin / Comb / Wattles (roughness delta >= 0.45 from plumage!)
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0x222024,
    roughness: 0.74,
    metalness: 0.0,
  });

  const beakMat = new THREE.MeshStandardMaterial({
    color: 0x3b352e,
    roughness: 0.52,
    metalness: 0.05,
  });

  const chickDownMat = new THREE.MeshStandardMaterial({
    color: 0x1d1f20,
    roughness: 0.88,
    metalness: 0.0,
  });

  const strawMat = new THREE.MeshStandardMaterial({
    map: strawTex,
    bumpMap: strawBump,
    bumpScale: 0.03,
    roughness: 0.84,
    metalness: 0.0,
  });

  const eggCreamMat = new THREE.MeshPhysicalMaterial({
    color: 0xf4e6cc,
    roughness: 0.36,
    metalness: 0.0,
    clearcoat: 0.18,
  });

  const eggTanMat = new THREE.MeshPhysicalMaterial({
    color: 0xd9b38c,
    roughness: 0.38,
    metalness: 0.0,
    clearcoat: 0.18,
  });

  const woodMat = new THREE.MeshStandardMaterial({
    map: woodTex,
    bumpMap: woodBump,
    bumpScale: 0.025,
    roughness: 0.78,
    metalness: 0.02,
  });

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xefe3c8,
    roughness: 0.88,
    metalness: 0.0,
  });

  const roofMat = new THREE.MeshStandardMaterial({
    color: 0x8f472e,
    roughness: 0.72,
    metalness: 0.04,
  });

  const brassMat = new THREE.MeshPhysicalMaterial({
    color: 0xd4a446,
    roughness: 0.22,
    metalness: 0.9,
    clearcoat: 0.2,
  });

  const foliageMat = new THREE.MeshStandardMaterial({
    color: 0x375e32,
    roughness: 0.78,
    metalness: 0.0,
  });

  const groundMat = new THREE.MeshStandardMaterial({
    map: groundTex,
    roughness: 0.92,
    metalness: 0.0,
  });

  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0x6f6c5e,
    roughness: 0.86,
    metalness: 0.02,
  });

  disposables.push(
    plumageMat,
    skinMat,
    beakMat,
    chickDownMat,
    strawMat,
    eggCreamMat,
    eggTanMat,
    woodMat,
    wallMat,
    roofMat,
    brassMat,
    foliageMat,
    groundMat,
    stoneMat
  );

  // Extended Courtyard Terrain (never boxed inside walls)
  const terrainGeo = new THREE.PlaneGeometry(44, 44, 40, 40);
  terrainGeo.rotateX(-Math.PI / 2);
  const posAttr = terrainGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vz = posAttr.getZ(i);
    posAttr.setY(i, groundHeightAt(vx, vz));
  }
  terrainGeo.computeVertexNormals();
  const terrain = new THREE.Mesh(terrainGeo, groundMat);
  terrain.receiveShadow = true;
  scene.add(terrain);
  disposables.push(terrainGeo);

  // Sculpted Hero Courtyard Stone Platform
  const rockGeo = new THREE.DodecahedronGeometry(0.95, 1);
  rockGeo.scale(1.25, 0.36, 1.05);
  const heroRock = new THREE.Mesh(rockGeo, stoneMat);
  heroRock.position.set(0, groundHeightAt(0, 0) + 0.12, 0);
  heroRock.receiveShadow = true;
  heroRock.castShadow = true;
  scene.add(heroRock);
  disposables.push(rockGeo);

  const rockTopY = groundHeightAt(0, 0) + 0.32;

  // Hero Kadaknath Rooster on Courtyard Stone
  const rooster = createKadaknathRooster(
    plumageMat,
    skinMat,
    beakMat,
    shadowTex,
    disposables
  );
  rooster.group.position.set(0.18, rockTopY, -0.05);
  rooster.group.rotation.y = 0.52;
  scene.add(rooster.group);

  // Kadaknath Hen beside Rooster
  const hen = createKadaknathHen(
    plumageMat,
    skinMat,
    beakMat,
    shadowTex,
    disposables
  );
  hen.group.position.set(-0.56, rockTopY - 0.02, 0.14);
  hen.group.rotation.y = 0.72;
  scene.add(hen.group);

  // 2 Fluffy Kadaknath Chicks in Foreground
  const chick1 = createKadaknathChick(
    chickDownMat,
    beakMat,
    shadowTex,
    disposables
  );
  chick1.position.set(-0.22, groundHeightAt(-0.22, 1.05), 1.05);
  chick1.rotation.y = 0.45;

  const chick2 = createKadaknathChick(
    chickDownMat,
    beakMat,
    shadowTex,
    disposables
  );
  chick2.position.set(0.16, groundHeightAt(0.16, 1.18), 1.18);
  chick2.rotation.y = -0.5;
  scene.add(chick1, chick2);

  // Woven Straw Nest with Fresh Kadaknath Eggs
  const eggNest = createEggNestGroup(
    strawMat,
    eggCreamMat,
    eggTanMat,
    shadowTex,
    disposables
  );
  eggNest.position.set(1.55, groundHeightAt(1.55, 0.95), 0.95);
  scene.add(eggNest);

  // Heritage Timber Poultry Coop in Midground
  const coop = createHeritageCoopGroup(
    woodMat,
    wallMat,
    roofMat,
    brassMat,
    shadowTex,
    disposables
  );
  coop.position.set(-2.35, groundHeightAt(-2.35, -2.1), -2.1);
  coop.rotation.y = 0.42;
  scene.add(coop);

  // Natural Perimeter Neem Trees
  const tree1 = createNeemTree(woodMat, foliageMat, disposables);
  tree1.position.set(3.4, groundHeightAt(3.4, -2.6), -2.6);
  const tree2 = createNeemTree(woodMat, foliageMat, disposables);
  tree2.position.set(-4.3, groundHeightAt(-4.3, 0.6), 0.6);
  tree2.scale.setScalar(0.88);
  scene.add(tree1, tree2);

  // InstancedMesh Courtyard Grass Blades (90 instances, avoiding nest/coop/rock footprints)
  const grassCount = 90;
  const bladeGeo = new THREE.ConeGeometry(0.036, 0.28, 5);
  bladeGeo.translate(0, 0.14, 0);
  const bladeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.86,
  });
  const grassInstanced = new THREE.InstancedMesh(bladeGeo, bladeMat, grassCount);
  grassInstanced.receiveShadow = true;

  for (let i = 0; i < grassCount; i++) {
    const angle = (i / grassCount) * Math.PI * 2 + (i % 7) * 0.31;
    const radius = 1.75 + ((i * 37) % 45) * 0.12;
    let gx = Math.cos(angle) * radius;
    let gz = Math.sin(angle) * radius;

    // Push clear of egg nest (1.55, 0.95) and coop (-2.35, -2.1)
    if (Math.hypot(gx - 1.55, gz - 0.95) < 0.95) {
      gx += 0.95;
      gz += 0.65;
    }
    if (Math.hypot(gx + 2.35, gz + 2.1) < 2.2) {
      gx -= 1.4;
      gz += 1.6;
    }

    const gy = groundHeightAt(gx, gz);
    const scaleJitter = 0.85 + ((i * 19) % 30) * 0.01; // ±15%

    _dummyObj.position.set(gx, gy, gz);
    _dummyObj.rotation.set(
      ((i % 5) - 2) * 0.08,
      (i * 1.1) % (Math.PI * 2),
      ((i % 3) - 1) * 0.08
    );
    _dummyObj.scale.set(
      scaleJitter,
      scaleJitter * (0.88 + (i % 4) * 0.14),
      scaleJitter
    );
    _dummyObj.updateMatrix();
    grassInstanced.setMatrixAt(i, _dummyObj.matrix);

    _instanceColor.setHSL(0.26 + (i % 5) * 0.012, 0.38, 0.22 + (i % 4) * 0.03);
    grassInstanced.setColorAt(i, _instanceColor);
  }
  grassInstanced.instanceMatrix.needsUpdate = true;
  if (grassInstanced.instanceColor) grassInstanced.instanceColor.needsUpdate = true;
  grassInstanced.computeBoundingSphere();
  scene.add(grassInstanced);
  disposables.push(bladeGeo, bladeMat);

  // Atmospheric Golden Dust Motes
  const dustCount = 110;
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPositions[i * 3] = (((i * 53) % 100) / 100 - 0.5) * 9;
    dustPositions[i * 3 + 1] = 0.3 + ((i * 29) % 100) * 0.032;
    dustPositions[i * 3 + 2] = (((i * 71) % 100) / 100 - 0.5) * 9;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0xf4d284,
    size: 0.045,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
  });
  const dustPoints = new THREE.Points(dustGeo, dustMat);
  scene.add(dustPoints);
  disposables.push(dustGeo, dustMat);

  let paused = false;

  const setCameraPreset = (preset: CameraPresetId) => {
    transitioningCamera = true;
    switch (preset) {
      case 'rooster':
        _desiredCamPos.set(2.45, 1.62, 2.25);
        _desiredTarget.set(0.05, 0.92, 0.02);
        break;
      case 'flock':
        _desiredCamPos.set(2.4, 1.55, 3.1);
        _desiredTarget.set(0.45, 0.45, 0.65);
        break;
      case 'coop':
        _desiredCamPos.set(0.45, 2.1, 1.85);
        _desiredTarget.set(-1.95, 0.95, -1.65);
        break;
      case 'overview':
      default:
        _desiredCamPos.set(3.4, 2.55, 4.65);
        _desiredTarget.set(-0.2, 0.72, -0.2);
        break;
    }
  };

  const setLightingPreset = (mode: LightingPresetId) => {
    if (mode === 'morning') {
      _targetBgColor.setHex(0xeaf0e4);
      keyLight.color.setHex(0xfff4dc);
      keyLight.intensity = 1.95;
      keyLight.position.set(6.0, 9.0, 4.5);
      hemiLight.color.setHex(0xdbeafe);
      hemiLight.groundColor.setHex(0x5c6648);
      hemiLight.intensity = 0.95;
    } else if (mode === 'dusk') {
      _targetBgColor.setHex(0x28322a);
      keyLight.color.setHex(0xffb86c);
      keyLight.intensity = 1.45;
      keyLight.position.set(-5.5, 4.5, 4.0);
      hemiLight.color.setHex(0x6c8299);
      hemiLight.groundColor.setHex(0x26231c);
      hemiLight.intensity = 0.65;
    } else {
      _targetBgColor.setHex(0xe8dec3);
      keyLight.color.setHex(0xffe7ba);
      keyLight.intensity = 2.15;
      keyLight.position.set(5.5, 8.5, 5.0);
      hemiLight.color.setHex(0xdbeafe);
      hemiLight.groundColor.setHex(0x6b583e);
      hemiLight.intensity = 0.85;
    }
  };

  _targetBgColor.setHex(initialFogHex);
  _bgColor.setHex(initialFogHex);

  const stepAndRender = (delta: number, elapsed: number) => {
    const dt = Math.min(delta, 0.1);

    if (!paused) {
      rooster.headPivot.rotation.y = Math.sin(elapsed * 1.4) * 0.16;
      rooster.headPivot.rotation.x = Math.sin(elapsed * 2.1) * 0.05;
      rooster.tailPivot.rotation.z = Math.sin(elapsed * 1.1) * 0.04;

      hen.headPivot.rotation.y = Math.cos(elapsed * 1.7) * 0.2;
      hen.headPivot.rotation.x = Math.max(0, Math.sin(elapsed * 2.4)) * 0.18;

      chick1.position.y =
        groundHeightAt(-0.22, 1.05) + Math.abs(Math.sin(elapsed * 3.2)) * 0.025;
      chick2.position.y =
        groundHeightAt(0.16, 1.18) + Math.abs(Math.cos(elapsed * 2.9)) * 0.022;

      dustPoints.rotation.y = elapsed * 0.035;
    }

    if (transitioningCamera) {
      camera.position.x = THREE.MathUtils.damp(
        camera.position.x,
        _desiredCamPos.x,
        5.5,
        dt
      );
      camera.position.y = THREE.MathUtils.damp(
        camera.position.y,
        _desiredCamPos.y,
        5.5,
        dt
      );
      camera.position.z = THREE.MathUtils.damp(
        camera.position.z,
        _desiredCamPos.z,
        5.5,
        dt
      );

      controls.target.x = THREE.MathUtils.damp(
        controls.target.x,
        _desiredTarget.x,
        5.5,
        dt
      );
      controls.target.y = THREE.MathUtils.damp(
        controls.target.y,
        _desiredTarget.y,
        5.5,
        dt
      );
      controls.target.z = THREE.MathUtils.damp(
        controls.target.z,
        _desiredTarget.z,
        5.5,
        dt
      );

      if (
        camera.position.distanceToSquared(_desiredCamPos) < 0.002 &&
        controls.target.distanceToSquared(_desiredTarget) < 0.002
      ) {
        transitioningCamera = false;
      }
    }

    _bgColor.lerp(_targetBgColor, 1 - Math.exp(-4 * dt));
    (scene.background as THREE.Color).copy(_bgColor);
    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.color.copy(_bgColor);
    }

    controls.update();
    renderer.render(scene, camera);
  };

  const resize = (width: number, height: number) => {
    const w = Math.max(1, width);
    const h = Math.max(1, height);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };

  const dispose = () => {
    controls.dispose();
    disposables.forEach((dItem) => dItem.dispose());
  };

  return {
    setCameraPreset,
    setLightingPreset,
    setPaused: (p: boolean) => {
      paused = p;
    },
    resize,
    stepAndRender,
    dispose,
  };
}

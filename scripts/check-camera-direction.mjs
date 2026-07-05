import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CameraRig } from '../src/three/CameraRig.js';

const domElementStub = { addEventListener() {}, setPointerCapture() {} };

const views = [
  ['Inselanflug', [24, 13, 32], [0, 1, -22]],
  ['Einsteigen', [6, 5.3, 5], [-7, 3.1, -10]],
  ['Schrumpfen', [-2, 5, 2], [5, 1.2, -1]],
  ['Wassertropfen', [0, .5, 10.5], [0, 0, 0]],
  ['Verdunstung', [0, .4, 7.2], [0, 1.2, -1]],
  ['Wolkenbildung', [0, 2, 13], [0, 3, -9]],
  ['Wolkenreise', [-8, 7, 15], [0, 3, -10]],
  ['Regen', [0, 8, 16], [0, 3, -10]],
  ['Landwege', [42, 12, 24], [23, 0, -22]],
  ['Flussmündung', [6, 9, 22], [-10, -1, 8]],
  ['Gesamtmodell', [-2, 25, 39], [0, 3, -13]]
].map(([name, position, target]) => ({ name, position, target }));

for (const view of views) {
  const camera = new THREE.PerspectiveCamera();
  const rig = new CameraRig(camera, domElementStub);
  rig.setPosition(...view.position);
  rig.setTarget(...view.target);
  rig.root.updateMatrixWorld(true);

  const actualDirection = new THREE.Vector3();
  camera.getWorldDirection(actualDirection);
  const expectedDirection = new THREE.Vector3(...view.target)
    .sub(new THREE.Vector3(...view.position))
    .normalize();
  const alignment = actualDirection.dot(expectedDirection);

  assert.ok(
    alignment > 0.999,
    `${view.name}: Kamera blickt nicht auf das Ziel (Ausrichtung ${alignment}).`
  );
}

console.log(`Kamerarichtung für ${views.length} Kapitelansichten geprüft.`);

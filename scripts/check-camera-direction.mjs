import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CameraRig } from '../src/three/CameraRig.js';

const domElementStub = {
  addEventListener() {},
  setPointerCapture() {}
};

const views = [
  {
    name: 'Meer und Aufbruch',
    position: [0, 5.8, 18],
    target: [0, 2.5, -28]
  },
  {
    name: 'Im Wassertropfen',
    position: [0, 0.5, 10.5],
    target: [0, 0, 0]
  },
  {
    name: 'Verdunstung',
    position: [0, 0.4, 7.2],
    target: [0, 1.2, -1]
  },
  {
    name: 'Gesamtmodell',
    position: [-2, 24, 35],
    target: [0, 3, -12]
  }
];

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

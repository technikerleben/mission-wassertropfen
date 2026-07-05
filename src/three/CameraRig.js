import * as THREE from 'three';

export class CameraRig {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.root = new THREE.Group();
    this.lookPivot = new THREE.Group();
    this.root.add(this.lookPivot);
    this.lookPivot.add(camera);
    this.target = new THREE.Vector3(0, 0, -1);
    this.viewMatrix = new THREE.Matrix4();
    this.desiredQuaternion = new THREE.Quaternion();
    this.pointer = { active: false, startX: 0, startY: 0, startYaw: 0, startPitch: 0 };
    this.userYaw = 0;
    this.userPitch = 0;
    this.targetYaw = 0;
    this.targetPitch = 0;
    this.maxYaw = THREE.MathUtils.degToRad(24);
    this.maxPitch = THREE.MathUtils.degToRad(13);
    this.bindInput();
  }

  bindInput() {
    this.domElement.addEventListener('pointerdown', (event) => {
      this.pointer.active = true;
      this.pointer.startX = event.clientX;
      this.pointer.startY = event.clientY;
      this.pointer.startYaw = this.targetYaw;
      this.pointer.startPitch = this.targetPitch;
      this.domElement.setPointerCapture?.(event.pointerId);
    });
    this.domElement.addEventListener('pointermove', (event) => {
      if (!this.pointer.active) return;
      const dx = (event.clientX - this.pointer.startX) / window.innerWidth;
      const dy = (event.clientY - this.pointer.startY) / window.innerHeight;
      this.targetYaw = THREE.MathUtils.clamp(this.pointer.startYaw - dx * 1.45, -this.maxYaw, this.maxYaw);
      this.targetPitch = THREE.MathUtils.clamp(this.pointer.startPitch - dy * 1.1, -this.maxPitch, this.maxPitch);
    });
    const stop = () => { this.pointer.active = false; };
    this.domElement.addEventListener('pointerup', stop);
    this.domElement.addEventListener('pointercancel', stop);
  }

  setPosition(x, y, z) {
    this.root.position.set(x, y, z);
  }

  setTarget(x, y, z) {
    this.target.set(x, y, z);
    this.snapToTarget();
  }

  calculateDesiredQuaternion() {
    if (this.root.position.distanceToSquared(this.target) < 0.000001) return false;

    // Kameras blicken in Three.js entlang ihrer lokalen negativen Z-Achse.
    // Matrix4.lookAt(eye, target, up) erzeugt genau diese Kameraorientierung.
    // Object3D.lookAt() auf einer normalen Group würde dagegen die positive
    // Z-Achse zum Ziel drehen und die Kamera dadurch vom Motiv wegschauen lassen.
    this.viewMatrix.lookAt(this.root.position, this.target, this.root.up);
    this.desiredQuaternion.setFromRotationMatrix(this.viewMatrix);
    return true;
  }

  snapToTarget() {
    if (this.calculateDesiredQuaternion()) {
      this.root.quaternion.copy(this.desiredQuaternion);
    }
  }

  resetLook() {
    this.targetYaw = 0;
    this.targetPitch = 0;
  }

  update(deltaTime) {
    const blend = 1 - Math.exp(-deltaTime * 8);
    if (this.calculateDesiredQuaternion()) {
      this.root.quaternion.slerp(this.desiredQuaternion, blend);
    }
    this.userYaw = THREE.MathUtils.lerp(this.userYaw, this.targetYaw, blend);
    this.userPitch = THREE.MathUtils.lerp(this.userPitch, this.targetPitch, blend);
    this.lookPivot.rotation.set(this.userPitch, this.userYaw, 0, 'YXZ');
  }
}

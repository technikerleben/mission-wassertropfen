import * as THREE from 'three';

const tempMatrix = new THREE.Matrix4();
const tempQuaternion = new THREE.Quaternion();
const tempScale = new THREE.Vector3(1, 1, 1);
const tempPosition = new THREE.Vector3();
const tempEuler = new THREE.Euler();

function createSky() {
  const geometry = new THREE.SphereGeometry(120, 32, 20);
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      topColor: { value: new THREE.Color('#0b4e7d') },
      bottomColor: { value: new THREE.Color('#b5e9ee') },
      offset: { value: 16 },
      exponent: { value: 0.7 }
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + vec3(0.0, offset, 0.0)).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `
  });
  return new THREE.Mesh(geometry, material);
}

function createOcean() {
  const geometry = new THREE.PlaneGeometry(180, 180, 160, 160);
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.ShaderMaterial({
    transparent: false,
    uniforms: {
      uTime: { value: 0 },
      uDeep: { value: new THREE.Color('#06496a') },
      uShallow: { value: new THREE.Color('#31a7bf') }
    },
    vertexShader: `
      uniform float uTime;
      varying float vWave;
      varying vec3 vNormalW;
      void main() {
        vec3 p = position;
        float w1 = sin(p.x * 0.19 + uTime * 0.9) * 0.34;
        float w2 = cos(p.z * 0.15 - uTime * 0.72) * 0.26;
        float w3 = sin((p.x + p.z) * 0.08 + uTime * 0.42) * 0.18;
        p.y += w1 + w2 + w3;
        vWave = p.y;
        vNormalW = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uDeep;
      uniform vec3 uShallow;
      varying float vWave;
      varying vec3 vNormalW;
      void main() {
        float mixValue = smoothstep(-0.7, 0.9, vWave);
        vec3 color = mix(uDeep, uShallow, mixValue);
        float fresnel = pow(1.0 - abs(vNormalW.z), 2.0);
        color += fresnel * vec3(0.08, 0.18, 0.22);
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  return mesh;
}

function createCloud(x, y, z, scale = 1) {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color: '#edfaff', roughness: 1, transparent: true, opacity: 0.88 });
  const geometry = new THREE.SphereGeometry(1, 14, 10);
  const parts = [
    [-1.4, 0, 0, 1.15], [-.4, .45, 0, 1.4], [.75, .25, 0, 1.2], [1.65, -.02, 0, .92], [.1, -.15, .25, 1.3]
  ];
  for (const [px, py, pz, s] of parts) {
    const puff = new THREE.Mesh(geometry, material);
    puff.position.set(px, py, pz);
    puff.scale.setScalar(s);
    group.add(puff);
  }
  group.position.set(x, y, z);
  group.scale.setScalar(scale);
  return group;
}

function createSun() {
  const group = new THREE.Group();
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(4, 24, 18),
    new THREE.MeshBasicMaterial({ color: '#fff1a3' })
  );
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: createGlowTexture(),
    color: '#ffe68a',
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  }));
  glow.scale.set(18, 18, 1);
  group.add(glow, sphere);
  group.position.set(-30, 28, -65);
  return group;
}

function createGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255,255,220,1)');
  gradient.addColorStop(.2, 'rgba(255,232,125,.8)');
  gradient.addColorStop(1, 'rgba(255,205,80,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

function createMountains() {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color: '#6d8f83', roughness: 1, flatShading: true });
  const snow = new THREE.MeshStandardMaterial({ color: '#e9f6f5', roughness: .9, flatShading: true });
  const specs = [
    [-26, 3, -44, 8, 14], [-15, 2.5, -49, 10, 17], [1, 2, -53, 12, 20], [18, 3, -50, 9, 15], [31, 2, -47, 7, 12]
  ];
  for (const [x, y, z, radius, height] of specs) {
    const mountain = new THREE.Mesh(new THREE.ConeGeometry(radius, height, 7), material);
    mountain.position.set(x, y + height / 2 - 1.5, z);
    mountain.rotation.y = Math.random();
    const cap = new THREE.Mesh(new THREE.ConeGeometry(radius * .42, height * .28, 7), snow);
    cap.position.set(x, y + height * .83, z);
    cap.rotation.y = mountain.rotation.y;
    group.add(mountain, cap);
  }
  return group;
}

export class OceanWorld {
  constructor() {
    this.group = new THREE.Group();
    this.group.visible = false;
    this.ocean = createOcean();
    this.sky = createSky();
    this.sun = createSun();
    this.clouds = new THREE.Group();
    this.clouds.add(createCloud(-24, 17, -38, 2.3), createCloud(12, 20, -52, 2.9), createCloud(36, 15, -28, 1.8));
    this.mountains = createMountains();
    this.group.add(this.sky, this.ocean, this.sun, this.clouds, this.mountains);
  }

  update(time) {
    this.ocean.material.uniforms.uTime.value = time;
    this.clouds.children.forEach((cloud, index) => {
      cloud.position.x += Math.sin(time * .08 + index) * .001;
      cloud.rotation.y = Math.sin(time * .05 + index) * .04;
    });
  }
}

export class MolecularWorld {
  constructor(maxCount = 180) {
    this.group = new THREE.Group();
    this.group.visible = false;
    this.maxCount = maxCount;
    this.activeCount = 110;
    this.surfaceY = 4.2;
    this.molecules = [];
    this.isHeating = false;
    this.baseSpeed = .34;
    this.evaporationProgress = 0;
    this.createEnvironment();
    this.createMolecules();
    this.createTrackedMolecule();
  }

  createEnvironment() {
    const shellMaterial = new THREE.MeshPhysicalMaterial({
      color: '#7ce7f0', transparent: true, opacity: .08, roughness: .12, metalness: 0,
      transmission: .25, side: THREE.BackSide, depthWrite: false
    });
    this.shell = new THREE.Mesh(new THREE.SphereGeometry(10, 34, 24), shellMaterial);
    this.shell.scale.set(1.28, .9, 1.05);
    this.surface = new THREE.Mesh(
      new THREE.CircleGeometry(10, 64),
      new THREE.MeshPhysicalMaterial({ color: '#54d8e7', transparent: true, opacity: .19, side: THREE.DoubleSide, roughness: .18, depthWrite: false })
    );
    this.surface.rotation.x = -Math.PI / 2;
    this.surface.position.y = this.surfaceY;
    this.bubbles = new THREE.Points(
      new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(Array.from({ length: 360 }, () => (Math.random() - .5) * 18), 3)),
      new THREE.PointsMaterial({ color: '#b8f7ff', size: .035, transparent: true, opacity: .28 })
    );
    this.group.add(this.shell, this.surface, this.bubbles);
  }

  createMolecules() {
    const oxygenGeometry = new THREE.SphereGeometry(.18, 10, 8);
    const hydrogenGeometry = new THREE.SphereGeometry(.11, 8, 6);
    this.oxygenMesh = new THREE.InstancedMesh(oxygenGeometry, new THREE.MeshStandardMaterial({ color: '#ef6b72', roughness: .38 }), this.maxCount);
    this.hydrogenMesh = new THREE.InstancedMesh(hydrogenGeometry, new THREE.MeshStandardMaterial({ color: '#f5fbff', roughness: .28 }), this.maxCount * 2);
    this.oxygenMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.hydrogenMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    for (let i = 0; i < this.maxCount; i++) {
      const position = new THREE.Vector3(
        THREE.MathUtils.randFloatSpread(13.5),
        THREE.MathUtils.randFloat(-5.6, 3.8),
        THREE.MathUtils.randFloatSpread(10.5)
      );
      if (position.length() > 8.2) position.multiplyScalar(8.2 / position.length());
      const velocity = new THREE.Vector3().randomDirection().multiplyScalar(THREE.MathUtils.randFloat(.12, .42));
      this.molecules.push({ position, velocity, rotation: Math.random() * Math.PI * 2, spin: THREE.MathUtils.randFloat(-1.5, 1.5) });
    }
    this.group.add(this.oxygenMesh, this.hydrogenMesh);
    this.setActiveCount(this.activeCount);
  }

  createTrackedMolecule() {
    this.tracked = new THREE.Group();
    const oxygen = new THREE.Mesh(new THREE.SphereGeometry(.3, 20, 14), new THREE.MeshStandardMaterial({ color: '#ff5967', emissive: '#7b0715', emissiveIntensity: .8, roughness: .25 }));
    const hydrogenMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#2a6b73', emissiveIntensity: .25, roughness: .2 });
    const h1 = new THREE.Mesh(new THREE.SphereGeometry(.18, 16, 10), hydrogenMaterial);
    const h2 = h1.clone();
    h1.position.set(-.34, .2, 0);
    h2.position.set(.34, .2, 0);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: createGlowTexture(), color: '#68ecff', transparent: true, opacity: .55, depthWrite: false, blending: THREE.AdditiveBlending }));
    glow.scale.set(2.2, 2.2, 1);
    this.tracked.add(glow, oxygen, h1, h2);
    this.tracked.position.set(0, .2, -1);
    this.group.add(this.tracked);
  }

  setActiveCount(count) {
    this.activeCount = Math.min(count, this.maxCount);
    this.oxygenMesh.count = this.activeCount;
    this.hydrogenMesh.count = this.activeCount * 2;
  }

  reset() {
    this.isHeating = false;
    this.evaporationProgress = 0;
    this.tracked.position.set(0, .2, -1);
    this.tracked.scale.setScalar(1);
    this.surface.material.opacity = .19;
  }

  setHeating(value) {
    this.isHeating = value;
  }

  update(deltaTime, time) {
    const speed = this.baseSpeed * (this.isHeating ? 2.4 : 1);
    for (let i = 0; i < this.activeCount; i++) {
      const molecule = this.molecules[i];
      molecule.position.addScaledVector(molecule.velocity, deltaTime * speed * 7);
      molecule.rotation += molecule.spin * deltaTime * speed;
      const radial = Math.sqrt(molecule.position.x ** 2 + molecule.position.z ** 2);
      if (radial > 7.2) {
        const normal = new THREE.Vector3(molecule.position.x, 0, molecule.position.z).normalize();
        molecule.velocity.reflect(normal);
        molecule.position.x *= .98;
        molecule.position.z *= .98;
      }
      if (molecule.position.y > this.surfaceY - .35 || molecule.position.y < -5.8) {
        molecule.velocity.y *= -1;
        molecule.position.y = THREE.MathUtils.clamp(molecule.position.y, -5.75, this.surfaceY - .4);
      }
      tempEuler.set(0, molecule.rotation, Math.sin(molecule.rotation * .7) * .5);
      tempQuaternion.setFromEuler(tempEuler);
      tempPosition.copy(molecule.position);
      tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
      this.oxygenMesh.setMatrixAt(i, tempMatrix);

      const hOffset1 = new THREE.Vector3(-.27, .15, 0).applyQuaternion(tempQuaternion).add(molecule.position);
      const hOffset2 = new THREE.Vector3(.27, .15, 0).applyQuaternion(tempQuaternion).add(molecule.position);
      tempMatrix.compose(hOffset1, tempQuaternion, tempScale);
      this.hydrogenMesh.setMatrixAt(i * 2, tempMatrix);
      tempMatrix.compose(hOffset2, tempQuaternion, tempScale);
      this.hydrogenMesh.setMatrixAt(i * 2 + 1, tempMatrix);
    }
    this.oxygenMesh.instanceMatrix.needsUpdate = true;
    this.hydrogenMesh.instanceMatrix.needsUpdate = true;
    this.tracked.rotation.y = Math.sin(time * 1.1) * .35;
    this.tracked.rotation.z = Math.cos(time * .9) * .18;
    const pulse = 1 + Math.sin(time * 4) * .035;
    this.tracked.scale.setScalar(pulse);
    this.surface.rotation.z = Math.sin(time * .18) * .03;
  }
}

function createArrowCurve(points, color) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 72, .09, 8, false),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .7 })
  );
  const dots = [];
  const dotGeometry = new THREE.SphereGeometry(.22, 10, 8);
  const dotMaterial = new THREE.MeshBasicMaterial({ color });
  for (let i = 0; i < 5; i++) {
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    dots.push(dot);
    tube.add(dot);
  }
  tube.userData = { curve, dots, offset: Math.random() };
  return tube;
}

export class OverviewWorld {
  constructor() {
    this.group = new THREE.Group();
    this.group.visible = false;
    this.sky = createSky();
    this.ocean = createOcean();
    this.ocean.scale.set(.52, .52, .52);
    this.ocean.position.x = -28;
    this.land = new THREE.Mesh(
      new THREE.PlaneGeometry(95, 72, 30, 30),
      new THREE.MeshStandardMaterial({ color: '#5f9d68', roughness: 1, flatShading: true })
    );
    this.land.rotation.x = -Math.PI / 2;
    this.land.position.set(25, .16, -15);
    const positions = this.land.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      positions.setZ(i, Math.max(0, Math.sin(x * .08) * 1.5 + Math.cos(y * .11) * 1.2 + Math.random() * .45));
    }
    positions.needsUpdate = true;
    this.land.geometry.computeVertexNormals();
    this.mountains = createMountains();
    this.mountains.position.set(18, 0, 10);
    this.cloud = createCloud(12, 18, -22, 3.1);
    this.sun = createSun();
    this.sun.position.set(-35, 31, -56);
    this.river = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
        new THREE.Vector3(22, 1.05, -35), new THREE.Vector3(18, .65, -15), new THREE.Vector3(8, .45, 3), new THREE.Vector3(-10, .28, 13), new THREE.Vector3(-27, .1, 11)
      ]), 80, .8, 10, false),
      new THREE.MeshStandardMaterial({ color: '#28a7c2', roughness: .25 })
    );
    this.arrows = new THREE.Group();
    this.arrows.add(
      createArrowCurve([[-28, 1, 5], [-25, 8, -2], [-15, 14, -14], [2, 17, -21]], '#6ee7f2'),
      createArrowCurve([[8, 17, -20], [18, 15, -13], [27, 9, -2], [28, 2, 7]], '#d5f7ff'),
      createArrowCurve([[25, 1, 8], [16, .6, 2], [4, .4, 8], [-18, .3, 10]], '#47bed6')
    );
    this.group.add(this.sky, this.ocean, this.land, this.mountains, this.cloud, this.sun, this.river, this.arrows);
  }

  update(time) {
    this.ocean.material.uniforms.uTime.value = time;
    this.cloud.position.x = 12 + Math.sin(time * .12) * 2;
    this.arrows.children.forEach((tube) => {
      const { curve, dots, offset } = tube.userData;
      dots.forEach((dot, index) => {
        const t = (time * .08 + index / dots.length + offset) % 1;
        dot.position.copy(curve.getPointAt(t));
        tube.worldToLocal(dot.position);
      });
    });
  }
}

export class WorldManager {
  constructor(scene) {
    this.scene = scene;
    this.ocean = new OceanWorld();
    this.molecular = new MolecularWorld();
    this.overview = new OverviewWorld();
    this.worlds = { ocean: this.ocean, molecular: this.molecular, overview: this.overview };
    Object.values(this.worlds).forEach((world) => scene.add(world.group));
    this.active = null;
  }

  activate(name) {
    Object.entries(this.worlds).forEach(([worldName, world]) => { world.group.visible = worldName === name; });
    this.active = this.worlds[name];
  }

  update(deltaTime, time) {
    if (!this.active) return;
    if (this.active === this.molecular) this.active.update(deltaTime, time);
    else this.active.update(time);
  }

  setQuality(level) {
    const counts = { low: 70, medium: 110, high: 170 };
    this.molecular.setActiveCount(counts[level] ?? counts.medium);
    const cloudVisibility = level !== 'low';
    this.ocean.clouds.children.forEach((cloud, index) => { cloud.visible = cloudVisibility || index === 0; });
  }
}

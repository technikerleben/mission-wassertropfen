import * as THREE from 'three';

const tempMatrix = new THREE.Matrix4();
const tempQuaternion = new THREE.Quaternion();
const tempScale = new THREE.Vector3(1, 1, 1);
const tempPosition = new THREE.Vector3();
const tempEuler = new THREE.Euler();

function createGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(.25, 'rgba(120,235,255,.8)');
  gradient.addColorStop(1, 'rgba(80,210,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

function createSky() {
  const geometry = new THREE.SphereGeometry(180, 36, 22);
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      topColor: { value: new THREE.Color('#0b5f91') },
      bottomColor: { value: new THREE.Color('#c8f2ef') }
    },
    vertexShader: `
      varying vec3 vPosition;
      void main(){
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      varying vec3 vPosition;
      void main(){
        float h = clamp(normalize(vPosition).y * .55 + .45, 0.0, 1.0);
        gl_FragColor = vec4(mix(bottomColor, topColor, pow(h,.75)),1.0);
      }
    `
  });
  return new THREE.Mesh(geometry, material);
}

function createOcean(size = 220) {
  const geometry = new THREE.PlaneGeometry(size, size, 120, 120);
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDeep: { value: new THREE.Color('#075b78') },
      uLight: { value: new THREE.Color('#34c6cf') }
    },
    vertexShader: `
      uniform float uTime;
      varying float vWave;
      void main(){
        vec3 p = position;
        p.y += sin(p.x*.16+uTime*.8)*.22;
        p.y += cos(p.z*.13-uTime*.63)*.18;
        p.y += sin((p.x+p.z)*.07+uTime*.35)*.12;
        vWave = p.y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uDeep;
      uniform vec3 uLight;
      varying float vWave;
      void main(){
        float m = smoothstep(-.6,.6,vWave);
        gl_FragColor = vec4(mix(uDeep,uLight,m),1.0);
      }
    `
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  return mesh;
}

function createPalm(x, z, scale = 1) {
  const group = new THREE.Group();
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: '#8d5b34', roughness: 1 });
  const leafMaterial = new THREE.MeshStandardMaterial({ color: '#2f9b57', roughness: .9, side: THREE.DoubleSide });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.18, .28, 4.6, 7), trunkMaterial);
  trunk.position.y = 2.3;
  trunk.rotation.z = .08;
  group.add(trunk);
  for (let i = 0; i < 7; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(.48, 3.5, 5), leafMaterial);
    leaf.position.y = 4.55;
    leaf.rotation.z = Math.PI / 2.5;
    leaf.rotation.y = i / 7 * Math.PI * 2;
    leaf.position.x = Math.cos(leaf.rotation.y) * .55;
    leaf.position.z = Math.sin(leaf.rotation.y) * .55;
    group.add(leaf);
  }
  group.position.set(x, 0, z);
  group.scale.setScalar(scale);
  return group;
}

function createIsland() {
  const group = new THREE.Group();
  const sand = new THREE.Mesh(
    new THREE.CylinderGeometry(11, 14, 1.7, 44),
    new THREE.MeshStandardMaterial({ color: '#e9c77a', roughness: 1, flatShading: true })
  );
  sand.position.y = -.45;
  const grass = new THREE.Mesh(
    new THREE.CylinderGeometry(8.2, 10.8, 1.25, 36),
    new THREE.MeshStandardMaterial({ color: '#69a95b', roughness: 1, flatShading: true })
  );
  grass.position.y = .5;
  group.add(sand, grass);
  group.add(
    createPalm(-4, -1.5, 1),
    createPalm(-1.2, 2.8, .9),
    createPalm(3.3, 1.2, 1.1),
    createPalm(5.2, -2.4, .8)
  );
  return group;
}

function createExplorer() {
  const group = new THREE.Group();
  const hullMaterial = new THREE.MeshStandardMaterial({ color: '#d8eef3', metalness: .65, roughness: .25 });
  const darkMaterial = new THREE.MeshStandardMaterial({ color: '#17384a', metalness: .5, roughness: .32 });
  const glassMaterial = new THREE.MeshPhysicalMaterial({ color: '#58d9eb', transparent: true, opacity: .42, transmission: .2, roughness: .08 });

  const hull = new THREE.Mesh(new THREE.CapsuleGeometry(1.8, 4.6, 8, 18), hullMaterial);
  hull.rotation.z = Math.PI / 2;
  hull.scale.set(1, .92, .9);
  group.add(hull);

  const canopy = new THREE.Mesh(new THREE.SphereGeometry(1.45, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), glassMaterial);
  canopy.scale.set(1.4, .8, 1);
  canopy.position.set(.7, 1.05, 0);
  canopy.rotation.z = -.12;
  group.add(canopy);
  group.userData.canopy = canopy;

  const wingGeometry = new THREE.BoxGeometry(2.6, .18, 1.15);
  const leftWing = new THREE.Mesh(wingGeometry, darkMaterial);
  leftWing.position.set(-.5, -.45, 2.05);
  const rightWing = leftWing.clone();
  rightWing.position.z = -2.05;
  group.add(leftWing, rightWing);

  const engineGeometry = new THREE.CylinderGeometry(.38, .48, 1.4, 12);
  engineGeometry.rotateZ(Math.PI / 2);
  const engineA = new THREE.Mesh(engineGeometry, darkMaterial);
  engineA.position.set(-2.55, -.2, 1.15);
  const engineB = engineA.clone();
  engineB.position.z = -1.15;
  group.add(engineA, engineB);

  const lightMaterial = new THREE.MeshBasicMaterial({ color: '#7df6ff' });
  const light = new THREE.Mesh(new THREE.SphereGeometry(.18, 10, 8), lightMaterial);
  light.position.set(2.85, 0, 0);
  group.add(light);

  const hatch = new THREE.Mesh(new THREE.BoxGeometry(1.55, .12, 1.35), darkMaterial);
  hatch.position.set(.45, 1.68, 0);
  hatch.rotation.z = -.05;
  group.add(hatch);
  group.userData.hatch = hatch;

  group.scale.setScalar(1.35);
  return group;
}

function createCloud(x = 0, y = 0, z = 0, scale = 1) {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color: '#f0fbff', roughness: 1, transparent: true, opacity: .9 });
  const geometry = new THREE.SphereGeometry(1, 14, 10);
  [[-2,0,0,1.5],[-.8,.7,0,1.8],[.8,.45,0,1.55],[2,0,0,1.35],[0,-.25,.4,1.9]].forEach(([px,py,pz,s]) => {
    const puff = new THREE.Mesh(geometry, material);
    puff.position.set(px,py,pz);
    puff.scale.setScalar(s);
    group.add(puff);
  });
  group.position.set(x,y,z);
  group.scale.setScalar(scale);
  return group;
}

function createTrackedMolecule(scale = 1) {
  const group = new THREE.Group();
  const oxygen = new THREE.Mesh(
    new THREE.SphereGeometry(.32, 18, 12),
    new THREE.MeshStandardMaterial({ color: '#ff5967', emissive: '#700815', emissiveIntensity: .8, roughness: .25 })
  );
  const hMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#1d6570', emissiveIntensity: .2, roughness: .2 });
  const h1 = new THREE.Mesh(new THREE.SphereGeometry(.19, 14, 10), hMaterial);
  const h2 = h1.clone();
  h1.position.set(-.36,.2,0);
  h2.position.set(.36,.2,0);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: createGlowTexture(), color: '#7defff', transparent: true, opacity: .7, depthWrite: false, blending: THREE.AdditiveBlending }));
  glow.scale.set(2.6,2.6,1);
  group.add(glow, oxygen, h1, h2);
  group.scale.setScalar(scale);
  return group;
}

function createStreamCurve(points, radius = .38, color = '#31b8cf') {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  const mesh = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 100, radius, 10, false),
    new THREE.MeshStandardMaterial({ color, roughness: .2, metalness: .05 })
  );
  mesh.userData.curve = curve;
  return mesh;
}

export class IslandWorld {
  constructor() {
    this.group = new THREE.Group();
    this.group.visible = false;
    this.sky = createSky();
    this.ocean = createOcean();
    this.island = createIsland();
    this.island.position.set(0, .15, -24);
    this.explorer = createExplorer();
    this.explorer.position.set(-7, 3.2, -10);
    this.explorer.rotation.y = .2;
    this.shrinkRings = new THREE.Group();
    for (let i = 0; i < 7; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(2.8 + i * .6, .035, 8, 48),
        new THREE.MeshBasicMaterial({ color: i % 2 ? '#61e8f3' : '#d7fbff', transparent: true, opacity: 0 })
      );
      ring.rotation.y = Math.PI / 2;
      ring.position.copy(this.explorer.position);
      this.shrinkRings.add(ring);
    }
    this.drop = new THREE.Mesh(
      new THREE.SphereGeometry(1.25, 28, 20),
      new THREE.MeshPhysicalMaterial({ color: '#79ecf5', transparent: true, opacity: .5, transmission: .35, roughness: .05 })
    );
    this.drop.position.set(5, 1.2, -1);
    this.drop.visible = false;
    this.group.add(this.sky, this.ocean, this.island, this.explorer, this.shrinkRings, this.drop);
    this.reset();
  }

  reset() {
    this.explorer.visible = true;
    this.explorer.position.set(-7, 3.2, -10);
    this.explorer.rotation.set(0,.2,0);
    this.explorer.scale.setScalar(1.35);
    this.explorer.userData.hatch.rotation.x = 0;
    this.explorer.userData.hatch.position.y = 1.68;
    this.drop.visible = false;
    this.drop.scale.setScalar(1);
    this.shrinkRings.children.forEach((ring) => {
      ring.material.opacity = 0;
      ring.scale.setScalar(1);
    });
  }

  update(time) {
    this.ocean.material.uniforms.uTime.value = time;
    this.explorer.position.y += Math.sin(time * 1.6) * .0015;
    this.shrinkRings.children.forEach((ring, index) => {
      ring.rotation.x = time * (.25 + index * .03);
    });
  }
}

export class MolecularWorld {
  constructor(maxCount = 190) {
    this.group = new THREE.Group();
    this.group.visible = false;
    this.maxCount = maxCount;
    this.activeCount = 120;
    this.surfaceY = 4.1;
    this.molecules = [];
    this.isHeating = false;
    this.createEnvironment();
    this.createMolecules();
    this.tracked = createTrackedMolecule(1.1);
    this.tracked.position.set(0,.2,-1);
    this.group.add(this.tracked);
  }

  createEnvironment() {
    this.shell = new THREE.Mesh(
      new THREE.SphereGeometry(10,34,24),
      new THREE.MeshPhysicalMaterial({ color:'#7ce7f0',transparent:true,opacity:.08,roughness:.12,transmission:.25,side:THREE.BackSide,depthWrite:false })
    );
    this.shell.scale.set(1.28,.9,1.05);
    this.surface = new THREE.Mesh(
      new THREE.CircleGeometry(10,64),
      new THREE.MeshPhysicalMaterial({ color:'#54d8e7',transparent:true,opacity:.2,side:THREE.DoubleSide,roughness:.18,depthWrite:false })
    );
    this.surface.rotation.x = -Math.PI/2;
    this.surface.position.y = this.surfaceY;
    this.group.add(this.shell,this.surface);
  }

  createMolecules() {
    const oxygenGeometry = new THREE.SphereGeometry(.18,10,8);
    const hydrogenGeometry = new THREE.SphereGeometry(.11,8,6);
    this.oxygenMesh = new THREE.InstancedMesh(oxygenGeometry,new THREE.MeshStandardMaterial({color:'#ef6b72',roughness:.38}),this.maxCount);
    this.hydrogenMesh = new THREE.InstancedMesh(hydrogenGeometry,new THREE.MeshStandardMaterial({color:'#f5fbff',roughness:.28}),this.maxCount*2);
    this.oxygenMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.hydrogenMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    for(let i=0;i<this.maxCount;i++){
      const position = new THREE.Vector3(THREE.MathUtils.randFloatSpread(13),THREE.MathUtils.randFloat(-5.5,3.7),THREE.MathUtils.randFloatSpread(10));
      if(position.length()>8.1) position.multiplyScalar(8.1/position.length());
      const velocity = new THREE.Vector3().randomDirection().multiplyScalar(THREE.MathUtils.randFloat(.12,.42));
      this.molecules.push({position,velocity,rotation:Math.random()*Math.PI*2,spin:THREE.MathUtils.randFloat(-1.5,1.5)});
    }
    this.group.add(this.oxygenMesh,this.hydrogenMesh);
    this.setActiveCount(this.activeCount);
  }

  setActiveCount(count){
    this.activeCount=Math.min(count,this.maxCount);
    this.oxygenMesh.count=this.activeCount;
    this.hydrogenMesh.count=this.activeCount*2;
  }

  reset(){
    this.isHeating=false;
    this.tracked.position.set(0,.2,-1);
    this.tracked.scale.setScalar(1.1);
    this.shell.material.opacity=.08;
    this.surface.material.opacity=.2;
  }

  setHeating(value){this.isHeating=value;}

  update(deltaTime,time){
    const speed=(this.isHeating?2.45:1)*.34;
    for(let i=0;i<this.activeCount;i++){
      const m=this.molecules[i];
      m.position.addScaledVector(m.velocity,deltaTime*speed*7);
      m.rotation+=m.spin*deltaTime*speed;
      const radial=Math.hypot(m.position.x,m.position.z);
      if(radial>7.2){
        const normal=new THREE.Vector3(m.position.x,0,m.position.z).normalize();
        m.velocity.reflect(normal);
        m.position.x*=.98;m.position.z*=.98;
      }
      if(m.position.y>this.surfaceY-.35||m.position.y<-5.8){
        m.velocity.y*=-1;
        m.position.y=THREE.MathUtils.clamp(m.position.y,-5.75,this.surfaceY-.4);
      }
      tempEuler.set(0,m.rotation,Math.sin(m.rotation*.7)*.5);
      tempQuaternion.setFromEuler(tempEuler);
      tempPosition.copy(m.position);
      tempMatrix.compose(tempPosition,tempQuaternion,tempScale);
      this.oxygenMesh.setMatrixAt(i,tempMatrix);
      const h1=new THREE.Vector3(-.27,.15,0).applyQuaternion(tempQuaternion).add(m.position);
      const h2=new THREE.Vector3(.27,.15,0).applyQuaternion(tempQuaternion).add(m.position);
      tempMatrix.compose(h1,tempQuaternion,tempScale);this.hydrogenMesh.setMatrixAt(i*2,tempMatrix);
      tempMatrix.compose(h2,tempQuaternion,tempScale);this.hydrogenMesh.setMatrixAt(i*2+1,tempMatrix);
    }
    this.oxygenMesh.instanceMatrix.needsUpdate=true;
    this.hydrogenMesh.instanceMatrix.needsUpdate=true;
    this.tracked.rotation.y=Math.sin(time*1.1)*.35;
    this.tracked.rotation.z=Math.cos(time*.9)*.18;
  }
}

export class CloudWorld {
  constructor() {
    this.group = new THREE.Group();
    this.group.visible = false;
    this.sky = createSky();
    this.land = new THREE.Mesh(
      new THREE.PlaneGeometry(160,100,30,20),
      new THREE.MeshStandardMaterial({color:'#6ca566',roughness:1,flatShading:true})
    );
    this.land.rotation.x=-Math.PI/2;
    this.land.position.set(0,-12,-40);
    this.coast = new THREE.Mesh(new THREE.PlaneGeometry(70,100),new THREE.MeshStandardMaterial({color:'#e6c67b',roughness:1}));
    this.coast.rotation.x=-Math.PI/2;
    this.coast.position.set(-48,-11.7,-40);
    this.cloud = createCloud(0,3,-10,3.2);
    this.tracked = createTrackedMolecule(.9);
    this.tracked.position.set(0,2.8,-9);
    this.droplet = new THREE.Mesh(
      new THREE.SphereGeometry(1,24,18),
      new THREE.MeshPhysicalMaterial({color:'#75e5ef',transparent:true,opacity:.4,transmission:.35,roughness:.08})
    );
    this.droplet.position.copy(this.tracked.position);
    this.droplet.scale.setScalar(.1);
    this.windLines = new THREE.Group();
    for(let i=0;i<18;i++){
      const line = new THREE.Mesh(new THREE.BoxGeometry(THREE.MathUtils.randFloat(2,6),.025,.025),new THREE.MeshBasicMaterial({color:'#c8f7ff',transparent:true,opacity:.35}));
      line.position.set(THREE.MathUtils.randFloatSpread(45),THREE.MathUtils.randFloat(-2,9),THREE.MathUtils.randFloat(-20,5));
      this.windLines.add(line);
    }
    this.group.add(this.sky,this.land,this.coast,this.cloud,this.tracked,this.droplet,this.windLines);
    this.reset();
  }

  reset(){
    this.cloud.position.set(0,3,-10);
    this.cloud.scale.setScalar(3.2);
    this.tracked.position.set(0,2.8,-9);
    this.tracked.visible=true;
    this.droplet.position.copy(this.tracked.position);
    this.droplet.scale.setScalar(.1);
    this.droplet.visible=true;
  }

  update(time){
    this.cloud.rotation.y=Math.sin(time*.08)*.08;
    this.windLines.children.forEach((line,index)=>{
      line.position.x+=.035+.004*index;
      if(line.position.x>28) line.position.x=-28;
    });
    this.tracked.rotation.y=time*.7;
  }
}

export class RainWorld {
  constructor() {
    this.group = new THREE.Group();
    this.group.visible = false;
    this.sky = createSky();
    this.cloud = createCloud(0,10,-18,3.5);
    this.ground = new THREE.Mesh(
      new THREE.PlaneGeometry(120,100,28,20),
      new THREE.MeshStandardMaterial({color:'#70a85f',roughness:1,flatShading:true})
    );
    this.ground.rotation.x=-Math.PI/2;
    this.ground.position.set(0,-7,-30);
    this.rain = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(.025,.055,1.8,5),
      new THREE.MeshBasicMaterial({color:'#9cecff',transparent:true,opacity:.62}),
      420
    );
    this.rainData=[];
    for(let i=0;i<420;i++) this.rainData.push({x:THREE.MathUtils.randFloatSpread(48),y:THREE.MathUtils.randFloat(-8,18),z:THREE.MathUtils.randFloat(-40,2),speed:THREE.MathUtils.randFloat(10,20)});
    this.trackedDrop = new THREE.Mesh(
      new THREE.SphereGeometry(.8,20,14),
      new THREE.MeshPhysicalMaterial({color:'#65e5ef',transparent:true,opacity:.65,transmission:.25,roughness:.08})
    );
    this.trackedDrop.position.set(0,11,-10);
    this.tracked = createTrackedMolecule(.52);
    this.trackedDrop.add(this.tracked);
    this.tracked.position.set(0,0,.1);
    this.group.add(this.sky,this.cloud,this.ground,this.rain,this.trackedDrop);
    this.reset();
  }

  reset(){
    this.trackedDrop.position.set(0,11,-10);
    this.trackedDrop.scale.set(1,.9,1);
  }

  update(deltaTime,time){
    this.rainData.forEach((d,i)=>{
      d.y-=d.speed*deltaTime;
      if(d.y<-8){d.y=18;d.x=THREE.MathUtils.randFloatSpread(48);}
      tempPosition.set(d.x,d.y,d.z);
      tempMatrix.compose(tempPosition,tempQuaternion.identity(),tempScale);
      this.rain.setMatrixAt(i,tempMatrix);
    });
    this.rain.instanceMatrix.needsUpdate=true;
    this.trackedDrop.rotation.z=Math.sin(time*4)*.08;
  }
}

export class LandWorld {
  constructor() {
    this.group = new THREE.Group();
    this.group.visible=false;
    this.sky=createSky();
    this.ocean=createOcean(120);
    this.ocean.position.set(-55,-5,-25);
    this.terrain=new THREE.Mesh(
      new THREE.PlaneGeometry(150,100,50,30),
      new THREE.MeshStandardMaterial({color:'#72a963',roughness:1,flatShading:true})
    );
    this.terrain.rotation.x=-Math.PI/2;
    this.terrain.position.set(22,-4,-24);
    const p=this.terrain.geometry.attributes.position;
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),y=p.getY(i);
      p.setZ(i,Math.max(0,2.8+Math.sin(x*.045)*1.4+Math.cos(y*.07)*1.1+(x/80)*3));
    }
    p.needsUpdate=true;this.terrain.geometry.computeVertexNormals();

    this.stream=createStreamCurve([[34,2,-52],[28,1,-35],[20,.4,-18],[8,-.4,-3],[-8,-1,8]],.42,'#43bdd2');
    this.river=createStreamCurve([[-8,-1,8],[-20,-1.8,12],[-35,-2.8,8],[-52,-4,0]],1.15,'#249cb8');
    this.stream.visible=true;this.river.visible=true;

    this.soil = new THREE.Mesh(
      new THREE.BoxGeometry(32,12,16),
      new THREE.MeshStandardMaterial({color:'#79543c',roughness:1,transparent:true,opacity:.88})
    );
    this.soil.position.set(27,-9,-4);
    this.groundwater=createStreamCurve([[36,-9,-8],[31,-10,-4],[24,-9,-1],[17,-9,2]],.55,'#4fcfe3');
    this.groundwater.visible=false;

    this.plant=new THREE.Group();
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(.12,.18,4,8),new THREE.MeshStandardMaterial({color:'#4d9a4a'}));
    stem.position.y=2;
    const crown=new THREE.Mesh(new THREE.SphereGeometry(1.3,12,9),new THREE.MeshStandardMaterial({color:'#3c9750',flatShading:true}));
    crown.position.y=4.3;
    this.plant.add(stem,crown);
    this.plant.position.set(18,0,-2);
    this.roots=new THREE.Group();
    for(let i=0;i<7;i++){
      const root=new THREE.Mesh(new THREE.CylinderGeometry(.04,.08,4.5,5),new THREE.MeshStandardMaterial({color:'#9c724f'}));
      root.position.set(18,-2.1,-2);
      root.rotation.z=THREE.MathUtils.randFloat(-.7,.7);
      root.rotation.x=THREE.MathUtils.randFloat(-.5,.5);
      this.roots.add(root);
    }

    this.routeDots=new THREE.Group();
    for(let i=0;i<9;i++){
      const dot=new THREE.Mesh(new THREE.SphereGeometry(.22,10,8),new THREE.MeshBasicMaterial({color:'#7cecff'}));
      this.routeDots.add(dot);
    }
    this.trackedDrop=new THREE.Mesh(new THREE.SphereGeometry(.48,16,12),new THREE.MeshPhysicalMaterial({color:'#6ee7f2',transparent:true,opacity:.65,roughness:.08}));
    this.trackedDrop.position.copy(this.stream.userData.curve.getPointAt(0));

    this.island=createIsland();
    this.island.scale.setScalar(.55);
    this.island.position.set(-62,-4,-12);

    this.group.add(this.sky,this.ocean,this.terrain,this.stream,this.river,this.soil,this.groundwater,this.plant,this.roots,this.routeDots,this.trackedDrop,this.island);
    this.reset();
  }

  reset(){
    this.groundwater.visible=false;
    this.soil.visible=false;
    this.roots.visible=false;
    this.routeDots.visible=false;
    this.trackedDrop.visible=true;
    this.trackedDrop.position.copy(this.stream.userData.curve.getPointAt(0));
  }

  update(deltaTime,time){
    this.ocean.material.uniforms.uTime.value=time;
    const streamCurve=this.stream.userData.curve;
    const riverCurve=this.river.userData.curve;
    this.routeDots.children.forEach((dot,index)=>{
      const t=(time*.09+index/9)%1;
      const curve=index<4?streamCurve:riverCurve;
      dot.position.copy(curve.getPointAt(t));
    });
  }
}

function createArrowCurve(points,color){
  const curve=new THREE.CatmullRomCurve3(points.map((p)=>new THREE.Vector3(...p)));
  const tube=new THREE.Mesh(new THREE.TubeGeometry(curve,70,.08,8,false),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.75}));
  const dots=[];
  for(let i=0;i<5;i++){
    const dot=new THREE.Mesh(new THREE.SphereGeometry(.2,9,7),new THREE.MeshBasicMaterial({color}));
    dots.push(dot);tube.add(dot);
  }
  tube.userData={curve,dots,offset:Math.random()};
  return tube;
}

export class OverviewWorld {
  constructor(){
    this.group=new THREE.Group();this.group.visible=false;
    this.sky=createSky();this.ocean=createOcean(150);this.ocean.position.x=-38;
    this.island=createIsland();this.island.scale.setScalar(.55);this.island.position.set(-46,.2,-18);
    this.land=new THREE.Mesh(new THREE.PlaneGeometry(100,75,30,25),new THREE.MeshStandardMaterial({color:'#67a261',roughness:1,flatShading:true}));
    this.land.rotation.x=-Math.PI/2;this.land.position.set(25,.1,-18);
    this.cloud=createCloud(3,17,-25,2.8);
    this.river=createStreamCurve([[28,1,-35],[21,.6,-18],[10,.3,0],[-10,.1,9],[-33,0,5]],.85,'#2ba9c2');
    this.arrows=new THREE.Group();
    this.arrows.add(
      createArrowCurve([[-36,1,0],[-31,8,-5],[-20,15,-18],[-3,18,-25]],'#72edf7'),
      createArrowCurve([[4,17,-24],[13,15,-16],[24,9,-4],[26,2,5]],'#d8faff'),
      createArrowCurve([[25,1,5],[16,.5,1],[4,.2,6],[-27,.1,7]],'#48c2d8')
    );
    this.group.add(this.sky,this.ocean,this.island,this.land,this.cloud,this.river,this.arrows);
  }
  update(time){
    this.ocean.material.uniforms.uTime.value=time;
    this.cloud.position.x=3+Math.sin(time*.12)*2;
    this.arrows.children.forEach((tube)=>{
      const {curve,dots,offset}=tube.userData;
      dots.forEach((dot,index)=>{
        const t=(time*.08+index/dots.length+offset)%1;
        dot.position.copy(curve.getPointAt(t));tube.worldToLocal(dot.position);
      });
    });
  }
}

export class WorldManager {
  constructor(scene){
    this.scene=scene;
    this.island=new IslandWorld();
    this.molecular=new MolecularWorld();
    this.cloud=new CloudWorld();
    this.rain=new RainWorld();
    this.land=new LandWorld();
    this.overview=new OverviewWorld();
    this.worlds={island:this.island,molecular:this.molecular,cloud:this.cloud,rain:this.rain,land:this.land,overview:this.overview};
    Object.values(this.worlds).forEach((world)=>scene.add(world.group));
    this.active=null;
  }

  activate(name){
    Object.entries(this.worlds).forEach(([key,world])=>{world.group.visible=key===name;});
    this.active=this.worlds[name];
  }

  update(deltaTime,time){
    if(!this.active)return;
    if(this.active===this.molecular||this.active===this.rain||this.active===this.land) this.active.update(deltaTime,time);
    else this.active.update(time);
  }

  setQuality(level){
    const counts={low:70,medium:120,high:185};
    this.molecular.setActiveCount(counts[level]??counts.medium);
    const shadows=level==='high';
    Object.values(this.worlds).forEach((world)=>{
      world.group.traverse((object)=>{
        if(object.isMesh){object.castShadow=shadows;object.receiveShadow=shadows;}
      });
    });
  }
}

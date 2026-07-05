import * as THREE from 'three';
import { EventBus } from './EventBus.js';
import { NarrationManager } from './NarrationManager.js';
import { UIManager } from '../ui/UIManager.js';
import { CameraRig } from '../three/CameraRig.js';
import { WorldManager } from '../three/Worlds.js';
import { ChapterManager } from '../chapters/ChapterManager.js';

export class AppController {
  constructor() {
    this.canvas = document.getElementById('experience');
    this.eventBus = new EventBus();
    this.ui = new UIManager(this.eventBus);
    this.narration = new NarrationManager();
    this.clock = new THREE.Clock();
    this.elapsed = 0;
    this.started = false;
    this.quality = 'medium';
  }

  async init() {
    try {
      this.ui.setLoading(.18);
      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2('#0a3043', .005);
      this.camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, .05, 350);
      this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: 'high-performance' });
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.15;
      this.renderer.shadowMap.enabled = false;
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.ui.setLoading(.38);

      this.cameraRig = new CameraRig(this.camera, this.canvas);
      this.scene.add(this.cameraRig.root);
      this.addLights();
      this.worldManager = new WorldManager(this.scene);
      this.ui.setLoading(.74);
      this.chapterManager = new ChapterManager({
        worldManager: this.worldManager,
        cameraRig: this.cameraRig,
        ui: this.ui,
        narration: this.narration
      });
      this.bindEvents();
      this.applyQuality('medium');
      this.worldManager.activate('ocean');
      this.cameraRig.setPosition(0, 6, 18);
      this.cameraRig.setTarget(0, 2, -30);
      this.ui.setLoading(1);
      this.ui.hideLoading();
      this.animate();
    } catch (error) {
      console.error(error);
      this.ui.showError();
    }
  }

  addLights() {
    const hemisphere = new THREE.HemisphereLight('#c7f6ff', '#163445', 2.5);
    const sunLight = new THREE.DirectionalLight('#fff2cf', 3.4);
    sunLight.position.set(-24, 36, 16);
    const fill = new THREE.DirectionalLight('#52cce3', 1.1);
    fill.position.set(18, 8, 20);
    this.scene.add(hemisphere, sunLight, fill);
  }

  bindEvents() {
    this.eventBus.on('mission:start', () => {
      if (this.started) return;
      this.started = true;
      this.narration.unlock();
      this.ui.leaveStartScreen();
      this.chapterManager.start();
    });
    this.eventBus.on('chapter:next', () => {
      if (this.started) this.chapterManager.next();
    });
    this.eventBus.on('chapter:previous', () => {
      if (this.started) this.chapterManager.previous();
    });
    this.eventBus.on('playback:toggle', () => {
      if (this.started) this.chapterManager.togglePause();
    });
    this.eventBus.on('sound:changed', (enabled) => this.narration.setEnabled(enabled));
    this.eventBus.on('quality:changed', (level) => this.applyQuality(level));
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.started && !this.chapterManager.paused) this.chapterManager.togglePause();
    });
  }

  applyQuality(level) {
    this.quality = level;
    const pixelRatios = { low: 1, medium: 1.25, high: 1.75 };
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelRatios[level] ?? 1.25));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.worldManager.setQuality(level);
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
  }

  animate() {
    this.renderer.setAnimationLoop(() => {
      const deltaTime = Math.min(this.clock.getDelta(), .05);
      this.elapsed += deltaTime;
      this.cameraRig.update(deltaTime);
      this.worldManager.update(deltaTime, this.elapsed);
      this.chapterManager.update();
      this.renderer.render(this.scene, this.camera);
    });
  }
}

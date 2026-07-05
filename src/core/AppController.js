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
    this.contextLost = false;
  }

  async init() {
    try {
      this.ui.setLoading(.18);
      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2('#0a3043', .0042);
      this.camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, .05, 420);
      this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: 'high-performance' });
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.15;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.bindWebGLContextEvents();
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
        narration: this.narration,
        eventBus: this.eventBus
      });
      this.ui.setChapterList(this.chapterManager.chapters);
      this.ui.setLearningContent(this.chapterManager.chapters);
      this.bindEvents();
      this.applyQuality('medium');
      this.worldManager.activate('island');
      this.cameraRig.setPosition(24, 13, 32);
      this.cameraRig.setTarget(0, 1, -22);
      this.ui.setLoading(1);
      this.ui.hideLoading();
      this.animate();
    } catch (error) {
      console.error(error);
      this.ui.showRuntimeError({
        title: 'Die 3D-Darstellung konnte nicht gestartet werden.',
        text: 'Bitte öffne die Seite in einem aktuellen Browser oder nutze ein anderes Gerät.',
        reload: false
      });
    }
  }

  addLights() {
    this.hemisphereLight = new THREE.HemisphereLight('#c7f6ff', '#163445', 2.5);
    this.sunLight = new THREE.DirectionalLight('#fff2cf', 3.4);
    this.sunLight.position.set(-24, 36, 16);
    this.sunLight.shadow.mapSize.set(1024, 1024);
    this.sunLight.shadow.camera.near = 1;
    this.sunLight.shadow.camera.far = 190;
    this.sunLight.shadow.camera.left = -70;
    this.sunLight.shadow.camera.right = 70;
    this.sunLight.shadow.camera.top = 70;
    this.sunLight.shadow.camera.bottom = -70;
    this.fillLight = new THREE.DirectionalLight('#52cce3', 1.1);
    this.fillLight.position.set(18, 8, 20);
    this.scene.add(this.hemisphereLight, this.sunLight, this.fillLight);
  }

  bindWebGLContextEvents() {
    this.canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      this.contextLost = true;
      this.narration.stop();
      this.chapterManager?.pauseForSystemEvent();
      this.ui.showRuntimeError({
        title: 'Die 3D-Verbindung wurde unterbrochen.',
        text: 'Das kann auf schwächeren Geräten oder nach einem längeren Tab-Wechsel passieren. Lade die Seite neu, um die Mission fortzusetzen.',
        reload: true
      });
    });
    this.canvas.addEventListener('webglcontextrestored', () => {
      this.contextLost = false;
      this.ui.updateRuntimeError('Die Grafikverbindung ist wieder verfügbar. Ein Neuladen stellt alle Szenen sicher wieder her.');
    });
  }

  bindEvents() {
    this.eventBus.on('mission:start', async () => {
      if (this.started) return;
      this.started = true;
      this.ui.setStartPending(true);
      const speechStatus = await this.narration.unlock();
      this.ui.setSpeechStatus(speechStatus);
      this.ui.leaveStartScreen();
      this.chapterManager.start();
    });
    this.eventBus.on('chapter:next', () => { if (this.started) this.chapterManager.next(); });
    this.eventBus.on('chapter:previous', () => { if (this.started) this.chapterManager.previous(); });
    this.eventBus.on('chapter:select', (index) => { if (this.started) this.chapterManager.goTo(index); });
    this.eventBus.on('playback:toggle', () => { if (this.started) this.chapterManager.togglePause(); });
    this.eventBus.on('sound:changed', (enabled) => this.narration.setEnabled(enabled));
    this.eventBus.on('quality:changed', (level) => this.applyQuality(level));
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.started && !this.chapterManager.paused) this.chapterManager.pauseForSystemEvent();
    });
  }

  getMaxPixelRatio() {
    const pixelRatios = { low: 1, medium: 1.25, high: 1.75 };
    return pixelRatios[this.quality] ?? pixelRatios.medium;
  }

  updatePixelRatio() {
    if (!this.renderer) return;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.getMaxPixelRatio()));
  }

  applyQuality(level) {
    this.quality = level;
    this.updatePixelRatio();
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    const shadowsEnabled = level === 'high';
    this.renderer.shadowMap.enabled = shadowsEnabled;
    this.sunLight.castShadow = shadowsEnabled;
    this.worldManager.setQuality(level);
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.updatePixelRatio();
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
  }

  animate() {
    this.renderer.setAnimationLoop(() => {
      if (this.contextLost) return;
      const deltaTime = Math.min(this.clock.getDelta(), .05);
      this.elapsed += deltaTime;
      this.cameraRig.update(deltaTime);
      this.worldManager.update(deltaTime, this.elapsed);
      this.chapterManager.update();
      this.renderer.render(this.scene, this.camera);
    });
  }
}

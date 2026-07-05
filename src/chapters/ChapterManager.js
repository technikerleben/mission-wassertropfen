import { gsap } from 'gsap';
import { chapters } from './chapters.js';

export class ChapterManager {
  constructor({ worldManager, cameraRig, ui, narration, eventBus }) {
    this.worldManager = worldManager;
    this.cameraRig = cameraRig;
    this.ui = ui;
    this.narration = narration;
    this.eventBus = eventBus;
    this.chapters = chapters;
    this.index = 0;
    this.timeline = null;
    this.paused = false;
    this.currentCue = '';
    this.cueIndex = 0;
    this.resumeAfterOverlay = false;

    this.eventBus.on('overlay:opened', () => this.pauseForOverlay());
    this.eventBus.on('overlay:closed', () => this.resumeFromOverlay());
    this.eventBus.on('subtitles:changed', (enabled) => {
      if (enabled) this.ui.setSubtitle(this.currentCue);
    });
  }

  start() { this.goTo(0); }

  goTo(index) {
    const targetIndex = Math.max(0, Math.min(index, this.chapters.length - 1));
    this.stopCurrent();
    this.index = targetIndex;
    this.cueIndex = 0;
    this.currentCue = '';
    const chapter = this.chapters[this.index];
    this.worldManager.activate(chapter.world);
    this.resetWorld(chapter.world);
    this.ui.setChapter(chapter, this.index, this.chapters.length);
    this.ui.setTelemetry(chapter.telemetry);
    this.ui.setPaused(false);
    this.paused = false;
    this.cameraRig.resetLook();
    this.buildTimeline(chapter);
    this.narration.speak(chapter.narration);
    this.timeline.play(0);
  }

  resetWorld(name) {
    this.worldManager.worlds[name]?.reset?.();
  }

  stopCurrent() {
    this.timeline?.kill();
    this.timeline = null;
    this.narration.stop();
    this.ui.setSubtitle('');
    this.ui.hideKeyword();
    this.resumeAfterOverlay = false;
  }

  next() { if (this.index < this.chapters.length - 1) this.goTo(this.index + 1); }
  previous() { if (this.index > 0) this.goTo(this.index - 1); }

  togglePause() {
    if (!this.timeline || this.timeline.progress() >= 1) return;
    this.paused = !this.paused;
    if (this.paused) {
      this.timeline.pause();
      this.narration.pause();
    } else {
      this.timeline.resume();
      this.narration.resume();
    }
    this.ui.setPaused(this.paused);
  }

  pauseForSystemEvent() {
    if (!this.timeline || this.paused || this.timeline.progress() >= 1) return;
    this.paused = true;
    this.timeline.pause();
    this.narration.pause();
    this.ui.setPaused(true);
  }

  pauseForOverlay() {
    this.resumeAfterOverlay = Boolean(this.timeline && !this.paused && this.timeline.progress() < 1);
    if (this.resumeAfterOverlay) {
      this.paused = true;
      this.timeline.pause();
      this.narration.pause();
      this.ui.setPaused(true);
    }
  }

  resumeFromOverlay() {
    if (!this.resumeAfterOverlay || !this.timeline || this.timeline.progress() >= 1) {
      this.resumeAfterOverlay = false;
      return;
    }
    this.resumeAfterOverlay = false;
    this.paused = false;
    this.timeline.resume();
    this.narration.resume();
    this.ui.setPaused(false);
  }

  setView(position, target) {
    this.cameraRig.setPosition(...position);
    this.cameraRig.setTarget(...target);
  }

  buildTimeline(chapter) {
    const w = this.worldManager;
    const camera = this.cameraRig;
    this.timeline = gsap.timeline({ paused: true, onComplete: () => this.handleChapterComplete() });

    switch (chapter.id) {
      case 'island-arrival': {
        this.setView([24, 13, 32], [0, 1, -22]);
        w.island.explorer.visible = true;
        this.timeline
          .to(camera.root.position, { x: 10, y: 8, z: 15, duration: 12, ease: 'sine.inOut' }, 0)
          .to(camera.target, { x: -3, y: 1.5, z: -18, duration: 12, ease: 'sine.inOut' }, 0)
          .to(camera.root.position, { x: -1, y: 6, z: 5, duration: 12, ease: 'sine.inOut' }, 12)
          .to(camera.target, { x: -7, y: 3, z: -10, duration: 12, ease: 'sine.inOut' }, 12);
        break;
      }

      case 'boarding': {
        this.setView([6, 5.3, 5], [-7, 3.1, -10]);
        const hatch = w.island.explorer.userData.hatch;
        this.timeline
          .to(camera.root.position, { x: -1.5, y: 4.2, z: -2.5, duration: 7, ease: 'power1.inOut' }, 0)
          .to(camera.target, { x: -7, y: 3.2, z: -10, duration: 7, ease: 'power1.inOut' }, 0)
          .to(hatch.rotation, { x: -1.4, duration: 3, ease: 'power2.out' }, 5)
          .to(hatch.position, { y: 2.8, duration: 3, ease: 'power2.out' }, 5)
          .to(camera.root.position, { x: -6.2, y: 3.7, z: -8.3, duration: 8, ease: 'power2.inOut' }, 8)
          .to(camera.target, { x: -7.2, y: 3.2, z: -10.5, duration: 8, ease: 'power2.inOut' }, 8)
          .to(camera.root.position, { x: -7, y: 3.45, z: -9.5, duration: 5, ease: 'power2.in' }, 16)
          .to(camera.target, { x: 5, y: 1.2, z: -2, duration: 5, ease: 'power2.in' }, 16)
          .to(w.island.explorer.position, { x: -2, y: 5, z: -2, duration: 5, ease: 'sine.inOut' }, 21);
        break;
      }

      case 'shrinking': {
        this.setView([-2, 5, 2], [5, 1.2, -1]);
        w.island.explorer.position.set(-2, 5, 2);
        w.island.drop.visible = true;
        w.island.drop.scale.setScalar(.2);
        this.timeline
          .to(w.island.shrinkRings.children.map((ring) => ring.material), { opacity: .75, duration: 2, stagger: .12 }, 1)
          .to(w.island.shrinkRings.children.map((ring) => ring.scale), { x: 2.4, y: 2.4, z: 2.4, duration: 4, stagger: .12, repeat: 2 }, 2)
          .to(w.island.explorer.scale, { x: .08, y: .08, z: .08, duration: 12, ease: 'power2.inOut' }, 3)
          .to(w.island.drop.scale, { x: 4.8, y: 4.8, z: 4.8, duration: 12, ease: 'power2.inOut' }, 3)
          .to(camera.root.position, { x: 3.4, y: 1.6, z: 1.2, duration: 12, ease: 'power2.inOut' }, 3)
          .to(camera.target, { x: 5, y: 1.2, z: -1, duration: 12, ease: 'power2.inOut' }, 3)
          .to(camera.root.position, { x: 4.8, y: 1.2, z: -.2, duration: 8, ease: 'power3.in' }, 16)
          .to(w.island.drop.material, { opacity: .08, duration: 3 }, 22);
        break;
      }

      case 'inside-drop': {
        this.setView([0, .5, 10.5], [0, 0, 0]);
        w.molecular.group.scale.setScalar(.2);
        this.timeline
          .to(w.molecular.group.scale, { x: 1, y: 1, z: 1, duration: 4, ease: 'power3.out' }, 0)
          .to(camera.root.position, { x: 2.8, y: 1.3, z: 7.5, duration: 10, ease: 'sine.inOut' }, 4)
          .to(camera.target, { x: 0, y: .25, z: -1, duration: 10, ease: 'sine.inOut' }, 4)
          .to(camera.root.position, { x: -1.2, y: .6, z: 5, duration: 13, ease: 'sine.inOut' }, 15);
        break;
      }

      case 'evaporation': {
        this.setView([0, .4, 7.2], [0, 1.2, -1]);
        this.timeline
          .call(() => w.molecular.setHeating(true), [], 2)
          .to(w.molecular.surface.material, { opacity: .36, duration: 7, yoyo: true, repeat: 1 }, 3)
          .to(w.molecular.tracked.position, { y: 3.7, x: .6, duration: 15, ease: 'power1.in' }, 5)
          .to(w.molecular.tracked.position, { y: 7.2, x: 1.5, duration: 8, ease: 'power2.out' }, 20)
          .to(camera.root.position, { y: 6.2, x: .5, z: 7.5, duration: 9, ease: 'power1.inOut' }, 20)
          .to(camera.target, { y: 6.7, x: 1.4, z: -1, duration: 9, ease: 'power1.inOut' }, 20)
          .to(w.molecular.shell.material, { opacity: .02, duration: 6 }, 28)
          .call(() => w.molecular.setHeating(false), [], 36);
        break;
      }

      case 'cloud': {
        this.setView([0, 2, 13], [0, 3, -9]);
        w.cloud.cloud.scale.setScalar(.35);
        w.cloud.droplet.scale.setScalar(.05);
        this.timeline
          .to(w.cloud.tracked.position, { y: 4.5, duration: 7, ease: 'sine.inOut' }, 0)
          .to(w.cloud.cloud.scale, { x: 3.2, y: 3.2, z: 3.2, duration: 15, ease: 'power2.out' }, 5)
          .to(w.cloud.droplet.scale, { x: 1, y: 1, z: 1, duration: 8, ease: 'back.out(1.5)' }, 12)
          .to(w.cloud.tracked.position, { x: .1, y: 2.8, z: -9, duration: 8 }, 12)
          .to(camera.root.position, { x: 6, y: 5, z: 8, duration: 12, ease: 'sine.inOut' }, 18)
          .to(camera.target, { x: 0, y: 3, z: -10, duration: 12, ease: 'sine.inOut' }, 18);
        break;
      }

      case 'cloud-travel': {
        this.setView([-8, 7, 15], [0, 3, -10]);
        this.timeline
          .to(w.cloud.cloud.position, { x: 20, z: -35, duration: 30, ease: 'none' }, 0)
          .to(w.cloud.tracked.position, { x: 20, z: -34, duration: 30, ease: 'none' }, 0)
          .to(w.cloud.droplet.position, { x: 20, z: -34, duration: 30, ease: 'none' }, 0)
          .to(w.cloud.droplet.scale, { x: 1.7, y: 1.7, z: 1.7, duration: 28, ease: 'sine.in' }, 0)
          .to(camera.root.position, { x: 10, y: 8, z: 4, duration: 30, ease: 'none' }, 0)
          .to(camera.target, { x: 20, y: 3, z: -35, duration: 30, ease: 'none' }, 0);
        break;
      }

      case 'rain': {
        this.setView([0, 8, 16], [0, 3, -10]);
        this.timeline
          .to(w.rain.trackedDrop.position, { y: -5.6, z: -17, duration: 21, ease: 'power1.in' }, 3)
          .to(w.rain.trackedDrop.scale, { x: 1.15, y: 1.6, z: 1.15, duration: 8, yoyo: true, repeat: 1 }, 5)
          .to(camera.root.position, { y: -1.2, z: 6, duration: 22, ease: 'power1.in' }, 3)
          .to(camera.target, { y: -5.5, z: -17, duration: 22, ease: 'power1.in' }, 3)
          .to(w.rain.trackedDrop.position, { x: 5, y: -6.2, z: -23, duration: 7, ease: 'sine.out' }, 24);
        break;
      }

      case 'land-routes': {
        this.setView([42, 12, 24], [23, 0, -22]);
        w.land.soil.visible = false;
        w.land.groundwater.visible = false;
        w.land.roots.visible = false;
        w.land.routeDots.visible = true;
        const curve = w.land.stream.userData.curve;
        const follow = { t: 0 };
        this.timeline
          .to(follow, { t: 1, duration: 19, ease: 'none', onUpdate: () => w.land.trackedDrop.position.copy(curve.getPointAt(follow.t)) }, 0)
          .to(camera.root.position, { x: 18, y: 7, z: 12, duration: 19, ease: 'sine.inOut' }, 0)
          .to(camera.target, { x: 9, y: 0, z: -3, duration: 19, ease: 'sine.inOut' }, 0)
          .call(() => { w.land.soil.visible = true; w.land.groundwater.visible = true; w.land.roots.visible = true; }, [], 10)
          .to(w.land.soil.material, { opacity: .48, duration: 5 }, 10)
          .to(camera.root.position, { x: 31, y: -1, z: 14, duration: 9, ease: 'power2.inOut' }, 12)
          .to(camera.target, { x: 26, y: -8, z: -4, duration: 9, ease: 'power2.inOut' }, 12)
          .to(camera.root.position, { x: 5, y: 8, z: 14, duration: 12, ease: 'power2.inOut' }, 28)
          .to(camera.target, { x: -11, y: -1, z: 8, duration: 12, ease: 'power2.inOut' }, 28);
        break;
      }

      case 'river-sea': {
        this.setView([6, 9, 22], [-10, -1, 8]);
        w.land.routeDots.visible = true;
        const curve = w.land.river.userData.curve;
        const follow = { t: 0 };
        w.land.trackedDrop.position.copy(curve.getPointAt(0));
        this.timeline
          .to(follow, { t: 1, duration: 27, ease: 'none', onUpdate: () => w.land.trackedDrop.position.copy(curve.getPointAt(follow.t)) }, 0)
          .to(camera.root.position, { x: -38, y: 6, z: 18, duration: 27, ease: 'none' }, 0)
          .to(camera.target, { x: -55, y: -3, z: 0, duration: 27, ease: 'none' }, 0)
          .to(camera.root.position, { x: -45, y: 12, z: 30, duration: 7, ease: 'sine.out' }, 27)
          .to(camera.target, { x: -62, y: 0, z: -12, duration: 7, ease: 'sine.out' }, 27);
        break;
      }

      case 'overview': {
        this.setView([-2, 25, 39], [0, 3, -13]);
        this.timeline
          .fromTo(w.overview.group.scale, { x: .82, y: .82, z: .82 }, { x: 1, y: 1, z: 1, duration: 5, ease: 'power2.out' }, 0)
          .to(camera.root.position, { x: 22, y: 21, z: 28, duration: 16, ease: 'sine.inOut' }, 3)
          .to(camera.target, { x: 5, y: 3, z: -12, duration: 16, ease: 'sine.inOut' }, 3)
          .to(camera.root.position, { x: -22, y: 28, z: 32, duration: 16, ease: 'sine.inOut' }, 19)
          .to(camera.target, { x: -4, y: 1, z: -10, duration: 16, ease: 'sine.inOut' }, 19);
        break;
      }

      default:
        this.setView([0, 5, 15], [0, 0, -10]);
    }

    if (chapter.keyword) {
      this.timeline.call(() => this.ui.showKeyword(chapter.keyword), [], chapter.keyword.at);
      this.timeline.call(() => this.ui.hideKeyword(), [], Math.min(chapter.duration - 2, chapter.keyword.at + 9));
    }
    this.timeline.to({}, { duration: chapter.duration }, 0);
  }

  handleChapterComplete() {
    this.ui.setSubtitle('');
    if (this.index === this.chapters.length - 1) {
      window.setTimeout(() => this.ui.showCompletion(), 450);
    }
  }

  update() {
    if (!this.timeline) return;
    const chapter = this.chapters[this.index];
    const time = this.timeline.time();
    while (this.cueIndex < chapter.cues.length - 1 && time >= chapter.cues[this.cueIndex][1]) {
      this.cueIndex += 1;
    }
    const cue = chapter.cues[this.cueIndex];
    const text = cue && time >= cue[0] && time < cue[1] ? cue[2] : '';
    if (text !== this.currentCue) {
      this.currentCue = text;
      this.ui.setSubtitle(text);
    }
  }
}

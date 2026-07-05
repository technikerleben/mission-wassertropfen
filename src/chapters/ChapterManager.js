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

  start() {
    this.goTo(0);
  }

  goTo(index) {
    const targetIndex = Math.max(0, Math.min(index, this.chapters.length - 1));
    this.stopCurrent();
    this.index = targetIndex;
    this.cueIndex = 0;
    this.currentCue = '';
    const chapter = this.chapters[this.index];
    this.worldManager.activate(chapter.world);
    this.ui.setChapter(chapter, this.index, this.chapters.length);
    this.ui.setTelemetry(chapter.telemetry);
    this.ui.setPaused(false);
    this.paused = false;
    this.cameraRig.resetLook();
    this.buildTimeline(chapter);
    this.narration.speak(chapter.narration);
    this.timeline.play(0);
  }

  stopCurrent() {
    this.timeline?.kill();
    this.timeline = null;
    this.narration.stop();
    this.ui.setSubtitle('');
    this.ui.hideKeyword();
    this.resumeAfterOverlay = false;
  }

  next() {
    if (this.index < this.chapters.length - 1) this.goTo(this.index + 1);
  }

  previous() {
    if (this.index > 0) this.goTo(this.index - 1);
  }

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
    this.resumeAfterOverlay = Boolean(
      this.timeline && !this.paused && this.timeline.progress() < 1
    );
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

  buildTimeline(chapter) {
    const world = this.worldManager;
    this.timeline = gsap.timeline({
      paused: true,
      onComplete: () => this.handleChapterComplete()
    });

    if (chapter.id === 'departure') {
      this.cameraRig.setPosition(0, 5.8, 18);
      this.cameraRig.setTarget(0, 2.5, -28);
      this.timeline
        .to(this.cameraRig.root.position, { z: 3, y: 4.2, duration: 13, ease: 'power1.inOut' }, 0)
        .to(this.cameraRig.target, { x: -8, y: 1.5, z: -45, duration: 13, ease: 'power1.inOut' }, 0)
        .to(this.cameraRig.root.position, { x: -8, z: -8, duration: 12, ease: 'sine.inOut' }, 13)
        .to(this.cameraRig.target, { x: -20, y: 0, z: -55, duration: 12, ease: 'sine.inOut' }, 13);
    }

    if (chapter.id === 'inside-drop') {
      world.molecular.reset();
      this.cameraRig.setPosition(0, 0.5, 10.5);
      this.cameraRig.setTarget(0, 0, 0);
      this.timeline
        .fromTo(world.molecular.group.scale, { x: .25, y: .25, z: .25 }, { x: 1, y: 1, z: 1, duration: 4.5, ease: 'power3.out' }, 0)
        .fromTo(world.molecular.group.rotation, { y: -.8 }, { y: 0, duration: 6, ease: 'power2.out' }, 0)
        .to(this.cameraRig.root.position, { x: 2.8, y: 1.3, z: 7.5, duration: 10, ease: 'sine.inOut' }, 4)
        .to(this.cameraRig.target, { x: 0, y: .25, z: -1, duration: 8, ease: 'sine.inOut' }, 4)
        .to(this.cameraRig.root.position, { x: -1.1, y: .5, z: 5, duration: 12, ease: 'sine.inOut' }, 15)
        .to(this.cameraRig.target, { x: 0, y: .2, z: -1, duration: 12, ease: 'sine.inOut' }, 15);
    }

    if (chapter.id === 'evaporation') {
      world.molecular.reset();
      this.cameraRig.setPosition(0, .4, 7.2);
      this.cameraRig.setTarget(0, 1.2, -1);
      this.timeline
        .call(() => world.molecular.setHeating(true), [], 3)
        .to(world.molecular.surface.material, { opacity: .34, duration: 7, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 4)
        .to(this.cameraRig.root.position, { y: 2.1, z: 6.2, duration: 13, ease: 'sine.inOut' }, 4)
        .to(this.cameraRig.target, { y: 3.3, z: -1, duration: 13, ease: 'sine.inOut' }, 4)
        .to(world.molecular.tracked.position, { y: 3.75, x: .6, duration: 15, ease: 'power1.in' }, 5)
        .to(world.molecular.tracked.position, { y: 6.8, x: 1.4, duration: 7, ease: 'power2.out' }, 20)
        .to(this.cameraRig.root.position, { y: 6.1, x: .4, z: 7.7, duration: 8, ease: 'power1.inOut' }, 20)
        .to(this.cameraRig.target, { y: 6.6, x: 1.4, z: -1, duration: 8, ease: 'power1.inOut' }, 20)
        .to(world.molecular.shell.material, { opacity: .025, duration: 7 }, 27)
        .call(() => world.molecular.setHeating(false), [], 36);
    }

    if (chapter.id === 'overview') {
      this.cameraRig.setPosition(-2, 24, 35);
      this.cameraRig.setTarget(0, 3, -12);
      this.timeline
        .fromTo(world.overview.group.scale, { x: .82, y: .82, z: .82 }, { x: 1, y: 1, z: 1, duration: 5, ease: 'power2.out' }, 0)
        .to(this.cameraRig.root.position, { x: 18, y: 20, z: 26, duration: 18, ease: 'sine.inOut' }, 2)
        .to(this.cameraRig.target, { x: 6, y: 3, z: -12, duration: 18, ease: 'sine.inOut' }, 2)
        .to(this.cameraRig.root.position, { x: -18, y: 27, z: 29, duration: 20, ease: 'sine.inOut' }, 20)
        .to(this.cameraRig.target, { x: 0, y: 1, z: -10, duration: 20, ease: 'sine.inOut' }, 20);
    }

    if (chapter.keyword) {
      this.timeline.call(() => this.ui.showKeyword(chapter.keyword), [], chapter.keyword.at);
      this.timeline.call(
        () => this.ui.hideKeyword(),
        [],
        Math.min(chapter.duration - 2, chapter.keyword.at + 9)
      );
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

    while (
      this.cueIndex < chapter.cues.length - 1
      && time >= chapter.cues[this.cueIndex][1]
    ) {
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

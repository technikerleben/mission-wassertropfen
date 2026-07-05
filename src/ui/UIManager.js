const byId = (id) => document.getElementById(id);

export class UIManager {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.subtitlesEnabled = true;
    this.soundEnabled = true;
    this.isPaused = false;
    this.elements = {
      startScreen: byId('startScreen'),
      startButton: byId('startButton'),
      loadingScreen: byId('loadingScreen'),
      loadingBar: byId('loadingBar'),
      errorScreen: byId('errorScreen'),
      chapterCounter: byId('chapterCounter'),
      chapterCard: byId('chapterCard'),
      chapterEyebrow: byId('chapterEyebrow'),
      chapterTitle: byId('chapterTitle'),
      chapterIntro: byId('chapterIntro'),
      keyword: byId('keyword'),
      keywordTitle: byId('keywordTitle'),
      keywordText: byId('keywordText'),
      subtitle: byId('subtitle'),
      placeValue: byId('placeValue'),
      processValue: byId('processValue'),
      stateValue: byId('stateValue'),
      energyValue: byId('energyValue'),
      backButton: byId('backButton'),
      playButton: byId('playButton'),
      playIcon: byId('playIcon'),
      playLabel: byId('playLabel'),
      nextButton: byId('nextButton'),
      soundButton: byId('soundButton'),
      subtitleButton: byId('subtitleButton'),
      fullscreenButton: byId('fullscreenButton'),
      qualitySelect: byId('qualitySelect')
    };
    this.bindControls();
  }

  bindControls() {
    const e = this.elements;
    e.startButton.addEventListener('click', () => this.eventBus.emit('mission:start'));
    e.backButton.addEventListener('click', () => this.eventBus.emit('chapter:previous'));
    e.nextButton.addEventListener('click', () => this.eventBus.emit('chapter:next'));
    e.playButton.addEventListener('click', () => this.eventBus.emit('playback:toggle'));
    e.soundButton.addEventListener('click', () => {
      this.soundEnabled = !this.soundEnabled;
      e.soundButton.classList.toggle('is-off', !this.soundEnabled);
      e.soundButton.textContent = this.soundEnabled ? '♫' : '×';
      this.eventBus.emit('sound:changed', this.soundEnabled);
    });
    e.subtitleButton.addEventListener('click', () => {
      this.subtitlesEnabled = !this.subtitlesEnabled;
      e.subtitleButton.style.opacity = this.subtitlesEnabled ? '1' : '.45';
      if (!this.subtitlesEnabled) this.setSubtitle('');
      this.eventBus.emit('subtitles:changed', this.subtitlesEnabled);
    });
    e.fullscreenButton.addEventListener('click', async () => {
      try {
        if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
        else await document.exitFullscreen();
      } catch {
        // Fullscreen is optional and may be blocked by the browser.
      }
    });
    e.qualitySelect.addEventListener('change', (event) => {
      this.eventBus.emit('quality:changed', event.target.value);
    });

    window.addEventListener('keydown', (event) => {
      if (event.code === 'Space') {
        event.preventDefault();
        this.eventBus.emit('playback:toggle');
      } else if (event.code === 'ArrowRight') {
        this.eventBus.emit('chapter:next');
      } else if (event.code === 'ArrowLeft') {
        this.eventBus.emit('chapter:previous');
      } else if (event.key.toLowerCase() === 'f') {
        e.fullscreenButton.click();
      } else if (event.key.toLowerCase() === 'm') {
        e.soundButton.click();
      }
    });
  }

  setLoading(progress) {
    this.elements.loadingBar.style.width = `${Math.max(8, progress * 100)}%`;
  }

  hideLoading() {
    this.elements.loadingScreen.hidden = true;
  }

  leaveStartScreen() {
    this.elements.startScreen.classList.add('is-leaving');
    setTimeout(() => this.elements.startScreen.remove(), 850);
  }

  showError() {
    this.elements.errorScreen.hidden = false;
  }

  setChapter(chapter, index, total) {
    this.elements.chapterCounter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    this.elements.chapterEyebrow.textContent = `KAPITEL ${index + 1}`;
    this.elements.chapterTitle.textContent = chapter.title;
    this.elements.chapterIntro.textContent = chapter.intro;
    this.elements.chapterCard.classList.remove('is-hidden');
    setTimeout(() => this.elements.chapterCard.classList.add('is-hidden'), 5200);
    this.elements.backButton.disabled = index === 0;
    this.elements.nextButton.disabled = index === total - 1;
    this.hideKeyword();
  }

  setTelemetry({ place, process, state, energy }) {
    this.elements.placeValue.textContent = place;
    this.elements.processValue.textContent = process;
    this.elements.stateValue.textContent = state;
    this.elements.energyValue.textContent = energy;
  }

  showKeyword({ title, text }) {
    this.elements.keywordTitle.textContent = title;
    this.elements.keywordText.textContent = text;
    this.elements.keyword.hidden = false;
  }

  hideKeyword() {
    this.elements.keyword.hidden = true;
  }

  setSubtitle(text) {
    this.elements.subtitle.textContent = this.subtitlesEnabled ? text : '';
  }

  setPaused(paused) {
    this.isPaused = paused;
    this.elements.playIcon.textContent = paused ? '▶' : 'Ⅱ';
    this.elements.playLabel.textContent = paused ? 'Weiter' : 'Pause';
  }
}

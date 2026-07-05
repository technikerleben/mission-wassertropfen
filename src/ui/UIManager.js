import { glossary } from '../content/glossary.js';

const byId = (id) => document.getElementById(id);

export class UIManager {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.subtitlesEnabled = true;
    this.soundEnabled = true;
    this.isPaused = false;
    this.currentChapterIndex = 0;
    this.chapters = [];
    this.previouslyFocused = null;
    this.elements = {
      startScreen: byId('startScreen'),
      startButton: byId('startButton'),
      loadingScreen: byId('loadingScreen'),
      loadingBar: byId('loadingBar'),
      errorScreen: byId('errorScreen'),
      errorTitle: byId('errorTitle'),
      errorText: byId('errorText'),
      reloadButton: byId('reloadButton'),
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
      chaptersButton: byId('chaptersButton'),
      transcriptButton: byId('transcriptButton'),
      glossaryButton: byId('glossaryButton'),
      fullscreenButton: byId('fullscreenButton'),
      qualitySelect: byId('qualitySelect'),
      noticeBanner: byId('noticeBanner'),
      noticeText: byId('noticeText'),
      noticeCloseButton: byId('noticeCloseButton'),
      modalLayer: byId('modalLayer'),
      modalBackdrop: byId('modalBackdrop'),
      learningModal: byId('learningModal'),
      modalEyebrow: byId('modalEyebrow'),
      modalTitle: byId('modalTitle'),
      modalContent: byId('modalContent'),
      modalCloseButton: byId('modalCloseButton')
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
      e.subtitleButton.classList.toggle('is-off', !this.subtitlesEnabled);
      if (!this.subtitlesEnabled) this.setSubtitle('');
      this.eventBus.emit('subtitles:changed', this.subtitlesEnabled);
    });
    e.chaptersButton.addEventListener('click', () => this.showChapterMenu());
    e.transcriptButton.addEventListener('click', () => this.showTranscript());
    e.glossaryButton.addEventListener('click', () => this.showGlossary());
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
    e.noticeCloseButton.addEventListener('click', () => { e.noticeBanner.hidden = true; });
    e.modalCloseButton.addEventListener('click', () => this.closeModal());
    e.modalBackdrop.addEventListener('click', () => this.closeModal());
    e.reloadButton.addEventListener('click', () => window.location.reload());

    window.addEventListener('keydown', (event) => {
      if (!e.modalLayer.hidden) {
        if (event.key === 'Escape') this.closeModal();
        if (event.key === 'Tab') this.keepFocusInModal(event);
        return;
      }
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

  keepFocusInModal(event) {
    const focusable = [...this.elements.learningModal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )].filter((element) => !element.disabled && !element.hidden);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  setChapterList(chapters) {
    this.chapters = chapters;
  }

  setLearningContent(chapters) {
    this.chapters = chapters;
  }

  setLoading(progress) {
    this.elements.loadingBar.style.width = `${Math.max(8, progress * 100)}%`;
  }

  hideLoading() {
    this.elements.loadingScreen.hidden = true;
  }

  setStartPending(pending) {
    this.elements.startButton.disabled = pending;
    const label = this.elements.startButton.querySelector('span');
    const note = this.elements.startButton.querySelector('small');
    if (pending) {
      label.textContent = 'Mission wird gestartet';
      note.textContent = 'Sprach- und Grafiksysteme werden vorbereitet';
    }
  }

  leaveStartScreen() {
    this.elements.startScreen.classList.add('is-leaving');
    setTimeout(() => this.elements.startScreen.remove(), 850);
  }

  setSpeechStatus({ supported, hasGermanVoice }) {
    if (!supported) {
      this.showNotice('Auf diesem Gerät ist keine Sprachausgabe verfügbar. Die Untertitel bleiben vollständig nutzbar.');
    } else if (!hasGermanVoice) {
      this.showNotice('Es wurde keine deutsche Systemstimme gefunden. Der Browser verwendet möglicherweise eine Ersatzstimme; die Untertitel sind aktiv.');
    }
  }

  showNotice(text) {
    this.elements.noticeText.textContent = text;
    this.elements.noticeBanner.hidden = false;
  }

  showRuntimeError({ title, text, reload = true }) {
    this.elements.errorTitle.textContent = title;
    this.elements.errorText.textContent = text;
    this.elements.reloadButton.hidden = !reload;
    this.elements.errorScreen.hidden = false;
    if (reload) this.elements.reloadButton.focus();
    else {
      this.elements.errorScreen.tabIndex = -1;
      this.elements.errorScreen.focus();
    }
  }

  updateRuntimeError(text) {
    this.elements.errorText.textContent = text;
  }

  setChapter(chapter, index, total) {
    this.currentChapterIndex = index;
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

  openModal({ eyebrow, title, content }) {
    this.previouslyFocused = document.activeElement;
    this.elements.modalEyebrow.textContent = eyebrow;
    this.elements.modalTitle.textContent = title;
    this.elements.modalContent.replaceChildren(content);
    this.elements.modalLayer.hidden = false;
    document.body.classList.add('modal-open');
    this.eventBus.emit('overlay:opened');
    requestAnimationFrame(() => this.elements.learningModal.focus());
  }

  closeModal() {
    if (this.elements.modalLayer.hidden) return;
    this.elements.modalLayer.hidden = true;
    document.body.classList.remove('modal-open');
    this.eventBus.emit('overlay:closed');
    this.previouslyFocused?.focus?.();
  }

  createParagraph(text, className = '') {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    if (className) paragraph.className = className;
    return paragraph;
  }

  showChapterMenu() {
    const wrapper = document.createElement('div');
    wrapper.className = 'chapter-menu-grid';
    this.chapters.forEach((chapter, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'chapter-menu-card';
      if (index === this.currentChapterIndex) button.classList.add('is-current');
      const number = document.createElement('span');
      number.textContent = String(index + 1).padStart(2, '0');
      const title = document.createElement('strong');
      title.textContent = chapter.title;
      const intro = document.createElement('small');
      intro.textContent = chapter.intro;
      button.append(number, title, intro);
      button.addEventListener('click', () => {
        this.closeModal();
        this.eventBus.emit('chapter:select', index);
      });
      wrapper.append(button);
    });

    const learningActions = document.createElement('div');
    learningActions.className = 'chapter-menu-learning';
    const transcript = document.createElement('button');
    transcript.type = 'button';
    transcript.textContent = 'Gesamten Text lesen';
    transcript.addEventListener('click', () => this.showTranscript());
    const terms = document.createElement('button');
    terms.type = 'button';
    terms.textContent = 'Glossar öffnen';
    terms.addEventListener('click', () => this.showGlossary());
    learningActions.append(transcript, terms);
    wrapper.append(learningActions);

    this.openModal({ eyebrow: 'REISEPLAN', title: 'Kapitel auswählen', content: wrapper });
  }

  showTranscript() {
    const wrapper = document.createElement('div');
    wrapper.className = 'transcript-list';
    wrapper.append(this.createParagraph(
      'Hier kannst du alle Sprechertexte in Ruhe nachlesen. Die Texte bleiben auch ohne Ton vollständig verständlich.',
      'modal-lead'
    ));
    this.chapters.forEach((chapter, index) => {
      const section = document.createElement('section');
      section.className = 'transcript-section';
      if (index === this.currentChapterIndex) section.classList.add('is-current');
      const heading = document.createElement('h3');
      heading.textContent = `${index + 1}. ${chapter.title}`;
      section.append(heading, this.createParagraph(chapter.narration));
      wrapper.append(section);
    });
    this.openModal({ eyebrow: 'BARRIEREFREIER LESETEXT', title: 'Gesamter Sprechertext', content: wrapper });
  }

  showGlossary() {
    const wrapper = document.createElement('div');
    wrapper.className = 'glossary-grid';
    glossary.forEach(({ term, definition }) => {
      const article = document.createElement('article');
      const heading = document.createElement('h3');
      heading.textContent = term;
      article.append(heading, this.createParagraph(definition));
      wrapper.append(article);
    });
    this.openModal({ eyebrow: 'FACHBEGRIFFE', title: 'Glossar zum Wasserkreislauf', content: wrapper });
  }

  showCompletion() {
    const wrapper = document.createElement('div');
    wrapper.className = 'completion-content';
    wrapper.append(this.createParagraph(
      'Die geführte Mission ist abgeschlossen. Die Reise des Wassers geht trotzdem weiter.',
      'modal-lead'
    ));

    const recap = document.createElement('div');
    recap.className = 'recap-grid';
    [
      ['1', 'Sonne', 'Die Sonne liefert die Energie für den Wasserkreislauf.'],
      ['2', 'Verdunstung', 'Flüssiges Wasser wird zu unsichtbarem Wasserdampf.'],
      ['3', 'Wolken und Niederschlag', 'Wasser kondensiert und gelangt später zurück zur Erde.'],
      ['4', 'Kein Ende', 'Wasser wechselt Ort und Zustand, verschwindet aber nicht.']
    ].forEach(([number, title, text]) => {
      const card = document.createElement('article');
      const badge = document.createElement('span');
      badge.textContent = number;
      const heading = document.createElement('h3');
      heading.textContent = title;
      card.append(badge, heading, this.createParagraph(text));
      recap.append(card);
    });
    wrapper.append(recap);

    const actions = document.createElement('div');
    actions.className = 'modal-actions';
    [
      ['Kapitel auswählen', () => this.showChapterMenu()],
      ['Gesamten Text lesen', () => this.showTranscript()],
      ['Glossar öffnen', () => this.showGlossary()],
      ['Mission schließen', () => this.closeModal()]
    ].forEach(([label, action], index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.className = index === 0 ? 'modal-action modal-action--primary' : 'modal-action';
      button.addEventListener('click', action);
      actions.append(button);
    });
    wrapper.append(actions);
    this.openModal({ eyebrow: 'MISSION ABGESCHLOSSEN', title: 'Der Kreislauf geht weiter', content: wrapper });
  }
}

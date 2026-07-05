export class NarrationManager {
  constructor() {
    this.supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    this.enabled = true;
    this.currentText = '';
    this.isPaused = false;
    this.voices = [];
    this.selectedVoice = null;
    this.requestId = 0;
    this.handleVoicesChanged = () => {
      if (!this.supported) return;
      this.voices = speechSynthesis.getVoices();
      this.selectedVoice = this.findGermanVoice();
    };
    if (this.supported) {
      speechSynthesis.addEventListener('voiceschanged', this.handleVoicesChanged);
    }
    this.voicesReady = this.createVoicesReadyPromise();
  }

  createVoicesReadyPromise() {
    if (!this.supported) return Promise.resolve([]);

    const updateVoices = () => {
      this.voices = speechSynthesis.getVoices();
      this.selectedVoice = this.findGermanVoice();
      return this.voices;
    };

    const initialVoices = updateVoices();
    if (initialVoices.length > 0) return Promise.resolve(initialVoices);

    return new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
        resolve(updateVoices());
      };
      const onVoicesChanged = () => {
        if (speechSynthesis.getVoices().length > 0) finish();
      };

      speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
      window.setTimeout(finish, 1800);
    });
  }

  findGermanVoice() {
    return this.voices.find((voice) => voice.lang?.toLowerCase() === 'de-de')
      ?? this.voices.find((voice) => voice.lang?.toLowerCase().startsWith('de'))
      ?? null;
  }

  async unlock() {
    if (!this.supported) return this.getStatus();

    // iOS und manche Chromium-Versionen erwarten den ersten Aufruf direkt
    // innerhalb der Nutzerinteraktion. Ein leerer Satz schaltet die Engine frei.
    const utterance = new SpeechSynthesisUtterance('');
    speechSynthesis.speak(utterance);
    speechSynthesis.cancel();

    await this.voicesReady;
    this.selectedVoice = this.findGermanVoice();
    return this.getStatus();
  }

  async speak(text) {
    this.currentText = text;
    const requestId = ++this.requestId;

    if (!this.enabled || !this.supported) return false;

    await this.voicesReady;
    if (requestId !== this.requestId || !this.enabled) return false;

    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = 0.92;
    utterance.pitch = 1.02;
    utterance.volume = 0.92;
    if (this.selectedVoice) utterance.voice = this.selectedVoice;

    // Ein kurzer Frame Abstand verhindert, dass cancel() auf manchen Geräten
    // den unmittelbar folgenden speak()-Aufruf mit verschluckt.
    requestAnimationFrame(() => {
      if (requestId === this.requestId && this.enabled) speechSynthesis.speak(utterance);
    });

    this.isPaused = false;
    return true;
  }

  pause() {
    if (!this.enabled || !this.supported) return;
    speechSynthesis.pause();
    this.isPaused = true;
  }

  resume() {
    if (!this.enabled || !this.supported) return;
    speechSynthesis.resume();
    this.isPaused = false;
  }

  stop() {
    this.requestId += 1;
    if (this.supported) speechSynthesis.cancel();
    this.isPaused = false;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) this.stop();
    else if (this.currentText) this.speak(this.currentText);
  }

  getStatus() {
    return {
      supported: this.supported,
      hasGermanVoice: Boolean(this.selectedVoice),
      voiceCount: this.voices.length
    };
  }
}

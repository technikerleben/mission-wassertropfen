export class NarrationManager {
  constructor() {
    this.enabled = true;
    this.currentText = '';
    this.isPaused = false;
  }

  unlock() {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance('');
    speechSynthesis.speak(utterance);
    speechSynthesis.cancel();
  }

  speak(text) {
    this.currentText = text;
    if (!this.enabled || !('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = 0.92;
    utterance.pitch = 1.02;
    utterance.volume = 0.92;
    const voices = speechSynthesis.getVoices();
    const germanVoice = voices.find((voice) => voice.lang?.toLowerCase().startsWith('de'));
    if (germanVoice) utterance.voice = germanVoice;
    speechSynthesis.speak(utterance);
    this.isPaused = false;
  }

  pause() {
    if (!this.enabled || !('speechSynthesis' in window)) return;
    speechSynthesis.pause();
    this.isPaused = true;
  }

  resume() {
    if (!this.enabled || !('speechSynthesis' in window)) return;
    speechSynthesis.resume();
    this.isPaused = false;
  }

  stop() {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    this.isPaused = false;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) this.stop();
    else if (this.currentText) this.speak(this.currentText);
  }
}

// ============================================================
// Sound FX & Speech Synthesis Manager
// Web Audio API chimes + Browser SpeechSynthesis Voice Narration
// ============================================================

class SoundManager {
  constructor() {
    this.enabled = true;
    this.ctx = null;
    this.isSpeaking = false;
    this.currentUtterance = null;
  }

  _initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Pleasant click chime on step
  playClick() {
    if (!this.enabled) return;
    try {
      this._initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch (e) {}
  }

  // Toggle button chime
  playToggleChime(isOn) {
    if (!this.enabled && isOn !== true) return;
    try {
      this._initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const freq = isOn ? 659.25 : 329.63; // E5 or E4
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {}
  }

  // Record-breaking victory chord
  playRecord() {
    if (!this.enabled) return;
    try {
      this._initContext();
      if (!this.ctx) return;

      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C Major arpeggio
      freqs.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.value = freq;

        const startTime = this.ctx.currentTime + i * 0.07;
        gain.gain.setValueAtTime(0.05, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.35);
      });
    } catch (e) {}
  }

  // Built-in Browser Voice Text-to-Speech Narration
  speak(text, onEnd) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      if (!text) {
        this.isSpeaking = false;
        if (onEnd) onEnd();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      // Pick an English voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))) ||
                        voices.find(v => v.lang.startsWith('en'));
        if (enVoice) utterance.voice = enVoice;
      }

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      this.currentUtterance = utterance;
      this.isSpeaking = true;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (onEnd) onEnd();
    }
  }

  stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }
}

export const sounds = new SoundManager();

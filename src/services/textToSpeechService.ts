// Text-to-Speech Service for Autonomous Agent
// Provides voice feedback and content reading with multi-language support

import { speechHighlightService } from './speechHighlightService';

export type VoiceLanguage = 'en-US' | 'ig-NG' | 'ha-NG' | 'yo-NG';
export type VoiceGender = 'male' | 'female';

interface VoiceSettings {
  language: VoiceLanguage;
  gender: VoiceGender;
  rate: number;
  pitch: number;
  volume: number;
}

interface SpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
  translate?: boolean;
  enableHighlighting?: boolean;
  highlightContainer?: string;
}

interface QueuedSpeech {
  text: string;
  options: SpeakOptions;
}

// Nigerian language translations
const TRANSLATIONS: Record<VoiceLanguage, Record<string, string>> = {
  'en-US': {},
  'ig-NG': {
    'Autonomous learning agent activated': 'Onye nkuzi AI amalitela',
    'Course selected': 'Ahọpụtala ọmụmụ',
    'Topic completed': 'Emechala isiokwu',
    'Course completed': 'Emechala ọmụmụ',
    'All courses completed': 'Emechala ọmụmụ niile',
    'Excellent work': 'Ọrụ magburu onwe ya',
    'Well done': 'I mere nke ọma',
    'Outstanding achievement': 'Ihe ịga nke ọma pụrụ iche',
    'Moving to next topic': "Na-aga n'isiokwu ọzọ",
    'Starting next course': 'Na-amalite ọmụmụ ọzọ',
  },
  'ha-NG': {
    'Autonomous learning agent activated': 'An kunna mai koyar da AI',
    'Course selected': 'An zaɓi darasi',
    'Topic completed': 'An gama batun',
    'Course completed': 'An gama darasi',
    'All courses completed': 'An gama duk darussan',
    'Excellent work': 'Aiki mai kyau sosai',
    'Well done': 'Ka yi kyau',
    'Outstanding achievement': 'Babban nasara',
    'Moving to next topic': 'Zuwa batun na gaba',
    'Starting next course': 'Fara darasi na gaba',
  },
  'yo-NG': {
    'Autonomous learning agent activated': 'Olukọ AI ti bẹrẹ',
    'Course selected': 'A ti yan ẹkọ',
    'Topic completed': 'A ti pari koko-ọrọ',
    'Course completed': 'A ti pari ẹkọ',
    'All courses completed': 'A ti pari gbogbo ẹkọ',
    'Excellent work': 'Iṣẹ to dara pupọ',
    'Well done': 'O ṣe daradara',
    'Outstanding achievement': 'Aṣeyọri nla',
    'Moving to next topic': 'N lọ si koko-ọrọ tókàn',
    'Starting next course': 'Bẹrẹ ẹkọ tókàn',
  },
};

// How long after a user gesture speak() is considered "safe" by Chrome.
const GESTURE_WINDOW_MS = 5000;

class TextToSpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isEnabled: boolean = true;
  private settings: VoiceSettings = {
    language: 'en-US',
    gender: 'female',
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
  };
  private voicesLoaded: boolean = false;

  /**
   * Timestamp of the most recent user gesture.
   * Chrome only allows speak() within ~5 s of a click/keydown/touchstart.
   */
  private lastGestureTime: number = 0;

  /**
   * Speech queued while outside a gesture window (e.g. called from a useEffect
   * or a timer — common in the autonomous agent). Replayed automatically on the
   * next user interaction. Only the latest item is kept to avoid stale audio.
   */
  private pendingQueue: QueuedSpeech | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      this.registerGestureListeners();

      const saved = localStorage.getItem('voice-settings');
      if (saved) {
        try {
          this.settings = { ...this.settings, ...JSON.parse(saved) };
        } catch (e) {
          console.error('Failed to load voice settings', e);
        }
      }
    }
  }

  // ── Gesture tracking ───────────────────────────────────────────────────────

  private registerGestureListeners() {
    const onGesture = () => {
      this.lastGestureTime = Date.now();
      // If speech was queued while we lacked a gesture, play it now
      this.flushQueue();
    };
    window.addEventListener('click',      onGesture, { capture: true, passive: true });
    window.addEventListener('keydown',    onGesture, { capture: true, passive: true });
    window.addEventListener('touchstart', onGesture, { capture: true, passive: true });
  }

  private hasRecentGesture(): boolean {
    return Date.now() - this.lastGestureTime < GESTURE_WINDOW_MS;
  }

  private flushQueue() {
    if (!this.pendingQueue) return;
    const { text, options } = this.pendingQueue;
    this.pendingQueue = null;
    // Small defer so the gesture event finishes propagating before we speak
    setTimeout(() => this._doSpeak(text, options), 50);
  }

  // ── Voice helpers ──────────────────────────────────────────────────────────

  private loadVoices() {
    if (!this.synth) return;
    this.synth.getVoices();
    if (!this.voicesLoaded) {
      this.synth.onvoiceschanged = () => { this.voicesLoaded = true; };
    }
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synth?.getVoices() ?? [];
  }

  private findVoice(language: VoiceLanguage, gender: VoiceGender): SpeechSynthesisVoice | null {
    const voices = this.getAvailableVoices();
    // Nigerian languages fall back to English voices
    const langCode =
      language === 'ig-NG' || language === 'ha-NG' || language === 'yo-NG'
        ? 'en'
        : language.split('-')[0];

    return (
      voices.find((v) => v.lang.startsWith(langCode) && v.name.toLowerCase().includes(gender)) ||
      voices.find((v) => v.lang.startsWith(langCode)) ||
      voices.find((v) => v.default) ||
      voices[0] ||
      null
    );
  }

  // ── Settings ───────────────────────────────────────────────────────────────

  setLanguage(language: string) {
    const langMap: Record<string, VoiceLanguage> = {
      English: 'en-US',
      Igbo: 'ig-NG',
      Hausa: 'ha-NG',
      Yoruba: 'yo-NG',
    };
    this.setVoiceSettings({ language: langMap[language] || 'en-US' });
  }

  setVoiceSettings(settings: Partial<VoiceSettings>) {
    this.settings = { ...this.settings, ...settings };
    if (typeof window !== 'undefined') {
      localStorage.setItem('voice-settings', JSON.stringify(this.settings));
    }
  }

  getVoiceSettings(): VoiceSettings {
    return { ...this.settings };
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) this.stop();
  }

  // ── stop ───────────────────────────────────────────────────────────────────

  stop() {
    if (!this.synth && typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
    }
    this.synth?.cancel();
    this.currentUtterance = null;
    this.pendingQueue = null; // discard queued speech on explicit stop
    speechHighlightService.stopHighlighting();
  }

  // ── Translation ────────────────────────────────────────────────────────────

  private translateText(text: string, targetLang: VoiceLanguage): string {
    if (targetLang === 'en-US') return text;
    const translations = TRANSLATIONS[targetLang];
    if (!translations) return text;
    for (const [english, translated] of Object.entries(translations)) {
      if (text.toLowerCase().includes(english.toLowerCase())) {
        return text.replace(new RegExp(english, 'gi'), translated);
      }
    }
    return text;
  }

  calculateReadingTime(text: string, wordsPerMinute: number = 150): number {
    const words = text.trim().split(/\s+/).length;
    return Math.ceil((words / wordsPerMinute) * 60);
  }

  // ── _doSpeak (internal) ────────────────────────────────────────────────────
  /**
   * The raw synth call. Always deferred by one tick so Chrome has time to
   * process any preceding cancel() before we call speak().
   */
  private _doSpeak(text: string, options: SpeakOptions) {
    if (!this.synth && typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
    }
    if (!this.synth) return;

    let spokenText = text;
    if (options.translate && this.settings.language !== 'en-US') {
      spokenText = this.translateText(text, this.settings.language);
    }

    // Cancel whatever is playing, then speak after one tick
    this.synth.cancel();
    speechHighlightService.stopHighlighting();

    setTimeout(() => {
      if (!this.synth) return;

      const utterance = new SpeechSynthesisUtterance(spokenText);

      const voice = this.findVoice(this.settings.language, this.settings.gender);
      if (voice) utterance.voice = voice;

      utterance.lang   = this.settings.language === 'en-US' ? 'en-US' : 'en-NG';
      utterance.rate   = options.rate   ?? this.settings.rate;
      utterance.pitch  = options.pitch  ?? this.settings.pitch;
      utterance.volume = options.volume ?? this.settings.volume;

      utterance.onstart = () => {
        if (options.enableHighlighting) {
          try {
            const wpm = (options.rate ?? this.settings.rate) * 150;
            speechHighlightService.startHighlighting(
              text,
              options.highlightContainer || '.prose',
              { wordsPerMinute: wpm, highlightColor: 'bg-yellow-300', animationDuration: 300 }
            );
          } catch (err) {
            console.warn('Speech highlighting error (non-fatal):', err);
            // Continue speaking even if highlighting fails
          }
        }
        options.onStart?.();
      };

      utterance.onend = () => {
        try {
          speechHighlightService.stopHighlighting();
        } catch (err) {
          console.warn('Error stopping highlighting (non-fatal):', err);
        }
        this.currentUtterance = null;
        options.onEnd?.();
      };

      utterance.onerror = (event) => {
        try {
          speechHighlightService.stopHighlighting();
        } catch (err) {
          console.warn('Error stopping highlighting on error (non-fatal):', err);
        }
        this.currentUtterance = null;

        // Fired by our own stop() / cancel() — not a real error
        if (event.error === 'interrupted' || event.error === 'canceled') return;

        if (event.error === 'not-allowed') {
          // Still no valid gesture — re-queue; plays on next user interaction
          console.warn('TTS: speak() blocked (not-allowed) — queued for next interaction');
          this.pendingQueue = { text, options };
          return;
        }

        console.error('🚨 TTS error:', event.error);
        options.onError?.(String(event.error));
      };

      this.currentUtterance = utterance;
      try {
        this.synth.speak(utterance);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn('TTS: synth.speak() threw:', msg);
        options.onError?.(msg);
      }
    }, 0);
  }

  // ── speak (public) ─────────────────────────────────────────────────────────
  /**
   * Speaks text if called within a user-gesture window.
   * If called from an effect/timer (no recent gesture), the speech is queued
   * silently and replayed automatically on the next click/keydown/touchstart.
   *
   * This is the fix for the "not-allowed" errors coming from:
   *   useAutoPilot.useEffect → autonomousAgentService.stop() → announce()
   */
  speak(text: string, options: SpeakOptions = {}): boolean {
    if (!this.isEnabled) {
      options.onError?.('Speech synthesis disabled');
      return false;
    }
    if (!text?.trim()) return false;

    if (this.hasRecentGesture()) {
      this._doSpeak(text, options);
    } else {
      // Programmatic call with no gesture context (effects, timers, agent events)
      // Queue it — will auto-play on the next user interaction
      console.warn('TTS: no recent gesture — queuing speech for next interaction');
      this.pendingQueue = { text, options };
    }

    return true;
  }

  // ── announce ───────────────────────────────────────────────────────────────

  announce(text: string, onEnd?: () => void) {
    this.speak(text, {
      rate: this.settings.rate * 1.1,
      pitch: this.settings.pitch * 1.1,
      volume: 1.0,
      onEnd,
      translate: false,
    });
  }

  // ── readContent ────────────────────────────────────────────────────────────

  readContent(text: string, onEnd?: () => void, onError?: (error: any) => void): boolean {
    return this.speak(text, {
      rate: this.settings.rate * 0.9,
      pitch: this.settings.pitch,
      volume: 0.9,
      onEnd,
      onError,
      translate: false,
      enableHighlighting: false,
      highlightContainer: '.prose',
    });
  }

  // ── unlock ─────────────────────────────────────────────────────────────────
  /**
   * No-op. The old "silent utterance" trick consumed the user gesture token
   * and was the root cause of "not-allowed" errors. The gesture listener +
   * queue mechanism fully replaces it.
   */
  unlock() {
    // intentional no-op
  }

  // ── Utilities ──────────────────────────────────────────────────────────────

  isSpeaking(): boolean {
    return this.synth?.speaking ?? false;
  }

  async waitForSpeech(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth?.speaking) { resolve(); return; }
      const interval = setInterval(() => {
        if (!this.synth?.speaking) { clearInterval(interval); resolve(); }
      }, 100);
    });
  }
}

export const textToSpeechService = new TextToSpeechService();

"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { textToSpeechService } from '@/services/textToSpeechService';

interface ReadAloudProps {
  text: string;
  autoPlay?: boolean;
  onComplete?: () => void;
  className?: string;
}

const WORDS_PER_CHUNK = 150;

// ── Helpers ──────────────────────────────────────────────────────────────────

function toPlainText(input: string): string {
  if (!input?.trim()) return '';
  if (typeof document !== 'undefined') {
    const div = document.createElement('div');
    div.innerHTML = input;
    div.querySelectorAll('p,li,h1,h2,h3,h4,h5,h6,div,br,td,th,blockquote').forEach((el) => {
      el.appendChild(document.createTextNode(' '));
    });
    return (div.textContent || div.innerText || '').replace(/\s+/g, ' ').trim();
  }
  return input
    .replace(/<\/(p|li|h[1-6]|div|br|td|th|blockquote)>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ').trim();
}

function chunkText(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+["']?|[^.!?]+$/g) || [text];
  const chunks: string[] = [];
  let current = '';
  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence.trim()}` : sentence.trim();
    if (candidate.split(/\s+/).length > WORDS_PER_CHUNK && current) {
      chunks.push(current.trim());
      current = sentence.trim();
    } else {
      current = candidate;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(Boolean);
}

function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  return (
    voices.find((v) => v.lang === 'en-US' && v.localService) ||
    voices.find((v) => v.lang.startsWith('en') && v.localService) ||
    voices.find((v) => v.lang.startsWith('en')) ||
    voices[0] ||
    null
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

type ReadState = 'idle' | 'reading' | 'paused';

export const ReadAloud: React.FC<ReadAloudProps> = ({ text, autoPlay = false, onComplete, className = '' }) => {
  const [readState, setReadState] = useState<ReadState>('idle');
  const [chunkIndex, setChunkIndex] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const chunksRef = useRef<string[]>([]);
  const chunkIdxRef = useRef(0);
  const stoppedRef = useRef(false);
  const pausedRef = useRef(false);

  /**
   * voiceRef is populated EAGERLY on mount (not lazily on click).
   * This means handlePlay never needs to await anything — it stays
   * fully synchronous, keeping Chrome's gesture context intact.
   */
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const getSynth = (): SpeechSynthesis | null =>
    typeof window !== 'undefined' && 'speechSynthesis' in window
      ? window.speechSynthesis : null;

  // ── Eagerly load voices on mount ───────────────────────────────────────────
  useEffect(() => {
    const synth = getSynth();
    if (!synth) return;

    const load = () => {
      const voices = synth.getVoices();
      if (voices.length > 0) voiceRef.current = pickVoice(voices);
    };

    load(); // attempt immediately (works in Firefox and Safari)
    synth.addEventListener('voiceschanged', load); // fires in Chrome after a tick
    return () => {
      synth.removeEventListener('voiceschanged', load);
      synth.cancel();
    };
  }, []);

  // ── speakChunk ─────────────────────────────────────────────────────────────
  /**
   * Called synchronously from handlePlay (direct click) or from the previous
   * utterance's onend callback (still within Chrome's speaking context).
   * NO await, NO setTimeout — guaranteed synchronous call path.
   */
  const speakChunk = useCallback((index: number) => {
    const synth = getSynth();
    const chunk = chunksRef.current[index];
    if (!synth || !chunk) {
      setReadState('idle');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunk);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Only assign voice if we have one — never assign undefined/null
    if (voiceRef.current) utterance.voice = voiceRef.current;

    utterance.onstart = () => {
      console.log('ReadAloud: Chunk', index, 'started');
      chunkIdxRef.current = index;
      setReadState('reading');
      setChunkIndex(index);
      setError(null);
    };

    utterance.onend = () => {
      console.log('ReadAloud: onend called | index:', index, '| stoppedRef:', stoppedRef.current, '| pausedRef:', pausedRef.current);

      // SAFETY CHECK #1: If stopped, absolutely do NOT continue
      if (stoppedRef.current) {
        console.log('ReadAloud: STOPPED - onend ignoring and not continuing');
        return;
      }

      // SAFETY CHECK #2: If paused, do NOT continue
      if (pausedRef.current) {
        console.log('ReadAloud: PAUSED - onend ignoring and not continuing');
        return;
      }

      const next = index + 1;
      if (next < chunksRef.current.length) {
        console.log('ReadAloud: Playing next chunk', next);
        chunkIdxRef.current = next;
        speakChunk(next);
      } else {
        console.log('ReadAloud: All chunks completed');
        setReadState('idle');
        setChunkIndex(0);
        chunkIdxRef.current = 0;
        stoppedRef.current = false;
        pausedRef.current = false;
        onComplete?.();
      }
    };

    utterance.onerror = (e) => {
      console.log('ReadAloud: onerror called | error:', e.error, '| index:', index, '| stoppedRef:', stoppedRef.current, '| pausedRef:', pausedRef.current);

      // If we've been stopped, do NOT process this error at all
      if (stoppedRef.current) {
        console.log('ReadAloud: Stopped flag is true, ignoring error and not continuing');
        return;
      }

      if (e.error === 'interrupted' || e.error === 'canceled') {
        console.log('ReadAloud: Interrupted/canceled error');
        return;
      }

      console.error('ReadAloud error:', e.error, '| chunk index:', index);
      setError(
        e.error === 'not-allowed'
          ? 'Browser blocked speech — please click the button again.'
          : `Speech failed (${e.error}). Please try again.`
      );
      setReadState('idle');
    };

    console.log('ReadAloud: Speaking chunk', index, ':', chunk.substring(0, 50), '...');
    synth.speak(utterance);
  }, [onComplete]);

  // ── handlePlay ─────────────────────────────────────────────────────────────
  /**
   * FULLY SYNCHRONOUS — no await, no setTimeout, no Promises.
   * Called directly from onClick, so Chrome's gesture context is alive
   * for the entire execution of this function including speakChunk().
   */
  const handlePlay = useCallback(() => {
    const synth = getSynth();
    if (!synth) {
      setError('Speech synthesis is not supported in this browser.');
      return;
    }

    // Resume if currently paused (continue from where we paused)
    // Only check pausedRef — don't rely on synth.paused which can be unreliable
    if (pausedRef.current === true) {
      console.log('ReadAloud: Resuming from pause at chunk', chunkIdxRef.current);
      pausedRef.current = false;
      synth.resume();
      setReadState('reading');
      return;
    }

    // If stopped (stop was clicked), reset everything and start fresh
    if (stoppedRef.current === true) {
      console.log('ReadAloud: Starting new playback after stop');
      stoppedRef.current = false;
      pausedRef.current = false;
    } else {
      // Brand new play (never started before)
      console.log('ReadAloud: Starting new playback from idle');
    }

    setError(null);

    // Flush any stuck utterances
    synth.cancel();

    const plain = toPlainText(text);
    if (!plain) {
      setError('No readable content found.');
      return;
    }

    // If voices still haven't loaded (very rare edge case), try one more time
    if (!voiceRef.current) {
      const voices = synth.getVoices();
      if (voices.length > 0) voiceRef.current = pickVoice(voices);
      // If still empty, we'll speak without a specific voice — browser default
    }

    const chunks = chunkText(plain);
    chunksRef.current = chunks;
    chunkIdxRef.current = 0;
    setTotalChunks(chunks.length);
    setChunkIndex(0);

    // Synchronous — gesture context is still live here
    speakChunk(0);
  }, [text, speakChunk, onComplete]);

  // ── handlePause / handleStop ───────────────────────────────────────────────

  const handlePause = useCallback(() => {
    const synth = getSynth();
    if (!synth) return;
    console.log('ReadAloud: Pausing speech');
    pausedRef.current = true;
    synth.pause();
    setReadState('paused');
  }, []);

  const handleStop = useCallback(() => {
    const synth = getSynth();
    console.log('ReadAloud: handleStop called');

    // SET STOPPED FLAG FIRST - before any other operations
    stoppedRef.current = true;
    pausedRef.current = false;
    chunkIdxRef.current = 0;

    if (synth) {
      console.log('ReadAloud: Calling synth.cancel()');
      // Cancel ALL pending utterances
      synth.cancel();
      // Flush the queue by canceling again (safety measure)
      synth.cancel();
    }

    // Update UI state immediately
    setReadState('idle');
    setChunkIndex(0);
    setError(null);

    console.log('ReadAloud: Stop complete - stoppedRef is TRUE, all synthesis canceled');
  }, []);

  const progress = totalChunks > 1
    ? Math.round(((chunkIndex + 1) / totalChunks) * 100)
    : 0;

  // Auto-play when enabled (for autonomous mode)
  useEffect(() => {
    if (autoPlay && text && readState === 'idle') {
      console.log('ReadAloud: auto-playing in autonomous mode, text length:', text.length);
      // Unlock speech synthesis for autonomous mode (handles browser autoplay policies)
      textToSpeechService.unlock?.();
      // Use a small delay to ensure the component is fully mounted and speech synthesis is ready
      const timer = setTimeout(() => {
        handlePlay();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, text, readState, handlePlay]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="flex items-center gap-3">

        {readState === 'idle' && (
          <button onClick={handlePlay}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-black hover-lift transition-all shadow-xl flex items-center gap-3 outline-none group"
            aria-label="Read aloud">
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            <span>Play Audio</span>
          </button>
        )}

        {readState === 'reading' && (
          <button onClick={handlePause}
            className="px-8 py-4 bg-white text-slate-900 border-2 border-slate-900 rounded-2xl font-black hover-lift transition-all shadow-xl flex items-center gap-3 outline-none group"
            aria-label="Pause reading">
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Pause</span>
          </button>
        )}

        {readState === 'paused' && (
          <button onClick={handlePlay}
            className="px-8 py-4 bg-green-600 text-white rounded-2xl font-black hover-lift transition-all shadow-xl flex items-center gap-3 outline-none group"
            aria-label="Resume reading">
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Resume</span>
          </button>
        )}

        {readState !== 'idle' && (
          <button onClick={handleStop}
            className="p-4 bg-red-50 text-red-600 rounded-2xl border-2 border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-sm focus:outline-none"
            aria-label="Stop reading">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          </button>
        )}
      </div>

      {readState !== 'idle' && totalChunks > 1 && (
        <div className="flex items-center gap-4 px-2">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }} />
          </div>
          <span className="text-[10px] font-black text-slate-400 tabular-nums tracking-widest">{progress}%</span>
        </div>
      )}

      {error && (
        <div className="px-4 py-2 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-xs text-red-600 font-bold" role="alert">{error}</p>
        </div>
      )}
    </div>
  );
};

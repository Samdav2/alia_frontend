'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { grokAIService } from '@/services/grokAIService';
import { systemControlService } from '@/services/systemControlService';

// ─────────────────────────────────────────────────────────────────────────────
//  Fuzzy matching engine
// ─────────────────────────────────────────────────────────────────────────────

/** Levenshtein edit distance between two strings */
function editDistance(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
  return dp[m][n];
}

/** 0–1 similarity; 1 = identical */
function similarity(a: string, b: string): number {
  if (!a && !b) return 1;
  const len = Math.max(a.length, b.length);
  if (len === 0) return 1;
  return 1 - editDistance(a, b) / len;
}

/**
 * Score how well a transcript matches a set of keyword phrases.
 * Strategy: split transcript and keywords into words, compare each
 * keyword word against each transcript word, keep best similarity.
 * Final score = average of best-word scores across all keyword words.
 */
function fuzzyScore(transcript: string, keywords: string[]): number {
  const tWords = transcript.toLowerCase().split(/\s+/);

  let best = 0;
  for (const phrase of keywords) {
    const kWords = phrase.toLowerCase().split(/\s+/);
    // score for this phrase = average best-word similarity
    const phraseScore =
      kWords.reduce((sum, kw) => {
        const bestWord = tWords.reduce(
          (b, tw) => Math.max(b, similarity(kw, tw)),
          0
        );
        return sum + bestWord;
      }, 0) / kWords.length;
    if (phraseScore > best) best = phraseScore;
  }
  return best;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Command table  (defined outside hook — never stale)
// ─────────────────────────────────────────────────────────────────────────────
interface Cmd {
  keywords: string[];          // phrases to match against transcript
  label: string;               // spoken feedback
  id: string;                  // stable id
}

const COMMANDS: Cmd[] = [
  { id: 'home', keywords: ['go home', 'home', 'main page'], label: 'Navigating home' },
  { id: 'dashboard', keywords: ['dashboard', 'go to dashboard', 'my courses'], label: 'Opening dashboard' },
  { id: 'quiz', keywords: ['quiz', 'take quiz', 'assessment', 'test'], label: 'Opening quiz' },
  { id: 'scroll-down', keywords: ['scroll down', 'down', 'next section'], label: 'Scrolling down' },
  { id: 'scroll-up', keywords: ['scroll up', 'up', 'previous section'], label: 'Scrolling up' },
  { id: 'read', keywords: ['read page', 'read', 'read aloud', 'listen'], label: 'Reading page aloud' },
  { id: 'stop-read', keywords: ['stop reading', 'stop', 'quiet', 'silence'], label: 'Stopped reading' },
  { id: 'help', keywords: ['help', 'commands', 'what can you do'], label: 'Listing commands' },
];

const MATCH_THRESHOLD = 0.55; // min similarity score to accept a command

// ─────────────────────────────────────────────────────────────────────────────
//  Scroll helper — walks DOM to find the actual scrollable container
// ─────────────────────────────────────────────────────────────────────────────
function smartScroll(delta: number) {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  let el = document.elementFromPoint(cx, cy) as HTMLElement | null;
  while (el && el !== document.body) {
    const oy = window.getComputedStyle(el).overflowY;
    if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight) {
      el.scrollBy({ top: delta, behavior: 'smooth' });
      return;
    }
    el = el.parentElement;
  }
  window.scrollBy({ top: delta, behavior: 'smooth' });
}

export const useVoiceNavigation = (enabled: boolean = false) => {
  const router = useRouter();
  const routerRef = useRef(router);
  useEffect(() => { routerRef.current = router; }, [router]);

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  const recognitionRef = useRef<any>(null);
  const stoppedRef = useRef(false);
  const isRestartingRef = useRef(false);

  const isSpeakingRef = useRef(false);
  const ignoreUntilRef = useRef(0);

  const speak = (text: string) => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.onstart = () => {
      isSpeakingRef.current = true;
      console.log('[Voice] AI started speaking');
    };

    utterance.onend = () => {
      isSpeakingRef.current = false;
      // 1-second cool-off to avoid echoes/buffered results
      ignoreUntilRef.current = Date.now() + 1000;
      console.log('[Voice] AI finished speaking');
    };

    utterance.onerror = () => {
      isSpeakingRef.current = false;
      ignoreUntilRef.current = Date.now() + 500;
      console.log('[Voice] AI speech error');
    };

    window.speechSynthesis.speak(utterance);
  };

  const runCommand = (id: string, label: string) => {
    setLastCommand(label);
    speak(label);
    setTimeout(() => {
      switch (id) {
        case 'home': routerRef.current.push('/'); break;
        case 'dashboard': routerRef.current.push('/dashboard/student'); break;
        case 'quiz': routerRef.current.push('/dashboard/student/courses'); break;
        case 'scroll-down': smartScroll(320); break;
        case 'scroll-up': smartScroll(-320); break;
        case 'read': {
          // Filter out elements that shouldn't be read (Accessibility Menu, hidden items)
          const clones = document.body.cloneNode(true) as HTMLElement;
          const toRemove = clones.querySelectorAll('button, nav, .aria-hidden, script, style, [role="menu"]');
          toRemove.forEach(el => el.remove());

          const text = clones.innerText.replace(/\s+/g, ' ').trim().slice(0, 3000);
          speak(text);
          break;
        }
        case 'stop-read': window.speechSynthesis.cancel(); break;
        case 'help':
          speak(
            'I can navigate, scroll, and read the page. Say: go home, dashboard, quiz, scroll down, scroll up, read page, or stop reading.'
          );
          break;
      }
    }, 400);
  };

  const processFinal = async (text: string) => {
    if (isSpeakingRef.current || Date.now() < ignoreUntilRef.current) {
      console.log(`[Voice] Ignoring transcript while AI is speaking: "${text}"`);
      return;
    }

    const lower = text.toLowerCase().trim();
    if (!lower) return;

    // Score every command
    const scored = COMMANDS.map(cmd => ({
      cmd,
      score: fuzzyScore(lower, cmd.keywords),
    })).sort((a, b) => b.score - a.score);

    const best = scored[0];
    setConfidence(Math.round(best.score * 100));

    console.log(
      `[Voice] transcript="${lower}"  best="${best.cmd.id}" score=${best.score.toFixed(2)}`
    );

    if (best.score >= MATCH_THRESHOLD) {
      runCommand(best.cmd.id, best.cmd.label);
    } else {
      // ───────────────────────────────────────────────────────────────────────
      // AI Fallback for Natural Language Understanding
      // ───────────────────────────────────────────────────────────────────────
      console.log('[Voice] Low confidence match, sending to ALIA AI...');
      setIsProcessingAI(true);
      try {
        // Initialize system control context
        systemControlService.updateContext();

        // Map current state to Grok context
        const context = systemControlService.getUserContext();
        grokAIService.updateUserContext({
          currentCourse: context.currentCourse,
          completedTopics: context.completedTopics,
          performance: {
            averageScore: context.performance.averageScore,
            timeSpent: context.performance.totalTimeSpent,
            strugglingTopics: []
          }
        });

        // Generate response
        const aiResponse = await grokAIService.generateAgenticResponse(lower);

        setLastCommand(aiResponse.response.substring(0, 50) + '...');
        speak(aiResponse.response);

        // Execute actions if any
        if (aiResponse.actions && aiResponse.actions.length > 0) {
          const action = aiResponse.actions[0];
          console.log(`[Voice] AI executing action: ${action.type}`, action.data);

          // Small delay before action to let AI start speaking
          setTimeout(async () => {
            try {
              await systemControlService.executeRawAction({
                type: action.type,
                description: action.description,
                data: action.data
              });
            } catch (err) {
              console.error('[Voice] Action execution failed:', err);
            }
          }, 1500);
        }
      } catch (error) {
        console.error('[Voice] AI processing error:', error);
      } finally {
        setIsProcessingAI(false);
      }
    }
  };

  const startRecognition = () => {
    if (isRestartingRef.current) return;

    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) { console.warn('[Voice] Not supported'); return; }

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) { }
    }

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 3;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setIsListening(true);
      isRestartingRef.current = false;
    };

    rec.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        // Live preview from first alternative
        setTranscript(result[0].transcript);

        if (result.isFinal) {
          // Try all alternatives for best match
          for (let a = 0; a < result.length; a++) {
            processFinal(result[a].transcript);
          }
        }
      }
    };

    rec.onerror = (event: any) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      console.warn('[Voice] Error:', event.error);
      stoppedRef.current = true;
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
      if (!stoppedRef.current && recognitionRef.current === rec) {
        isRestartingRef.current = true;
        setTimeout(() => {
          if (!stoppedRef.current) startRecognition();
          else isRestartingRef.current = false;
        }, 250);
      }
    };

    recognitionRef.current = rec;
    stoppedRef.current = false;
    try { rec.start(); } catch (e) {
      console.error('[Voice] start() failed:', e);
      isRestartingRef.current = false;
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (enabled) {
      stoppedRef.current = false;
      startRecognition();
    } else {
      stoppedRef.current = true;
      isRestartingRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) { }
        recognitionRef.current = null;
      }
      setIsListening(false);
      setTranscript('');
      setLastCommand('');
      setConfidence(0);
    }

    return () => {
      stoppedRef.current = true;
      isRestartingRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) { }
        recognitionRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { isListening, transcript, lastCommand, confidence, isProcessingAI };
};

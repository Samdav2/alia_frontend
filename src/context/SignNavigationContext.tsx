'use client';

import React, {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
  useEffect,
  ReactNode
} from 'react';
import { useRouter } from 'next/navigation';
import SignInterpreter from '@/components/Accessibility/SignInterpreter';

/**
 * Global Sign Navigation Context Provider
 *
 * Works like WebGazer - once enabled, hand sign navigation is available
 * on EVERY page across the entire website. No per-page setup needed.
 *
 * Signs are detected continuously in the background and execute commands
 * when hand gestures match trained patterns.
 */

interface SignNavigationContextType {
  isEnabled: boolean;
  toggleSignNavigation: () => void;
  lastDetectedSign: string | null;
  commandsExecuted: number;
}

const SignNavigationContext = createContext<SignNavigationContextType | undefined>(undefined);

export const useGlobalSignNavigation = () => {
  const context = useContext(SignNavigationContext);
  if (!context) {
    throw new Error('useGlobalSignNavigation must be used within SignNavigationProvider');
  }
  return context;
};

export const SignNavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [isEnabled, setIsEnabled] = useState(false);
  const [lastDetectedSign, setLastDetectedSign] = useState<string | null>(null);
  const [commandsExecuted, setCommandsExecuted] = useState(0);

  const cooldownRef = useRef<boolean>(false);
  const commandCountRef = useRef<number>(0);

  // ── Execute Navigation Command ──
  const executeCommand = useCallback((sign: string) => {
    console.log(`\n🔷 ═══════════════════════════════════════════════════════════`);
    console.log(`🔷 EXECUTING COMMAND: ${sign}`);
    console.log(`🔷 ═══════════════════════════════════════════════════════════`);

    // 1. Check cooldown
    if (cooldownRef.current) {
      console.log(`⏳ ⚠️  Command IGNORED - In cooldown period`);
      return;
    }

    let actionTaken = false;

    switch (sign) {
      // ── NAVIGATION COMMANDS ──
      case 'SCROLL_DOWN':
        console.log('📖 Action: SCROLL DOWN 400px');
        window.scrollBy({ top: 400, behavior: 'smooth' });
        actionTaken = true;
        break;

      case 'SCROLL_UP':
        console.log('📖 Action: SCROLL UP 400px');
        window.scrollBy({ top: -400, behavior: 'smooth' });
        actionTaken = true;
        break;

      case 'GO_BACK':
        console.log('🔙 Action: GO BACK');
        router.back();
        actionTaken = true;
        break;

      case 'GO_HOME':
      case 'DASHBOARD':
        console.log('🏠 Action: GO TO DASHBOARD/STUDENT');
        router.push('/dashboard/student');
        actionTaken = true;
        break;

      // ── COURSE & VIDEO COMMANDS ──
      case 'ATTEND_CLASS':
        console.log('🎓 Action: ATTEND CLASS - Looking for primary action button');
        const primaryBtn = document.querySelector('[data-primary-action]') as HTMLButtonElement;
        if (primaryBtn) {
          console.log('✅ Found button! Clicking it...');
          primaryBtn.click();
          actionTaken = true;
        } else {
          console.warn('❌ No button found with [data-primary-action]');
          // Try alternate selectors
          const btnAlt = document.querySelector('button[type="submit"]') as HTMLButtonElement;
          if (btnAlt) {
            console.log('✅ Using alternate submit button');
            btnAlt.click();
            actionTaken = true;
          }
        }
        break;

      case 'PLAY_VIDEO':
        console.log('▶️  Action: PLAY ALL VIDEOS');
        const videos = document.querySelectorAll('video');
        if (videos.length > 0) {
          console.log(`Found ${videos.length} video(s). Playing...`);
          videos.forEach((video, idx) => {
            video.play().catch(err => console.error(`Video ${idx} play error:`, err));
          });
          actionTaken = true;
        } else {
          console.warn('❌ No videos found on page');
        }
        break;

      case 'STOP_VIDEO':
        console.log('⏸️  Action: PAUSE ALL VIDEOS');
        const videosStop = document.querySelectorAll('video');
        if (videosStop.length > 0) {
          console.log(`Found ${videosStop.length} video(s). Pausing...`);
          videosStop.forEach((video, idx) => {
            video.pause();
          });
          actionTaken = true;
        } else {
          console.warn('❌ No videos found on page');
        }
        break;

      // ── SYSTEM COMMANDS ──
      case 'ASK_FOR_HELP':
        console.log('🆘 Action: ASK FOR HELP - Looking for help input');
        const helpInput = document.querySelector('[data-help-input]') as HTMLInputElement;
        if (helpInput) {
          console.log('✅ Found help input! Focusing...');
          helpInput.focus();
          actionTaken = true;
        } else {
          console.warn('❌ No help input found with [data-help-input]');
        }
        break;

      case 'HELLO':
      case 'GREET':
        console.log('👋 Greeting - No action needed');
        // Greeting signs don't need to trigger navigation
        return;

      default:
        console.log(`ℹ️  Sign '${sign}' has no navigation action`);
        break;
    }

    // 2. Trigger Cooldown
    if (actionTaken) {
      console.log(`✅ ═══════════════════════════════════════════════════════════`);
      console.log(`✅ ACTION COMPLETED: ${sign}`);
      console.log(`✅ Starting 1.5s cooldown...`);
      console.log(`✅ ═══════════════════════════════════════════════════════════\n`);

      setLastDetectedSign(sign);
      commandCountRef.current++;
      setCommandsExecuted(commandCountRef.current);

      cooldownRef.current = true;
      setTimeout(() => {
        cooldownRef.current = false;
        console.log('✅ Cooldown expired - ready for next command');
      }, 1500);
    } else {
      console.log(`❌ ═══════════════════════════════════════════════════════════`);
      console.log(`❌ ACTION FAILED: ${sign} - No matching element found`);
      console.log(`❌ ═══════════════════════════════════════════════════════════\n`);
    }

  }, [router]);

  // ── Listen for sign detection from SignInterpreter ──
  useEffect(() => {
    if (!isEnabled) return;

    // Listen for custom event from SignInterpreter
    const handleSignDetected = (event: CustomEvent<{ sign: string }>) => {
      console.log(`🌍 Global sign detected: ${event.detail.sign}`);
      executeCommand(event.detail.sign);
    };

    window.addEventListener('sign-detected' as any, handleSignDetected);
    console.log('🌐 Global sign navigation enabled - listening for signs');

    return () => {
      window.removeEventListener('sign-detected' as any, handleSignDetected);
    };
  }, [isEnabled, executeCommand]);

  const toggleSignNavigation = useCallback(() => {
    setIsEnabled(prev => {
      const newState = !prev;
      if (newState) {
        console.log('✅ GLOBAL SIGN NAVIGATION ENABLED - Works on every page!');
      } else {
        console.log('❌ Global sign navigation disabled');
      }
      return newState;
    });
  }, []);

  return (
    <SignNavigationContext.Provider
      value={{
        isEnabled,
        toggleSignNavigation,
        lastDetectedSign,
        commandsExecuted
      }}
    >
      {/* GLOBAL SIGN INTERPRETER - Visible Preview in Top-Left Corner */}
      {isEnabled && (
        <div className="fixed top-4 left-4 w-80 z-50 bg-slate-900 rounded-xl border-2 border-green-500 shadow-2xl overflow-hidden">
          {/* Compact Sign Interpreter with visible camera feed */}
          <div className="p-2">
            <SignInterpreter onSignDetected={(sign) => {
              // Emit the event - let the context listener handle it
              const event = new CustomEvent('sign-detected', { detail: { sign } });
              window.dispatchEvent(event);
            }} />
          </div>
        </div>
      )}

      {children}
    </SignNavigationContext.Provider>
  );
};

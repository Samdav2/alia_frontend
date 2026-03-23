'use client';

import { useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Command Execution Engine with Cooldown (Debounce) Mechanism
 *
 * Translates detected sign commands into browser/Next.js actions
 * Prevents command spam by enforcing a 1.5s cooldown between actions
 *
 * Signs Supported:
 * - SCROLL_DOWN: Scroll down 400px
 * - SCROLL_UP: Scroll up 400px
 * - GO_BACK: Navigate to previous page
 * - GO_HOME / DASHBOARD: Navigate to dashboard
 * - ATTEND_CLASS: Click primary action button (via data-primary-action)
 * - PLAY_VIDEO / STOP_VIDEO: Toggle all videos on page
 * - ASK_FOR_HELP: Focus help input (via data-help-input)
 */
export const useSignNavigation = () => {
  const router = useRouter();
  const cooldownRef = useRef<boolean>(false);
  const lastCommandRef = useRef<string>('');
  const commandTimestampRef = useRef<number>(0);

  const executeCommand = useCallback((sign: string) => {
    // 1. Check if we are in a cooldown period
    if (cooldownRef.current) {
      console.log(`⏳ Command ignored (cooldown): ${sign}`);
      return;
    }

    let actionTaken = false;

    switch (sign) {
      // ── NAVIGATION COMMANDS ──
      case 'SCROLL_DOWN':
        console.log('📖 SCROLL_DOWN detected');
        window.scrollBy({ top: 400, behavior: 'smooth' });
        actionTaken = true;
        break;

      case 'SCROLL_UP':
        console.log('📖 SCROLL_UP detected');
        window.scrollBy({ top: -400, behavior: 'smooth' });
        actionTaken = true;
        break;

      case 'GO_BACK':
        console.log('🔙 GO_BACK detected');
        router.back();
        actionTaken = true;
        break;

      case 'GO_HOME':
      case 'DASHBOARD':
        console.log('🏠 DASHBOARD detected');
        router.push('/dashboard');
        actionTaken = true;
        break;

      // ── COURSE & VIDEO COMMANDS ──
      case 'ATTEND_CLASS':
        console.log('🎓 ATTEND_CLASS detected');
        // Example: Automatically click the primary "Join Class" or "Play" button
        const primaryBtn = document.querySelector('[data-primary-action]') as HTMLButtonElement;
        if (primaryBtn) {
          console.log('✅ Clicking primary action button');
          primaryBtn.click();
          actionTaken = true;
        } else {
          console.warn('⚠️ No primary action button found (data-primary-action)');
        }
        break;

      case 'STOP_VIDEO':
      case 'PLAY_VIDEO':
        console.log('🎬 VIDEO CONTROL detected');
        // Find all videos on the page and toggle play/pause
        const videos = document.querySelectorAll('video');
        if (videos.length > 0) {
          videos.forEach((video) => {
            if (video.paused) {
              console.log('▶️ Playing video');
              video.play().catch(err => console.error('Play error:', err));
            } else {
              console.log('⏸️ Pausing video');
              video.pause();
            }
          });
          actionTaken = true;
        } else {
          console.warn('⚠️ No videos found on page');
        }
        break;

      // ── SYSTEM COMMANDS ──
      case 'ASK_FOR_HELP':
        console.log('🆘 ASK_FOR_HELP detected');
        // Example: Focus on a search bar or open a chat modal
        const helpInput = document.querySelector('[data-help-input]') as HTMLInputElement;
        if (helpInput) {
          console.log('✅ Focusing help input');
          helpInput.focus();
          actionTaken = true;
        } else {
          console.warn('⚠️ No help input found (data-help-input)');
          // Fallback for testing
          console.log('📞 Opening Support Hub (fallback)');
          // You could emit an event here or show a modal
          actionTaken = true;
        }
        break;

      case 'HELLO':
      case 'GREET':
        console.log('👋 HELLO detected - no action needed');
        // Greeting signs don't need to trigger navigation
        // But we don't want them to trigger cooldown
        return;

      default:
        // Not a navigation command, do nothing
        console.log(`ℹ️ Sign '${sign}' has no navigation action`);
        break;
    }

    // 2. Trigger Cooldown to prevent spamming commands
    if (actionTaken) {
      console.log(`⏱️ Cooldown activated for 1.5s (last: ${sign})`);
      lastCommandRef.current = sign;
      commandTimestampRef.current = Date.now();

      cooldownRef.current = true;
      // Lock the engine for 1.5 seconds after a command is executed
      setTimeout(() => {
        cooldownRef.current = false;
        console.log('✅ Cooldown expired - ready for next command');
      }, 1500);
    }

  }, [router]);

  return { executeCommand };
};

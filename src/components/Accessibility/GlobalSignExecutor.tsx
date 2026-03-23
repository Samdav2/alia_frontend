'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export const GlobalSignExecutor: React.FC = () => {
    const router = useRouter();
    const cooldownRef = useRef<boolean>(false);
    const [activeCommand, setActiveCommand] = useState<string | null>(null);

    useEffect(() => {
        const handleSignCommand = (event: Event) => {
            const customEvent = event as CustomEvent<{ sign: string }>;
            const sign = customEvent.detail.sign;

            // Ignore if currently in cooldown to prevent spamming!
            if (cooldownRef.current) return;

            let executed = false;
            setActiveCommand(sign);

            switch (sign) {
                case 'SCROLL_DOWN':
                    window.scrollBy({ top: 500, behavior: 'smooth' });
                    executed = true;
                    break;

                case 'SCROLL_UP':
                    window.scrollBy({ top: -500, behavior: 'smooth' });
                    executed = true;
                    break;

                case 'GO_BACK':
                    router.back();
                    executed = true;
                    break;

                case 'DASHBOARD':
                    router.push('/dashboard/student'); // Updated to student path
                    executed = true;
                    break;

                case 'ATTEND_CLASS':
                    // Clicks the most important button on the screen
                    const primaryBtn = document.querySelector('button') || document.querySelector('[data-primary]');
                    if (primaryBtn) {
                        primaryBtn.click();
                        executed = true;
                    }
                    break;

                case 'STOP_VIDEO':
                    const videos = document.querySelectorAll('video');
                    videos.forEach((vid) => {
                        if (!vid.paused) {
                            vid.pause();
                            executed = true;
                        }
                    });
                    break;

                case 'ASK_FOR_HELP':
                    alert('Opening Help Chatbot...'); // Replace with your chatbot trigger
                    executed = true;
                    break;
            }

            // If a command actually triggered, lock the engine for 1.5 seconds
            if (executed) {
                cooldownRef.current = true;

                setTimeout(() => {
                    cooldownRef.current = false;
                    setActiveCommand(null);
                }, 1500);
            } else {
                // If not executed, clear it immediately
                setActiveCommand(null);
            }
        };

        window.addEventListener('sign-detected', handleSignCommand);

        return () => {
            window.removeEventListener('sign-detected', handleSignCommand);
        };
    }, [router]);

    // Optional: Visual feedback popup so the user knows the command worked
    if (!activeCommand) return null;

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-blue-600 text-white px-6 py-3 rounded-full font-black tracking-widest uppercase shadow-2xl animate-bounce">
            ⚡ Command Executed: {activeCommand}
        </div>
    );
};

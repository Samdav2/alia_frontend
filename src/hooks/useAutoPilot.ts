'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import { autonomousAgentService } from '@/services/autonomousAgentService';

export const useAutoPilot = () => {
    const { isAutoPilotActive, setAutoPilotActive } = useUserPreferences();
    const router = useRouter();
    const pathname = usePathname();
    const [status, setStatus] = useState<string>('');
    const [progress, setProgress] = useState(0);
    const [coursesCompleted, setCoursesCompleted] = useState<string[]>([]);
    const processingRef = useRef(false);

    useEffect(() => {
        // Subscribe to agent state changes
        const unsubscribe = autonomousAgentService.subscribe((state) => {
            setStatus(state.status);
            setProgress(state.progress);
            setCoursesCompleted(state.coursesCompleted);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (!isAutoPilotActive) {
            autonomousAgentService.stop();
            setStatus('');
            setProgress(0);
            processingRef.current = false;
            return;
        }

        const runAutonomousFlow = async () => {
            // Prevent multiple simultaneous executions
            if (processingRef.current) return;
            processingRef.current = true;

            try {
                // Dashboard: Start autonomous mode
                if (pathname === '/dashboard/student') {
                    const result = await autonomousAgentService.start();
                    
                    if (result.completed) {
                        setAutoPilotActive?.(false);
                        processingRef.current = false;
                        return;
                    }

                    if (result.nextRoute) {
                        await new Promise(r => setTimeout(r, 1000));
                        router.push(result.nextRoute);
                    }
                }

                // Learning Room: Process current topic
                else if (pathname.startsWith('/courses/')) {
                    const courseMatch = pathname.match(/\/courses\/(\d+)/);
                    const topicMatch = pathname.match(/\/topics\/(\d+)/);
                    
                    if (courseMatch && topicMatch) {
                        const courseId = courseMatch[1];
                        const topicId = topicMatch[1];

                        const result = await autonomousAgentService.processTopic(courseId, topicId);
                        
                        if (result.completed) {
                            setAutoPilotActive?.(false);
                            await new Promise(r => setTimeout(r, 2000));
                            router.push('/dashboard/student');
                        } else if (result.nextRoute) {
                            await new Promise(r => setTimeout(r, 1500));
                            router.push(result.nextRoute);
                        }
                    }
                }
            } finally {
                processingRef.current = false;
            }
        };

        runAutonomousFlow();

    }, [isAutoPilotActive, pathname, router, setAutoPilotActive]);

    return { 
        status, 
        progress,
        coursesCompleted,
        resetProgress: () => autonomousAgentService.resetProgress(),
    };
};

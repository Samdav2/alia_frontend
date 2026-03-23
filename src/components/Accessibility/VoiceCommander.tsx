"use client";

import React, { useEffect, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { Mic, MicOff, Volume2, X } from "lucide-react";
import { useUserPreferences } from "@/context/UserPreferencesContext";
import { motion, AnimatePresence } from "framer-motion";

const VoiceCommander: React.FC = () => {
    const { isVoiceNavActive, toggleVoiceNavActive } = useUserPreferences();
    const [lastCommand, setLastCommand] = useState<string>("");

    const commands = [
        {
            command: ["scroll down", "go down"],
            callback: () => {
                window.scrollBy({ top: 500, behavior: "smooth" });
                setLastCommand("Scrolling down");
            },
        },
        {
            command: ["scroll up", "go up"],
            callback: () => {
                window.scrollBy({ top: -500, behavior: "smooth" });
                setLastCommand("Scrolling up");
            },
        },
        {
            command: ["take quiz", "start assessment"],
            callback: () => {
                // Mock navigation for now
                setLastCommand("Opening Quiz...");
                setTimeout(() => alert("Navigating to Quiz..."), 500);
            },
        },
        {
            command: "stop listening",
            callback: () => {
                toggleVoiceNavActive?.();
                setLastCommand("Voice navigation deactivated");
            },
        },
    ];

    const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition({
        commands,
    });

    useEffect(() => {
        if (isVoiceNavActive && !listening) {
            SpeechRecognition.startListening({ continuous: true });
        } else if (!isVoiceNavActive && listening) {
            SpeechRecognition.stopListening();
        }
    }, [isVoiceNavActive, listening]);

    if (!browserSupportsSpeechRecognition) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            <AnimatePresence>
                {lastCommand && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm"
                    >
                        {lastCommand}
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={toggleVoiceNavActive}
                className={`p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center ${isVoiceNavActive ? "bg-red-500 text-white animate-pulse" : "bg-white text-gray-800 hover:bg-gray-100"
                    }`}
                aria-label={isVoiceNavActive ? "Stop voice navigation" : "Start voice navigation"}
            >
                {isVoiceNavActive ? <Mic size={24} /> : <MicOff size={24} />}
            </button>

            {isVoiceNavActive && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-4 rounded-2xl shadow-xl w-64 border border-gray-100"
                >
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider">Voice Controls</h3>
                        <Volume2 size={14} className="text-blue-500" />
                    </div>
                    <p className="text-sm text-gray-600 mb-3 italic">"{transcript || "Listening..."}"</p>
                    <div className="space-y-1">
                        <CommandLabel label="Scroll down" />
                        <CommandLabel label="Scroll up" />
                        <CommandLabel label="Take Quiz" />
                        <CommandLabel label="Stop listening" />
                    </div>
                </motion.div>
            )}
        </div>
    );
};

const CommandLabel = ({ label }: { label: string }) => (
    <div className="text-[10px] bg-gray-50 rounded px-2 py-1 text-gray-500 font-mono">
        {label}
    </div>
);

export default VoiceCommander;

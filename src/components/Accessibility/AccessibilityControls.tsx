"use client";

import React from "react";
import { useUserPreferences } from "@/context/UserPreferencesContext";
import { Type, Contrast, Mic, Eye, Settings2 } from "lucide-react";
import { motion } from "framer-motion";

const AccessibilityControls: React.FC = () => {
    const {
        isDyslexicMode,
        isHighContrast,
        isVoiceNavActive,
        isGazeScrollActive,
        toggleDyslexicMode,
        toggleHighContrast,
        toggleVoiceNavActive,
        toggleGazeScrollActive,
    } = useUserPreferences();

    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="fixed top-6 right-6 z-50 flex flex-col items-end gap-3">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-3 rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                aria-label="Toggle accessibility menu"
            >
                <Settings2 className={`w-6 h-6 text-gray-700 transition-transform duration-500 ${isOpen ? "rotate-90" : ""}`} />
            </button>

            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex flex-col gap-2 min-w-[200px]"
                >
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Accessibility</h3>

                    <ToggleItem
                        icon={<Type className="w-4 h-4" />}
                        label="Dyslexia Mode"
                        active={isDyslexicMode ?? false}
                        onClick={() => toggleDyslexicMode?.()}
                    />
                    <ToggleItem
                        icon={<Contrast className="w-4 h-4" />}
                        label="High Contrast"
                        active={isHighContrast ?? false}
                        onClick={() => toggleHighContrast?.()}
                    />
                    <ToggleItem
                        icon={<Mic className="w-4 h-4" />}
                        label="Voice Navigation"
                        active={isVoiceNavActive ?? false}
                        onClick={() => toggleVoiceNavActive?.()}
                    />
                    <ToggleItem
                        icon={<Eye className="w-4 h-4" />}
                        label="Gaze Scrolling"
                        active={isGazeScrollActive ?? false}
                        onClick={() => toggleGazeScrollActive?.()}
                    />
                </motion.div>
            )}
        </div>
    );
};

interface ToggleItemProps {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
}

const ToggleItem: React.FC<ToggleItemProps> = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-all ${active ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50 text-gray-600"
            }`}
    >
        <div className="flex items-center gap-3">
            {icon}
            <span className="text-sm font-medium">{label}</span>
        </div>
        <div className={`w-8 h-4 rounded-full relative transition-colors ${active ? "bg-blue-500" : "bg-gray-200"}`}>
            <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${active ? "left-5" : "left-1"}`} />
        </div>
    </button>
);

export default AccessibilityControls;

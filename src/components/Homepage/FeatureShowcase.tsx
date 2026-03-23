'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Eye,
    Mic,
    Zap,
    Type,
    Bell,
    UserCheck,
    Volume2,
    Languages,
    Sparkles,
    ArrowRight
} from 'lucide-react';

interface Feature {
    title: string;
    description: string;
    icon: React.ReactNode;
    category: string;
    bgClass: string;
    textClass: string;
    ringClass: string;
    badgeBgClass: string;
    badgeTextClass: string;
    gradientClass: string;
}

const FEATURES: Feature[] = [
    {
        title: "AI Sign Interpreter",
        description: "Real-time hand tracking and sign language detection using advanced neural vision engines.",
        icon: <Languages className="w-8 h-8" />,
        category: "Vision",
        bgClass: "bg-blue-50",
        textClass: "text-blue-600",
        ringClass: "ring-blue-50/50",
        badgeBgClass: "bg-blue-50",
        badgeTextClass: "text-blue-700",
        gradientClass: "from-blue-500/5"
    },
    {
        title: "Gaze Tracking",
        description: "Navigate and scroll through course materials using only your eye movements for hands-free control.",
        icon: <Eye className="w-8 h-8" />,
        category: "Navigation",
        bgClass: "bg-indigo-50",
        textClass: "text-indigo-600",
        ringClass: "ring-indigo-50/50",
        badgeBgClass: "bg-indigo-50",
        badgeTextClass: "text-indigo-700",
        gradientClass: "from-indigo-500/5"
    },
    {
        title: "Voice Commander",
        description: "Speak naturally to command the platform, from navigation to submitting adaptive assessments.",
        icon: <Mic className="w-8 h-8" />,
        category: "Voice",
        bgClass: "bg-purple-50",
        textClass: "text-purple-600",
        ringClass: "ring-purple-50/50",
        badgeBgClass: "bg-purple-50",
        badgeTextClass: "text-purple-700",
        gradientClass: "from-purple-500/5"
    },
    {
        title: "Bionic Reading",
        description: "Guided focus technology that highlights key parts of words to improve reading speed and comprehension.",
        icon: <Zap className="w-8 h-8" />,
        category: "Cognitive",
        bgClass: "bg-amber-50",
        textClass: "text-amber-600",
        ringClass: "ring-amber-50/50",
        badgeBgClass: "bg-amber-50",
        badgeTextClass: "text-amber-700",
        gradientClass: "from-amber-500/5"
    },
    {
        title: "Dyslexia Mode",
        description: "Specialized typography and layout adjustments designed specificially for students with dyslexia.",
        icon: <Type className="w-8 h-8" />,
        category: "Accessibility",
        bgClass: "bg-rose-50",
        textClass: "text-rose-600",
        ringClass: "ring-rose-50/50",
        badgeBgClass: "bg-rose-50",
        badgeTextClass: "text-rose-700",
        gradientClass: "from-rose-500/5"
    },
    {
        title: "Sign Avatar",
        description: "A digital representative that provides visual sign language feedback for all platform interactions.",
        icon: <UserCheck className="w-8 h-8" />,
        category: "Visual",
        bgClass: "bg-emerald-50",
        textClass: "text-emerald-600",
        ringClass: "ring-emerald-50/50",
        badgeBgClass: "bg-emerald-50",
        badgeTextClass: "text-emerald-700",
        gradientClass: "from-emerald-500/5"
    },
    {
        title: "Smart Read-Aloud",
        description: "Intent-aware text-to-speech with contextual highlighting that syncs perfectly with your pace.",
        icon: <Volume2 className="w-8 h-8" />,
        category: "Audio",
        bgClass: "bg-cyan-50",
        textClass: "text-cyan-600",
        ringClass: "ring-cyan-50/50",
        badgeBgClass: "bg-cyan-50",
        badgeTextClass: "text-cyan-700",
        gradientClass: "from-cyan-500/5"
    },
    {
        title: "Visual Notifications",
        description: "High-visibility visual cues and haptic-ready alerts for all critical system and learning events.",
        icon: <Bell className="w-8 h-8" />,
        category: "System",
        bgClass: "bg-slate-50",
        textClass: "text-slate-600",
        ringClass: "ring-slate-50/50",
        badgeBgClass: "bg-slate-50",
        badgeTextClass: "text-slate-700",
        gradientClass: "from-slate-500/5"
    }
];

export const FeatureShowcase: React.FC = () => {
    return (
        <section id="features-suite" className="py-24 sm:py-32 bg-slate-50 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-400/5 rounded-full blur-[120px] -mr-96 -mt-96" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-400/5 rounded-full blur-[120px] -ml-48 -mb-48" />

            <div className="max-w-7xl mx-auto px-4 relative">
                <div className="text-center mb-16 md:mb-24">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 glass-card rounded-full mb-6 md:mb-8 border-blue-100/50"
                    >
                        <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                        <span className="text-xs md:text-sm font-black bg-blue-600 bg-clip-text text-transparent uppercase tracking-[0.2em]">Limitless Inclusion</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 mb-6 md:mb-8 tracking-tight"
                    >
                        The <span className="alia-gradient-text">Feature</span> Suite
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-2xl text-slate-600 max-w-2xl mx-auto font-medium px-4 md:px-0"
                    >
                        ALIA isn't just an LMS. It's an entire ecosystem of adaptive tools designed to break every barrier in education.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {FEATURES.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ y: -8 }}
                            className="group relative h-full bg-white/70 backdrop-blur-xl rounded-[32px] md:rounded-[40px] p-6 md:p-8 border border-white hover:border-blue-200 transition-all duration-500 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] hover:bg-white"
                        >
                            <div className="relative z-10 space-y-5 md:space-y-6">
                                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-[20px] md:rounded-[24px] ${feature.bgClass} flex items-center justify-center ${feature.textClass} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ring-4 ${feature.ringClass}`}>
                                    {feature.icon}
                                </div>

                                <div className="space-y-3 md:space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${feature.badgeBgClass} ${feature.badgeTextClass}`}>
                                            {feature.category}
                                        </span>
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>

                                <div className="pt-2 md:pt-4 flex items-center gap-2 text-sm font-black text-blue-600 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                    Explore Tool <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>

                            {/* Decorative background element for the card */}
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${feature.gradientClass} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                        </motion.div>
                    ))}
                </div>

                {/* Visual Accent */}
                <div className="mt-20 md:mt-32 flex flex-col items-center">
                    <div className="h-px w-full max-w-4xl bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-8 md:mb-12" />
                    <p className="text-[10px] md:text-sm font-black text-slate-400 uppercase tracking-[0.5em] text-center">
                        Built for humans. Powered by ALIA.
                    </p>
                </div>
            </div>
        </section>
    );
};

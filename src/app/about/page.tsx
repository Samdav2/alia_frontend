'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Homepage/Navigation';
import { Footer } from '@/components/Homepage/Footer';
import { Mail, Github, Linkedin, GraduationCap, MapPin, Code, Cpu, Accessibility } from 'lucide-react';

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-slate-50" data-alia-version="ALIA-V1">
            <Navigation />

            {/* Hero Section for About */}
            <section className="pt-32 pb-24 px-4 relative overflow-hidden">
                {/* Background Accents */}
                <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-blue-50 to-transparent -z-10" />
                <div className="absolute top-20 right-0 w-96 h-96 bg-purple-200/30 rounded-full blur-[120px] -z-10" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-200/30 rounded-full blur-[120px] -z-10" />

                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="space-y-8"
                        >
                            <div className="inline-flex items-center gap-3 px-5 py-2.5 glass-card rounded-full border-blue-100">
                                <GraduationCap className="w-5 h-5 text-blue-600" />
                                <span className="text-sm font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Final Year Project 2026
                                </span>
                            </div>

                            <h1 className="text-5xl sm:text-7xl font-black text-slate-900 leading-tight">
                                About <br />
                                <span className="alia-gradient-text">ALIA Project</span>
                            </h1>

                            <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-xl">
                                ALIA (Adaptive Learning & Inclusive Agent) is a multi-agent AI ecosystem designed to revolutionize how we perceive accessibility in digital education.
                            </p>

                            <div className="p-8 glass-card rounded-[32px] border-white/80 shadow-2xl space-y-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-2xl bg-slate-900 flex items-center justify-center text-3xl shadow-xl overflow-hidden ring-4 ring-white">
                                        <img
                                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Samuel"
                                            alt="Dawodu Samuel Iyanu"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900">Dawodu Samuel Iyanu</h2>
                                        <p className="text-blue-600 font-bold">220194044</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-slate-600 font-medium">
                                        <MapPin className="w-5 h-5 text-slate-400" />
                                        <span>Educational Technology, Lagos State University (LASU)</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600 font-medium">
                                        <Mail className="w-5 h-5 text-slate-400" />
                                        <span>samuel.dawodu@student.lasu.edu.ng</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="glass-card p-10 rounded-[40px] border-white/80 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] relative z-10 space-y-8">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Project Mission</h3>

                                <div className="space-y-6">
                                    <div className="flex gap-5">
                                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <Cpu className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-slate-900">Adaptive Intelligence</h4>
                                            <p className="text-slate-600 font-medium">Harnessing AI to create content that evolves with the learner's pace and comprehension.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-5">
                                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                                            <Accessibility className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-slate-900">Inclusive Accessibility</h4>
                                            <p className="text-slate-600 font-medium">Implementing state-of-the-art eye-tracking and gesture controls for motor-impaired users.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-5">
                                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                                            <Code className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-slate-900">Modern Architecture</h4>
                                            <p className="text-slate-600 font-medium">Built with Next.js, FastAPI, and Multi-Agent Orchestration for scalable education.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-100 flex gap-4">
                                    <button className="p-4 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
                                        <Github className="w-6 h-6 text-slate-700" />
                                    </button>
                                    <button className="p-4 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
                                        <Linkedin className="w-6 h-6 text-slate-700" />
                                    </button>
                                    <button className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-black hover-lift shadow-lg">
                                        View Project Docs
                                    </button>
                                </div>
                            </div>

                            {/* Decorative behind card */}
                            <div className="absolute top-10 right-10 -bottom-10 -left-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-[48px] -z-10 opacity-10 blur-2xl" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Detailed Project Info Section */}
            <section className="py-24 px-4 bg-white/50 backdrop-blur-sm border-t border-slate-100">
                <div className="max-w-4xl mx-auto space-y-16">
                    <div className="text-center space-y-6">
                        <h2 className="text-4xl font-black text-slate-900">What are we solving?</h2>
                        <p className="text-xl text-slate-600 font-medium leading-relaxed">
                            Standard Learning Management Systems (LMS) are often designed for the "average" user, leaving behind those with visual, auditory, or cognitive differences.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black text-slate-900">The Problem</h3>
                            <p className="text-slate-600 font-medium leading-relaxed">
                                Physical barriers like inability to use a mouse, or cognitive barriers like dyslexia, often make digital learning an exhausting task. Existing solutions are usually fragmented "plug-ins" rather than integrated experiences.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black text-slate-900">The Solution: ALIA</h3>
                            <p className="text-slate-600 font-medium leading-relaxed">
                                ALIA integrates accessibility into the core engine. Using multi-agent synergy, the platform "learns how you learn" and presents information in the format you need—be it sign language, simplified text, or voice commands.
                            </p>
                        </div>
                    </div>

                    <div className="p-12 bg-blue-600 rounded-[40px] text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                        <div className="relative z-10 text-center space-y-8">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto text-4xl">
                                🎓
                            </div>
                            <h3 className="text-3xl font-black">Educational Technology, LASU</h3>
                            <p className="text-xl text-blue-50 font-medium">
                                This project represents the culmination of 4 years of research into instructional design and human-computer interaction at LASU's EDU Tech department.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}

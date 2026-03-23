'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Target, Zap, Globe, Users, Heart } from 'lucide-react';

const IMPORTANCE_ITEMS = [
    {
        icon: <Users className="w-8 h-8 text-blue-500" />,
        title: "Inclusive by Design",
        description: "Traditional LMS platforms often overlook students with diverse needs. ALIA ensures every learner, regardless of physical or cognitive ability, has an equal seat at the table."
    },
    {
        icon: <Target className="w-8 h-8 text-purple-500" />,
        title: "Closing the Gap",
        description: "By adapting content in real-time, we eliminate the friction between complex materials and student comprehension, fostering a more effective educational landscape."
    },
    {
        icon: <ShieldCheck className="w-8 h-8 text-green-500" />,
        title: "Empowering Educators",
        description: "ALIA doesn't replace teachers; it gives them super-powers. Automated summarization and analytics allow educators to focus on what matters: mentoring students."
    },
    {
        icon: <Globe className="w-8 h-8 text-orange-500" />,
        title: "Universal Access",
        description: "From sign language interpretation to gaze-based navigation, we are breaking down the physical barriers that prevent billions from accessing quality education."
    },
    {
        icon: <Zap className="w-8 h-8 text-yellow-500" />,
        title: "Real-time Adaptation",
        description: "Learning isn't static. Our multi-agent system monitors engagement and difficulty, adjusting the journey dynamically to prevent burnout and maximize retention."
    },
    {
        icon: <Heart className="w-8 h-8 text-red-500" />,
        title: "Student Well-being",
        description: "By reducing the frustration of inaccessible content, we support the mental health and confidence of students who have traditionally felt left behind by technology."
    }
];

export const ImportanceSection: React.FC = () => {
    return (
        <section id="importance" className="relative py-24 sm:py-32 overflow-hidden bg-slate-50">
            {/* Background Mesh Gradients */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-200 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-purple-200 rounded-full blur-[120px]" />
                <div className="absolute -bottom-[10%] left-[20%] w-[35%] h-[35%] bg-green-100 rounded-full blur-[120px]" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full mb-6 border-blue-100"
                    >
                        <span className="text-sm font-black bg-blue-600 bg-clip-text text-transparent uppercase tracking-widest">Why ALIA Matters</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl sm:text-6xl font-black text-slate-900 mb-8 tracking-tight"
                    >
                        Bridging the <span className="alia-gradient-text">Accessibility Gap</span> in Education
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed"
                    >
                        Education is a human right, but for many, it remains out of reach due to technological and physical barriers. ALIA is more than a platform—it's a commitment to inclusive excellence.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {IMPORTANCE_ITEMS.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="glass-card p-10 rounded-[32px] border-white/60 hover:border-blue-500/30 transition-all shadow-2xl shadow-slate-200 group"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center mb-8 border border-slate-100 group-hover:rotate-6 transition-transform">
                                {item.icon}
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight group-hover:text-blue-600 transition-colors">
                                {item.title}
                            </h3>
                            <p className="text-slate-600 font-medium leading-relaxed">
                                {item.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Call to Action Inside Importance */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mt-24 p-12 lg:p-20 rounded-[48px] bg-slate-900 overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -mr-48 -mt-48" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] -ml-48 -mb-48" />

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-center lg:text-left">
                        <div>
                            <h3 className="text-3xl sm:text-5xl font-black text-white mb-6">
                                Ready to transform your <span className="text-blue-400">learning experience</span>?
                            </h3>
                            <p className="text-xl text-slate-400 font-medium">
                                Join thousands of students and educators who are redefining what's possible in inclusive education.
                            </p>
                        </div>
                        <div className="flex justify-center lg:justify-end gap-6">
                            <button className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-lg hover-lift shadow-xl">
                                Get Started Free
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

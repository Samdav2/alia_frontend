'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-slate-950 text-slate-400 py-20 px-4 soft-gradient-bg border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl group-hover:rotate-6 transition-transform shadow-xl">
                A
              </div>
              <span className="font-black text-2xl text-slate-900 tracking-tight">
                ALIA
              </span>
            </Link>
            <p className="text-lg font-medium text-slate-600 leading-relaxed">
              Advancing human potential through adaptive learning and agentic inclusivity.
            </p>
          </div>

          {[
            { title: 'Product', links: [{ n: 'Voice Nav', h: '#' }, { n: 'Gaze Control', h: '#' }, { n: 'AI Engine', h: '#features' }] },
            { title: 'Community', links: [{ n: 'Case Studies', h: '#' }, { n: 'Research', h: '#' }, { n: 'Faculty Portal', h: '#' }] },
            { title: 'Contact', links: [{ n: 'Support', h: '#' }, { n: 'Sales', h: '#' }, { n: 'LASU Hub', h: '#' }] }
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs">{col.title}</h4>
              <ul className="space-y-4">
                {col.links.map((link) => (
                  <li key={link.n}>
                    <Link href={link.h} className="text-slate-600 font-bold hover:text-blue-600 transition-colors">
                      {link.n}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="pt-12 border-t border-slate-200">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-10">
            {/* Developer Credit */}
            <div className="flex items-center gap-6 glass-card p-6 rounded-3xl border-white ring-8 ring-slate-50 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-2xl font-black">
                AE
              </div>
              <div>
                <p className="text-slate-900 font-black text-lg">Dawodu Samuel Iyanu</p>
                <p className="text-slate-500 font-bold">Lagos State University | 220194044</p>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-right">
              <p className="font-black text-slate-900 text-lg">© {currentYear} ALIA Architecture</p>
              <p className="text-slate-500 font-bold">Inclusive Learning, Adapted to You.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

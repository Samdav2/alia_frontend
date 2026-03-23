'use client';

import React from 'react';
import Link from 'next/link';

interface PricingTier {
  id: string;
  name: string;
  icon: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  highlighted: boolean;
  cta: string;
  badge?: string;
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'basic',
    name: 'Basic Tier',
    icon: '🎓',
    description: 'Perfect for individual students',
    price: 'Free',
    period: 'Forever',
    features: [
      'Individual student registration',
      'Basic accessibility tools',
      'Text-to-speech engine',
      'Dyslexia-friendly fonts',
      'High contrast modes',
      'Access to all courses',
      'Community support',
    ],
    highlighted: false,
    cta: 'Get Started Free',
  },
  {
    id: 'faculty',
    name: 'Faculty Premium',
    icon: '🏫',
    description: 'For departments & institutions',
    price: '₦53,750',
    period: 'Per Semester',
    features: [
      'Everything in Basic',
      'Advanced AI grading system',
      'Bulk student uploads',
      'Extra cloud storage (100GB)',
      '24/7 Priority support',
      'Custom branding options',
      'Advanced analytics dashboard',
      'Agentic alerts system',
      'Dedicated account manager',
    ],
    highlighted: true,
    cta: 'Contact Sales',
    badge: 'Most Popular',
  },
];

export const PricingSection: React.FC = () => {
  return (
    <section id="pricing" className="py-24 sm:py-32 px-4 soft-gradient-bg relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full mb-6 border-blue-100">
            <span className="text-sm font-bold bg-blue-600 bg-clip-text text-transparent uppercase tracking-widest">Pricing Strategy</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            Departmental <span className="alia-gradient-text">Licensing</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
            Scalable, inclusive pricing for students and institutions. Built to grow with your community.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`relative rounded-[40px] p-10 transition-all hover-lift ${tier.highlighted
                  ? 'bg-slate-900 text-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] lg:scale-105 border-4 border-white/10'
                  : 'glass-card text-slate-900 border-white/60 shadow-2xl shadow-slate-200'
                }`}
            >
              {tier.badge && (
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                  <div className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-xs font-black rounded-full uppercase tracking-widest shadow-xl ring-4 ring-white">
                    {tier.badge}
                  </div>
                </div>
              )}

              <div className="text-center mb-10">
                <div className="text-6xl mb-6 animate-bounce-slow">{tier.icon}</div>
                <h3 className="text-3xl font-black mb-3">{tier.name}</h3>
                <p className={`text-lg font-medium ${tier.highlighted ? 'text-slate-400' : 'text-slate-600'}`}>
                  {tier.description}
                </p>
              </div>

              <div className="text-center mb-10 pb-10 border-b border-white/10">
                <div className="text-5xl font-black mb-2">{tier.price}</div>
                <div className={`text-sm font-bold uppercase tracking-widest ${tier.highlighted ? 'text-blue-400' : 'text-blue-600'}`}>
                  {tier.period}
                </div>
              </div>

              <Link
                href={tier.id === 'basic' ? '/signup' : '#contact'}
                className={`block w-full py-5 rounded-2xl font-black text-center text-lg transition-all mb-10 shadow-xl active:scale-95 ${tier.highlighted
                    ? 'bg-white text-slate-900 hover:bg-slate-50'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
              >
                {tier.cta}
              </Link>

              <div className="space-y-4">
                <div className={`text-xs uppercase font-black tracking-widest mb-6 ${tier.highlighted ? 'text-slate-400' : 'text-slate-500'}`}>
                  What's included
                </div>
                {tier.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${tier.highlighted ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                      }`}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-bold text-sm lg:text-base">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Note */}
        <div className="mt-16 glass-card border-l-[12px] border-blue-600 p-8 rounded-[32px] max-w-4xl mx-auto shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-6xl opacity-10 group-hover:scale-125 transition-transform">💡</div>
          <div className="relative z-10 flex items-start gap-6">
            <div className="p-4 bg-blue-100 rounded-2xl text-3xl">🛡️</div>
            <div className="space-y-2">
              <h4 className="text-xl font-black text-slate-900">Departmental Transparency</h4>
              <p className="text-slate-600 font-medium leading-relaxed">
                Faculty Premium includes 7.5% system charges. Base cost: <span className="text-blue-600 font-black">₦50,000</span> per semester.
                Full inclusive coverage for up to 500 students per license. Contact our architecture team for enterprise scale.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

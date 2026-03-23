'use client';

import React from 'react';

export const TrustSection: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto text-center">
        <div className="text-4xl sm:text-5xl mb-4">🇳🇬</div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-4">
          Engineered for the Modern Nigerian Educational Landscape
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-white/90 max-w-3xl mx-auto">
          Built with accessibility, inclusivity, and scalability at its core.
          Designed for Nigerian universities. Ready for the world.
        </p>
      </div>
    </section>
  );
};

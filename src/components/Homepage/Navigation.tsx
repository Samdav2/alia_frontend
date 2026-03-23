'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AccessibilityDropdown } from './AccessibilityDropdown';

export const Navigation: React.FC = () => {
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
        ? 'bg-white/95 backdrop-blur-lg shadow-lg'
        : 'bg-white/80 backdrop-blur-md shadow-sm'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group z-50">
            <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg lg:text-xl group-hover:shadow-xl transition-all group-hover:rotate-6 shadow-indigo-200 shadow-lg">
              A
            </div>
            <span className="font-bold text-xl sm:text-2xl lg:text-3xl alia-gradient-text tracking-tight">
              ALIA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {['Home', 'Features', 'About', 'Contact'].map((item) => (
              <Link
                key={item}
                href={item === 'Home' ? '/' : item === 'About' ? '/about' : `#${item.toLowerCase()}`}
                className="text-slate-600 hover:text-blue-600 font-semibold transition-colors relative group py-2"
              >
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3 lg:gap-6">
            {/* Accessibility Icon */}
            <div className="relative">
              <button
                onClick={() => setIsAccessibilityOpen(!isAccessibilityOpen)}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border-2 border-slate-200 text-blue-600 flex items-center justify-center hover:border-blue-500 hover:shadow-lg transition-all hover:scale-105 shadow-sm overflow-hidden group"
                title="Accessibility Options"
              >
                <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 text-lg sm:text-xl">♿</span>
              </button>
              {isAccessibilityOpen && (
                <AccessibilityDropdown
                  onClose={() => setIsAccessibilityOpen(false)}
                />
              )}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden sm:flex items-center gap-4">
              <Link
                href="/login"
                className="px-5 py-2.5 text-slate-700 font-bold hover:text-blue-600 transition-all"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:shadow-xl transition-all font-bold hover:scale-105 active:scale-95 shadow-lg"
              >
                Join ALIA
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 focus:outline-none"
              aria-label="Toggle menu"
            >
              <span
                className={`w-6 h-0.5 bg-slate-900 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                  }`}
              />
              <span
                className={`w-6 h-0.5 bg-slate-900 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''
                  }`}
              />
              <span
                className={`w-6 h-0.5 bg-slate-900 transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                  }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-0 top-[64px] bg-white/98 backdrop-blur-xl transition-all duration-300 ${isMobileMenuOpen
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 translate-x-full'
          } pointer-events-auto`}
      >
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-6 sm:gap-8 px-8 py-12 overflow-y-auto">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-2xl sm:text-3xl font-black text-slate-900 hover:text-blue-600 transition-colors py-2"
          >
            Home
          </Link>
          <Link
            href="#features-suite"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-2xl sm:text-3xl font-black text-slate-900 hover:text-blue-600 transition-colors py-2"
          >
            Features
          </Link>
          <Link
            href="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-2xl sm:text-3xl font-black text-slate-900 hover:text-blue-600 transition-colors py-2"
          >
            About
          </Link>
          <Link
            href="#contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-2xl sm:text-3xl font-black text-slate-900 hover:text-blue-600 transition-colors py-2"
          >
            Contact
          </Link>

          <div className="flex flex-col gap-4 w-full max-w-xs mt-4 sm:mt-8">
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-4 text-center text-slate-700 border-2 border-slate-200 rounded-2xl hover:border-blue-500 hover:text-blue-600 font-black text-lg transition-all"
            >
              Login
            </Link>
            <Link
              href="/signup"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-4 text-center bg-slate-900 text-white rounded-2xl hover:shadow-xl transition-all font-black text-lg"
            >
              Join ALIA
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

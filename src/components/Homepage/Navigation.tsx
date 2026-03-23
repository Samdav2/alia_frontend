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
          <Link href="/" className="flex items-center gap-2 group z-50">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg lg:text-xl group-hover:shadow-xl transition-all group-hover:rotate-6 shadow-indigo-200 shadow-lg">
              A
            </div>
            <span className="font-bold text-2xl lg:text-3xl alia-gradient-text tracking-tight">
              ALIA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {['Home', 'Features', 'Pricing', 'Contact'].map((item) => (
              <Link
                key={item}
                href={item === 'Home' ? '/' : `#${item.toLowerCase()}`}
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
                className="w-11 h-11 rounded-full bg-white border-2 border-slate-200 text-blue-600 flex items-center justify-center hover:border-blue-500 hover:shadow-lg transition-all hover:scale-105 shadow-sm overflow-hidden group"
                title="Accessibility Options"
              >
                <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 text-xl">♿</span>
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
        className={`lg:hidden fixed inset-0 top-16 bg-white/98 backdrop-blur-lg transition-all duration-300 ${isMobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
          }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8 px-8">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-2xl font-bold text-slate-900 hover:text-blue-600 transition-colors"
          >
            Home
          </Link>
          <Link
            href="#features"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-2xl font-bold text-slate-900 hover:text-blue-600 transition-colors"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-2xl font-bold text-slate-900 hover:text-blue-600 transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="#contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-2xl font-bold text-slate-900 hover:text-blue-600 transition-colors"
          >
            Contact
          </Link>

          <div className="flex flex-col gap-4 w-full max-w-xs mt-8 sm:hidden">
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-3 text-center text-slate-700 border-2 border-slate-300 rounded-lg hover:border-blue-500 hover:text-blue-600 font-bold transition-all"
            >
              Login
            </Link>
            <Link
              href="/signup"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-3 text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-bold"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

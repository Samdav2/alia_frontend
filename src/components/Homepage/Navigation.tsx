'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { authService } from '@/services/api/authService';
import { userService } from '@/services/api/userService';
import { LayoutDashboard } from 'lucide-react';

export const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const validateAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          // Validate token by fetching profile
          const profile = await userService.getProfile();
          setIsAuthenticated(true);
          setUser(profile);
          authService.setCurrentUser(profile);
        } catch (error) {
          console.error('Auth validation failed:', error);
          authService.logout();
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    validateAuth();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isMobileMenuOpen
          ? 'bg-white shadow-sm'
          : scrolled
            ? 'bg-white/95 backdrop-blur-lg shadow-lg'
            : 'bg-white/80 backdrop-blur-md shadow-sm'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 lg:gap-4 group z-50">
            <div className="relative w-10 h-10 lg:w-14 lg:h-14 group-hover:scale-110 transition-transform duration-500">
              <img
                src="/logo-icon.png"
                alt="ALIA Logo"
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl lg:text-3xl alia-gradient-text tracking-tighter leading-none">
                ALIA
              </span>
              <span className="text-[8px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 hidden sm:block">
                Adaptive Learning & Inclusive Agent
              </span>
            </div>
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

            {/* Desktop Auth/Dashboard Buttons */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-4">
                <Link
                  href={user?.role === 'lecturer' ? '/dashboard/lecturer' : '/dashboard/student'}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:shadow-xl transition-all font-bold hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </Link>
              </div>
            ) : (
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
            )}

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
        className={`lg:hidden fixed inset-0 top-[64px] bg-white transition-all duration-300 ${isMobileMenuOpen
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

          {isAuthenticated ? (
            <div className="flex flex-col gap-4 w-full max-w-xs mt-4 sm:mt-8">
              <Link
                href={user?.role === 'lecturer' ? '/dashboard/lecturer' : '/dashboard/student'}
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-4 text-center bg-blue-600 text-white rounded-2xl hover:shadow-xl transition-all font-black text-lg flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-6 h-6" />
                Go to Dashboard
              </Link>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </nav>
  );
};

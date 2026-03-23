import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserPreferencesProvider } from "@/context/UserPreferencesContext";
import { SignNavigationProvider } from "@/context/SignNavigationContext";
import GazeTrackerActivator from "@/components/Accessibility/GazeTrackerActivator";
import { AccessibilityFAB } from "@/components/Dashboard/Accessibility/AccessibilityFAB";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ALIA - Adaptive Learning & Inclusive Agent",
  description: "An intelligent, multi-agent platform designed to make education accessible, personalized, and inclusive for every student.",
  keywords: "ALIA, LMS, education, accessibility, AI, inclusive learning",
  authors: [{ name: "Amiola Oluwademilade Emmanuel", url: "https://lasu.edu.ng" }],
};

import { GlobalSignExecutor } from "@/components/Accessibility/GlobalSignExecutor";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserPreferencesProvider>
          <SignNavigationProvider>
            {/* Global gesture executor - listens for signs and executes commands */}
            <GlobalSignExecutor />
            {/* Gaze tracker activator - reads context and initializes WebGazer when enabled */}
            <GazeTrackerActivator />
            {/* Global accessibility FAB - ♿ button available on every page */}
            <AccessibilityFAB />
            {children}
          </SignNavigationProvider>
        </UserPreferencesProvider>
      </body>
    </html>
  );
}

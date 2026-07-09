import React from 'react';
import { TopNav } from '@/components/Dashboard/StudentDashboard/TopNav';
import { BottomNav } from '@/components/Dashboard/StudentDashboard/BottomNav';

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <TopNav />
      <div className="w-full min-w-0 lg:pl-72">{children}</div>
      <BottomNav />
    </div>
  );
}

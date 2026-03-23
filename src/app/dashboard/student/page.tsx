import { LandingView } from '@/components/Dashboard/StudentDashboard/LandingView';
import { BottomNav } from '@/components/Dashboard/StudentDashboard/BottomNav';
import { TopNav } from '@/components/Dashboard/StudentDashboard/TopNav';

export default function StudentDashboardPage() {
  // Mock user data - replace with actual auth
  const studentData = {
    name: 'Amiola Oluwademilade Emmanuel',
    id: '220194031',
    department: 'Education',
  };

  return (
    <>
      <TopNav />
      <div className="pt-24 lg:pt-20">
        <LandingView
          studentName={studentData.name}
          studentId={studentData.id}
          department={studentData.department}
        />
      </div>
      <BottomNav />
    </>
  );
}

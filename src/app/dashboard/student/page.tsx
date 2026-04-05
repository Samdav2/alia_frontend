import { LandingView } from '@/components/Dashboard/StudentDashboard/LandingView';

export default function StudentDashboardPage() {
  // Mock user data - replace with actual auth
  const studentData = {
    name: 'Amiola Oluwademilade Emmanuel',
    id: '220194031',
    department: 'Education',
  };

  return (
    <div className="pt-6 sm:pt-8 lg:pt-0">
      <LandingView
        studentName={studentData.name}
        studentId={studentData.id}
        department={studentData.department}
      />
    </div>
  );
}

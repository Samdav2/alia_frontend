import { CourseOverview } from '@/components/Dashboard/StudentDashboard/CourseOverview';
import { BottomNav } from '@/components/Dashboard/StudentDashboard/BottomNav';

interface CoursePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { id } = await params;

  return (
    <>
      <CourseOverview courseId={id} />
      <BottomNav />
    </>
  );
}

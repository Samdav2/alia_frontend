import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    // TODO: Fetch from analytics database
    const performanceData = {
      courseId,
      students: [
        {
          id: '1',
          name: 'Amiola Oluwademilade',
          studentId: '220194031',
          quizScore: 92,
          timeSpent: 45,
          status: 'excellent',
        },
        {
          id: '2',
          name: 'John Smith',
          studentId: '220194032',
          quizScore: 78,
          timeSpent: 30,
          status: 'good',
        },
      ],
    };

    return NextResponse.json(performanceData, { status: 200 });
  } catch (error) {
    console.error('Error fetching performance analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance analytics' },
      { status: 500 }
    );
  }
}

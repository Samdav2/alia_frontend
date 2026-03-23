import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // TODO: Fetch from database
    const courses = [
      {
        id: '1',
        code: 'EDU 411',
        title: 'Instructional Design',
        progress: 60,
        instructor: 'Dr. Smith',
      },
      {
        id: '2',
        code: 'EDU 412',
        title: 'Educational Technology',
        progress: 45,
        instructor: 'Prof. Johnson',
      },
    ];

    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const courseData = await request.json();

    // TODO: Save to database
    const newCourse = {
      id: Date.now().toString(),
      ...courseData,
    };

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    // TODO: Fetch from database with optional role filter
    const users = [
      {
        id: '1',
        name: 'Amiola Oluwademilade',
        email: '[email]@university.edu',
        role: 'student',
        department: 'Education',
        status: 'active',
      },
    ];

    const filtered = role ? users.filter((u) => u.role === role) : users;

    return NextResponse.json(filtered, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();

    // TODO: Save to database
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      status: 'pending',
    };

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

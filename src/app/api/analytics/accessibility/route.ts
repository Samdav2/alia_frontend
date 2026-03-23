import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // TODO: Fetch from analytics database
    const accessibilityData = {
      totalUsageHours: 1276,
      activeUsers: 496,
      features: [
        {
          feature: 'Text-to-Speech (TTS)',
          usageHours: 523,
          activeUsers: 187,
          trend: 'up',
        },
        {
          feature: 'Dyslexia-Friendly Font',
          usageHours: 312,
          activeUsers: 124,
          trend: 'up',
        },
        {
          feature: 'High Contrast Mode',
          usageHours: 198,
          activeUsers: 89,
          trend: 'stable',
        },
        {
          feature: 'Voice Navigation',
          usageHours: 87,
          activeUsers: 34,
          trend: 'up',
        },
        {
          feature: 'Bionic Reading',
          usageHours: 156,
          activeUsers: 62,
          trend: 'down',
        },
      ],
    };

    return NextResponse.json(accessibilityData, { status: 200 });
  } catch (error) {
    console.error('Error fetching accessibility analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accessibility analytics' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { dashboardService } from '../../../../../services/dashboard-service';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const refresh = url.searchParams.get('refresh') === 'true';
    const category = url.searchParams.get('category') || 'Overview';

    const dashboardData = await dashboardService.getDashboardData(refresh, category);

    return NextResponse.json({
      success: true,
      data: dashboardData
    });
  } catch (error: any) {
    console.error('Dashboard Route Error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'An error occurred while fetching the market dashboard data.'
      }
    }, { status: 500 });
  }
}

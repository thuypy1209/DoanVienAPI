import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [sinhViensCount, hoatDongsCount, recentActivities] = await Promise.all([
      prisma.sinhViens.count(),
      prisma.hoatDongs.count(),
      prisma.hoatDongs.findMany({
        take: 3,
        orderBy: { Id: 'desc' },
      }),
    ]);

    return NextResponse.json({
      status: 'success',
      message: 'Prisma ORM connected to SQL Server successfully!',
      data: {
        totalStudents: sinhViensCount,
        totalActivities: hoatDongsCount,
        recentActivities,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Prisma query failed',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

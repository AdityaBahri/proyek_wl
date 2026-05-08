import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');

    const where = {};
    if (origin) where.originCity = { contains: origin, mode: 'insensitive' };
    if (destination) where.destinationCity = { contains: destination, mode: 'insensitive' };

    const routes = await prisma.route.findMany({ where, orderBy: { originCity: 'asc' } });
    return NextResponse.json({ routes });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const route = await prisma.route.create({
      data: {
        originCity: body.originCity,
        destinationCity: body.destinationCity,
        boardingPoints: body.boardingPoints || [],
        dropPoints: body.dropPoints || [],
        distance: body.distance || null,
        estimatedTime: body.estimatedTime || null,
      },
    });
    return NextResponse.json({ route }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

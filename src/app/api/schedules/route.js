import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const date = searchParams.get('date');

    const where = { isActive: true };
    if (origin || destination) {
      where.route = {};
      if (origin) where.route.originCity = { contains: origin };
      if (destination) where.route.destinationCity = { contains: destination };
    }
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      where.departureDateTime = { gte: startDate, lt: endDate };
    }

    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        route: true,
        vehicle: { include: { agency: true } },
        bookings: { select: { selectedSeats: true, status: true } },
      },
      orderBy: { departureDateTime: 'asc' },
    });

    return NextResponse.json({ schedules });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const schedule = await prisma.schedule.create({
      data: {
        routeId: body.routeId,
        vehicleId: body.vehicleId,
        departureDateTime: new Date(body.departureDateTime),
        arrivalDateTime: new Date(body.arrivalDateTime),
        ticketPrice: parseInt(body.ticketPrice),
        isActive: body.isActive !== false,
      },
      include: { route: true, vehicle: true },
    });
    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

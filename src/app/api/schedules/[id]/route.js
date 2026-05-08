import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        route: true,
        vehicle: { include: { agency: true } },
        bookings: { select: { selectedSeats: true, status: true } },
      },
    });
    if (!schedule) return NextResponse.json({ error: 'Jadwal tidak ditemukan' }, { status: 404 });
    return NextResponse.json({ schedule });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const schedule = await prisma.schedule.update({
      where: { id },
      data: {
        routeId: body.routeId,
        vehicleId: body.vehicleId,
        departureDateTime: body.departureDateTime ? new Date(body.departureDateTime) : undefined,
        arrivalDateTime: body.arrivalDateTime ? new Date(body.arrivalDateTime) : undefined,
        ticketPrice: body.ticketPrice ? parseInt(body.ticketPrice) : undefined,
        isActive: body.isActive,
      },
      include: { route: true, vehicle: true },
    });
    return NextResponse.json({ schedule });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.schedule.delete({ where: { id } });
    return NextResponse.json({ message: 'Jadwal berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

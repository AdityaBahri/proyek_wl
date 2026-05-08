import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const passengerId = searchParams.get('passengerId');
    const scheduleId = searchParams.get('scheduleId');
    const status = searchParams.get('status');

    const where = {};
    if (passengerId) where.passengerId = passengerId;
    if (scheduleId) where.scheduleId = scheduleId;
    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        passenger: { select: { id: true, name: true, email: true, phone: true } },
        schedule: { include: { route: true, vehicle: { include: { agency: true } } } },
        payment: true,
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ bookings });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const seats = body.selectedSeats || [];

    // Check seat availability
    const existingBookings = await prisma.booking.findMany({
      where: { scheduleId: body.scheduleId, status: { not: 'cancelled' } },
    });
    const takenSeats = existingBookings.flatMap(b => b.selectedSeats || []);
    const conflict = seats.filter(s => takenSeats.includes(s));
    if (conflict.length > 0) {
      return NextResponse.json({ error: `Kursi ${conflict.join(', ')} sudah terisi` }, { status: 400 });
    }

    const schedule = await prisma.schedule.findUnique({ where: { id: body.scheduleId } });
    if (!schedule) return NextResponse.json({ error: 'Jadwal tidak ditemukan' }, { status: 404 });

    const booking = await prisma.booking.create({
      data: {
        passengerId: body.passengerId,
        scheduleId: body.scheduleId,
        selectedSeats: seats,
        totalPrice: schedule.ticketPrice * seats.length,
        status: 'pending',
      },
      include: { schedule: { include: { route: true, vehicle: true } } },
    });
    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

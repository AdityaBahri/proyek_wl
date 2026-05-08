import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        passenger: { select: { id: true, name: true, email: true, phone: true } },
        schedule: { include: { route: true, vehicle: { include: { agency: true } } } },
        payment: true,
        review: true,
      },
    });
    if (!booking) return NextResponse.json({ error: 'Booking tidak ditemukan' }, { status: 404 });
    return NextResponse.json({ booking });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const booking = await prisma.booking.update({
      where: { id },
      data: { status: body.status },
      include: { schedule: { include: { route: true } }, payment: true },
    });
    return NextResponse.json({ booking });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.booking.update({ where: { id }, data: { status: 'cancelled' } });
    return NextResponse.json({ message: 'Booking dibatalkan' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

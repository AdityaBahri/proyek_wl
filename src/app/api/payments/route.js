import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const payment = await prisma.payment.create({
      data: {
        bookingId: body.bookingId,
        paymentMethod: body.paymentMethod,
        proofUrl: body.proofUrl || null,
        paymentStatus: 'pending',
      },
    });
    await prisma.booking.update({ where: { id: body.bookingId }, data: { status: 'paid' } });
    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const where = {};
    if (bookingId) where.bookingId = bookingId;

    const payments = await prisma.payment.findMany({
      where,
      include: { booking: { include: { passenger: { select: { name: true, email: true } }, schedule: { include: { route: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ payments });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

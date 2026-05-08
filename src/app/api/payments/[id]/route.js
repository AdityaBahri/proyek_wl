import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const payment = await prisma.payment.update({
      where: { id },
      data: { paymentStatus: body.paymentStatus },
    });
    if (body.paymentStatus === 'verified') {
      await prisma.booking.update({ where: { id: payment.bookingId }, data: { status: 'paid' } });
    }
    if (body.paymentStatus === 'rejected') {
      await prisma.booking.update({ where: { id: payment.bookingId }, data: { status: 'pending' } });
    }
    return NextResponse.json({ payment });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

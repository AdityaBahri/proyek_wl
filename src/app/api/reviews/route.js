import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const review = await prisma.review.create({
      data: {
        bookingId: body.bookingId,
        passengerId: body.passengerId,
        rating: parseInt(body.rating),
        comment: body.comment || null,
      },
    });
    await prisma.booking.update({ where: { id: body.bookingId }, data: { status: 'completed' } });
    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const agencyId = searchParams.get('agencyId');

    const where = {};
    if (agencyId) {
      where.booking = { schedule: { vehicle: { agencyId } } };
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        passenger: { select: { name: true } },
        booking: { include: { schedule: { include: { route: true, vehicle: { include: { agency: true } } } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ reviews });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

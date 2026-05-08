import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const route = await prisma.route.update({
      where: { id },
      data: {
        originCity: body.originCity,
        destinationCity: body.destinationCity,
        boardingPoints: body.boardingPoints ? JSON.stringify(body.boardingPoints) : undefined,
        dropPoints: body.dropPoints ? JSON.stringify(body.dropPoints) : undefined,
        distance: body.distance,
        estimatedTime: body.estimatedTime,
      },
    });
    return NextResponse.json({ route });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.route.delete({ where: { id } });
    return NextResponse.json({ message: 'Rute berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

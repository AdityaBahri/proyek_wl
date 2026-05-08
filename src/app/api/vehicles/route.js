import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const agencyId = searchParams.get('agencyId');
    const where = {};
    if (agencyId) where.agencyId = agencyId;

    const vehicles = await prisma.vehicle.findMany({
      where,
      include: { agency: { select: { agencyName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ vehicles });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const vehicle = await prisma.vehicle.create({
      data: {
        agencyId: body.agencyId,
        licensePlate: body.licensePlate,
        vehicleType: body.vehicleType,
        seatCapacity: parseInt(body.seatCapacity),
        facilities: JSON.stringify(body.facilities || []),
        imageUrl: body.imageUrl || null,
      },
    });
    return NextResponse.json({ vehicle }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

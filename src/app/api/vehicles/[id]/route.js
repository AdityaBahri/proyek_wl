import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        licensePlate: body.licensePlate,
        vehicleType: body.vehicleType,
        seatCapacity: body.seatCapacity ? parseInt(body.seatCapacity) : undefined,
        facilities: body.facilities ? JSON.stringify(body.facilities) : undefined,
        isActive: body.isActive,
      },
    });
    return NextResponse.json({ vehicle });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.vehicle.delete({ where: { id } });
    return NextResponse.json({ message: 'Kendaraan berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

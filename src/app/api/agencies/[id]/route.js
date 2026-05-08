import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const agency = await prisma.travelAgency.update({
      where: { id },
      data: {
        agencyName: body.agencyName,
        contactNumber: body.contactNumber,
        address: body.address,
        description: body.description,
        legalDocumentUrl: body.legalDocumentUrl,
        isActive: body.isActive,
      },
    });
    return NextResponse.json({ agency });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.travelAgency.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ message: 'Agen travel dinonaktifkan' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

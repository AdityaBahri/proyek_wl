import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const where = {};
    if (userId) where.userId = userId;

    const agencies = await prisma.travelAgency.findMany({
      where,
      include: { user: { select: { name: true, email: true } }, vehicles: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ agencies });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const agency = await prisma.travelAgency.create({
      data: {
        userId: body.userId,
        agencyName: body.agencyName,
        contactNumber: body.contactNumber,
        address: body.address,
        description: body.description || null,
        legalDocumentUrl: body.legalDocumentUrl || null,
      },
    });
    return NextResponse.json({ agency }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

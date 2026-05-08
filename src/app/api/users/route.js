import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const where = {};
    if (role) where.role = role;

    const users = await prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true, agency: { select: { id: true, agencyName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });

    const hashedPassword = await bcrypt.hash(body.password, 10);
    
    if (body.role === 'operator' && body.agencyName) {
      const user = await prisma.user.create({
        data: { 
          name: body.name, 
          email: body.email, 
          password: hashedPassword, 
          phone: body.phone || null, 
          role: 'operator',
          agency: {
            create: {
              agencyName: body.agencyName,
              contactNumber: body.agencyContact || body.phone || '-',
              address: body.agencyAddress || '-',
              isActive: false, // Menunggu persetujuan admin
            }
          }
        },
        select: { id: true, name: true, email: true, role: true },
      });
      return NextResponse.json({ user }, { status: 201 });
    } else {
      const user = await prisma.user.create({
        data: { name: body.name, email: body.email, password: hashedPassword, phone: body.phone || null, role: body.role || 'passenger' },
        select: { id: true, name: true, email: true, role: true },
      });
      return NextResponse.json({ user }, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

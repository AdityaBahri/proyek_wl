import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData = {};
    if (body.name) updateData.name = body.name;
    if (body.phone) updateData.phone = body.phone;
    
    // Check if updating email (make sure it's not already used)
    if (body.email) {
      const existingUser = await prisma.user.findUnique({ where: { email: body.email } });
      if (existingUser && existingUser.id !== id) {
        return NextResponse.json({ error: 'Email sudah digunakan oleh akun lain' }, { status: 400 });
      }
      updateData.email = body.email;
    }

    // Check if updating password
    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, phone: true, role: true }
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true }
    });
    
    if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Clean existing data (order matters due to foreign keys)
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.route.deleteMany();
  await prisma.travelAgency.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Super Admin
  const admin = await prisma.user.create({
    data: { name: 'Admin Lintas Kota', email: 'admin@lintaskota.id', password: hashedPassword, role: 'super_admin' },
  });

  // Create Operators
  const op1 = await prisma.user.create({
    data: { name: 'Budi Santoso', email: 'budi@traveljaya.id', password: hashedPassword, role: 'operator', phone: '081234567890' },
  });
  const op2 = await prisma.user.create({
    data: { name: 'Siti Rahayu', email: 'siti@primashuttle.id', password: hashedPassword, role: 'operator', phone: '081298765432' },
  });

  // Create Passengers
  const p1 = await prisma.user.create({
    data: { name: 'Ahmad Rizky', email: 'ahmad@gmail.com', password: hashedPassword, role: 'passenger', phone: '081311111111' },
  });
  const p2 = await prisma.user.create({
    data: { name: 'Dewi Lestari', email: 'dewi@gmail.com', password: hashedPassword, role: 'passenger', phone: '081322222222' },
  });

  // Create Travel Agencies
  const agency1 = await prisma.travelAgency.create({
    data: {
      userId: op1.id, agencyName: 'Travel Jaya Abadi', contactNumber: '021-5551234',
      address: 'Jl. Sudirman No. 100, Jakarta Selatan',
      description: 'Travel terpercaya sejak 2010 dengan armada modern dan nyaman.',
    },
  });
  const agency2 = await prisma.travelAgency.create({
    data: {
      userId: op2.id, agencyName: 'Prima Shuttle Express', contactNumber: '022-5554321',
      address: 'Jl. Asia Afrika No. 55, Bandung',
      description: 'Layanan shuttle premium antar kota dengan fasilitas lengkap.',
    },
  });

  // Create Vehicles (PostgreSQL Json type — pass arrays directly)
  const v1 = await prisma.vehicle.create({
    data: {
      agencyId: agency1.id, licensePlate: 'B 1234 XY', vehicleType: 'Toyota HiAce',
      seatCapacity: 12, facilities: ['AC', 'Musik', 'USB Charger', 'Wi-Fi'],
    },
  });
  const v2 = await prisma.vehicle.create({
    data: {
      agencyId: agency1.id, licensePlate: 'B 5678 AB', vehicleType: 'Mercedes Sprinter',
      seatCapacity: 16, facilities: ['AC', 'Musik', 'Reclining Seat', 'Snack'],
    },
  });
  const v3 = await prisma.vehicle.create({
    data: {
      agencyId: agency2.id, licensePlate: 'D 9012 CD', vehicleType: 'Isuzu Elf',
      seatCapacity: 12, facilities: ['AC', 'TV', 'USB Charger'],
    },
  });

  // Create Routes (PostgreSQL Json type — pass arrays directly)
  const r1 = await prisma.route.create({
    data: {
      originCity: 'Jakarta', destinationCity: 'Bandung',
      boardingPoints: ['Terminal Lebak Bulus', 'Cawang', 'Bekasi Timur'],
      dropPoints: ['Pasteur', 'Dago', 'Buah Batu'],
      distance: '150 km', estimatedTime: '3 jam',
    },
  });
  const r2 = await prisma.route.create({
    data: {
      originCity: 'Jakarta', destinationCity: 'Semarang',
      boardingPoints: ['Terminal Lebak Bulus', 'Cawang'],
      dropPoints: ['Simpang Lima', 'Terminal Terboyo'],
      distance: '440 km', estimatedTime: '7 jam',
    },
  });
  const r3 = await prisma.route.create({
    data: {
      originCity: 'Bandung', destinationCity: 'Yogyakarta',
      boardingPoints: ['Pasteur', 'Cibiru'],
      dropPoints: ['Malioboro', 'Terminal Giwangan'],
      distance: '420 km', estimatedTime: '8 jam',
    },
  });
  const r4 = await prisma.route.create({
    data: {
      originCity: 'Surabaya', destinationCity: 'Malang',
      boardingPoints: ['Terminal Purabaya', 'Waru'],
      dropPoints: ['Arjosari', 'Alun-Alun Malang'],
      distance: '90 km', estimatedTime: '2 jam',
    },
  });

  // Create Schedules
  const makeDate = (day, hour) => {
    const d = new Date();
    d.setDate(d.getDate() + day);
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  await prisma.schedule.create({
    data: { routeId: r1.id, vehicleId: v1.id, departureDateTime: makeDate(1, 6), arrivalDateTime: makeDate(1, 9), ticketPrice: 150000 },
  });
  await prisma.schedule.create({
    data: { routeId: r1.id, vehicleId: v1.id, departureDateTime: makeDate(1, 12), arrivalDateTime: makeDate(1, 15), ticketPrice: 150000 },
  });
  await prisma.schedule.create({
    data: { routeId: r1.id, vehicleId: v2.id, departureDateTime: makeDate(2, 8), arrivalDateTime: makeDate(2, 11), ticketPrice: 175000 },
  });
  await prisma.schedule.create({
    data: { routeId: r2.id, vehicleId: v2.id, departureDateTime: makeDate(1, 20), arrivalDateTime: makeDate(2, 3), ticketPrice: 350000 },
  });
  await prisma.schedule.create({
    data: { routeId: r3.id, vehicleId: v3.id, departureDateTime: makeDate(2, 7), arrivalDateTime: makeDate(2, 15), ticketPrice: 300000 },
  });
  await prisma.schedule.create({
    data: { routeId: r4.id, vehicleId: v3.id, departureDateTime: makeDate(1, 9), arrivalDateTime: makeDate(1, 11), ticketPrice: 75000 },
  });

  console.log('✅ Seed data created successfully!');
  console.log('');
  console.log('📧 Login Accounts:');
  console.log('   Super Admin : admin@lintaskota.id / password123');
  console.log('   Operator 1  : budi@traveljaya.id / password123');
  console.log('   Operator 2  : siti@primashuttle.id / password123');
  console.log('   Penumpang 1 : ahmad@gmail.com / password123');
  console.log('   Penumpang 2 : dewi@gmail.com / password123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

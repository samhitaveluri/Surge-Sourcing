import { PrismaClient, Role, RfqStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing records in correct relation order
  await prisma.quotation.deleteMany();
  await prisma.rFQ.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Buyers
  const buyer1 = await prisma.user.create({
    data: {
      name: 'Apex Retailers Ltd',
      email: 'buyer@example.com',
      password: passwordHash,
      role: Role.BUYER,
    },
  });

  const buyer2 = await prisma.user.create({
    data: {
      name: 'Zenith Innovations',
      email: 'buyer2@example.com',
      password: passwordHash,
      role: Role.BUYER,
    },
  });

  // 2. Create Suppliers
  const supplier1 = await prisma.user.create({
    data: {
      name: 'Global Furniture Solutions',
      email: 'supplier@example.com',
      password: passwordHash,
      role: Role.SUPPLIER,
    },
  });

  const supplier2 = await prisma.user.create({
    data: {
      name: 'TechSource Electronics',
      email: 'supplier2@example.com',
      password: passwordHash,
      role: Role.SUPPLIER,
    },
  });

  // 3. Create Sample RFQs
  const futureDate30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const futureDate15 = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
  const futureDate45 = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);
  const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

  const rfq1 = await prisma.rFQ.create({
    data: {
      buyerId: buyer1.id,
      productName: 'Ergonomic Office Chairs',
      description: 'We require 500 high-grade ergonomic mesh office chairs with adjustable lumbar support and 3D armrests for our new tech center.',
      quantity: 500,
      deliveryLocation: 'Hyderabad, Telangana',
      deadline: futureDate30,
      status: RfqStatus.OPEN,
    },
  });

  const rfq2 = await prisma.rFQ.create({
    data: {
      buyerId: buyer1.id,
      productName: 'Motorized Standing Desks',
      description: 'Dual-motor electric height adjustable standing desks with scratch-resistant oak finish tabletops.',
      quantity: 120,
      deliveryLocation: 'Bengaluru, Karnataka',
      deadline: futureDate15,
      status: RfqStatus.OPEN,
    },
  });

  const rfq3 = await prisma.rFQ.create({
    data: {
      buyerId: buyer2.id,
      productName: 'Cat6 Industrial Ethernet Cables (1000ft spools)',
      description: 'High-speed shielded copper networking spools for commercial data center cabling installation.',
      quantity: 80,
      deliveryLocation: 'Pune, Maharashtra',
      deadline: futureDate45,
      status: RfqStatus.OPEN,
    },
  });

  const rfq4 = await prisma.rFQ.create({
    data: {
      buyerId: buyer1.id,
      productName: 'Modular Conference Tables',
      description: 'Past procurement for modular board room tables with integrated power sockets and HDMI pass-throughs.',
      quantity: 10,
      deliveryLocation: 'Mumbai, Maharashtra',
      deadline: pastDate,
      status: RfqStatus.CLOSED,
    },
  });

  // 4. Create Sample Quotation for RFQ 1
  await prisma.quotation.create({
    data: {
      rfqId: rfq1.id,
      supplierId: supplier1.id,
      quotedPrice: 450000.0,
      estimatedDeliveryTime: '10 business days',
      message: 'We can supply all 500 ergonomic chairs with a 2-year warranty, on-site assembly, and free freight shipping.',
    },
  });

  console.log('Seed completed successfully!');
  console.log({
    buyers: [buyer1.email, buyer2.email],
    suppliers: [supplier1.email, supplier2.email],
    rfqCount: 4,
  });
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

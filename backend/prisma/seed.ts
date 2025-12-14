import prisma from '../src/prisma/client';
import bcrypt from 'bcrypt';

async function main() {
  const adminEmail = 'admin'; // Using username 'admin' as requested
  const adminPassword = 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { username: adminEmail },
    update: {
      password: hashedPassword,
      isAdmin: true,
    },
    create: {
      username: adminEmail,
      password: hashedPassword,
      isAdmin: true,
    },
  });

  console.log('Admin user created/verified:', admin);

  // Seed some sweets if they don't exist
  const sweetsCount = await prisma.sweet.count();
  if (sweetsCount === 0) {
    await prisma.sweet.createMany({
      data: [
        { name: 'Chocolate Fudge', category: 'Fudge', price: 5.99, quantity: 20 },
        { name: 'Gummy Bears', category: 'Gummies', price: 2.50, quantity: 50 },
        { name: 'Lollipop', category: 'Hard Candy', price: 0.99, quantity: 100 },
        { name: 'Dark Chocolate Truffles', category: 'Chocolate', price: 12.99, quantity: 15 },
        { name: 'Sour Worms', category: 'Gummies', price: 3.00, quantity: 5 }, // Low stock
      ],
    });
    console.log('Initial sweets seeded');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

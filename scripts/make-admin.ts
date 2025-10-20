import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  
  if (!email) {
    console.log('\n❌ Usage: bun run scripts/make-admin.ts <email>\n');
    console.log('Example: bun run scripts/make-admin.ts user@example.com\n');
    
    // Show all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
      },
    });
    
    if (users.length > 0) {
      console.log('📋 Available users:\n');
      users.forEach((user) => {
        const adminBadge = user.isAdmin ? '👑 ADMIN' : '';
        console.log(`  ${user.name} <${user.email}> ${adminBadge}`);
      });
      console.log('');
    } else {
      console.log('⚠️  No users found in database. Create an account first!\n');
    }
    
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log(`\n❌ User with email "${email}" not found!\n`);
    process.exit(1);
  }

  if (user.isAdmin) {
    console.log(`\n✅ ${user.name} (${user.email}) is already an admin!\n`);
    process.exit(0);
  }

  await prisma.user.update({
    where: { email },
    data: { isAdmin: true },
  });

  console.log(`\n✅ Success! ${user.name} (${user.email}) is now an ADMIN! 👑\n`);
  console.log(`   You can now access the admin panel at: /admin\n`);
}

main()
  .catch((error) => {
    console.error('\n❌ Error:', error.message, '\n');
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());


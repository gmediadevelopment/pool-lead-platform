const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Database Connection Test (Standalone) ---');
    console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);

    try {
        console.log('Attempting to connect to database...');
        const userCount = await prisma.user.count();
        console.log('SUCCESS! User count:', userCount);
    } catch (error) {
        console.error('FAILED to connect!');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        if (error.stack) {
            console.error('Stack Trace:', error.stack);
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();

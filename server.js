const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

// Try to load .env manually just in case
try {
    const dotenv = require('dotenv');
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
        console.log('.env file loaded from', envPath);
    } else {
        dotenv.config(); // Fallback to default
    }
} catch (e) {
    console.log('dotenv loading issue:', e.message);
}

const logFile = path.join(__dirname, 'debug.log');
const log = (msg) => {
    const entry = `[${new Date().toISOString()}] ${msg}\n`;
    try {
        fs.appendFileSync(logFile, entry);
    } catch (e) { }
    process.stdout.write(entry);
};

// Redirect console to our log file to capture Next.js logs
console.log = log;
console.error = log;


process.on('uncaughtException', (err) => {
    log(`UNCAUGHT EXCEPTION: ${err.message}\n${err.stack}`);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    log(`UNHANDLED REJECTION at: ${promise} reason: ${reason}`);
});


log('--- Server starting (v1.4 - EL9 Engine Test) ---');
log(`Startup time: ${new Date().toISOString()}`);
log(`NODE_ENV: ${process.env.NODE_ENV}`);
log(`DATABASE_URL present: ${!!process.env.DATABASE_URL}`);
if (process.env.DATABASE_URL) {
    log(`DATABASE_URL starts with: ${process.env.DATABASE_URL.substring(0, 15)}...`);
}
log(`NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`);
log(`Available Env Keys: ${Object.keys(process.env).filter(k => !k.includes('SECRET') && !k.includes('PASS')).join(', ')}`);

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

// Startup Database Test
async function checkDatabase() {
    log('Running Startup Database Check...');
    try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        log('Prisma Client required. Attempting count...');
        const count = await prisma.user.count();
        log(`Database Check SUCCESS. User count: ${count}`);
        await prisma.$disconnect();
    } catch (err) {
        log(`CRITICAL: Startup Database Check FAILED: ${err.message}`);
        log(err.stack);
    }
}

app.prepare().then(async () => {
    log('Next.js app prepared');
    await checkDatabase();

    createServer(async (req, res) => {
        log(`Incoming request: ${req.method} ${req.url}`);
        try {
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            log(`CRASH during request ${req.url}: ${err.message}\n${err.stack}`);
            if (!res.headersSent) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                    error: 'Internal Server Error',
                    message: err.message,
                    stack: dev ? err.stack : undefined
                }));
            }
        }
    }).listen(port, (err) => {
        if (err) {
            log(`FAILED to listen: ${err.message}`);
            throw err;
        }
        log(`Server listening on port ${port}`);
    });
}).catch((err) => {
    log(`CRITICAL: Next.js preparation failed: ${err.message}`);
    log(err.stack);
    process.exit(1);
});




const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

// Force Prisma/MySQL to use 127.0.0.1 to avoid IPv6 (::1) access denied errors on Hostinger
function forceIpv4() {
    if (process.env.DATABASE_URL && (process.env.DATABASE_URL.includes('main-hosting.eu') || process.env.DATABASE_URL.includes('localhost'))) {
        process.env.DATABASE_URL = process.env.DATABASE_URL.replace(/@([^:/]+)/, '@127.0.0.1');
        return true;
    }
    return false;
}

// Try to load .env manually just in case
try {
    const dotenv = require('dotenv');
    const envPaths = [path.join(__dirname, '.env'), path.join(__dirname, 'hostinger.env')];
    let loaded = false;
    for (const envPath of envPaths) {
        if (fs.existsSync(envPath)) {
            dotenv.config({ path: envPath, override: true });
            console.log('.env file loaded from', envPath);
            loaded = true;
            break;
        }
    }
    if (!loaded) dotenv.config();

    if (forceIpv4()) {
        console.log('DATABASE_URL hostname forced to 127.0.0.1 (IPv4)');
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


log('--- Server starting (v2.4 - Stable Config, No Startup DB Check) ---');
log(`Startup time: ${new Date().toISOString()}`);
log(`NODE_ENV: ${process.env.NODE_ENV}`);
log(`DATABASE_URL present: ${!!process.env.DATABASE_URL}`);
if (process.env.DATABASE_URL) {
    const masked = process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@');
    log(`DATABASE_URL (masked): ${masked}`);
}
log(`NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`);

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

// Direct MySQL Driver Test (for diagnostics only)
async function checkMysqlDirect() {
    log('Running Direct MySQL Driver Check...');
    try {
        const mysql = require('mysql2/promise');
        const url = process.env.DATABASE_URL;
        if (!url) throw new Error('DATABASE_URL is missing');

        log('Attempting direct connection with mysql2...');
        const connection = await mysql.createConnection(url);
        log('Direct MySQL Connection: SUCCESS!');
        await connection.end();
        return true;
    } catch (err) {
        log(`Direct MySQL Connection: FAILED - ${err.message}`);
        return false;
    }
}

// DISABLED: Prisma startup check to prevent crashes
async function checkDatabase() {
    log('Prisma startup check DISABLED to prevent server crashes');
    log('Database connectivity will be tested on first API request');
    await checkMysqlDirect();
}

app.prepare().then(() => {
    log('Next.js app prepared');

    // START DB CHECK IN BACKGROUND
    checkDatabase().catch(err => log(`Background DB Check Error: ${err.message}`));

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




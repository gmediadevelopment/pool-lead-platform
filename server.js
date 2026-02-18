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
    const envPaths = [path.join(__dirname, '.env.local'), path.join(__dirname, '.env'), path.join(__dirname, 'hostinger.env')];
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

    // Load Google Sheets credentials from JSON file if not already set
    if (!process.env.GOOGLE_SHEETS_CREDENTIALS && !process.env.GOOGLE_CLIENT_EMAIL) {
        const credentialsPath = path.join(__dirname, 'google-sheets-credentials.json');
        if (fs.existsSync(credentialsPath)) {
            const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
            process.env.GOOGLE_CLIENT_EMAIL = credentials.client_email;
            process.env.GOOGLE_PRIVATE_KEY = credentials.private_key;
            process.env.GOOGLE_SHEETS_SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '1uauVteOX5d9nK0nEaJ_wfw_jinRZCZFSrtB0Ge--nJE';
            process.env.GOOGLE_SHEETS_RANGE = process.env.GOOGLE_SHEETS_RANGE || 'Sheet1!A:Z';
            console.log('Google Sheets credentials loaded from google-sheets-credentials.json');
        }
    }

    if (forceIpv4()) {
        console.log('DATABASE_URL hostname forced to 127.0.0.1 (IPv4)');
    }
} catch (e) {
    console.log('dotenv loading issue:', e.message);
}

// Hardcoded fallback variables for Hostinger (used when no .env.local exists after build)
if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'mysql://u328068506_admin:ao3957vabzikuikhfSFAIJFG@127.0.0.1:3306/u328068506_main';
}
if (!process.env.NEXTAUTH_SECRET) {
    process.env.NEXTAUTH_SECRET = '7xK9mP2nQ5vL8wR3tY6uI1oA4sD7fG0hJ2kL5zX8cV9b';
}
if (!process.env.NEXTAUTH_URL) {
    process.env.NEXTAUTH_URL = 'https://marktplatz.poolbau-vergleich.de';
}
if (!process.env.STRIPE_PUBLIC_KEY) {
    process.env.STRIPE_PUBLIC_KEY = 'pk_test_51T2AYB2XUA5NPEWSuEk5R9azHVg9uoIBHJhrIMghcRxfhn2Qw3KI1sUDh3PzXi9GOPGS7HkTJJnVbQVU7GRu5W6N0018R22Mwa';
}
if (!process.env.STRIPE_SECRET_KEY) {
    process.env.STRIPE_SECRET_KEY = 'sk_test_51T2AYB2XUA5NPEWSXPHrHDT9MsbNb40XA7ka8nP0KcIGKY7BF49AV8QbNYa9DYvut41rWYy0eM3aBVksxIhSjm4C00v4sR11vu';
}
if (!process.env.STRIPE_WEBHOOK_SECRET) {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_yK8TZEDtTDnjOcHA6QNXPmMv0yVkWtbp';
}
if (!process.env.GOOGLE_CLIENT_EMAIL) {
    process.env.GOOGLE_CLIENT_EMAIL = 'pool-lead-sheets-sync@pool-lead-platform.iam.gserviceaccount.com';
}
if (!process.env.GOOGLE_SHEETS_SPREADSHEET_ID) {
    process.env.GOOGLE_SHEETS_SPREADSHEET_ID = '1uauVteOX5d9nK0nEaJ_wfw_jinRZCZFSrtB0Ge--nJE';
}
if (!process.env.GOOGLE_SHEETS_RANGE) {
    process.env.GOOGLE_SHEETS_RANGE = 'Leads!A:Z';
}
if (!process.env.CRON_SECRET) {
    process.env.CRON_SECRET = '2a3c46054d7dd4197bcc3cc0c31510e1a46ec2b7828d9d3fc2e7843993830866';
}
if (!process.env.GOOGLE_PRIVATE_KEY) {
    process.env.GOOGLE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDOEtyqqPd4IBAC\nGTf/AQ5oS+4ohbQKMBUICkWdNsz4BMLtg0eTVJeVgcjL5qGUbz6UEW//KsnRu2DN\nrnR+oovqhrRjorTFP7YhESMd+pWhNQ2A6bnUK8dIb7bsRfdzRzFETs56noILURIo\njY3pqPJD74L+aiSYbdr60Ts9SlG9lwked8SUoxzFzYnWBvbAqMJ7WkPSodh+2A/I\nZQJvLcHXxoG3Bhl9lQkvtDoa+bLFFRHc7P3P2DYXcYLRdTqGy/scobl0DLuqkzM3\nyqBEp3uYhW7KcOtR0sHxyOrc7+eYssMOitWb3ouoJq+7981lt0GkNRb5htyY7Zil\n8zVkrk0lAgMBAAECggEAL7ohnmr8ybcPThUeKXLKrfAsC/mPba6eKFsMrXE0PpsH\ntG+rw50bcHZ7FXJoaNLs+Oki+cOks20E6g4mD/BAnIQvQkY8PNTZL0ZjTj2rqwb5\nBirbrZ6oDIhHIui/e1T5PZtM6gxNDSbtIDRMslm9JmvR+G+H4z/KMD4GTNcqIFDw\npdmnnJvmh/ZWjkjyxPsSzZ6ZBy7f/lZmPOV7YRSQckdzrZtsGpR9noDnGIXYOVhT\naA77/RTxwZG5yAOiZIwtMT+/V9HpeYfnGwSuB3/p+jj3oHJjegcNPobOQr9Gs7mr\n0Rz5R94+o8Czz2nsYYTS8MMmvoG8RPk3jDVAAxDkEQKBgQD0K7JLuNis9kNfxcCX\nB1qIiU2sdybgmiUZ6G7ELXz+DdrrszCX+Wpv8dRSMmsbGL4nEMUypbq/QtY/Jk3m\nyH0wu5C06Yzw0/miw2YQUJnRSAD6PWEgTKKXQp83+8TWE04c/WC84TKQZQJta7s+\nxYCuTJzCYlE1o9By7F27oTpO+QKBgQDYDqvHByCtsbkPT+SrIfyfwO3B/WDbWkGy\nILK7hwks/AFk979zOxN/T3T/01uEp1RZbFvOtIspwuF0XW/LFXhLKz1h0Sv0gbCz\nuyyoxumfhJveJnc94P5KHNU800uct0BGy3x67Oxq8t7p3/KNgVYqi0d7u+Bj3HS/\nshCpMZS+jQKBgQDWXm7A8F67K9JnCTVW44vmh7V8D3hAhNTB9EEbV1x/qCZl/QJS\nyxVZhxWDvOQv+/8mSSD4oGxecw2qj7ShQ7A10tbvHoUxAsoOzkKTXFBPX0oMaUsW\nknHFHyaufgqIcJaJ+SKvcX91KlmBO64/JCMf4/9U4gCueU4PN9nrW1fX8QKBgFkZ\nu8eJbfWTrGDfLstQadEsDCELMC1lzF/8Uhk5+BPAHYcZELAhtcmz5+k0rbJIG2YB\nZN8a36UqRDXr7pWO1hwRye+UBo+ACHImh6VW2rO5SVpU/KndJqFDwMCj1rPbcrt/\nYWeEW39Dh6Blha7LntBOvf0OHtyv5snDUlGkK9ZlAoGAbrGCLbjzlHe3xTuICSOd\nUIZIQcKHC3fGb3dr4HQ+Vk5NNzNQ1PQ1wK56DsCsvr7wQeKMr8Fw47srspKwmwWV\nW0IBceEgYQs1p5p6Q+fisjJobWpXbGVgNCoT9XWr/k3ksHrA+PpSOVxXUhLLJbyP\nszjWdVxXMyY2rBRbZD6q0r0=\n-----END PRIVATE KEY-----';
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




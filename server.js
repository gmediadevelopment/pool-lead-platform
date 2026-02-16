const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'debug.log');
const log = (msg) => {
    const entry = `[${new Date().toISOString()}] ${msg}\n`;
    fs.appendFileSync(logFile, entry);
    console.log(msg);
};

log('--- Server starting ---');
log(`NODE_ENV: ${process.env.NODE_ENV}`);
log(`DATABASE_URL present: ${!!process.env.DATABASE_URL}`);
log(`NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`);

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    log('Next.js app prepared');
    createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            log(`ERROR during request ${req.url}: ${err.message}`);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                error: 'Internal Server Error',
                message: err.message,
                stack: dev ? err.stack : undefined
            }));
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



const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Check if we are in production
const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;

// On Hostinger Passenger, the app root should be explicitly set
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    }).listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on port ${port}`);
    });
}).catch((err) => {
    console.error('Next.js preparation failed', err);
    process.exit(1);
});


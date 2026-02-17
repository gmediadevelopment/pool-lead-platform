const path = require("path");

process.env.NODE_ENV = process.env.NODE_ENV || "production";

const appRoot = path.resolve(__dirname);
process.env.PASSENGER_APP_ROOT = appRoot;

// Startup file for Next.js custom server
process.env.PASSENGER_STARTUP_FILE = "server.js";

module.exports = function (passenger) {
    passenger.on("startup", () => {
        console.log("Passenger starting Node.js app...");
    });
    return require(path.join(appRoot, process.env.PASSENGER_STARTUP_FILE));
};

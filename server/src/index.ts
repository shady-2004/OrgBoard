const dotenv = require("dotenv");
dotenv.config();

// Import the Express app
const app = require("./app").default;

// Vercel serverless function handler
module.exports = app;

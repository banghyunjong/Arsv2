// Vercel serverless entry point
// Pre-built dist/app.js를 로드해서 Express app을 export
const { createApp } = require('../dist/app');
const { app } = createApp();
module.exports = app;

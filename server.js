const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Import your original app, but don't use it directly
const apiApp = require('./src/app');

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const API_BASE_URL = process.env.API_BASE_URL || `http://localhost:${PORT}/api`;

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('API_BASE_URL', process.env.API_BASE_URL);

// Create a new Express application
const app = express();

// Mount your API routes from the original app
app.use('/api', apiApp);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`API available at ${API_BASE_URL}`);
    console.log(`Swagger docs at ${API_BASE_URL}/docs`);
});
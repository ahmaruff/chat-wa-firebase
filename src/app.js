const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

const chatRoutes = require('./chat/interface/routes/chat.routes');
const waRoutes = require('./whatsapp/interface/routes/whatsapp.routes');

dotenv.config();

const app = express();


// === Middleware ===
app.use(express.json());

// CORS Middleware
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS ? process.env.CORS_ALLOWED_ORIGINS.split(',') : ['http://localhost:5173'];

console.log('CORS_ALLOWED_ORIGINS:', process.env.CORS_ALLOWED_ORIGINS);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));


// === Routes ===
app.get('/', (req, res) => {
    res.json({
        app_name: "Webhook Chat",
        description: "webhook chat",
    });
});

// Swagger Docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/chats', chatRoutes);
app.use('/whatsapp', waRoutes);

// === Error Handling ===
// 404
app.use((req, res, next) => {
    res.status(404).json({ status: 'fail', code: 404, message: 'Route Not Found', data: null });
});

// General Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ status: 'error', code: 500, message: 'Internal Server Error', data: null });
});

module.exports = app;
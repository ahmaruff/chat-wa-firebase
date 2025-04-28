// const swaggerJsdoc = require('swagger-jsdoc');
// const swaggerUi = require('swagger-ui-express');

const swaggerJSdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Webhook Chat APIs',
      version: '1.0.0',
      description: 'Webhook',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Local API server'
      },
    ],
  },
  apis: ['./src/**/*.routes.js'],
};

const swaggerSpec = swaggerJSdoc(options);

module.exports = swaggerSpec;

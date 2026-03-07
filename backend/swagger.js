const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SmartAttend API",
      version: "1.0.0",
      description: "API Documentation for SmartAttend Project",
    },
    servers: [
      {
        url: "https://smartattend-s6la.onrender.com/",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"], // very important for your structure
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };

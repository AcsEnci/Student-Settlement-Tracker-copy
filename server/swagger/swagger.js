const swaggerJsdoc = require("swagger-jsdoc");
const studentSchemas = require("./schemas/student");


const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Student API",
      version: "1.0.0",
      description: "API for managing students",
    },
    servers: [
      {
        url: "http://localhost:8080",
      },
    ],
    components: {
      schemas: studentSchemas,
    },
  },
  apis: ["./server.js"],
});

module.exports = swaggerSpec;

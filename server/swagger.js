const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Bookshelf API Documentation",
      version: "1.0.0",
      description:
        "Introducing Bookshelf API: Explore, Collect, Share. Your go-to for storing and sharing your favorite books.",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsDoc(options);

module.exports = (app) => {
  app.use("/", swaggerUI.serve, swaggerUI.setup(specs));
};

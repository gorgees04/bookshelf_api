const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const YAML = require("yamljs");

const path = require("path");
const filePath = path.resolve(__dirname, "swagger.yaml");

const options = {
  definition: YAML.load(filePath),
  apis: ["./routes/*.js"],
};

const specs = swaggerJsDoc(options);

module.exports = (app) => {
  app.use("/api-doc", swaggerUI.serve, swaggerUI.setup(specs));
};

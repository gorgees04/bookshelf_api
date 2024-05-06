const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const YAML = require("yamljs");
require("dotenv").config();

const path = require("path");
const filePath = path.resolve(__dirname, "swagger.yaml");

let swaggerDocument = YAML.load(filePath);

// Replace the placeholder with the actual SERVER_URL from environment variables
const SERVER_URL = process.env.SERVER_URL;
swaggerDocument.servers = [{ url: `${SERVER_URL}/api` }];

const options = {
  definition: swaggerDocument,
  apis: ["./routes/*.js"],
};

const specs = swaggerJsDoc(options);

module.exports = (app) => {
  // Customize Swagger UI configuration
  const swaggerUIOptions = {
    customSiteTitle: "Bookshelf API doc",
    swaggerOptions: {
      // Add support for file upload in request parameters
      plugins: [
        {
          // Use a plugin to customize Swagger UI
          Upload: function (system) {
            return {
              wrapComponents: {
                parameters:
                  (Original, { React }) =>
                  (props) => {
                    if (props.schema && props.schema.format === "binary") {
                      // Add a file upload input for parameters of type 'file'
                      return `
                      <div class="form-group">
                        <label for="${props.name}">${props.name}</label>
                        <input type="file" id="${props.name}" name="${props.name}" onchange="handleFileChange(event)">
                      </div>
                    `;
                    }
                    // Render the original parameter component for other types
                    return Original(props);
                  },
              },
            };
          },
        },
      ],
    },
  };

  // Set up Swagger UI with custom options
  app.use(
    "/api-doc",
    swaggerUI.serve,
    swaggerUI.setup(specs, swaggerUIOptions)
  );
};

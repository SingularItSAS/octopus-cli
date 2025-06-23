# Octopus CLI - KrakenD Endpoint Generator

A powerful CLI tool that automatically generates KrakenD API Gateway endpoints from OpenAPI 3.1.0 YAML specifications. This tool streamlines the process of setting up microservice API gateways by parsing your OpenAPI documentation and creating ready-to-use KrakenD configuration files.

## 🚀 Features

- **OpenAPI 3.1.0 Support**: Full compatibility with modern OpenAPI specifications
- **Automatic Endpoint Generation**: Converts OpenAPI paths to KrakenD endpoints
- **Role-Based Access Control**: Extracts and applies roles from `x-roles` extensions
- **Server Path Detection**: Automatically detects and applies server base paths
- **Tag-Based Organization**: Groups endpoints by OpenAPI tags for better organization
- **Header Management**: Automatically extracts and configures required headers
- **Environment Variables**: Generates environment-based host configurations
- **JSON & YAML Support**: Process both OpenAPI JSON and YAML files

## 📋 Prerequisites

- Node.js 16+ 
- npm or yarn
- TypeScript knowledge (for development)

## 🛠 Installation

### Global Installation (Recommended)

```bash
npm install -g @singularit/octopus-cli
```

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/singularit/octopus-cli.git
   cd singularit-octopus-cli
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Link globally (optional)**
   ```bash
   npm link
   ```

## 📖 Usage

The CLI provides several commands to work with OpenAPI specifications and generate KrakenD endpoints.

### Basic Commands

#### List Endpoints
View all endpoints detected in your OpenAPI specification:

```bash
# If installed globally
octo-singular list --file path/to/your-openapi.yaml

# Using npx
npx @singularit/octopus-cli list --file path/to/your-openapi.yaml

# Development mode
npx ts-node src/index.ts list --file path/to/your-openapi.yaml
```

**Example Output:**
```
📋 Endpoints found in OpenAPI spec:
└── Authentication
    ├── POST /api/my-service/auth/login
    └── POST /api/my-service/auth/register
└── Users
    ├── GET /api/my-service/users [Roles: Admin, Manager]
    ├── PUT /api/my-service/users/{id}
    └── DELETE /api/my-service/users/{id}
```

#### Generate KrakenD Endpoints
Generate KrakenD configuration files organized by tags:

```bash
# If installed globally - with project name
octo-singular openapi -f path/to/your-openapi.yaml -p "my-service"

# Using npx - with project name
npx @singularit/octopus-cli openapi -f path/to/your-openapi.yaml -p "my-service"

# With custom output directory
octo-singular openapi -f path/to/your-openapi.yaml -p "my-service" -o ./generated-endpoints

# Development mode
npx ts-node src/index.ts openapi -f path/to/your-openapi.yaml -p "my-service"

# Example with Spring Boot generated OpenAPI JSON
octo-singular openapi -f /path/to/backend-api/build/classes/java/main/META-INF/swagger/backend-springboot-app.json -p "project-name"
```

This command will create separate JSON files for each tag found in your OpenAPI specification.

### Command Options

| Option | Alias | Description | Required |
|--------|-------|-------------|----------|
| `--file` | `-f` | Path to the OpenAPI YAML/JSON file | ✅ |
| `--project` | `-p` | Project name for environment variables | ✅ |
| `--output` | `-o` | Output directory for generated files | ❌ |
| `--config` | `-c` | Path to configuration file | ❌ |

## 📁 Project Structure

```
src/
├── commands/           # CLI command implementations
│   ├── init.ts         # Initialize command
│   ├── list.ts         # List endpoints command
│   └── openapi.ts      # Generate endpoints command
├── models/             # TypeScript interfaces
│   ├── ApiGatewayEndpoint.ts
│   ├── Backend.ts
│   ├── OctopusConfig.ts
│   ├── OpenApiEndpoint.ts
│   └── YamlEntry.ts
├── services/           # Core business logic
│   ├── configChecker.ts
│   ├── configLoader.ts
│   ├── endpointExporter.ts
│   ├── endpointLister.ts
│   ├── krakendAppender.ts
│   ├── krakendEndpointGenerator.ts
│   └── utils.ts
├── config/             # Configuration files
│   ├── banner.ts
│   ├── commandBuilder.ts
│   ├── inputHeaders.ts
│   └── setup.ts
└── index.ts           # CLI entry point
```

## 🔧 How It Works

### 1. OpenAPI Parsing
The tool parses OpenAPI 3.1.0 YAML files and extracts:
- **Paths**: All API endpoints
- **Methods**: HTTP methods (GET, POST, PUT, DELETE, etc.)
- **Tags**: For organizing endpoints
- **Parameters**: Headers and query parameters
- **Security**: Role-based access control from `x-roles`
- **Servers**: Base path configuration

### 2. Server Path Detection
The tool automatically detects the server base path from the OpenAPI `servers` section:

```yaml
servers:
  - url: http://localhost:8080/api/my-service
```

Results in base path: `/api/my-service`

### 3. Role Extraction
Roles are extracted from the `x-roles` extension in your OpenAPI specification:

```yaml
/users:
  get:
    x-roles:
      roles: "Admin,Manager,User"
```

### 4. Endpoint Generation
Each OpenAPI operation is converted to a KrakenD endpoint with:

```json
{
  "endpoint": "/api/my-service/users",
  "method": "GET",
  "input_query_strings": ["*"],
  "input_headers": ["Authorization", "Content-Type"],
  "output_encoding": "no-op",
  "roles": ["Admin", "Manager", "User"],
  "backend": [
    {
      "host_env": ["MY_SERVICE_HOST"],
      "url_pattern": "/api/my-service/users"
    }
  ]
}
```

## 📋 Example Usage

### Sample OpenAPI YAML
```yaml
openapi: 3.1.0
info:
  title: "My Service API"
  version: "1.0.0"
servers:
  - url: http://localhost:8080/api/my-service

paths:
  /users:
    get:
      tags:
        - Users
      summary: Get all users
      x-roles:
        roles: "Admin,Manager"
      parameters:
        - name: Authorization
          in: header
          required: true
          schema:
            type: string
      responses:
        '200':
          description: OK
  /products:
    post:
      tags:
        - Products
      summary: Create product
      x-roles:
        roles: "Admin"
      responses:
        '201':
          description: Created
```

### Generated Output
Running the CLI on the above YAML will generate a `users.json` file:

```json
{
  "controller": "users",
  "endpoints": [
    {
      "endpoint": "/api/my-service/users",
      "method": "GET",
      "input_query_strings": ["*"],
      "input_headers": ["Authorization", "Content-Type"],
      "output_encoding": "no-op",
      "roles": ["Admin", "Manager"],
      "backend": [
        {
          "host_env": ["MY_SERVICE_HOST"],
          "url_pattern": "/api/my-service/users"
        }
      ]
    }
  ]
}
```

And a `products.json` file:

```json
{
  "controller": "products",
  "endpoints": [
    {
      "endpoint": "/api/my-service/products",
      "method": "POST",
      "input_query_strings": ["*"],
      "input_headers": ["Authorization", "Content-Type"],
      "output_encoding": "no-op",
      "roles": ["Admin"],
      "backend": [
        {
          "host_env": ["MY_SERVICE_HOST"],
          "url_pattern": "/api/my-service/products"
        }
      ]
    }
  ]
}
```

## 🔧 Configuration

### Environment Variables
The generated endpoints use environment variables for host configuration:

```bash
# Set your backend host
export MY_SERVICE_HOST=http://your-backend:8080
```

### Custom Configuration
You can provide a custom configuration file:

```bash
octo-singular openapi --file api.yaml --project "my-service" --config custom-config.json
```

## 🛠 Development

### Building the Project
```bash
npm run build
```

### Running Tests
```bash
npm test
```

### Development Mode
```bash
npm run dev
```

## 🚀 Publishing to NPM

### Prerequisites
- NPM account with access to `@singularit` scope
- Proper authentication setup

### Steps
1. **Build the project**
   ```bash
   npm run build
   ```

2. **Version bump (if needed)**
   ```bash
   npm version patch  # or minor/major
   ```

3. **Publish to NPM**
   ```bash
   npm publish --access public
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## 📝 Advanced Features

### Custom Role Mapping
The tool supports custom role extraction from OpenAPI extensions:

```yaml
paths:
  /admin/users:
    get:
      x-roles:
        roles: "SuperAdmin,Admin"
      x-custom-auth:
        level: "high"
```

### Multi-Server Support
Support for multiple server configurations:

```yaml
servers:
  - url: http://localhost:8080/api/v1
    description: Development server
  - url: https://api.example.com/v1
    description: Production server
```

### Header Customization
Automatic extraction of custom headers from parameters:

```yaml
parameters:
  - name: X-Custom-Header
    in: header
    required: true
    schema:
      type: string
```

### Spring Boot Integration
Perfect integration with Spring Boot applications that generate OpenAPI documentation:

```bash
# Generate from Spring Boot OpenAPI JSON
octo-singular openapi -f ./build/classes/java/main/META-INF/swagger/my-app.json -p "my-service"

# Or from a web endpoint
curl http://localhost:8080/v3/api-docs -o api-docs.json
octo-singular openapi -f api-docs.json -p "my-service"
```

### Project Naming Convention
The project name affects the environment variable names:

- Project: `"user-service"` → Environment: `USER_SERVICE_HOST`
- Project: `"ProductAPI"` → Environment: `PRODUCTAPI_HOST`
- Project: `"my_backend"` → Environment: `MY_BACKEND_HOST`

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid OpenAPI YAML"**
   - Ensure your YAML file is valid OpenAPI 3.1.0 format
   - Check for syntax errors in the YAML

2. **"No endpoints found"**
   - Verify that your OpenAPI spec has a `paths` section
   - Ensure paths contain valid HTTP methods

3. **"Permission denied"**
   - Check file permissions for the output directory
   - Ensure you have write access to the target folder

### Debug Mode
Enable verbose logging:

```bash
DEBUG=octopus-cli octo-singular openapi --file api.yaml --project "my-service"
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋‍♂️ Support

If you encounter any issues or have questions:

1. Check the [troubleshooting section](#🐛-troubleshooting)
2. Search existing issues in the repository
3. Create a new issue with detailed information

---

**Happy API Gateway building! 🐙**
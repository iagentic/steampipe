# Steampipe REST API

This package provides a REST API server for Steampipe, exposing all command-line functionality through HTTP endpoints.

## Features

- **Query Execution**: Execute SQL queries against cloud resources
- **Service Management**: Start, stop, restart, and check service status
- **Plugin Management**: Install, uninstall, update, and list plugins
- **Batch Operations**: Execute multiple queries in a single request
- **Health Checks**: Monitor API server health
- **Documentation**: Self-documenting API endpoints

## Usage

### Starting the API Server

```bash
# Start on default port 8080
steampipe api

# Start on custom port
steampipe api --port 9000

# Start on specific host
steampipe api --host 0.0.0.0 --port 8080
```

### API Endpoints

#### Health Check
```
GET /health
```

#### Query Execution
```
POST /api/v1/query
POST /api/v1/query/batch
```

#### Service Management
```
GET  /api/v1/service/status
POST /api/v1/service/start
POST /api/v1/service/stop
POST /api/v1/service/restart
```

#### Plugin Management
```
GET    /api/v1/plugins
POST   /api/v1/plugins/install
DELETE /api/v1/plugins/uninstall
PUT    /api/v1/plugins/update
```

#### Documentation
```
GET /api/v1/docs
```

## Examples

### Execute a Query

```bash
curl -X POST http://localhost:8080/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "SELECT * FROM aws_s3_bucket LIMIT 5",
    "output": "json",
    "timing": "on"
  }'
```

### Check Service Status

```bash
curl http://localhost:8080/api/v1/service/status
```

### List Plugins

```bash
curl http://localhost:8080/api/v1/plugins
```

## Architecture

The API server is built using:

- **Gorilla Mux**: HTTP router and URL matcher
- **Steampipe Core**: Reuses existing business logic
- **JSON**: Request/response format
- **Graceful Shutdown**: Proper cleanup on termination

## Security Considerations

- Currently runs without authentication
- Implement proper auth for production use
- Use HTTPS in production environments
- Add rate limiting for abuse prevention

## Development

### Adding New Endpoints

1. Add the route in `setupRoutes()`
2. Implement the handler function
3. Add tests
4. Update documentation

### Testing

Use the provided test script:

```bash
chmod +x examples/test-api.sh
./examples/test-api.sh
```

## Dependencies

- `github.com/gorilla/mux`: HTTP router
- Steampipe core packages for business logic

## License

Same as Steampipe project. 
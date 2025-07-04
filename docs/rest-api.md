# Steampipe REST API

The Steampipe REST API provides programmatic access to all Steampipe functionality through HTTP endpoints. This allows you to integrate Steampipe into your applications, automation scripts, and other tools.

## Getting Started

### Starting the API Server

```bash
# Start on default port 8080
steampipe api

# Start on custom port
steampipe api --port 9000

# Start on specific host
steampipe api --host 0.0.0.0 --port 8080
```

### Base URL

All API endpoints are prefixed with `/api/v1/`:

```
http://localhost:8080/api/v1/
```

## Authentication

Currently, the API server runs without authentication. In production environments, you should implement appropriate authentication and authorization mechanisms.

## API Endpoints

### Query Execution

#### Execute Single Query

**POST** `/api/v1/query`

Execute a single SQL query and return results in JSON format.

**Request Body:**
```json
{
  "sql": "SELECT * FROM aws_s3_bucket LIMIT 5",
  "output": "json",
  "timing": "on",
  "search_path": ["aws", "public"]
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "arn": "arn:aws:s3:::my-bucket",
      "name": "my-bucket",
      "region": "us-east-1"
    }
  ],
  "columns": ["arn", "name", "region"],
  "row_count": 1,
  "timing": {
    "duration_ms": 1250,
    "rows_returned": 1,
    "uncached_rows_fetched": 1,
    "cached_rows_fetched": 0,
    "hydrate_calls": 5,
    "connection_count": 1
  }
}
```

#### Execute Batch Queries

**POST** `/api/v1/query/batch`

Execute multiple SQL queries in a single request.

**Request Body:**
```json
{
  "queries": [
    {
      "sql": "SELECT COUNT(*) as bucket_count FROM aws_s3_bucket",
      "output": "json"
    },
    {
      "sql": "SELECT COUNT(*) as user_count FROM aws_iam_user",
      "output": "json"
    }
  ]
}
```

**Response:**
```json
{
  "results": [
    {
      "success": true,
      "data": [{"bucket_count": 5}],
      "columns": ["bucket_count"],
      "row_count": 1
    },
    {
      "success": true,
      "data": [{"user_count": 12}],
      "columns": ["user_count"],
      "row_count": 1
    }
  ]
}
```

### Service Management

#### Get Service Status

**GET** `/api/v1/service/status`

Get the current status of the Steampipe service.

**Response:**
```json
{
  "running": true,
  "port": 9193,
  "database": "steampipe",
  "user": "steampipe",
  "connection_string": "postgres://steampipe@localhost:9193/steampipe"
}
```

#### Start Service

**POST** `/api/v1/service/start`

Start the Steampipe service.

**Query Parameters:**
- `port` (optional): Port number (default: 9193)
- `listen_addresses` (optional): Comma-separated list of addresses (default: localhost)

**Response:**
```json
{
  "success": true,
  "message": "Service started successfully",
  "port": 9193,
  "database": "steampipe"
}
```

#### Stop Service

**POST** `/api/v1/service/stop`

Stop the Steampipe service.

**Query Parameters:**
- `force` (optional): Force stop (default: false)

**Response:**
```json
{
  "success": true,
  "message": "Service stopped successfully"
}
```

#### Restart Service

**POST** `/api/v1/service/restart`

Restart the Steampipe service.

**Query Parameters:**
- `port` (optional): Port number (default: 9193)
- `listen_addresses` (optional): Comma-separated list of addresses (default: localhost)

**Response:**
```json
{
  "success": true,
  "message": "Service restarted successfully",
  "port": 9193,
  "database": "steampipe"
}
```

### Plugin Management

#### List Plugins

**GET** `/api/v1/plugins`

List all installed plugins.

**Response:**
```json
{
  "plugins": [
    {
      "name": "turbot/aws",
      "version": "0.118.0",
      "connections": ["aws_001", "aws_002"]
    },
    {
      "name": "turbot/azure",
      "version": "0.45.0",
      "connections": ["azure_001"]
    }
  ]
}
```

#### Install Plugin

**POST** `/api/v1/plugins/install`

Install a new plugin.

**Request Body:**
```json
{
  "name": "aws",
  "version": "0.118.0"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Plugin aws installation initiated"
}
```

#### Uninstall Plugin

**DELETE** `/api/v1/plugins/uninstall?name=aws`

Uninstall a plugin.

**Query Parameters:**
- `name`: Plugin name to uninstall

**Response:**
```json
{
  "success": true,
  "message": "Plugin aws uninstallation initiated"
}
```

#### Update Plugin

**PUT** `/api/v1/plugins/update`

Update an existing plugin.

**Request Body:**
```json
{
  "name": "aws",
  "version": "0.119.0"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Plugin aws update initiated"
}
```

### Utility Endpoints

#### Health Check

**GET** `/health`

Check if the API server is running.

**Response:**
```json
{
  "status": "healthy",
  "time": "2024-01-15T10:30:00Z"
}
```

#### API Documentation

**GET** `/api/v1/docs`

Get API documentation and available endpoints.

**Response:**
```json
{
  "version": "1.0.0",
  "endpoints": {
    "query": {
      "POST /api/v1/query": "Execute a single SQL query",
      "POST /api/v1/query/batch": "Execute multiple SQL queries"
    },
    "service": {
      "GET /api/v1/service/status": "Get service status",
      "POST /api/v1/service/start": "Start the service",
      "POST /api/v1/service/stop": "Stop the service",
      "POST /api/v1/service/restart": "Restart the service"
    },
    "plugins": {
      "GET /api/v1/plugins": "List installed plugins",
      "POST /api/v1/plugins/install": "Install a plugin",
      "DELETE /api/v1/plugins/uninstall": "Uninstall a plugin",
      "PUT /api/v1/plugins/update": "Update a plugin"
    }
  }
}
```

## Error Handling

All API endpoints return appropriate HTTP status codes:

- `200 OK`: Request successful
- `400 Bad Request`: Invalid request parameters
- `500 Internal Server Error`: Server error

Error responses include an error message:

```json
{
  "success": false,
  "error": "SQL query is required"
}
```

## Usage Examples

### Python Example

```python
import requests
import json

# Execute a query
response = requests.post('http://localhost:8080/api/v1/query', json={
    'sql': 'SELECT * FROM aws_s3_bucket LIMIT 5',
    'output': 'json'
})

if response.status_code == 200:
    result = response.json()
    print(f"Found {result['row_count']} buckets")
    for bucket in result['data']:
        print(f"- {bucket['name']}")
else:
    print(f"Error: {response.json()['error']}")
```

### JavaScript Example

```javascript
// Execute a query
const response = await fetch('http://localhost:8080/api/v1/query', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        sql: 'SELECT * FROM aws_s3_bucket LIMIT 5',
        output: 'json'
    })
});

const result = await response.json();
if (result.success) {
    console.log(`Found ${result.row_count} buckets`);
    result.data.forEach(bucket => {
        console.log(`- ${bucket.name}`);
    });
} else {
    console.error(`Error: ${result.error}`);
}
```

### cURL Example

```bash
# Execute a query
curl -X POST http://localhost:8080/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "SELECT * FROM aws_s3_bucket LIMIT 5",
    "output": "json"
  }'

# Get service status
curl http://localhost:8080/api/v1/service/status

# List plugins
curl http://localhost:8080/api/v1/plugins
```

## Configuration

The API server uses the same configuration as the Steampipe CLI. Configuration files are loaded from the same locations:

- `~/.steampipe/config/`
- Environment variables
- Command-line flags

## Security Considerations

1. **Authentication**: Implement authentication for production use
2. **Authorization**: Add role-based access control
3. **HTTPS**: Use HTTPS in production environments
4. **Rate Limiting**: Implement rate limiting to prevent abuse
5. **Input Validation**: Validate all input parameters
6. **Logging**: Enable comprehensive logging for audit trails

## Limitations

- The API server runs in the same process as the Steampipe service
- Long-running queries may timeout depending on your HTTP client configuration
- Large result sets are returned in memory (consider pagination for very large datasets)
- Plugin installation/uninstallation operations are asynchronous

## Troubleshooting

### Common Issues

1. **Service not running**: Ensure the Steampipe service is started before making API calls
2. **Port conflicts**: Use a different port if 8080 is already in use
3. **Permission errors**: Ensure the API server has necessary permissions to access Steampipe configuration
4. **Timeout errors**: Increase timeout values for long-running queries

### Debug Mode

Enable debug logging by setting the `STEAMPIPE_LOG_LEVEL` environment variable:

```bash
export STEAMPIPE_LOG_LEVEL=TRACE
steampipe api
``` 
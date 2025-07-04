# Steampipe REST API - Curl Reference

## Base URL
```
http://localhost:8080
```

## Health Check
```bash
curl -s http://localhost:8080/health | jq .
```

## API Documentation
```bash
curl -s http://localhost:8080/api/v1/docs | jq .
```

## Service Management

### Get Service Status
```bash
curl -s http://localhost:8080/api/v1/service/status | jq .
```

### Start Service
```bash
curl -s -X POST http://localhost:8080/api/v1/service/start | jq .
```

### Stop Service
```bash
curl -s -X POST http://localhost:8080/api/v1/service/stop | jq .
```

### Restart Service
```bash
curl -s -X POST http://localhost:8080/api/v1/service/restart | jq .
```

## Plugin Management

### List Plugins
```bash
curl -s http://localhost:8080/api/v1/plugins | jq .
```

### Install Plugin
```bash
curl -s -X POST http://localhost:8080/api/v1/plugins/install \
  -H "Content-Type: application/json" \
  -d '{"name": "plugin-name", "version": "1.0.0"}' | jq .
```

### Update Plugin
```bash
curl -s -X PUT http://localhost:8080/api/v1/plugins/update \
  -H "Content-Type: application/json" \
  -d '{"name": "plugin-name", "version": "2.0.0"}' | jq .
```

### Uninstall Plugin
```bash
curl -s -X DELETE "http://localhost:8080/api/v1/plugins/uninstall?name=plugin-name" | jq .
```

## Query Execution

### Single Query
```bash
curl -s -X POST http://localhost:8080/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{"sql": "SELECT version()"}' | jq .
```

### Batch Query
```bash
curl -s -X POST http://localhost:8080/api/v1/query/batch \
  -H "Content-Type: application/json" \
  -d '{"queries": ["SELECT 1 as query1", "SELECT 2 as query2"]}' | jq .
```

## Response Examples

### Successful Response
```json
{
  "success": true,
  "data": [...],
  "columns": [...],
  "row_count": 1
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## Notes
- Query execution may require authentication (steampipe login)
- All responses are in JSON format
- Use `jq .` for pretty-printed output
- Service runs on port 9193 by default
- API server runs on port 8080 by default 
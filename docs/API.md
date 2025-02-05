# API Documentation

## Authentication

All API endpoints require authentication using an API key. Include the key in the `X-API-Key` header:

```bash
curl -H "X-API-Key: your-api-key" https://your-domain.com/api/v1/services
```

## Rate Limiting

All endpoints are rate-limited. The current limits are:
- Status check creation: 10 requests per minute
- Status check results: 100 requests per minute
- Status check stats: 100 requests per minute

Rate limit information is returned in the headers:
- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when the rate limit resets

## Endpoints

### Services

#### GET /api/v1/services
List all services.

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "service-id",
      "name": "Service Name",
      "status": "operational",
      "description": "Service description"
    }
  ]
}
```

#### POST /api/v1/services
Create a new service.

Request:
```json
{
  "name": "Service Name",
  "description": "Service description",
  "monitoredUrl": "https://example.com"
}
```

### Status Checks

#### POST /api/v1/status-checks
Create a new status check.

Request:
```json
{
  "type": "http",
  "name": "Website Check",
  "target": "https://example.com",
  "interval": 60,
  "timeout": 30,
  "expectedStatusCode": 200
}
```

#### GET /api/v1/status-checks/results
Get status check results.

Query Parameters:
- `checkId`: ID of the status check
- `limit`: Number of results to return (default: 100)

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "result-id",
      "checkId": "check-id",
      "timestamp": "2025-02-02T05:06:07Z",
      "success": true,
      "latency": 150
    }
  ]
}
```

### Incidents

#### POST /api/v1/incidents
Create a new incident.

Request:
```json
{
  "title": "Service Outage",
  "description": "Investigating connectivity issues",
  "severity": "major",
  "serviceId": "service-id"
}
```

#### POST /api/v1/incidents/{id}/updates
Add an update to an incident.

Request:
```json
{
  "message": "Root cause identified",
  "status": "identified"
}
```

### Maintenance

#### POST /api/v1/maintenance
Schedule maintenance.

Request:
```json
{
  "title": "Database Upgrade",
  "description": "Scheduled maintenance for database upgrade",
  "startTime": "2025-02-03T00:00:00Z",
  "endTime": "2025-02-03T02:00:00Z",
  "services": ["service-id-1", "service-id-2"]
}
```

### Notifications

#### POST /api/v1/notifications/subscribe
Subscribe to notifications.

Request:
```json
{
  "email": "user@example.com",
  "serviceId": "service-id",
  "preferences": {
    "incidents": true,
    "maintenance": true,
    "statusChanges": true
  }
}
```

## WebSocket API

Connect to the WebSocket endpoint for real-time updates:

```javascript
const ws = new WebSocket('wss://your-domain.com/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle different message types
  switch (data.type) {
    case 'status_change':
      // Handle status change
      break;
    case 'incident_update':
      // Handle incident update
      break;
    // ...
  }
};
```

Message Types:
- `status_change`: Service status changes
- `incident_update`: New incident updates
- `maintenance_reminder`: Upcoming maintenance
- `ping`: Health check (respond with `pong`)

## Error Handling

All API endpoints use standard HTTP status codes and return errors in the following format:

```json
{
  "success": false,
  "error": {
    "code": "error_code",
    "message": "Human-readable error message"
  }
}
```

Common Error Codes:
- `invalid_request`: Missing or invalid parameters
- `not_found`: Resource not found
- `rate_limited`: Rate limit exceeded
- `unauthorized`: Invalid or missing API key

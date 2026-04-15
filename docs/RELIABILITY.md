# RELIABILITY — Error Handling and Observability

## Error Handling Strategy

### API Layer (Runtime)

- All route handlers catch errors and return `ApiResponse` with `success: false`
- HTTP status codes follow REST conventions (400 for bad input, 404 for not found, 500 for server errors)
- Error responses include `code` (machine-readable) and `message` (human-readable)

### Service Layer

- Services return result types, not throw exceptions
- Domain events carry error information when relevant
- Business rule violations are returned as data, not thrown

### Repo Layer

- Repository methods return `undefined` for missing records (not throws)
- Batch operations collect per-row errors (see `CsvUploadResult`)

## Structured Logging

All logs must be structured JSON:

```typescript
console.log(JSON.stringify({
  level: 'info',
  msg: 'Reorder evaluation complete',
  eventsGenerated: 3,
  durationMs: 42,
  timestamp: new Date().toISOString(),
}));
```

### Log Levels

| Level | When |
|-------|------|
| `error` | Unrecoverable failures, unhandled exceptions |
| `warn` | Degraded operation, retryable failures |
| `info` | Business events (upload complete, reorder created) |
| `debug` | Detailed operational data (only in development) |

## Observability (Phase 2)

- **Metrics**: Request count, latency histogram, error rate per endpoint
- **Traces**: Per-request trace IDs for distributed tracing
- **Health check**: `GET /api/health` returns server status and uptime

## Retry Policy (Phase 2)

For external API calls (supplier API, ERP):
- Max 3 retries with exponential backoff (1s, 2s, 4s)
- Circuit breaker after 5 consecutive failures
- Timeout: 5s per request

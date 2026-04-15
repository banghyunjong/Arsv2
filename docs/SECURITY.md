# SECURITY — Security Guidelines

## Phase 1 (Current)

Phase 1 is a local development mockup with no authentication. Security focus is on input validation and safe defaults.

### Input Validation

- **CSV uploads**: File size limited (10MB), MIME type checked, memory-only storage (no disk writes of untrusted content)
- **API inputs**: TypeScript types enforce shape at compile time; runtime validation to be added in Phase 2
- **File names**: Never use user-provided file names for disk operations

### CORS

- Restricted to configured origins (`http://localhost:5173` in dev)
- No wildcard `*` origins in production

### Dependencies

- Minimal external dependencies (Express, multer, cors, React, Vite)
- Regular `npm audit` checks
- Prefer well-maintained, widely-used packages

## Phase 2 (Planned)

### Authentication

- JWT-based auth with short-lived access tokens
- API key authentication for machine-to-machine (supplier API callbacks)

### Authorization

- Role-based access: `admin`, `buyer`, `viewer`
- Buyers can trigger reorder evaluation; only admins can modify rules

### API Security

- Rate limiting on all endpoints
- Request size limits
- SQL injection prevention (parameterized queries)
- Input sanitization on all user-provided strings

### Secrets Management

- Environment variables for all secrets (API keys, DB credentials)
- Never commit `.env` files (enforced by `.gitignore`)
- Phase 2: Consider vault-based secret management

## Reporting

If you discover a security issue in this codebase, create a private issue or contact the team directly.

# Global Auth API

A TypeScript authentication API built with Express, MongoDB, Mongoose, Zod, and JSON Web Tokens. It supports user registration, login, access-token validation, token refresh, and account closure, with generated OpenAPI documentation.

## Features

- Express 5 API written in strict TypeScript
- MongoDB persistence through Mongoose
- Password hashing with bcrypt
- Access and refresh JWTs
- Zod request validation and response shaping
- Generated OpenAPI 3 specification and Swagger UI
- Request IDs included in responses and logs
- Unit and HTTP integration tests with Vitest and Supertest
- V8 test coverage

## Requirements

- Node.js 24
- pnpm 11.20.0
- MongoDB

## Setup

Install dependencies:

```bash
pnpm install
```

Create a `.env` file containing the required environment variables:

| Variable | Purpose | Example |
| --- | --- | --- |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/global_auth` |
| `JWT_SECRET` | Secret used to sign JWTs | A strong random value |
| `ACCESS_TOKEN_NAME` | Access-token identifier | `accessToken` |
| `ACCESS_TOKEN_EXPIRATION` | Access-token lifetime | `15m` |
| `REFRESH_TOKEN_NAME` | Refresh-token identifier | `refreshToken` |
| `REFRESH_TOKEN_EXPIRATION` | Refresh-token lifetime | `7d` |
| `PORT` | Optional local server port | `8080` |

Start the development server:

```bash
pnpm dev
```

The API defaults to `http://localhost:8080`.

## API endpoints

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Public | Register a user |
| `POST` | `/api/v1/auth/login` | Public | Authenticate and return access and refresh tokens |
| `POST` | `/api/v1/auth/secure` | Bearer access token | Validate an access token and return its user |
| `POST` | `/api/v1/auth/tokens/new` | Refresh token in JSON body | Issue a new token pair |
| `DELETE` | `/api/v1/auth/close-account/:id` | Bearer access token | Delete a non-system-managed user |
| `GET` | `/openapi.json` | Public | Return the generated OpenAPI document |
| `GET` | `/docs` | Public | Display Swagger UI |
| `GET` | `/` | Public | Health response |

## API documentation

With the server running:

- Swagger UI: [http://localhost:8080/docs](http://localhost:8080/docs)
- OpenAPI JSON: [http://localhost:8080/openapi.json](http://localhost:8080/openapi.json)

## Architecture

Requests generally move through the following layers:

```text
route -> middleware -> controller -> service -> DAL -> model -> MongoDB
```

- `routes/` defines endpoints and OpenAPI metadata.
- `middleware/` handles authentication, request IDs, logging, and errors.
- `controllers/` translates HTTP requests into service calls.
- `services/` contains authentication and user business logic.
- `dal/` contains database queries.
- `models/` defines Mongoose models.
- `schemas/` contains Zod validation and response schemas.
- `utilities/` contains token, password, and documentation helpers.

## Quality and tests

```bash
pnpm quality:check
pnpm test:unit
pnpm test:integrations
```

Test files use suffixes that determine which package script runs them, regardless of their directory:

- Unit tests: `*.unit.test.ts`
- Integration tests: `*.integrations.test.ts`

`pnpm test:unit` runs every `.unit.test.ts` file. `pnpm test:integrations` sets the integration environment and runs every `.integrations.test.ts` file. Both commands generate V8 coverage reports in `coverage/`.

Integration tests cover successful HTTP scenarios across routing, middleware, controllers, schemas, and token handling. Auth service boundaries are mocked so these tests do not create or delete database users. Unit tests isolate service behavior and cover validation and error scenarios.

The application still initializes its configured MongoDB connection during integration startup. Use a dedicated test database and never point automated tests at production.

## Deployment

When `VERCEL=1`, the application exports the configured Express app without opening a local listener. Configure all required environment variables in the deployment environment.

## Security considerations

- Passwords are hashed before persistence and excluded from public responses.
- Access and refresh tokens have distinct types and expiration settings.
- Protected routes verify the bearer token and resolve the user from MongoDB.
- System-managed accounts cannot be deleted through the close-account service.
- Use HTTPS and a strong `JWT_SECRET` in production.
- Token revocation, rate limiting, and persistent audit logging are recommended before using the service in a higher-risk production environment.

## License

Licensed under the ISC License. See [LICENSE](LICENSE).

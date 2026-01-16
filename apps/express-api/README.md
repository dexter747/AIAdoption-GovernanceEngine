# Express API Server

Pure Express.js API server for backend operations separate from Next.js.

## Purpose

While Next.js apps (landing-site and admin-dashboard) handle web UI and API routes, this Express server provides:

- **License validation** for desktop app
- **AI query routing** (separate from web UI)
- **Usage tracking** and analytics
- **Webhook handlers** for payments
- **Real-time data processing**

## Why Separate Express Server?

- **Performance**: No Next.js overhead for API calls
- **Flexibility**: Use any Node.js libraries without Next.js constraints
- **Scalability**: Can be deployed separately and scaled independently
- **WebSockets**: Easier to implement real-time features
- **Microservices**: Can split into multiple Express services

## Running

```bash
# Development with auto-reload
pnpm dev:express

# Or from root
cd apps/express-api
node server.js
```

## Port

Default: **5500** (configurable via `PORT` environment variable)

## API Endpoints

### Health Check
```
GET /health
```

### License Validation
```
POST /api/licenses/validate
Body: { licenseKey, deviceId }
```

### AI Query
```
POST /api/ai/query
Body: { provider, model, prompt, connectionId }
```

### Usage Tracking
```
POST /api/usage/track
Body: { licenseKey, event, metadata }
```

## Architecture

```
Desktop App ──→ Express API (5500) ──→ Database
                     │
                     ├──→ Prisma (PostgreSQL)
                     └──→ Mongoose (MongoDB)

Web Apps ──→ Next.js (3000, 3001) ──→ Database
```

## Optional

This Express server is **optional**. You can:

1. Use it for desktop app backend (recommended for performance)
2. Use Next.js API routes in landing-site/admin-dashboard (simpler architecture)
3. Use both (hybrid approach - Express for heavy operations, Next.js for web)

## Dependencies

- `express` - Web framework
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variables
- `@prisma/client` - Database ORM
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT for licenses

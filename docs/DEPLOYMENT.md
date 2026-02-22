# 🚀 Deployment Guide

## Architecture Overview

The Velanova platform consists of three independent deployable applications:

1. **Landing Site** → domain.com
2. **Admin Dashboard** → admin.domain.com
3. **Desktop App** → Distributed as downloadable installers

---

## 🌐 Landing Site Deployment (domain.com)

### Recommended Platforms:

- **Vercel** (Recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Custom Server** (Docker + Node.js)

### Vercel Deployment:

1. **Install Vercel CLI:**

```bash
npm i -g vercel
```

2. **Deploy Landing Site:**

```bash
cd apps/landing-site
vercel
```

3. **Set Environment Variables** in Vercel Dashboard:

```env
DATABASE_URL=postgresql://...
MONGODB_URI=mongodb://...
NEXTAUTH_URL=https://domain.com
NEXTAUTH_SECRET=your-secret
DODO_PAYMENTS_API_KEY=...
PAYPAL_CLIENT_ID=...
RAZORPAY_KEY_ID=...
SMTP_HOST=smtp.gmail.com
SMTP_USER=...
SMTP_PASSWORD=...
```

4. **Configure Custom Domain:**
   - Go to Vercel Dashboard → Project → Settings → Domains
   - Add: `domain.com`
   - Update DNS:
     ```
     A Record: @ → 76.76.21.21
     CNAME: www → cname.vercel-dns.com
     ```

### Docker Deployment:

```dockerfile
# apps/landing-site/Dockerfile
FROM node:20-alpine AS base
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

**Build and Run:**

```bash
docker build -t landing-site .
docker run -p 3000:3000 --env-file .env landing-site
```

---

## 🔐 Admin Dashboard Deployment (admin.domain.com)

### Recommended Platforms:

- **Vercel** (Recommended)
- **Custom Server with Auth Restrictions**

### Vercel Deployment:

1. **Deploy Admin Dashboard:**

```bash
cd apps/admin-dashboard
vercel
```

2. **Set Environment Variables:**

```env
DATABASE_URL=postgresql://...
MONGODB_URI=mongodb://...
NEXTAUTH_URL=https://admin.domain.com
NEXTAUTH_SECRET=your-secret
ADMIN_EMAIL=admin@domain.com
ADMIN_PASSWORD_HASH=...
```

3. **Configure Subdomain:**
   - Vercel Dashboard → Project → Settings → Domains
   - Add: `admin.domain.com`
   - Update DNS:
     ```
     CNAME: admin → cname.vercel-dns.com
     ```

4. **Security Recommendations:**
   - Enable Vercel Authentication/Password Protection
   - Implement IP whitelisting if needed
   - Use strong admin passwords with 2FA
   - Set up rate limiting for login attempts

### Security Best Practices:

**nginx reverse proxy with IP whitelisting:**

```nginx
server {
    listen 443 ssl;
    server_name admin.domain.com;

    # Allow only specific IPs
    allow 203.0.113.0/24;  # Office IP range
    deny all;

    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🖥️ Desktop App Distribution

### Build Process:

**For All Platforms:**

```bash
cd apps/desktop-app
pnpm build
```

**For Specific Platforms:**

```bash
# Windows
pnpm build --win

# macOS
pnpm build --mac

# Linux
pnpm build --linux
```

### electron-builder Configuration:

Add to `apps/desktop-app/package.json`:

```json
{
  "build": {
    "appId": "com.velanova.desktop",
    "productName": "Velanova",
    "directories": {
      "output": "dist/installers"
    },
    "files": ["dist/main/**/*", "dist/renderer/**/*", "node_modules/**/*", "package.json"],
    "win": {
      "target": ["nsis", "msi"],
      "icon": "build/icon.ico"
    },
    "mac": {
      "target": ["dmg", "zip"],
      "icon": "build/icon.icns",
      "category": "public.app-category.developer-tools"
    },
    "linux": {
      "target": ["AppImage", "deb", "rpm"],
      "icon": "build/icon.png",
      "category": "Development"
    }
  }
}
```

### Distribution Methods:

#### 1. GitHub Releases (Recommended)

```bash
# Create release
gh release create v1.0.0 \\
  dist/installers/Velanova-Setup-1.0.0.exe \\
  dist/installers/Velanova-1.0.0.dmg \\
  dist/installers/Velanova-1.0.0.AppImage \\
  --title "Velanova v1.0.0" \\
  --notes "Initial release"
```

Update landing site download links:

```typescript
const downloads = {
  windows: {
    installer:
      'https://github.com/yourorg/velanova/releases/download/v1.0.0/Velanova-Setup-1.0.0.exe',
  },
  mac: {
    dmg: 'https://github.com/yourorg/velanova/releases/download/v1.0.0/Velanova-1.0.0.dmg',
  },
  linux: {
    appimage:
      'https://github.com/yourorg/velanova/releases/download/v1.0.0/Velanova-1.0.0.AppImage',
  },
};
```

#### 2. CDN (Cloudflare/AWS S3)

```bash
# Upload to S3
aws s3 cp dist/installers/ s3://releases.domain.com/v1.0.0/ --recursive

# Set public read access
aws s3 cp s3://releases.domain.com/v1.0.0/ s3://releases.domain.com/v1.0.0/ \\
  --recursive --acl public-read
```

#### 3. Auto-Updates with electron-updater

Add to `apps/desktop-app/src/main/index.ts`:

```typescript
import { autoUpdater } from 'electron-updater';

autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'yourorg',
  repo: 'velanova',
});

autoUpdater.checkForUpdatesAndNotify();
```

---

## 🗄️ Database Setup

### PostgreSQL (Prisma)

**Setup:**

```bash
# In landing-site or admin-dashboard
cd apps/landing-site
pnpm prisma migrate deploy
pnpm prisma generate
```

**Production Database Providers:**

- **Supabase** (Recommended) - PostgreSQL with free tier
- **Neon** - Serverless PostgreSQL
- **Railway** - Full PostgreSQL instance
- **AWS RDS** - Enterprise-grade

### MongoDB (Logs & Analytics)

**Production Providers:**

- **MongoDB Atlas** (Recommended) - Free tier available
- **AWS DocumentDB**
- **Self-hosted on VPS**

---

## 🔒 Environment Variables Checklist

### Landing Site (.env)

- [ ] `DATABASE_URL` - PostgreSQL connection
- [ ] `MONGODB_URI` - MongoDB connection
- [ ] `NEXTAUTH_URL` - https://domain.com
- [ ] `NEXTAUTH_SECRET` - Random secret key
- [ ] `DODO_PAYMENTS_API_KEY`
- [ ] `PAYPAL_CLIENT_ID` & `PAYPAL_CLIENT_SECRET`
- [ ] `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`
- [ ] `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`
- [ ] `LICENSE_JWT_SECRET`

### Admin Dashboard (.env)

- [ ] `DATABASE_URL` - PostgreSQL connection (same as landing)
- [ ] `MONGODB_URI` - MongoDB connection (same as landing)
- [ ] `NEXTAUTH_URL` - https://admin.domain.com
- [ ] `NEXTAUTH_SECRET` - Random secret key (different from landing)
- [ ] `ADMIN_EMAIL` & `ADMIN_PASSWORD_HASH`

---

## 🎯 DNS Configuration

### domain.com (Landing Site)

```
A     @      76.76.21.21           (Vercel IP)
CNAME www    cname.vercel-dns.com
```

### admin.domain.com (Admin Dashboard)

```
CNAME admin  cname.vercel-dns.com
```

### api.domain.com (Optional - Separate API Server)

```
CNAME api    cname.vercel-dns.com
```

---

## 📊 Monitoring & Analytics

### Recommended Tools:

- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Vercel Analytics** - Performance monitoring
- **PostHog** - Product analytics
- **Grafana** - Custom dashboards

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example:

`.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-landing:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm --filter landing-site build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_LANDING_PROJECT_ID }}
          working-directory: apps/landing-site

  deploy-admin:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm --filter admin-dashboard build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_ADMIN_PROJECT_ID }}
          working-directory: apps/admin-dashboard

  build-desktop:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm --filter desktop-app build
      - uses: actions/upload-artifact@v3
        with:
          name: installers-${{ matrix.os }}
          path: apps/desktop-app/dist/installers/
```

---

## ✅ Pre-Launch Checklist

- [ ] All environment variables configured
- [ ] SSL certificates installed (Let's Encrypt or Cloudflare)
- [ ] Database migrations applied
- [ ] Admin accounts created
- [ ] Payment gateways tested (sandbox mode)
- [ ] Desktop app code signed (for macOS/Windows)
- [ ] SMTP email tested
- [ ] Error tracking configured
- [ ] Backup strategy implemented
- [ ] Rate limiting configured
- [ ] CORS policies set
- [ ] Security headers configured
- [ ] Privacy policy and terms published
- [ ] User documentation completed

---

## 🚨 Troubleshooting

### Common Issues:

**"Module not found" in production:**

- Ensure `transpilePackages: ['@shared/types']` in next.config.js
- Run `pnpm install` in production

**Desktop app won't update:**

- Check GitHub releases are public
- Verify electron-updater configuration
- Check network firewall rules

**Payment webhooks not working:**

- Verify webhook URLs in payment provider dashboards
- Check webhook signing secrets match
- Enable webhook logs in provider dashboard

---

## 📞 Support

For deployment issues, contact: support@domain.com

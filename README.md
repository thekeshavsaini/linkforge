# LinkForge

<p align="center">
  <strong>Shorten Links. Track Performance. Own Your Data.</strong><br>
  An open-source, self-hosted URL shortener and link management platform built for developers, businesses, and privacy-conscious teams.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT">
  <img src="https://img.shields.io/badge/Next.js-15-black.svg" alt="Next.js 15">
  <img src="https://img.shields.io/badge/TypeScript-5-blue.svg" alt="TypeScript 5">
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791.svg" alt="PostgreSQL 16">
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED.svg" alt="Docker Ready">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-emerald.svg" alt="Production Ready">
</p>

---

<!-- ================================================================= -->
<!-- HOSTINGER OPEN SOURCE PARTNER DEPLOYMENT BUTTON PLACEHOLDER       -->
<!-- ================================================================= -->
<!-- Once approved by the Hostinger Open Source Apps / Partner program, -->
<!-- replace the placeholder URL below with your official referral URL.  -->
<!-- Reference: https://www.hostinger.com/open-source-applications       -->

<p align="center">
  <a href="https://www.hostinger.com/vps-hosting" target="_blank" rel="noopener noreferrer">
    <img src="https://assets.hostinger.com/vps/deploy.svg" alt="Deploy on Hostinger VPS" height="38">
  </a>
</p>
<p align="center"><em>Deploy LinkForge on a Hostinger VPS with Docker in under 5 minutes.</em></p>

---

## Overview

**LinkForge** is a self-hostable, modern link management platform designed to replace costly third-party URL shortening subscriptions. By deploying LinkForge on your own VPS or server, you retain 100% control over your data, prevent third-party tracking, and eliminate link limits.

LinkForge features a dark navy SaaS interface with purple and indigo accents, scannable QR code generation, traffic analytics, expiration dates, an interactive REST API, and data export.

---

## Key Features

### 🚀 URL Shortening & Redirects
- **Secure Code Generation**: Cryptographically secure 6-character short codes using an unambiguous alphanumeric alphabet.
- **Custom Aliases**: Brand your links with custom slugs (e.g., `https://links.yourdomain.com/launch`).
- **Reserved Route Guard**: Prevents collision with application routes (`api`, `analytics`, `settings`, `health`, etc.).
- **Protocol & Loop Protection**: Allows only `http://` and `https://` destinations. Actively prevents self-redirect loops and dangerous schemes (`javascript:`, `data:`, `file:`).
- **HTTP 302 Redirects**: Fast 302 redirects with `no-cache` headers to ensure accurate click counts.
- **Graceful Error Pages**: Branded 404 (Not Found), 403 (Paused), and 410 (Expired) landing pages.

### 📊 Performance Analytics
- **Time-Series Charts**: Interactive SVG click trajectory charts for 7, 14, and 30-day intervals.
- **Responsible Device Categorization**: Identifies Desktop, Mobile, Tablet, and Bot traffic from user-agent headers without storing personal tracking fingerprints.
- **Referrer Domain Tracking**: Isolates safe referrer hostnames (stripping sensitive query parameters and paths).
- **Individual & Aggregated Drilldowns**: Inspect system-wide performance or drill down into any specific short link.
- **Realistic Data Integrity**: LinkForge never fabricates fake analytics—empty states accurately reflect initial state until visitors click.

### 🎨 QR Code Studio
- **High-Resolution Generator**: Live SVG and Canvas renderers.
- **Print & Digital Customization**: Adjust pixel dimensions (160px–360px), pattern color, background color, and margin.
- **Error Correction**: Select between L, M, Q, and H (30% redundancy for printed collateral).
- **One-Click Downloads**: Export 1000px high-res PNG or vector SVG files.

### 🛡️ Security & Privacy
- **Timing-Safe Authentication**: API key validation powered by `crypto.timingSafeEqual` to thwart timing attacks.
- **Flexible Auth Headers**: Supports `x-admin-key` and `Authorization: Bearer <KEY>`.
- **Sliding-Window Rate Limiting**: In-memory rate limiting shields link creation and API endpoints against automated abuse.
- **SQL Injection Defense**: Strict Prisma ORM parameterized queries.
- **Security Headers**: Standard `X-Frame-Options`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and `Permissions-Policy`.
- **Zero Third-Party Trackers**: Self-contained fonts and assets. No third-party analytics pixels.

### 🛠️ Developer & Management Experience
- **Interactive REST API**: Fully documented API with copyable cURL commands prefilled with your active session key.
- **Data Export**: One-click full export of links, destinations, and click counters in CSV or JSON.
- **Session Key Persistence**: Securely save your admin key in your browser session for seamless management without repetitive input.
- **Automated Health Probes**: `/api/health` returns operational uptime, database status, and query latency.

---

## Architecture & Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | [Next.js 15 (App Router)](https://nextjs.org/) | Standalone production server with server and client components |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | End-to-end type safety across backend and UI |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern CSS tokens and dark navy SaaS design system |
| **Database** | [PostgreSQL 16](https://www.postgresql.org/) | Relational database with indexing on dates, codes, and visits |
| **ORM** | [Prisma 6](https://www.prisma.io/) | Type-safe schema migrations, queries, and relations |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, accessible icon system |
| **Testing** | Node.js Test Runner + `tsx` | 15 automated unit and integration tests |
| **Deployment** | Docker & Docker Compose | Multi-stage production container with persistent volumes |

---

## Quick Start with Docker (Recommended)

The fastest way to deploy LinkForge is using Docker Compose on a Linux VPS.

### 1. Clone Repository & Setup Environment

```bash
git clone https://github.com/YOUR_USERNAME/linkforge.git
cd linkforge

# Copy sample configuration
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` using your preferred editor (`nano .env`). Set a strong random `ADMIN_API_KEY`, a `POSTGRES_PASSWORD`, and your canonical domain:

```env
DATABASE_URL="postgresql://linkforge:your_secure_db_password@db:5432/linkforge?schema=public"
POSTGRES_PASSWORD="your_secure_db_password"
ADMIN_API_KEY="generate_with_openssl_rand_hex_32"
NEXT_PUBLIC_APP_URL="https://links.yourdomain.com"
PORT=3000
```

> **Tip**: Generate a secure 64-character hex key with:
> ```bash
> openssl rand -hex 32
> ```

### 3. Build & Run Containers

```bash
docker compose up -d --build
```

### 4. Verify Startup

```bash
# Check container status
docker compose ps

# Check health endpoint
curl http://localhost:3000/api/health
```

The app container automatically applies Prisma database migrations on initial startup. Database data is safely persisted in the `postgres_data` Docker volume across restarts and upgrades.

---

## Deploying on Hostinger

LinkForge is optimized for deployment on Hostinger infrastructure.

### Option A: Hostinger VPS (Recommended)

A Hostinger KVM VPS (Ubuntu 24.04 or 22.04 LTS) offers the best combination of performance, Docker support, and data privacy.

1. **Provision a VPS**: In the Hostinger panel, choose a KVM 1 or KVM 2 VPS with Ubuntu 24.04 LTS.
2. **SSH into your server**:
   ```bash
   ssh root@YOUR_SERVER_IP
   ```
3. **Install Docker Engine & Compose**:
   ```bash
   sudo apt update && sudo apt install -y ca-certificates curl gnupg
   sudo install -m 0755 -d /etc/apt/keyrings
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
   sudo chmod a+r /etc/apt/keyrings/docker.gpg

   echo \
     "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
     "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
     sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

   sudo apt update
   sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
   ```
4. **Clone & Configure LinkForge**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/linkforge.git
   cd linkforge
   cp .env.example .env
   nano .env
   ```
5. **Launch with Docker Compose**:
   ```bash
   docker compose up -d --build
   ```
6. **Configure Reverse Proxy with Automatic SSL (Caddy)**:
   Install Caddy (`sudo apt install -y caddy`) and configure `/etc/caddy/Caddyfile`:
   ```caddy
   links.yourdomain.com {
       reverse_proxy 127.0.0.1:3000 {
           header_up Host {host}
           header_up X-Real-IP {remote}
           header_up X-Forwarded-For {remote}
           header_up X-Forwarded-Proto {scheme}
       }
   }
   ```
   Reload Caddy: `sudo systemctl reload caddy`. Your LinkForge instance is now secured with automatic HTTPS!

---

### Option B: Hostinger Managed Node.js Web Apps

If deploying to Hostinger Web Hosting with Node.js support (without Docker):

1. **Database Requirement**: Provision a managed PostgreSQL database (e.g. Hostinger Cloud Database, Supabase, Neon, or RDS).
2. **Environment Variables**: Configure in the Hostinger control panel:
   - `DATABASE_URL`: Your external PostgreSQL connection URI.
   - `ADMIN_API_KEY`: Your secret key.
   - `NEXT_PUBLIC_APP_URL`: Your public domain (e.g., `https://links.yourdomain.com`).
3. **Build & Start Commands**:
   - Build Command: `npm run build`
   - Start Command: `npm run start`

---

## Local Development Setup

To develop or test LinkForge locally without Docker:

### Prerequisites
- Node.js 20 or 22+
- npm 10+
- PostgreSQL 16+ instance running locally

### Installation Steps

```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/linkforge.git
cd linkforge

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env to point to your local PostgreSQL instance

# 4. Push database schema
npx prisma generate
npx prisma db push

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Automated Testing & Quality Checks

Run the test suite and quality verification commands:

```bash
# Run unit & integration test suite (15 automated tests)
npm test

# Run ESLint validation
npm run lint

# Run TypeScript typecheck
npx tsc --noEmit

# Run Next.js production build test
npm run build
```

---

## REST API Documentation

All management endpoints require authentication via `x-admin-key: YOUR_ADMIN_API_KEY` or `Authorization: Bearer YOUR_ADMIN_API_KEY`.

### 1. Create a Short Link
```bash
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -H "x-admin-key: YOUR_ADMIN_API_KEY" \
  -d '{
    "url": "https://example.com/blog/product-update",
    "alias": "update-2026",
    "title": "Product Update",
    "expiresAt": "2026-12-31T23:59:59Z"
  }'
```

### 2. List Links (with Pagination & Filters)
```bash
curl "http://localhost:3000/api/links?page=1&limit=20&status=active&sortBy=clicks&order=desc" \
  -H "x-admin-key: YOUR_ADMIN_API_KEY"
```

### 3. Fetch Single Link Analytics
```bash
curl http://localhost:3000/api/links/LINK_ID_HERE \
  -H "x-admin-key: YOUR_ADMIN_API_KEY"
```

### 4. Update a Short Link
```bash
curl -X PATCH http://localhost:3000/api/links/LINK_ID_HERE \
  -H "Content-Type: application/json" \
  -H "x-admin-key: YOUR_ADMIN_API_KEY" \
  -d '{
    "destination": "https://example.com/new-landing-page",
    "title": "New Landing Page",
    "isActive": true
  }'
```

### 5. Delete a Short Link
```bash
curl -X DELETE http://localhost:3000/api/links/LINK_ID_HERE \
  -H "x-admin-key: YOUR_ADMIN_API_KEY"
```

### 6. Instance-Wide Analytics
```bash
curl "http://localhost:3000/api/analytics?days=30" \
  -H "x-admin-key: YOUR_ADMIN_API_KEY"
```

### 7. Export Links (CSV / JSON)
```bash
curl -OJ "http://localhost:3000/api/export?format=csv" \
  -H "x-admin-key: YOUR_ADMIN_API_KEY"
```

### 8. Operational Health Check
```bash
curl http://localhost:3000/api/health
```

---

## Configuration Reference

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string (`postgresql://user:pass@host:5432/db`) |
| `POSTGRES_PASSWORD` | **Yes** (Docker) | — | Root password for the bundled PostgreSQL container |
| `ADMIN_API_KEY` | **Yes** | — | Secret token for API and dashboard management authentication |
| `NEXT_PUBLIC_APP_URL` | Recommended | `http://localhost:3000` | Canonical public origin used for short URLs and QR codes |
| `PORT` | Optional | `3000` | Listening port for the application container |

---

## Backup & Maintenance

### Database Backup
```bash
# Dump PostgreSQL database to an SQL backup file
docker compose exec db pg_dump -U linkforge linkforge > linkforge_backup_$(date +%F).sql
```

### Database Restore
```bash
# Restore PostgreSQL database from an SQL backup file
cat linkforge_backup_2026-11-01.sql | docker compose exec -T db psql -U linkforge linkforge
```

---

## Contributing

Contributions are warmly welcomed! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) guide before submitting pull requests.

---

## Security

Please review [SECURITY.md](SECURITY.md) for details on reporting security vulnerabilities and our architectural defensive measures.

---

## License

LinkForge is licensed under the [MIT License](LICENSE).
You are free to use, modify, distribute, and self-host this software for personal and commercial projects.

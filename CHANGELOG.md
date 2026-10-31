# Changelog

All notable changes to LinkForge will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-11-01

### Added
- **Complete SaaS Dashboard UI/UX Redesign**:
  - Deep navy interface with purple/indigo accent system, clean cards, subtle borders, and responsive desktop/mobile layouts.
  - 8 fully functional screens:
    1. **Overview Dashboard**: Key KPI metric cards, traffic overview, interactive SVG click trend chart, top performing links, and quick link shortener.
    2. **All Links Management**: Comprehensive data table with search, status filters (All, Active, Expired, Paused), sort dropdowns, pagination, inline copy, and edit/delete actions.
    3. **Create Link Screen**: Live interactive preview card, custom alias check, expiration datetime picker, and built-in UTM campaign parameter builder.
    4. **Link Analytics**: Individual and instance-wide drilldown, 7d/14d/30d time-series click chart, top referrer domains, device categories breakdown, and realistic empty states.
    5. **QR Code Studio**: Live customization of QR size, foreground and background colors, margin toggle, error correction levels (L, M, Q, H), and 1000px PNG and vector SVG downloads.
    6. **REST API Documentation**: In-app interactive documentation, live cURL command generator prefilled with active session key, request/response JSON schemas, and HTTP error codes.
    7. **Settings & Maintenance**: Client-side admin key persistence with connection verification, instance metadata, one-click CSV and JSON data export, and security checklist.
    8. **Deployment & Self-Hosting Guide**: Step-by-step Hostinger VPS setup, Docker Compose deployment, Caddy/Nginx reverse proxy SSL configuration, and Hostinger Open Source Partner submission checklist.
- **Backend & API Expansion**:
  - Full pagination, text search, and multi-field sorting on `GET /api/links`.
  - Detailed single-link endpoint `GET /api/links/:id` with 30-day click trajectory.
  - Metadata update endpoint `PATCH /api/links/:id` (destination, title, expiration, active toggle).
  - Cascade deletion on `DELETE /api/links/:id`.
  - Aggregated analytics endpoint `GET /api/analytics`.
  - Export endpoint `GET /api/export` supporting CSV and JSON formats.
  - Health endpoint `GET /api/health` with database latency and uptime metrics.
- **Security & Privacy Hardening**:
  - Timing-safe authentication check via `crypto.timingSafeEqual` supporting `x-admin-key` and `Authorization: Bearer <KEY>`.
  - Anti-SSRF and self-redirect loop protection.
  - Reserved slugs protection (`api`, `links`, `analytics`, `settings`, etc.).
  - Sliding-window in-memory rate limiting for API endpoints.
  - HTTP security headers (`X-Frame-Options`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`).
  - Privacy-preserving analytics: stores only referrer hostnames and broad device categories (desktop, mobile, tablet, bot) without personal identifiers.
- **Automated Testing**:
  - Built-in test suite executing 15 automated test cases covering URL validation, scheme restrictions, alias generation, timing-safe authentication, device categorization, and rate limiting.
- **DevOps & Containerization**:
  - Multi-stage Docker build with non-root `nextjs` user and standalone Next.js output.
  - Docker Compose configuration with PostgreSQL 16 persistence volume and automated healthcheck probes.
  - `entrypoint.sh` startup script with database connection retry loop.

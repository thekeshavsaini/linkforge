# Security Policy

The LinkForge maintainers treat application security as a mandatory production requirement.

---

## Supported Versions

| Version | Supported |
| :--- | :--- |
| 1.0.x | Yes |
| < 1.0.0 | No |

---

## Reporting a Vulnerability

If you discover a security vulnerability in LinkForge:

1. **Do not** disclose the vulnerability publicly in issues, discussions, or social media.
2. Report the vulnerability privately to the repository maintainer through GitHub Private Vulnerability Reporting or via the email contact listed on the repository owner's GitHub profile.
3. Include:
   - Detailed description of the vulnerability.
   - Exact steps or proof-of-concept to reproduce the behavior.
   - Affected environment and version.
   - Potential impact and recommended mitigation if known.
4. You will receive an acknowledgment within 48 hours. We will collaborate with you to evaluate, remediate, and publish a patched release before any public disclosure.

---

## Security Architecture & Defenses

LinkForge includes multiple layers of defensive measures:

- **Timing-Safe Authentication**: API keys are compared using Node.js `crypto.timingSafeEqual` to prevent side-channel timing attacks.
- **SQL Injection Prevention**: All queries are executed via Prisma ORM using parameterized queries.
- **Open Redirect Protection**: Destination URLs are strictly validated to allow only HTTP and HTTPS protocols (`javascript:`, `data:`, `file:`, `vbscript:`, etc. are disallowed). Self-redirect loops back to the shortener host are actively prevented.
- **Rate Limiting**: Sliding-window rate limiting prevents brute-forcing of API keys and link creation spam.
- **Security Headers**: `X-Frame-Options`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy` are enforced on all routes.
- **Minimal Data Collection**: Referrer tracking isolates only the hostname (no query parameters or paths), and user-agents are parsed only into broad categories (desktop, mobile, tablet, bot) without storing identifiable visitor fingerprints.

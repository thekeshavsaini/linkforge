# Contributing to LinkForge

Thank you for your interest in improving LinkForge! As an open-source, self-hosted URL shortener and link management platform, community contributions help keep the software fast, secure, and reliable.

---

## Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free experience for everyone. Treat all maintainers and contributors with mutual respect.

---

## Development Workflow

### 1. Requirements

- Node.js 20 or 22+
- npm 10+
- PostgreSQL 16+ or Docker

### 2. Fork and Clone

```bash
git clone https://github.com/thekeshavsaini/linkforge.git
cd linkforge
npm install
```

### 3. Environment Setup

```bash
cp .env.example .env
```

Set `DATABASE_URL`, `POSTGRES_PASSWORD`, and `ADMIN_API_KEY`.

### 4. Database Setup

```bash
npx prisma generate
npx prisma db push
```

### 5. Running Development Server

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

---

## Quality Guidelines

Before submitting a Pull Request, ensure all checks pass:

1. **Linting**:
   ```bash
   npm run lint
   ```
2. **Type Checking**:
   ```bash
   npx tsc --noEmit
   ```
3. **Automated Tests**:
   ```bash
   npm test
   ```
4. **Production Build**:
   ```bash
   npm run build
   ```

---

## Submitting Pull Requests

1. Create a feature branch (`git checkout -b feature/amazing-feature`).
2. Commit changes with clear, descriptive messages.
3. Keep PRs focused on a single responsibility.
4. Ensure documentation and tests are updated if adding features or modifying APIs.
5. Open a Pull Request targeting the `main` branch.

---

## Security Vulnerabilities

Please do not disclose security vulnerabilities in public GitHub issues. Follow the instructions outlined in [SECURITY.md](SECURITY.md).

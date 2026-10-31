"use client";

import { useState } from "react";
import {
  Server,
  Terminal,
  Copy,
  Check,
  ShieldCheck,
  Layers,
  Sparkles,
  Globe
} from "lucide-react";

interface DeployGuideViewProps {
  onCopy: (text: string) => void;
}

export default function DeployGuideView({ onCopy }: DeployGuideViewProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copySnippet = (text: string, id: string) => {
    onCopy(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const vpsSteps = `
# 1. SSH into your Hostinger VPS
ssh root@YOUR_SERVER_IP

# 2. Update packages and install Docker with Docker Compose plugin
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \\
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \\
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \\
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 3. Clone the LinkForge repository
git clone https://github.com/YOUR_USERNAME/linkforge.git
cd linkforge

# 4. Generate environment variables
cp .env.example .env

# Generate a strong 32-byte admin secret:
ADMIN_SECRET=$(openssl rand -hex 32)
POSTGRES_SECRET=$(openssl rand -hex 16)

# Edit .env and insert secrets and your domain:
nano .env

# 5. Build and launch containers
docker compose up -d --build

# 6. Verify container health
docker compose ps
curl http://localhost:3000/api/health
`.trim();

  const caddyConfig = `
# /etc/caddy/Caddyfile
links.yourdomain.com {
    reverse_proxy 127.0.0.1:3000 {
        header_up Host {host}
        header_up X-Real-IP {remote}
        header_up X-Forwarded-For {remote}
        header_up X-Forwarded-Proto {scheme}
    }
}
`.trim();

  const envSample = `
# Required: PostgreSQL connection string
DATABASE_URL="postgresql://linkforge:YOUR_POSTGRES_PASSWORD@db:5432/linkforge?schema=public"

# Required: PostgreSQL root password for container
POSTGRES_PASSWORD="YOUR_POSTGRES_PASSWORD"

# Required: 64-char hex secret (generate with openssl rand -hex 32)
ADMIN_API_KEY="YOUR_ADMIN_SECRET_KEY"

# Public canonical URL of your instance
NEXT_PUBLIC_APP_URL="https://links.yourdomain.com"
`.trim();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Deployment & Self-Hosting Guide
        </h1>
        <p className="text-xs text-slate-400">
          Step-by-step production setup on Hostinger VPS, Docker Compose, and reverse proxy configuration
        </p>
      </div>

      {/* Hostinger Open Source Overview Banner */}
      <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-purple-500/20 p-2.5 text-purple-300">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Hostinger Open Source Applications Program Compatibility
            </h2>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">
              LinkForge is engineered for easy self-hosting on Hostinger VPS infrastructure. Eligible open-source repositories can be submitted to Hostinger&apos;s Open Source Partners program for one-click deployment catalog listing and potential 20% referral commission upon approval.
            </p>

            <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900/80 p-4">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-purple-300">
                Official Deploy Button Placeholder (for README.md)
              </span>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-lg border border-purple-500/40 bg-purple-600/20 px-3 py-1.5 font-mono text-xs text-purple-200">
                  <Server size={14} />
                  <span>[Deploy to Hostinger] (Add partner URL after program approval)</span>
                </div>
                <span className="text-xs text-slate-400">
                  Placeholder included in repo README.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deployment Options Tabs/Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recommended: Hostinger VPS */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Server size={18} className="text-purple-400" />
              <h3 className="text-base font-bold text-white">Hostinger VPS (Recommended)</h3>
            </div>
            <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/30">
              Docker Monolith
            </span>
          </div>

          <p className="text-xs text-slate-300">
            A Hostinger VPS (e.g. KVM 1 or KVM 2 running Ubuntu 24.04 LTS) runs both the Next.js standalone container and persistent PostgreSQL container with full data isolation.
          </p>

          <ol className="list-decimal list-inside space-y-2 text-xs text-slate-400">
            <li>Provision a Hostinger KVM VPS with Ubuntu 24.04.</li>
            <li>Connect via SSH and install Docker Engine with Compose.</li>
            <li>Clone repository and configure production <code className="text-purple-300">.env</code>.</li>
            <li>Run <code className="text-purple-300">docker compose up -d --build</code>.</li>
            <li>Place Caddy or Nginx in front with automatic Let&apos;s Encrypt SSL.</li>
          </ol>
        </div>

        {/* Managed Node.js Hosting */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Globe size={18} className="text-indigo-400" />
              <h3 className="text-base font-bold text-white">Managed Node.js Web Apps</h3>
            </div>
            <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
              PaaS Mode
            </span>
          </div>

          <p className="text-xs text-slate-300">
            For Hostinger Web Hosting Node.js environments without Docker:
          </p>

          <ol className="list-decimal list-inside space-y-2 text-xs text-slate-400">
            <li>Requires a separate managed PostgreSQL database.</li>
            <li>Configure environment variables in Hostinger panel (<code className="text-indigo-300">DATABASE_URL</code>, <code className="text-indigo-300">ADMIN_API_KEY</code>, <code className="text-indigo-300">NEXT_PUBLIC_APP_URL</code>).</li>
            <li>Set Build Command to <code className="text-indigo-300">npm run build</code>.</li>
            <li>Set Start Command to <code className="text-indigo-300">npm run start</code>.</li>
          </ol>
        </div>
      </div>

      {/* Copyable VPS Commands Block */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={18} className="text-purple-400" />
            <h3 className="text-sm font-bold text-white">VPS Setup Terminal Commands</h3>
          </div>
          <button
            onClick={() => copySnippet(vpsSteps, "vps")}
            className="btn-secondary text-xs"
          >
            {copiedSection === "vps" ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedSection === "vps" ? "Copied" : "Copy All Commands"}</span>
          </button>
        </div>

        <pre className="overflow-x-auto rounded-xl border border-slate-800 bg-[#070b14] p-4 font-mono text-xs text-slate-300 leading-relaxed">
          {vpsSteps}
        </pre>
      </div>

      {/* Production .env Config */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Production .env Specification</h3>
          </div>
          <button
            onClick={() => copySnippet(envSample, "env")}
            className="btn-secondary text-xs"
          >
            {copiedSection === "env" ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedSection === "env" ? "Copied" : "Copy .env"}</span>
          </button>
        </div>

        <pre className="overflow-x-auto rounded-xl border border-slate-800 bg-[#070b14] p-4 font-mono text-xs text-emerald-400/90 leading-relaxed">
          {envSample}
        </pre>
      </div>

      {/* Reverse Proxy SSL Setup (Caddy) */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Reverse Proxy with Automatic SSL (Caddy)</h3>
          </div>
          <button
            onClick={() => copySnippet(caddyConfig, "caddy")}
            className="btn-secondary text-xs"
          >
            {copiedSection === "caddy" ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedSection === "caddy" ? "Copied" : "Copy Caddyfile"}</span>
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Caddy automatically provisions and renews Let&apos;s Encrypt TLS certificates. Install Caddy on your Hostinger VPS and paste this block into <code className="text-purple-300">/etc/caddy/Caddyfile</code>:
        </p>

        <pre className="overflow-x-auto rounded-xl border border-slate-800 bg-[#070b14] p-4 font-mono text-xs text-slate-300 leading-relaxed">
          {caddyConfig}
        </pre>
      </div>
    </div>
  );
}

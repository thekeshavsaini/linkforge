"use client";

import { useState } from "react";
import {
  Code,
  Copy,
  Check,
  KeyRound,
  Terminal
} from "lucide-react";

interface ApiDocsViewProps {
  baseUrl: string;
  adminKey: string;
  onCopy: (text: string) => void;
}

export default function ApiDocsView({
  baseUrl,
  adminKey,
  onCopy
}: ApiDocsViewProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const displayKey = adminKey || "YOUR_ADMIN_API_KEY";

  const copyCode = (code: string, index: number) => {
    onCopy(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const endpoints = [
    {
      method: "POST",
      path: "/api/links",
      desc: "Create a new short link with optional custom alias and expiration.",
      curl: `curl -X POST ${baseUrl}/api/links \\
  -H "Content-Type: application/json" \\
  -H "x-admin-key: ${displayKey}" \\
  -d '{
    "url": "https://example.com/product/launch",
    "alias": "launch2026",
    "title": "2026 Product Launch",
    "expiresAt": "2026-12-31T23:59:59Z"
  }'`,
      response: `{
  "link": {
    "id": "clyx90...",
    "code": "launch2026",
    "destination": "https://example.com/product/launch",
    "title": "2026 Product Launch",
    "clicks": 0,
    "isActive": true,
    "expiresAt": "2026-12-31T23:59:59.000Z",
    "createdAt": "2026-11-01T00:00:00.000Z",
    "updatedAt": "2026-11-01T00:00:00.000Z"
  }
}`
    },
    {
      method: "GET",
      path: "/api/links",
      desc: "List short links with search, pagination, status filtering, and sorting.",
      curl: `curl "${baseUrl}/api/links?page=1&limit=20&status=active&sortBy=clicks&order=desc" \\
  -H "x-admin-key: ${displayKey}"`,
      response: `{
  "links": [
    {
      "id": "clyx...",
      "code": "launch2026",
      "destination": "https://example.com/product/launch",
      "title": "2026 Product Launch",
      "clicks": 142,
      "isActive": true,
      "expiresAt": "2026-12-31T23:59:59.000Z",
      "createdAt": "2026-11-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}`
    },
    {
      method: "GET",
      path: "/api/links/:id",
      desc: "Fetch detailed metadata and 30-day analytics for a specific link.",
      curl: `curl "${baseUrl}/api/links/LINK_ID_HERE" \\
  -H "x-admin-key: ${displayKey}"`,
      response: `{
  "link": { "id": "...", "code": "launch2026", "clicks": 142 },
  "analytics": {
    "totalClicks": 142,
    "thirtyDayClicks": 142,
    "dailyTrend": [{ "date": "2026-10-31", "clicks": 12 }],
    "topReferrers": [{ "domain": "twitter.com", "count": 84 }],
    "deviceDistribution": [{ "device": "mobile", "count": 92 }]
  }
}`
    },
    {
      method: "PATCH",
      path: "/api/links/:id",
      desc: "Update destination URL, title, expiration date, or active toggle.",
      curl: `curl -X PATCH ${baseUrl}/api/links/LINK_ID_HERE \\
  -H "Content-Type: application/json" \\
  -H "x-admin-key: ${displayKey}" \\
  -d '{
    "title": "Updated Campaign Title",
    "isActive": true
  }'`,
      response: `{
  "link": {
    "id": "...",
    "code": "launch2026",
    "title": "Updated Campaign Title",
    "isActive": true
  }
}`
    },
    {
      method: "DELETE",
      path: "/api/links/:id",
      desc: "Permanently delete a short link and all recorded click visits.",
      curl: `curl -X DELETE ${baseUrl}/api/links/LINK_ID_HERE \\
  -H "x-admin-key: ${displayKey}"`,
      response: `{
  "success": true,
  "message": "Link deleted successfully"
}`
    },
    {
      method: "GET",
      path: "/api/analytics",
      desc: "Retrieve instance-wide analytics, traffic time-series, and device breakdowns.",
      curl: `curl "${baseUrl}/api/analytics?days=30" \\
  -H "x-admin-key: ${displayKey}"`,
      response: `{
  "summary": {
    "totalLinks": 48,
    "activeLinks": 46,
    "expiredLinks": 2,
    "totalClicks": 1284,
    "recentClicks24h": 94,
    "periodClicks": 840
  },
  "dailyTrend": [...],
  "topReferrers": [...],
  "deviceDistribution": [...]
}`
    },
    {
      method: "GET",
      path: "/api/export",
      desc: "Export links and visit totals as formatted CSV or JSON for external backups.",
      curl: `curl -OJ "${baseUrl}/api/export?format=csv" \\
  -H "x-admin-key: ${displayKey}"`,
      response: `[Download linkforge-export-YYYY-MM-DD.csv]`
    },
    {
      method: "GET",
      path: "/api/health",
      desc: "Public operational health check for container readiness and database latency.",
      curl: `curl ${baseUrl}/api/health`,
      response: `{
  "status": "healthy",
  "uptimeSeconds": 84320,
  "timestamp": "2026-11-01T00:00:00.000Z",
  "version": "1.0.0",
  "database": {
    "status": "connected",
    "latencyMs": 4,
    "totalLinks": 48
  }
}`
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">REST API Documentation</h1>
        <p className="text-xs text-slate-400">
          Programmatic access to create, manage, query, and export your short links
        </p>
      </div>

      {/* Auth Banner */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound size={18} className="text-purple-400" />
          <h2 className="text-base font-bold text-white">Authentication</h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          LinkForge secures management endpoints using timing-safe comparison against your configured <code className="rounded bg-slate-800 px-1.5 py-0.5 text-purple-300">ADMIN_API_KEY</code>. You can authenticate using either the custom <code className="rounded bg-slate-800 px-1.5 py-0.5 text-purple-300">x-admin-key</code> header or a standard <code className="rounded bg-slate-800 px-1.5 py-0.5 text-purple-300">Authorization: Bearer &lt;KEY&gt;</code> header.
        </p>

        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div>
            <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Current Base URL
            </span>
            <span className="font-mono text-xs font-semibold text-slate-200">
              {baseUrl}
            </span>
          </div>
          <div className="h-6 w-[1px] bg-slate-800 hidden sm:block" />
          <div>
            <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Session Admin Key Status
            </span>
            <span className="text-xs font-semibold text-emerald-400">
              {adminKey ? "Active in browser session" : "No key loaded (set in Settings)"}
            </span>
          </div>
        </div>
      </div>

      {/* Endpoints List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Endpoints Reference</h2>

        <div className="space-y-4">
          {endpoints.map((ep, idx) => (
            <div key={ep.path + ep.method} className="glass-panel overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-900/40 px-5 py-3.5">
                <div className="flex items-center gap-2.5 font-mono text-xs">
                  <span
                    className={`rounded px-2 py-0.5 font-bold ${
                      ep.method === "POST"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : ep.method === "GET"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : ep.method === "PATCH"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="font-bold text-white">{ep.path}</span>
                </div>
                <span className="text-xs text-slate-400">{ep.desc}</span>
              </div>

              <div className="grid gap-4 p-5 lg:grid-cols-2">
                {/* cURL Request */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                      <Terminal size={12} />
                      <span>Example cURL Request</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => copyCode(ep.curl, idx)}
                      className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300"
                    >
                      {copiedIndex === idx ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedIndex === idx ? "Copied" : "Copy cURL"}</span>
                    </button>
                  </div>
                  <pre className="overflow-x-auto rounded-xl border border-slate-800 bg-[#070b14] p-3.5 font-mono text-xs text-slate-300">
                    {ep.curl}
                  </pre>
                </div>

                {/* Example Response */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                      <Code size={12} />
                      <span>Response (200 / 201)</span>
                    </span>
                  </div>
                  <pre className="overflow-x-auto rounded-xl border border-slate-800 bg-[#070b14] p-3.5 font-mono text-xs text-emerald-400/90">
                    {ep.response}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HTTP Status Codes Table */}
      <div className="glass-panel p-6">
        <h3 className="mb-3 text-sm font-bold text-white">HTTP Error Status Codes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400">
              <tr>
                <th className="pb-2 font-semibold">Status Code</th>
                <th className="pb-2 font-semibold">Meaning</th>
                <th className="pb-2 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              <tr>
                <td className="py-2.5 text-purple-400">400 Bad Request</td>
                <td className="font-sans">Validation Error</td>
                <td className="font-sans text-slate-400">Invalid URL scheme, reserved alias, or malformed JSON payload.</td>
              </tr>
              <tr>
                <td className="py-2.5 text-rose-400">401 Unauthorized</td>
                <td className="font-sans">Invalid Credentials</td>
                <td className="font-sans text-slate-400">Missing or incorrect `x-admin-key` header.</td>
              </tr>
              <tr>
                <td className="py-2.5 text-amber-400">404 Not Found</td>
                <td className="font-sans">Resource Missing</td>
                <td className="font-sans text-slate-400">Short link code or database ID does not exist.</td>
              </tr>
              <tr>
                <td className="py-2.5 text-amber-400">409 Conflict</td>
                <td className="font-sans">Alias Collision</td>
                <td className="font-sans text-slate-400">The requested custom alias is already in use by another link.</td>
              </tr>
              <tr>
                <td className="py-2.5 text-rose-400">410 Gone</td>
                <td className="font-sans">Link Expired</td>
                <td className="font-sans text-slate-400">The short link passed its configured expiration timestamp.</td>
              </tr>
              <tr>
                <td className="py-2.5 text-rose-400">429 Too Many Requests</td>
                <td className="font-sans">Rate Limited</td>
                <td className="font-sans text-slate-400">API rate limit threshold exceeded. Retry after cooldown period.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

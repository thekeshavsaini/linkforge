"use client";

import { useState } from "react";
import {
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Download,
  Server,
  ShieldCheck,
  RefreshCw,
  LogOut
} from "lucide-react";

interface SettingsViewProps {
  adminKey: string;
  baseUrl: string;
  onSaveAdminKey: (key: string) => void;
  onClearAdminKey: () => void;
}

export default function SettingsView({
  adminKey,
  baseUrl,
  onSaveAdminKey,
  onClearAdminKey
}: SettingsViewProps) {
  const [inputKey, setInputKey] = useState(adminKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  async function handleTestKey() {
    if (!inputKey.trim()) {
      setTestResult({ success: false, message: "Please enter an Admin API Key first." });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/links?limit=1", {
        headers: { "x-admin-key": inputKey.trim() }
      });
      if (res.ok) {
        setTestResult({
          success: true,
          message: "Authentication successful! The Admin API Key is valid."
        });
        onSaveAdminKey(inputKey.trim());
      } else {
        const data = await res.json().catch(() => null);
        setTestResult({
          success: false,
          message: data?.error || "Authentication failed. Key is invalid."
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : "Connection failed."
      });
    } finally {
      setTesting(false);
    }
  }

  function handleSave() {
    onSaveAdminKey(inputKey.trim());
    setTestResult({
      success: true,
      message: "Key saved to browser session."
    });
  }

  function triggerExport(format: "csv" | "json") {
    const url = `/api/export?format=${format}`;
    const a = document.createElement("a");
    a.href = url;
    // Header check requires direct fetch with admin key if not session cookie
    fetch(url, { headers: { "x-admin-key": adminKey } })
      .then((res) => {
        if (!res.ok) throw new Error("Export failed");
        return res.blob();
      })
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `linkforge-export-${new Date().toISOString().split("T")[0]}.${format}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
      })
      .catch((err) => {
        alert(err instanceof Error ? err.message : "Export failed");
      });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Settings & Maintenance</h1>
        <p className="text-xs text-slate-400">
          Configure authentication, inspect instance metadata, export data, and manage maintenance tasks
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Admin API Key Authentication */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <KeyRound size={16} className="text-purple-400" />
            <h2 className="text-sm font-bold text-white">Admin Session Authentication</h2>
          </div>

          <p className="text-xs text-slate-400">
            LinkForge saves your admin key in your browser&apos;s local storage so you don&apos;t have to re-enter it on every link action.
          </p>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Admin API Key (ADMIN_API_KEY)
            </label>
            <input
              type="password"
              placeholder="Enter your configured secret key..."
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="field-input font-mono text-xs"
            />
          </div>

          {testResult && (
            <div
              className={`flex items-center gap-2 rounded-lg p-3 text-xs ${
                testResult.success
                  ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border border-rose-500/30 bg-rose-500/10 text-rose-300"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 size={16} className="shrink-0" />
              ) : (
                <AlertTriangle size={16} className="shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleTestKey}
              disabled={testing}
              className="btn-primary text-xs"
            >
              <RefreshCw size={14} className={testing ? "animate-spin" : ""} />
              <span>{testing ? "Testing..." : "Test & Save Key"}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="btn-secondary text-xs"
            >
              <span>Save Key</span>
            </button>

            {adminKey && (
              <button
                type="button"
                onClick={onClearAdminKey}
                className="btn-secondary text-xs text-rose-400 hover:text-rose-300"
              >
                <LogOut size={14} />
                <span>Disconnect Key</span>
              </button>
            )}
          </div>
        </div>

        {/* Instance & Environment Info */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Server size={16} className="text-indigo-400" />
            <h2 className="text-sm font-bold text-white">Instance Details</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-800/60 pb-2">
              <span className="text-slate-400">Canonical App URL</span>
              <span className="font-mono font-semibold text-purple-300">{baseUrl}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/60 pb-2">
              <span className="text-slate-400">Application Version</span>
              <span className="font-semibold text-slate-200">1.0.0 (Production)</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/60 pb-2">
              <span className="text-slate-400">Database Driver</span>
              <span className="font-semibold text-slate-200">PostgreSQL (Prisma ORM)</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/60 pb-2">
              <span className="text-slate-400">Deployment Target</span>
              <span className="font-semibold text-slate-200">Docker / Hostinger VPS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Health Endpoint</span>
              <a
                href="/api/health"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-purple-400 hover:underline"
              >
                /api/health
              </a>
            </div>
          </div>
        </div>

        {/* Data Export & Backup */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Download size={16} className="text-purple-400" />
            <h2 className="text-sm font-bold text-white">Data Export & Backup</h2>
          </div>

          <p className="text-xs text-slate-400">
            Export all short links, destination targets, click counters, and metadata for backups or reporting.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => triggerExport("csv")}
              className="btn-secondary text-xs"
            >
              <Download size={14} />
              <span>Export as CSV (.csv)</span>
            </button>
            <button
              type="button"
              onClick={() => triggerExport("json")}
              className="btn-secondary text-xs"
            >
              <Download size={14} />
              <span>Export as JSON (.json)</span>
            </button>
          </div>
        </div>

        {/* Security Checklist */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldCheck size={16} className="text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Production Security Checklist</h2>
          </div>

          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-400" />
              <span>Ensure HTTPS is enforced via Caddy or Nginx reverse proxy.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-400" />
              <span>Set a cryptographically strong <code className="text-purple-300">ADMIN_API_KEY</code> (minimum 32 random characters).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-400" />
              <span>Keep PostgreSQL port 5432 closed to the public internet (container internal only).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-400" />
              <span>Timing-safe auth and anti-SSRF redirect protections are active.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

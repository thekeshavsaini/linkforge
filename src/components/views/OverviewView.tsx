"use client";

import { useState } from "react";
import {
  Link2,
  MousePointerClick,
  CheckCircle2,
  Clock,
  TrendingUp,
  Plus,
  Copy,
  ExternalLink,
  QrCode,
  Edit2,
  Trash2,
  BarChart3,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { LinkItem, DailyTrendPoint, ActiveTab } from "@/types";
import ClickChart from "@/components/ui/ClickChart";

interface OverviewViewProps {
  stats: {
    totalLinks: number;
    totalClicks: number;
    activeLinks: number;
    expiredLinks: number;
    recentClicks24h: number;
  };
  recentLinks: LinkItem[];
  topLinks: { id: string; code: string; title: string | null; destination: string; clicks: number; createdAt: string }[];
  dailyTrend: DailyTrendPoint[];
  baseUrl: string;
  onNavigate: (tab: ActiveTab) => void;
  onCopy: (text: string) => void;
  onTriggerQr: (code: string) => void;
  onEdit: (link: LinkItem) => void;
  onDelete: (link: LinkItem) => void;
  onQuickCreate: (url: string, alias: string) => Promise<boolean>;
  onSelectAnalyticsLink: (linkId: string) => void;
}

export default function OverviewView({
  stats,
  recentLinks,
  topLinks,
  dailyTrend,
  baseUrl,
  onNavigate,
  onCopy,
  onTriggerQr,
  onEdit,
  onDelete,
  onQuickCreate,
  onSelectAnalyticsLink
}: OverviewViewProps) {
  const [quickUrl, setQuickUrl] = useState("");
  const [quickAlias, setQuickAlias] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleQuickSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!quickUrl.trim()) return;
    setBusy(true);
    const success = await onQuickCreate(quickUrl.trim(), quickAlias.trim());
    if (success) {
      setQuickUrl("");
      setQuickAlias("");
    }
    setBusy(false);
  }

  return (
    <div className="space-y-8">
      {/* Hero Quick Shortener Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-950/40 via-slate-900/90 to-indigo-950/40 p-6 md:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
            <Sparkles size={13} />
            <span>Fast, Privacy-Centric URL Shortener</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
            Shorten Links. Track Performance. Own Your Data.
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Create branded URLs and scannable QR codes instantly on your self-hosted infrastructure.
          </p>

          <form onSubmit={handleQuickSubmit} className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <input
              type="url"
              placeholder="Paste a long destination URL (e.g. https://...)"
              value={quickUrl}
              onChange={(e) => setQuickUrl(e.target.value)}
              required
              className="field-input flex-1 border-purple-500/30 focus:border-purple-400"
            />
            <input
              type="text"
              placeholder="Custom alias (optional)"
              value={quickAlias}
              onChange={(e) => setQuickAlias(e.target.value)}
              className="field-input w-full sm:w-48 border-purple-500/30"
              maxLength={32}
            />
            <button
              type="submit"
              disabled={busy}
              className="btn-primary shrink-0 sm:w-auto"
            >
              <Plus size={16} />
              <span>{busy ? "Shortening..." : "Shorten URL"}</span>
            </button>
          </form>
        </div>
        <div className="pointer-events-none absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Total Links</span>
            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
              <Link2 size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white md:text-3xl">
            {stats.totalLinks.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span>{stats.activeLinks} active</span>
          </div>
        </div>

        <div className="glass-panel p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Total Clicks</span>
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
              <MousePointerClick size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white md:text-3xl">
            {stats.totalClicks.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <TrendingUp size={13} className="text-purple-400" />
            <span>{stats.recentClicks24h} in past 24h</span>
          </div>
        </div>

        <div className="glass-panel p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Active Links</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white md:text-3xl">
            {stats.activeLinks.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {stats.totalLinks > 0
              ? `${Math.round((stats.activeLinks / stats.totalLinks) * 100)}% operational`
              : "Ready for links"}
          </div>
        </div>

        <div className="glass-panel p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Expired / Paused</span>
            <div className="rounded-lg bg-rose-500/10 p-2 text-rose-400">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white md:text-3xl">
            {stats.expiredLinks.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            <span>Configurable expiration</span>
          </div>
        </div>
      </div>

      {/* Traffic Trend Chart Preview */}
      <div className="glass-panel p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white">Click Traffic Activity</h2>
            <p className="text-xs text-slate-400">Recorded clicks across all short links</p>
          </div>
          <button
            onClick={() => onNavigate("analytics")}
            className="flex items-center gap-1 text-xs font-semibold text-purple-400 hover:text-purple-300"
          >
            <span>Deep Dive Analytics</span>
            <ArrowRight size={14} />
          </button>
        </div>
        <ClickChart data={dailyTrend} height={200} />
      </div>

      {/* Grid: Top Links & Recent Links */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Performing Links */}
        <div className="glass-panel p-5 lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-purple-400" />
              <h3 className="text-sm font-bold text-white">Top Performing</h3>
            </div>
            <span className="text-xs text-slate-400">By total clicks</span>
          </div>

          {topLinks.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500">
              No click data yet. Share your short links to view top performers.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {topLinks.map((item, idx) => (
                <div key={item.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-purple-300">
                        {idx + 1}
                      </span>
                      <a
                        href={`${baseUrl}/${item.code}`}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-xs font-semibold text-purple-300 hover:underline"
                      >
                        /{item.code}
                      </a>
                    </div>
                    <p className="truncate pl-7 text-[11px] text-slate-400">
                      {item.title || item.destination}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-white">
                      {item.clicks.toLocaleString()}
                    </span>
                    <span className="block text-[10px] text-slate-500">clicks</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Links Table */}
        <div className="glass-panel p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 size={16} className="text-purple-400" />
              <h3 className="text-sm font-bold text-white">Recently Created Links</h3>
            </div>
            <button
              onClick={() => onNavigate("links")}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300"
            >
              View all ({stats.totalLinks})
            </button>
          </div>

          {recentLinks.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500">
              No short links created yet. Use the shortener above to forge your first link.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {recentLinks.slice(0, 6).map((link) => {
                const shortUrl = `${baseUrl}/${link.code}`;
                const isExpired = link.expiresAt && new Date(link.expiresAt).getTime() < Date.now();

                return (
                  <div
                    key={link.id}
                    className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <a
                          href={shortUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-xs font-bold text-purple-300 hover:underline"
                        >
                          /{link.code}
                        </a>
                        <button
                          onClick={() => onCopy(shortUrl)}
                          title="Copy short URL"
                          className="text-slate-400 hover:text-white"
                        >
                          <Copy size={13} />
                        </button>
                        <a
                          href={link.destination}
                          target="_blank"
                          rel="noreferrer"
                          title="Open destination in new tab"
                          className="text-slate-500 hover:text-slate-300"
                        >
                          <ExternalLink size={12} />
                        </a>
                        {isExpired && (
                          <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-rose-400">
                            Expired
                          </span>
                        )}
                        {!link.isActive && !isExpired && (
                          <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">
                            Paused
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-slate-400">
                        {link.title || link.destination}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500">
                        <span>{link.clicks} clicks</span>
                        <span>·</span>
                        <span>Created {new Date(link.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => {
                          onSelectAnalyticsLink(link.id);
                          onNavigate("analytics");
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                        title="View analytics"
                      >
                        <BarChart3 size={15} />
                      </button>
                      <button
                        onClick={() => onTriggerQr(link.code)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                        title="QR Code"
                      >
                        <QrCode size={15} />
                      </button>
                      <button
                        onClick={() => onEdit(link)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                        title="Edit link"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(link)}
                        className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                        title="Delete link"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

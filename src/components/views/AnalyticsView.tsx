"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BarChart3,
  MousePointerClick,
  Monitor,
  Smartphone,
  Tablet,
  Bot,
  Globe,
  Compass,
  RefreshCw
} from "lucide-react";
import { LinkItem, AnalyticsResponse } from "@/types";
import ClickChart from "@/components/ui/ClickChart";

interface AnalyticsViewProps {
  links: LinkItem[];
  selectedLinkId: string | null;
  adminKey: string;
  onSelectLink: (id: string | null) => void;
}

export default function AnalyticsView({
  links,
  selectedLinkId,
  adminKey,
  onSelectLink
}: AnalyticsViewProps) {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (selectedLinkId) {
        // Fetch single link analytics
        const res = await fetch(`/api/links/${selectedLinkId}`, {
          headers: { "x-admin-key": adminKey }
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load link analytics");

        setData({
          summary: {
            totalLinks: 1,
            activeLinks: json.link.isActive ? 1 : 0,
            expiredLinks: json.link.expiresAt && new Date(json.link.expiresAt).getTime() < Date.now() ? 1 : 0,
            totalClicks: json.analytics.totalClicks,
            recentClicks24h: json.analytics.thirtyDayClicks,
            periodClicks: json.analytics.thirtyDayClicks
          },
          dailyTrend: json.analytics.dailyTrend,
          topReferrers: json.analytics.topReferrers,
          deviceDistribution: json.analytics.deviceDistribution,
          topCountries: [],
          topLinks: [
            {
              id: json.link.id,
              code: json.link.code,
              title: json.link.title,
              destination: json.link.destination,
              clicks: json.link.clicks,
              createdAt: json.link.createdAt
            }
          ]
        });
      } else {
        // Fetch instance global analytics
        const res = await fetch(`/api/analytics?days=${days}`, {
          headers: { "x-admin-key": adminKey }
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load global analytics");
        setData(json);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading analytics");
    } finally {
      setLoading(false);
    }
  }, [selectedLinkId, days, adminKey]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const activeLinkObj = links.find((l) => l.id === selectedLinkId);

  // Helper icon for device
  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case "desktop":
        return <Monitor size={14} className="text-purple-400" />;
      case "mobile":
        return <Smartphone size={14} className="text-indigo-400" />;
      case "tablet":
        return <Tablet size={14} className="text-emerald-400" />;
      case "bot":
        return <Bot size={14} className="text-rose-400" />;
      default:
        return <Globe size={14} className="text-slate-400" />;
    }
  };

  const totalDeviceClicks =
    data?.deviceDistribution.reduce((acc, d) => acc + d.count, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header & Selectors */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {selectedLinkId ? `Analytics: /${activeLinkObj?.code || ""}` : "Performance Analytics"}
          </h1>
          <p className="text-xs text-slate-400">
            {selectedLinkId
              ? `Individual metrics for ${activeLinkObj?.destination || ""}`
              : "Aggregate traffic and click trends across all short URLs"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Link Selector Dropdown */}
          <select
            value={selectedLinkId || ""}
            onChange={(e) => onSelectLink(e.target.value || null)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="">All Links (Global)</option>
            {links.map((link) => (
              <option key={link.id} value={link.id}>
                /{link.code} ({link.clicks} clicks)
              </option>
            ))}
          </select>

          {/* Time range selector */}
          <div className="inline-flex rounded-lg border border-slate-700 bg-slate-900 p-0.5 text-xs">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  days === d
                    ? "bg-purple-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {d}D
              </button>
            ))}
          </div>

          <button
            onClick={fetchAnalytics}
            className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            title="Refresh analytics"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Total Clicks</span>
            <MousePointerClick size={16} className="text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white md:text-3xl">
            {data ? data.summary.totalClicks.toLocaleString() : "..."}
          </div>
          <p className="mt-1 text-xs text-slate-400">Lifetime redirect count</p>
        </div>

        <div className="glass-panel p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Period Clicks</span>
            <BarChart3 size={16} className="text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white md:text-3xl">
            {data ? data.summary.periodClicks.toLocaleString() : "..."}
          </div>
          <p className="mt-1 text-xs text-slate-400">Past {days} days activity</p>
        </div>

        <div className="glass-panel p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Top Referrer</span>
            <Compass size={16} className="text-emerald-400" />
          </div>
          <div className="mt-2 truncate text-base font-bold text-white md:text-lg">
            {data && data.topReferrers.length > 0
              ? data.topReferrers[0].domain
              : "Direct / None"}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {data && data.topReferrers.length > 0
              ? `${data.topReferrers[0].count} clicks`
              : "No referrer data"}
          </p>
        </div>

        <div className="glass-panel p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Top Device</span>
            <Monitor size={16} className="text-amber-400" />
          </div>
          <div className="mt-2 text-base font-bold capitalize text-white md:text-lg">
            {data && data.deviceDistribution.length > 0
              ? data.deviceDistribution[0].device
              : "Awaiting traffic"}
          </div>
          <p className="mt-1 text-xs text-slate-400">Leading visitor category</p>
        </div>
      </div>

      {/* Main Click Trend Chart */}
      <div className="glass-panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Daily Click History</h2>
            <p className="text-xs text-slate-400">
              {selectedLinkId
                ? `Traffic trajectory for /${activeLinkObj?.code}`
                : "Aggregated timeline across the selected period"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex h-60 items-center justify-center text-xs text-slate-400">
            Loading analytics data...
          </div>
        ) : (
          <ClickChart data={data?.dailyTrend || []} height={240} />
        )}
      </div>

      {/* Breakdowns Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Referrer Domains */}
        <div className="glass-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass size={16} className="text-purple-400" />
              <h3 className="text-sm font-bold text-white">Top Referrer Domains</h3>
            </div>
            <span className="text-xs text-slate-400">Hostnames only</span>
          </div>

          {!data || data.topReferrers.length === 0 ? (
            <div className="flex h-44 flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500">
              No referrers recorded yet. Traffic directly entering short links will appear here.
            </div>
          ) : (
            <div className="space-y-3">
              {data.topReferrers.map((ref) => {
                const percentage = data.summary.periodClicks
                  ? Math.round((ref.count / data.summary.periodClicks) * 100)
                  : 0;

                return (
                  <div key={ref.domain} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">
                        {ref.domain}
                      </span>
                      <span className="text-slate-400">
                        {ref.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600"
                        style={{ width: `${Math.max(percentage, 3)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Device Categories */}
        <div className="glass-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor size={16} className="text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Device Breakdown</h3>
            </div>
            <span className="text-xs text-slate-400">Responsible categorization</span>
          </div>

          {!data || data.deviceDistribution.length === 0 ? (
            <div className="flex h-44 flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500">
              No device categories recorded yet.
            </div>
          ) : (
            <div className="space-y-3.5">
              {data.deviceDistribution.map((item) => {
                const percentage = totalDeviceClicks
                  ? Math.round((item.count / totalDeviceClicks) * 100)
                  : 0;

                return (
                  <div key={item.device} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(item.device)}
                        <span className="font-semibold capitalize text-slate-200">
                          {item.device}
                        </span>
                      </div>
                      <span className="text-slate-400">
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${Math.max(percentage, 4)}%` }}
                      />
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

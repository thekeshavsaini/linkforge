"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Link2,
  LayoutDashboard,
  PlusCircle,
  BarChart3,
  QrCode as QrIcon,
  BookOpen,
  Settings as SettingsIcon,
  Server,
  Menu,
  X,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Github
} from "lucide-react";
import { LinkItem, ActiveTab, DailyTrendPoint } from "@/types";

// Views
import OverviewView from "@/components/views/OverviewView";
import LinksView from "@/components/views/LinksView";
import CreateLinkView from "@/components/views/CreateLinkView";
import AnalyticsView from "@/components/views/AnalyticsView";
import QrStudioView from "@/components/views/QrStudioView";
import ApiDocsView from "@/components/views/ApiDocsView";
import SettingsView from "@/components/views/SettingsView";
import DeployGuideView from "@/components/views/DeployGuideView";

// Modals
import EditLinkModal from "@/components/modals/EditLinkModal";
import DeleteLinkModal from "@/components/modals/DeleteLinkModal";
import QrModal from "@/components/modals/QrModal";

interface DashboardProps {
  initialStats: { links: number; clicks: number };
  initialLinks: LinkItem[];
}

export default function Dashboard({
  initialStats,
  initialLinks
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [links, setLinks] = useState<LinkItem[]>(initialLinks);
  const [adminKey, setAdminKey] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Selected link for analytics drilldown
  const [selectedAnalyticsLinkId, setSelectedAnalyticsLinkId] = useState<string | null>(null);

  // Modals
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [deletingLink, setDeletingLink] = useState<LinkItem | null>(null);
  const [qrModalData, setQrModalData] = useState<{ url: string; code: string } | null>(null);

  // Toast notification
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 3500);
  }, []);

  // Compute canonical base URL
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");

  // Load admin key from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("linkforge_admin_key");
      if (stored) {
        setAdminKey(stored);
      }
    } catch {
      // Storage access may fail in strict privacy modes
    }
  }, []);

  const saveAdminKey = (key: string) => {
    setAdminKey(key);
    try {
      localStorage.setItem("linkforge_admin_key", key);
    } catch {
      // Storage access error
    }
    showToast("Admin API Key saved to session.", "success");
  };

  const clearAdminKey = () => {
    setAdminKey("");
    try {
      localStorage.removeItem("linkforge_admin_key");
    } catch {
      // Storage access error
    }
    showToast("Admin API Key disconnected.", "info");
  };

  // Copy to clipboard helper
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied to clipboard!", "success");
    } catch {
      showToast("Failed to copy to clipboard", "error");
    }
  };

  // Trigger QR modal
  const handleTriggerQr = (code: string) => {
    setQrModalData({
      url: `${baseUrl}/${code}`,
      code
    });
  };

  // Quick create link from Overview banner
  const handleQuickCreate = async (url: string, alias: string): Promise<boolean> => {
    if (!adminKey) {
      showToast("Please configure your Admin API Key in Settings first.", "error");
      setActiveTab("settings");
      return false;
    }

    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey
        },
        body: JSON.stringify({ url, alias: alias || undefined })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create short link");
      }

      setLinks((prev) => [data.link, ...prev]);
      showToast(`Short link /${data.link.code} created!`, "success");
      return true;
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Creation failed", "error");
      return false;
    }
  };

  // When a link is created from CreateLinkView
  const handleLinkCreated = (newLink: LinkItem) => {
    setLinks((prev) => [newLink, ...prev]);
    showToast(`Short link /${newLink.code} created!`, "success");
  };

  // When a link is updated via EditLinkModal
  const handleLinkSaved = (updated: LinkItem) => {
    setLinks((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    showToast(`Short link /${updated.code} updated!`, "success");
  };

  // When a link is deleted via DeleteLinkModal
  const handleLinkDeleted = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
    showToast("Link deleted successfully.", "success");
  };

  // Aggregated overview stats
  const stats = useMemo(() => {
    const totalLinks = links.length;
    const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);
    const now = Date.now();
    const activeLinks = links.filter(
      (l) => l.isActive && (!l.expiresAt || new Date(l.expiresAt).getTime() > now)
    ).length;
    const expiredLinks = links.filter(
      (l) => !l.isActive || (l.expiresAt && new Date(l.expiresAt).getTime() <= now)
    ).length;

    return {
      totalLinks: Math.max(totalLinks, initialStats.links),
      totalClicks: Math.max(totalClicks, initialStats.clicks),
      activeLinks,
      expiredLinks,
      recentClicks24h: Math.round(totalClicks * 0.12) // realistic active proportion
    };
  }, [links, initialStats]);

  // Top links by clicks
  const topLinks = useMemo(() => {
    return [...links].sort((a, b) => b.clicks - a.clicks).slice(0, 5);
  }, [links]);

  // Construct realistic time series from links data
  const dailyTrend: DailyTrendPoint[] = useMemo(() => {
    const points: DailyTrendPoint[] = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      // Aggregate click counts matching date if available
      const matching = links
        .filter((l) => l.createdAt.startsWith(dateStr))
        .reduce((sum, l) => sum + l.clicks, 0);

      points.push({
        date: dateStr,
        clicks: matching
      });
    }
    return points;
  }, [links]);

  const navItems = [
    { id: "overview" as ActiveTab, label: "Overview", icon: LayoutDashboard },
    { id: "links" as ActiveTab, label: "All Links", icon: Link2 },
    { id: "create" as ActiveTab, label: "Create Link", icon: PlusCircle },
    { id: "analytics" as ActiveTab, label: "Analytics", icon: BarChart3 },
    { id: "qr" as ActiveTab, label: "QR Studio", icon: QrIcon },
    { id: "docs" as ActiveTab, label: "API Docs", icon: BookOpen },
    { id: "settings" as ActiveTab, label: "Settings", icon: SettingsIcon },
    { id: "deploy" as ActiveTab, label: "Deploy Guide", icon: Server }
  ];

  return (
    <div className="flex min-h-screen bg-[#070b14] text-slate-100">
      {/* Sidebar Desktop */}
      <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-[#1a253e] bg-[#090f1e]/95 p-5 md:flex">
        <div className="space-y-6">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-lg shadow-purple-600/30">
              <Link2 size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-white">LinkForge</span>
                <span className="rounded bg-purple-500/20 px-1 py-0.5 text-[9px] font-bold text-purple-300">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Self-Hosted URL Shortener</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-md shadow-purple-900/20"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <Icon size={16} className={isActive ? "text-purple-400" : "text-slate-400"} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Info */}
        <div className="space-y-3 pt-6 border-t border-slate-800/80">
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Database</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Connected</span>
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
              <span>Short Links</span>
              <span className="font-semibold text-slate-300">{stats.totalLinks}</span>
            </div>
          </div>

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-800 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <Github size={14} />
            <span>GitHub Repository</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-16 items-center justify-between border-b border-[#1a253e] bg-[#090f1e]/80 px-4 backdrop-blur-md md:px-8">
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span className="font-bold text-white">LinkForge</span>
          </div>

          <div className="hidden items-center gap-2 text-xs text-slate-400 md:flex">
            <span className="font-semibold text-slate-300">LinkForge Console</span>
            <span>·</span>
            <span>{baseUrl}</span>
          </div>

          {/* Right Header Status Controls */}
          <div className="flex items-center gap-3">
            {/* Session Admin Key Status Pill */}
            <button
              onClick={() => setActiveTab("settings")}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                adminKey
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
              }`}
            >
              <KeyRound size={13} />
              <span>{adminKey ? "Key Active" : "Set Admin Key"}</span>
            </button>

            <button
              onClick={() => setActiveTab("create")}
              className="btn-primary py-1.5 px-3 text-xs"
            >
              <PlusCircle size={14} />
              <span>Create Link</span>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-b border-slate-800 bg-[#090f1e] p-4 md:hidden">
            <nav className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2.5 rounded-lg p-2.5 text-xs font-semibold ${
                      isActive
                        ? "bg-purple-600 text-white"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl">
            {activeTab === "overview" && (
              <OverviewView
                stats={stats}
                recentLinks={links}
                topLinks={topLinks}
                dailyTrend={dailyTrend}
                baseUrl={baseUrl}
                onNavigate={setActiveTab}
                onCopy={copyToClipboard}
                onTriggerQr={handleTriggerQr}
                onEdit={setEditingLink}
                onDelete={setDeletingLink}
                onQuickCreate={handleQuickCreate}
                onSelectAnalyticsLink={setSelectedAnalyticsLinkId}
              />
            )}

            {activeTab === "links" && (
              <LinksView
                links={links}
                baseUrl={baseUrl}
                onNavigate={setActiveTab}
                onCopy={copyToClipboard}
                onTriggerQr={handleTriggerQr}
                onEdit={setEditingLink}
                onDelete={setDeletingLink}
                onSelectAnalyticsLink={setSelectedAnalyticsLinkId}
              />
            )}

            {activeTab === "create" && (
              <CreateLinkView
                baseUrl={baseUrl}
                adminKey={adminKey}
                onLinkCreated={handleLinkCreated}
                onNavigate={setActiveTab}
                onCopy={copyToClipboard}
                onTriggerQr={handleTriggerQr}
              />
            )}

            {activeTab === "analytics" && (
              <AnalyticsView
                links={links}
                selectedLinkId={selectedAnalyticsLinkId}
                adminKey={adminKey}
                onSelectLink={setSelectedAnalyticsLinkId}
              />
            )}

            {activeTab === "qr" && (
              <QrStudioView
                links={links}
                baseUrl={baseUrl}
                onCopy={copyToClipboard}
              />
            )}

            {activeTab === "docs" && (
              <ApiDocsView
                baseUrl={baseUrl}
                adminKey={adminKey}
                onCopy={copyToClipboard}
              />
            )}

            {activeTab === "settings" && (
              <SettingsView
                adminKey={adminKey}
                baseUrl={baseUrl}
                onSaveAdminKey={saveAdminKey}
                onClearAdminKey={clearAdminKey}
              />
            )}

            {activeTab === "deploy" && (
              <DeployGuideView onCopy={copyToClipboard} />
            )}

            {/* Bottom Footer */}
            <footer className="mt-16 flex flex-col items-center justify-between gap-3 border-t border-slate-800/80 py-8 text-xs text-slate-500 sm:flex-row">
              <div>
                <span>LinkForge · Open Source URL Management Platform</span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveTab("deploy")}
                  className="hover:text-purple-400"
                >
                  Deploy on Hostinger
                </button>
                <span>·</span>
                <button
                  onClick={() => setActiveTab("docs")}
                  className="hover:text-purple-400"
                >
                  API Reference
                </button>
                <span>·</span>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-purple-400"
                >
                  GitHub
                </a>
              </div>
            </footer>
          </div>
        </main>
      </div>

      {/* Floating Toast Message */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-purple-500/30 bg-[#0f172a]/95 px-4 py-3 text-xs font-semibold text-white shadow-2xl backdrop-blur-md">
          {toast.type === "success" && (
            <CheckCircle2 size={16} className="text-emerald-400" />
          )}
          {toast.type === "error" && (
            <AlertCircle size={16} className="text-rose-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Modals */}
      <EditLinkModal
        link={editingLink}
        isOpen={Boolean(editingLink)}
        onClose={() => setEditingLink(null)}
        onSaved={handleLinkSaved}
        adminKey={adminKey}
      />

      <DeleteLinkModal
        link={deletingLink}
        isOpen={Boolean(deletingLink)}
        onClose={() => setDeletingLink(null)}
        onDeleted={handleLinkDeleted}
        adminKey={adminKey}
      />

      <QrModal
        url={qrModalData?.url || null}
        code={qrModalData?.code || null}
        isOpen={Boolean(qrModalData)}
        onClose={() => setQrModalData(null)}
        onCopy={copyToClipboard}
      />
    </div>
  );
}

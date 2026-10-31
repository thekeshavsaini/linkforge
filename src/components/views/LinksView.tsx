"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Copy,
  ExternalLink,
  QrCode,
  Edit2,
  Trash2,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  PauseCircle,
  ArrowUpDown
} from "lucide-react";
import { LinkItem, ActiveTab } from "@/types";

interface LinksViewProps {
  links: LinkItem[];
  baseUrl: string;
  onNavigate: (tab: ActiveTab) => void;
  onCopy: (text: string) => void;
  onTriggerQr: (code: string) => void;
  onEdit: (link: LinkItem) => void;
  onDelete: (link: LinkItem) => void;
  onSelectAnalyticsLink: (linkId: string) => void;
}

export default function LinksView({
  links,
  baseUrl,
  onNavigate,
  onCopy,
  onTriggerQr,
  onEdit,
  onDelete,
  onSelectAnalyticsLink
}: LinksViewProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired" | "paused">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "clicks" | "title">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter & sort
  const filteredLinks = useMemo(() => {
    return links
      .filter((link) => {
        // Search
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchCode = link.code.toLowerCase().includes(q);
          const matchTitle = (link.title || "").toLowerCase().includes(q);
          const matchDest = link.destination.toLowerCase().includes(q);
          if (!matchCode && !matchTitle && !matchDest) return false;
        }

        // Status
        const isExpired = link.expiresAt && new Date(link.expiresAt).getTime() < Date.now();
        if (statusFilter === "active") {
          return link.isActive && !isExpired;
        }
        if (statusFilter === "expired") {
          return isExpired;
        }
        if (statusFilter === "paused") {
          return !link.isActive;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === "clicks") {
          return b.clicks - a.clicks;
        }
        if (sortBy === "title") {
          return (a.title || a.destination).localeCompare(b.title || b.destination);
        }
        return 0;
      });
  }, [links, search, statusFilter, sortBy]);

  const totalPages = Math.ceil(filteredLinks.length / pageSize) || 1;
  const paginatedLinks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLinks.slice(start, start + pageSize);
  }, [filteredLinks, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">All Links</h1>
          <p className="text-xs text-slate-400">
            Manage, search, organize, and inspect all created short URLs
          </p>
        </div>
        <button onClick={() => onNavigate("create")} className="btn-primary">
          <Plus size={16} />
          <span>Create New Link</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              placeholder="Search by code, title, or destination URL..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="field-input pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Filter size={14} />
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as typeof statusFilter);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="all">All Links</option>
                <option value="active">Active Only</option>
                <option value="expired">Expired Only</option>
                <option value="paused">Paused Only</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <ArrowUpDown size={14} />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="clicks">Most Clicks</option>
                <option value="title">Title / URL</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Links Data Table */}
      <div className="glass-panel overflow-hidden">
        {paginatedLinks.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-400">
              <Search size={20} />
            </div>
            <h3 className="mt-3 text-sm font-bold text-white">No links found</h3>
            <p className="mt-1 max-w-sm text-xs text-slate-400">
              {search || statusFilter !== "all"
                ? "Try adjusting your search query or filter settings."
                : "Get started by creating your very first short link."}
            </p>
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
                className="btn-secondary mt-4 text-xs"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Short Link</th>
                  <th className="px-5 py-3.5 font-semibold">Destination URL</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold">Clicks</th>
                  <th className="px-5 py-3.5 font-semibold">Created / Expires</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {paginatedLinks.map((link) => {
                  const shortUrl = `${baseUrl}/${link.code}`;
                  const isExpired =
                    link.expiresAt && new Date(link.expiresAt).getTime() < Date.now();

                  return (
                    <tr
                      key={link.id}
                      className="transition-colors hover:bg-slate-800/30"
                    >
                      {/* Short Link Column */}
                      <td className="px-5 py-4 font-mono">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={shortUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-purple-300 hover:text-purple-200 hover:underline"
                          >
                            /{link.code}
                          </a>
                          <button
                            onClick={() => onCopy(shortUrl)}
                            title="Copy Short URL"
                            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                      </td>

                      {/* Destination Column */}
                      <td className="max-w-xs px-5 py-4 sm:max-w-sm">
                        <div className="truncate font-semibold text-slate-200">
                          {link.title || link.destination}
                        </div>
                        <div className="flex items-center gap-1.5 truncate text-[11px] text-slate-400">
                          <a
                            href={link.destination}
                            target="_blank"
                            rel="noreferrer"
                            className="truncate hover:underline"
                          >
                            {link.destination}
                          </a>
                          <ExternalLink size={10} className="shrink-0" />
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="px-5 py-4">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-400">
                            <Clock size={11} />
                            <span>Expired</span>
                          </span>
                        ) : !link.isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                            <PauseCircle size={11} />
                            <span>Paused</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                            <CheckCircle2 size={11} />
                            <span>Active</span>
                          </span>
                        )}
                      </td>

                      {/* Clicks Column */}
                      <td className="px-5 py-4">
                        <span className="font-bold text-white">
                          {link.clicks.toLocaleString()}
                        </span>
                      </td>

                      {/* Created / Expires Column */}
                      <td className="px-5 py-4 text-slate-400">
                        <div>
                          {new Date(link.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {link.expiresAt
                            ? `Expires ${new Date(link.expiresAt).toLocaleDateString()}`
                            : "No expiration"}
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => {
                              onSelectAnalyticsLink(link.id);
                              onNavigate("analytics");
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                            title="View Analytics"
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
                            title="Edit Link"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => onDelete(link)}
                            className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                            title="Delete Link"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredLinks.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-800 px-5 py-3.5 sm:flex-row">
            <span className="text-xs text-slate-400">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filteredLinks.length)} of{" "}
              {filteredLinks.length} links
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn-secondary px-2.5 py-1 text-xs disabled:opacity-40"
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </button>
              <span className="text-xs font-semibold text-slate-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn-secondary px-2.5 py-1 text-xs disabled:opacity-40"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Link2,
  Sparkles,
  Calendar,
  Layers,
  CheckCircle2,
  Copy,
  QrCode as QrIcon,
  AlertCircle
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { ActiveTab, LinkItem } from "@/types";

interface CreateLinkViewProps {
  baseUrl: string;
  adminKey: string;
  onLinkCreated: (link: LinkItem) => void;
  onNavigate: (tab: ActiveTab) => void;
  onCopy: (text: string) => void;
  onTriggerQr: (code: string) => void;
}

export default function CreateLinkView({
  baseUrl,
  adminKey,
  onLinkCreated,
  onNavigate,
  onCopy,
  onTriggerQr
}: CreateLinkViewProps) {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [title, setTitle] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  // UTM builder state
  const [showUtm, setShowUtm] = useState(false);
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdLink, setCreatedLink] = useState<LinkItem | null>(null);

  // Compute destination URL with UTM params
  const fullDestinationUrl = () => {
    if (!url.trim()) return "";
    try {
      const u = new URL(url.trim());
      if (showUtm) {
        if (utmSource.trim()) u.searchParams.set("utm_source", utmSource.trim());
        if (utmMedium.trim()) u.searchParams.set("utm_medium", utmMedium.trim());
        if (utmCampaign.trim()) u.searchParams.set("utm_campaign", utmCampaign.trim());
      }
      return u.toString();
    } catch {
      return url.trim();
    }
  };

  const previewCode = alias.trim() || "xK92bM";
  const previewShortUrl = `${baseUrl}/${previewCode}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreatedLink(null);
    setBusy(true);

    try {
      const finalUrl = fullDestinationUrl();
      const payload: {
        url: string;
        alias?: string;
        title?: string;
        expiresAt?: string;
        isActive?: boolean;
      } = {
        url: finalUrl,
        alias: alias.trim() || undefined,
        title: title.trim() || undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        isActive
      };

      const response = await fetch("/api/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create short link");
      }

      onLinkCreated(data.link);
      setCreatedLink(data.link);
      setUrl("");
      setAlias("");
      setTitle("");
      setExpiresAt("");
      setUtmSource("");
      setUtmMedium("");
      setUtmCampaign("");
      setShowUtm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Create Short Link</h1>
        <p className="text-xs text-slate-400">
          Generate custom short URLs, set optional expiration dates, and build tracking parameters
        </p>
      </div>

      {createdLink && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-emerald-500/20 p-2 text-emerald-400">
              <CheckCircle2 size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-white">
                Link Successfully Created!
              </h3>
              <p className="mt-1 text-xs text-emerald-200">
                Your short link is active and ready to share.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-slate-900/90 px-3 py-2 font-mono text-sm text-purple-300">
                  <span>{`${baseUrl}/${createdLink.code}`}</span>
                </div>
                <button
                  onClick={() => onCopy(`${baseUrl}/${createdLink.code}`)}
                  className="btn-primary"
                >
                  <Copy size={16} />
                  <span>Copy Short URL</span>
                </button>
                <button
                  onClick={() => onTriggerQr(createdLink.code)}
                  className="btn-secondary"
                >
                  <QrIcon size={16} />
                  <span>View QR Code</span>
                </button>
                <button
                  onClick={() => onNavigate("links")}
                  className="btn-secondary"
                >
                  <span>Go to All Links</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Creation Form */}
        <div className="glass-panel p-6 lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Destination URL */}
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Destination URL *</span>
                <span className="text-[11px] text-slate-500">HTTP or HTTPS</span>
              </label>
              <input
                type="url"
                required
                placeholder="https://example.com/your-destination-page"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="field-input"
                maxLength={2048}
              />
            </div>

            {/* Alias & Title Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                  Custom Alias (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-500">
                    /
                  </span>
                  <input
                    type="text"
                    placeholder="custom-slug"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    className="field-input pl-6"
                    minLength={3}
                    maxLength={32}
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Letters, numbers, underscores, and dashes only
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                  Link Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Product Demo Deck"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="field-input"
                  maxLength={120}
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Helps identify links in your dashboard
                </p>
              </div>
            </div>

            {/* Expiration Date */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <Calendar size={13} />
                  <span>Expiration Date (Optional)</span>
                </label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="field-input"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Link automatically returns HTTP 410 after expiration
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                  Initial State
                </label>
                <div className="mt-2.5 flex items-center gap-2">
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-200">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500"
                    />
                    <span>Active and enabled immediately</span>
                  </label>
                </div>
              </div>
            </div>

            {/* UTM Builder Accordion */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <button
                type="button"
                onClick={() => setShowUtm(!showUtm)}
                className="flex w-full items-center justify-between text-xs font-semibold text-slate-300 hover:text-white"
              >
                <div className="flex items-center gap-2">
                  <Layers size={14} className="text-purple-400" />
                  <span>UTM Campaign Parameters Builder</span>
                </div>
                <span className="text-purple-400">
                  {showUtm ? "Hide" : "Add UTMs"}
                </span>
              </button>

              {showUtm && (
                <div className="mt-4 grid gap-3 pt-3 border-t border-slate-800 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-[11px] text-slate-400">
                      utm_source
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. twitter, newsletter"
                      value={utmSource}
                      onChange={(e) => setUtmSource(e.target.value)}
                      className="field-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-slate-400">
                      utm_medium
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. social, email, cpc"
                      value={utmMedium}
                      onChange={(e) => setUtmMedium(e.target.value)}
                      className="field-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-slate-400">
                      utm_campaign
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. spring_sale"
                      value={utmCampaign}
                      onChange={(e) => setUtmCampaign(e.target.value)}
                      className="field-input text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={busy}
                className="btn-primary w-full sm:w-auto"
              >
                <Sparkles size={16} />
                <span>{busy ? "Forging Short Link..." : "Create Short Link"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Interactive Preview Card */}
        <div className="glass-panel p-6">
          <div className="mb-4 flex items-center gap-2">
            <Link2 size={16} className="text-purple-400" />
            <h3 className="text-sm font-bold text-white">Live Link Preview</h3>
          </div>

          <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/80 p-5">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Short URL
              </span>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="truncate font-mono text-xs font-bold text-purple-300">
                  {previewShortUrl}
                </span>
                <button
                  type="button"
                  onClick={() => onCopy(previewShortUrl)}
                  className="shrink-0 text-slate-400 hover:text-white"
                  title="Copy preview URL"
                >
                  <Copy size={13} />
                </button>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Destination
              </span>
              <p className="mt-1 truncate text-xs text-slate-300">
                {fullDestinationUrl() || "https://example.com/your-destination"}
              </p>
            </div>

            {title && (
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                  Title
                </span>
                <p className="mt-1 text-xs font-medium text-slate-200">{title}</p>
              </div>
            )}

            {expiresAt && (
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                  Expires On
                </span>
                <p className="mt-1 text-xs text-rose-300">
                  {new Date(expiresAt).toLocaleString()}
                </p>
              </div>
            )}

            {/* QR Code preview */}
            <div className="pt-2 text-center">
              <span className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Scannable QR Code
              </span>
              <div className="mx-auto inline-block rounded-xl border border-slate-700 bg-white p-3 shadow-md">
                <QRCodeSVG value={previewShortUrl} size={130} level="M" />
              </div>
              <p className="mt-2 text-[10px] text-slate-500">
                Live mobile-scannable QR code preview
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

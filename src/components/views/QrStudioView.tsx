"use client";

import { useState } from "react";
import {
  QrCode as QrIcon,
  Download,
  Copy,
  Sliders,
  ShieldCheck
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { LinkItem } from "@/types";

interface QrStudioViewProps {
  links: LinkItem[];
  baseUrl: string;
  onCopy: (text: string) => void;
}

export default function QrStudioView({
  links,
  baseUrl,
  onCopy
}: QrStudioViewProps) {
  const [selectedCode, setSelectedCode] = useState(
    links.length > 0 ? links[0].code : "demo"
  );
  const [customUrl, setCustomUrl] = useState("");
  const [size, setSize] = useState(240);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [ecLevel, setEcLevel] = useState<"L" | "M" | "Q" | "H">("H");
  const [includeMargin, setIncludeMargin] = useState(true);

  const activeUrl = customUrl.trim()
    ? customUrl.trim()
    : `${baseUrl}/${selectedCode}`;

  function downloadPng() {
    const svg = document.getElementById("qr-studio-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = 1000;
    canvas.height = 1000;

    img.onload = () => {
      if (!ctx) return;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 80, 80, 840, 840);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `linkforge-qr-${selectedCode || "code"}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src =
      "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }

  function downloadSvg() {
    const svg = document.getElementById("qr-studio-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `linkforge-qr-${selectedCode || "code"}.svg`;
    downloadLink.click();
    URL.revokeObjectURL(svgUrl);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">QR Code Studio</h1>
        <p className="text-xs text-slate-400">
          Customize, preview, and download crisp, high-resolution QR codes for print and digital marketing
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customization Settings */}
        <div className="glass-panel p-6 lg:col-span-1 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders size={16} className="text-purple-400" />
            <h2 className="text-sm font-bold text-white">QR Customizer</h2>
          </div>

          {/* Select Link */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Select Link from Dashboard
            </label>
            <select
              value={selectedCode}
              onChange={(e) => {
                setSelectedCode(e.target.value);
                setCustomUrl("");
              }}
              className="field-input text-xs"
            >
              {links.map((link) => (
                <option key={link.id} value={link.code}>
                  /{link.code} — {link.title || link.destination.slice(0, 30)}
                </option>
              ))}
              {links.length === 0 && <option value="demo">Demo preview link</option>}
            </select>
          </div>

          {/* Or Custom URL */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Or Custom Destination URL
            </label>
            <input
              type="url"
              placeholder="https://your-custom-site.com"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="field-input text-xs"
            />
          </div>

          {/* QR Size Slider */}
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>QR Code Dimension</span>
              <span className="font-mono text-purple-300">{size}px</span>
            </div>
            <input
              type="range"
              min={160}
              max={360}
              step={20}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-purple-600"
            />
          </div>

          {/* Error Correction Level */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Error Correction
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(["L", "M", "Q", "H"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setEcLevel(level)}
                  className={`rounded-lg py-1.5 text-xs font-semibold ${
                    ecLevel === level
                      ? "bg-purple-600 text-white"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              H (30%) is best for printed materials and damaged surfaces.
            </p>
          </div>

          {/* Color pickers */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Pattern Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="h-8 w-10 cursor-pointer rounded border border-slate-700 bg-transparent p-0"
                />
                <span className="font-mono text-xs text-slate-400">{fgColor}</span>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Background
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-8 w-10 cursor-pointer rounded border border-slate-700 bg-transparent p-0"
                />
                <span className="font-mono text-xs text-slate-400">{bgColor}</span>
              </div>
            </div>
          </div>

          {/* Include Margin */}
          <div>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={includeMargin}
                onChange={(e) => setIncludeMargin(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-purple-600"
              />
              <span>Quiet Zone Margin (recommended for scan reliability)</span>
            </label>
          </div>
        </div>

        {/* Live Canvas Preview & Download Actions */}
        <div className="glass-panel p-6 lg:col-span-2 flex flex-col items-center justify-between text-center">
          <div className="w-full">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrIcon size={16} className="text-purple-400" />
                <h3 className="text-sm font-bold text-white">Live Render Preview</h3>
              </div>
              <div className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                <ShieldCheck size={14} />
                <span>Mobile Scan Ready</span>
              </div>
            </div>

            <div className="mx-auto my-6 inline-block rounded-2xl border border-slate-700 p-6 shadow-2xl" style={{ backgroundColor: bgColor }}>
              <QRCodeSVG
                id="qr-studio-svg"
                value={activeUrl}
                size={size}
                fgColor={fgColor}
                bgColor={bgColor}
                level={ecLevel}
                includeMargin={includeMargin}
              />
            </div>

            <p className="font-mono text-xs text-purple-300 break-all max-w-md mx-auto">
              {activeUrl}
            </p>
          </div>

          {/* Export Action Controls */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 w-full border-t border-slate-800/80 pt-6">
            <button
              type="button"
              onClick={downloadPng}
              className="btn-primary"
            >
              <Download size={16} />
              <span>Download PNG (1000px High-Res)</span>
            </button>

            <button
              type="button"
              onClick={downloadSvg}
              className="btn-secondary"
            >
              <Download size={16} />
              <span>Download Vector SVG</span>
            </button>

            <button
              type="button"
              onClick={() => onCopy(activeUrl)}
              className="btn-secondary"
            >
              <Copy size={16} />
              <span>Copy Target URL</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

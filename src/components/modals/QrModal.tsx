"use client";

import { useEffect, useRef } from "react";
import { X, Copy, Download, QrCode as QrIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface QrModalProps {
  url: string | null;
  code: string | null;
  isOpen: boolean;
  onClose: () => void;
  onCopy: (text: string) => void;
}

export default function QrModal({
  url,
  code,
  isOpen,
  onClose,
  onCopy
}: QrModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && url) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen, url]);

  function downloadPng() {
    if (!url) return;
    const svg = document.getElementById("qr-modal-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = 600;
    canvas.height = 600;

    img.onload = () => {
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 40, 40, 520, 520);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `linkforge-qr-${code || "link"}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }

  function downloadSvg() {
    const svg = document.getElementById("qr-modal-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `linkforge-qr-${code || "link"}.svg`;
    downloadLink.click();
    URL.revokeObjectURL(svgUrl);
  }

  if (!url) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="qr-modal-title"
      onCancel={onClose}
      className="m-auto w-full max-w-sm rounded-2xl border border-slate-700/80 bg-[#0d1424] p-0 text-slate-100 shadow-2xl backdrop:bg-black/80"
    >
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div className="flex items-center gap-2">
          <QrIcon size={18} className="text-purple-400" />
          <h2 id="qr-modal-title" className="text-base font-bold text-white">
            QR Code
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-6 text-center">
        <div className="mx-auto inline-block rounded-2xl border border-slate-700 bg-white p-4 shadow-lg">
          <QRCodeSVG
            id="qr-modal-svg"
            value={url}
            size={220}
            level="H"
            includeMargin={true}
          />
        </div>

        <p className="mt-4 break-all text-xs font-mono text-purple-300">
          {url}
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onCopy(url)}
            className="btn-primary w-full"
            autoFocus
          >
            <Copy size={16} />
            <span>Copy Short URL</span>
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={downloadPng}
              className="btn-secondary w-full text-xs"
            >
              <Download size={14} />
              <span>PNG (High-Res)</span>
            </button>
            <button
              type="button"
              onClick={downloadSvg}
              className="btn-secondary w-full text-xs"
            >
              <Download size={14} />
              <span>Vector (SVG)</span>
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

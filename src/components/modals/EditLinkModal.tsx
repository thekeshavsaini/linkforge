"use client";

import { useEffect, useRef, useState } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import { LinkItem } from "@/types";

interface EditLinkModalProps {
  link: LinkItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updated: LinkItem) => void;
  adminKey: string;
}

export default function EditLinkModal({
  link,
  isOpen,
  onClose,
  onSaved,
  adminKey
}: EditLinkModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [destination, setDestination] = useState("");
  const [title, setTitle] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && link) {
      setDestination(link.destination);
      setTitle(link.title || "");
      setIsActive(link.isActive);
      if (link.expiresAt) {
        // Format ISO string to datetime-local compatible format YYYY-MM-DDTHH:mm
        const date = new Date(link.expiresAt);
        const pad = (n: number) => n.toString().padStart(2, "0");
        const formatted = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
          date.getDate()
        )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
        setExpiresAt(formatted);
      } else {
        setExpiresAt("");
      }
      setError(null);

      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen, link]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!link) return;

    setBusy(true);
    setError(null);

    try {
      const payload: {
        destination: string;
        title: string;
        expiresAt: string | null;
        isActive: boolean;
      } = {
        destination,
        title,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        isActive
      };

      const response = await fetch(`/api/links/${link.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update link");
      }

      onSaved(data.link);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving changes");
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="edit-link-title"
      onCancel={onClose}
      className="m-auto w-full max-w-lg rounded-2xl border border-slate-700/80 bg-[#0d1424] p-0 text-slate-100 shadow-2xl backdrop:bg-black/80"
    >
      <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <div>
          <h2 id="edit-link-title" className="text-lg font-bold text-white">
            Edit Short Link
          </h2>
          <p className="text-xs text-slate-400">
            /{link?.code} · Created {link ? new Date(link.createdAt).toLocaleDateString() : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-4 p-6">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-300">
            Destination URL *
          </label>
          <input
            type="url"
            className="field-input"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
            maxLength={2048}
            autoFocus
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-300">
            Link Title (Optional)
          </label>
          <input
            type="text"
            className="field-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Autumn Product Launch"
            maxLength={120}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">
              Expiration Date & Time
            </label>
            <input
              type="datetime-local"
              className="field-input"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
            {expiresAt && (
              <button
                type="button"
                onClick={() => setExpiresAt("")}
                className="mt-1 text-[11px] text-purple-400 hover:underline"
              >
                Clear expiration
              </button>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">
              Status
            </label>
            <div className="mt-2 flex items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500"
                />
                <span>Active link</span>
              </label>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Uncheck to pause redirects temporarily
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={busy}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={busy}>
            <Save size={16} />
            <span>{busy ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </dialog>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { LinkItem } from "@/types";

interface DeleteLinkModalProps {
  link: LinkItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: (id: string) => void;
  adminKey: string;
}

export default function DeleteLinkModal({
  link,
  isOpen,
  onClose,
  onDeleted,
  adminKey
}: DeleteLinkModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && link) {
      setError(null);
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen, link]);

  async function handleDelete() {
    if (!link) return;

    setBusy(true);
    setError(null);

    try {
      const response = await fetch(`/api/links/${link.id}`, {
        method: "DELETE",
        headers: {
          "x-admin-key": adminKey
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete link");
      }

      onDeleted(link.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting link");
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="delete-dialog-title"
      onCancel={onClose}
      className="m-auto w-full max-w-md rounded-2xl border border-slate-700/80 bg-[#0d1424] p-0 text-slate-100 shadow-2xl backdrop:bg-black/80"
    >
      <div className="p-6">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/15 text-rose-400">
          <AlertTriangle size={24} />
        </div>

        <h2
          id="delete-dialog-title"
          className="text-center text-lg font-bold text-white"
        >
          Delete Short Link?
        </h2>

        <p className="mt-2 text-center text-xs text-slate-400">
          Are you sure you want to delete <span className="font-semibold text-slate-200">/{link?.code}</span>? All click metrics and analytics for this URL will be permanently removed.
        </p>

        {error && (
          <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-center text-xs text-rose-300">
            {error}
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary w-full"
            disabled={busy}
            autoFocus
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="btn-danger w-full"
            disabled={busy}
          >
            <Trash2 size={16} />
            <span>{busy ? "Deleting..." : "Delete Permanently"}</span>
          </button>
        </div>
      </div>
    </dialog>
  );
}

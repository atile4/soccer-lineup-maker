"use client";

import Modal from "../Modal";
import { modalStyles } from "../modal.styles";
import { Button } from "../ui/Button";
import { Player } from "@/app/types";

interface DeletePlayerModalProps {
  open: boolean;
  player: Player;
  // Where the player currently sits in the active lineup (field / bench / etc.)
  status: string;
  deleting: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeletePlayerModal({
  open,
  player,
  status,
  deleting,
  error,
  onConfirm,
  onCancel,
}: DeletePlayerModalProps) {
  return (
    <Modal open={open} onClose={onCancel}>
      <h2 className={modalStyles.title}>Delete {player.name}?</h2>

      <p className={modalStyles.body}>
        This permanently removes this player from your roster and every lineup
        they appear in. This can’t be undone.
      </p>

      {/* Quick snapshot of the player before they’re gone */}
      <dl className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-surface-subtle px-3 py-2 text-center">
          <dt className="text-caption font-medium text-muted">Number</dt>
          <dd className="mt-0.5 text-body font-semibold text-ink">
            {player.number ? player.number : "—"}
          </dd>
        </div>
        <div className="rounded-lg bg-surface-subtle px-3 py-2 text-center">
          <dt className="text-caption font-medium text-muted">Position</dt>
          <dd className="mt-0.5 text-body font-semibold text-ink">
            {player.position || "—"}
          </dd>
        </div>
        <div className="rounded-lg bg-surface-subtle px-3 py-2 text-center">
          <dt className="text-caption font-medium text-muted">Status</dt>
          <dd className="mt-0.5 text-body-sm font-semibold text-ink">
            {status}
          </dd>
        </div>
      </dl>

      {error && <p className="mt-3 text-body-sm text-danger">{error}</p>}

      <div className={modalStyles.actions}>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={deleting}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={onConfirm}
          loading={deleting}
        >
          {deleting ? "Deleting…" : "Delete player"}
        </Button>
      </div>
    </Modal>
  );
}

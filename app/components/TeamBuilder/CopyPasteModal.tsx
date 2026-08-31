"use client";

import Modal from "../Modal";
import { modalStyles } from "../modal.styles";
import { Button } from "../ui/Button";

interface CopyPasteModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CopyPasteModal({ open, onClose }: CopyPasteModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <h2 className={modalStyles.title}>Copy &amp; paste</h2>
      <p className={modalStyles.body}>Paste your player list below.</p>
      <p className={modalStyles.body}>
        Separate different fields with commas, and different players with new
        lines.
      </p>
      <textarea
        className="mt-4 w-full min-h-[200px] px-3 py-2.5 text-body-sm text-ink bg-surface border border-border rounded-md placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-accent-border focus:border-accent resize-y"
        placeholder={"Johnathan Ho, 10, OMF\nJimmy, 15..."}
      />
      <div className={modalStyles.actions}>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" disabled>
          Add players
        </Button>
      </div>
    </Modal>
  );
}

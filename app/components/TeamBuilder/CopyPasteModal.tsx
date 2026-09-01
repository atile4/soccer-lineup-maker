"use client";

import { useState } from "react";
import Modal from "../Modal";
import { modalStyles } from "../modal.styles";
import { Button } from "../ui/Button";
import {
  parsePlayerListText,
  ParsedPlayer,
} from "@/app/utils/playerListParser";

interface CopyPasteModalProps {
  open: boolean;
  onClose: () => void;
  onPlayersParsed?: (players: ParsedPlayer[]) => void;
}

export default function CopyPasteModal({
  open,
  onClose,
  onPlayersParsed,
}: CopyPasteModalProps) {
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const handleClose = () => {
    setText("");
    setErrors([]);
    onClose();
  };

  const handleAddClick = () => {
    const result = parsePlayerListText(text);

    if (result.errors.length > 0) {
      setErrors(result.errors.map((e) => `Line ${e.line}: ${e.message}`));
      return;
    }

    setErrors([]);
    onPlayersParsed?.(result.players);
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <h2 className={modalStyles.title}>Copy &amp; paste</h2>
      <p className={modalStyles.body}>Paste your player list below.</p>
      <p className={modalStyles.body}>
        Separate different fields with commas, and different players with new
        lines.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="mt-4 w-full min-h-[200px] px-3 py-2.5 text-body-sm text-ink bg-surface border border-border rounded-md placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-accent-border focus:border-accent resize-y"
        placeholder={"Johnathan Ho, 10, OMF\nJimmy, 15..."}
      />

      {errors.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-left text-body-sm text-danger">
          {errors.map((message, i) => (
            <li key={i}>{message}</li>
          ))}
        </ul>
      )}

      <div className={modalStyles.actions}>
        <Button type="button" variant="ghost" onClick={handleClose}>
          Cancel
        </Button>
        <Button type="button" onClick={handleAddClick} disabled={!text.trim()}>
          Add players
        </Button>
      </div>
    </Modal>
  );
}

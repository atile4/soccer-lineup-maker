"use client";

import { useState } from "react";
import Modal from "../Modal";
import { modalStyles } from "../modal.styles";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface CreateGameModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
  creating?: boolean;
}

export default function CreateGameModal({
  open,
  onClose,
  onCreate,
  creating = false,
}: CreateGameModalProps) {
  const [name, setName] = useState("");
  const MAX_NAME_CHARS = 20;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return; // guard against blank names
    onCreate(name.trim());
    setName("");
  };

  const handleClose = () => {
    setName(""); // reset the draft if they cancel
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <h2 className={modalStyles.title}>New Game</h2>

      <form onSubmit={handleSubmit} className="mt-4">
        <label htmlFor="game-name" className={modalStyles.fieldLabel}>
          Game Name
        </label>
        <Input
          id="game-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, MAX_NAME_CHARS))}
          maxLength={MAX_NAME_CHARS}
          placeholder="vs. Golden Griffins"
          autoFocus
        />
        <div className="mt-0.5 flex justify-end text-[10px] leading-none text-faint">
          {name.length}/{MAX_NAME_CHARS}
        </div>

        <div className={modalStyles.actions}>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={creating}
          >
            Cancel
          </Button>
          <Button type="submit" loading={creating} disabled={!name.trim()}>
            {creating ? "Creating…" : "Create game"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

"use client";

import { useCallback, useRef, useState } from "react";
import Modal from "../Modal";
import { modalStyles } from "../modal.styles";
import { Button } from "../ui/Button";
import { FileSpreadsheet, Upload, X } from "lucide-react";
import { parseSpreadsheet } from "@/app/utils/spreadsheetParser";
import type { ParsedPlayer, ParseError } from "@/app/utils/playerListParser";

interface ExcelImportModalProps {
  open: boolean;
  onClose: () => void;
  onPlayersParsed?: (players: ParsedPlayer[]) => void;
}

export default function ExcelImportModal({
  open,
  onClose,
  onPlayersParsed,
}: ExcelImportModalProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [players, setPlayers] = useState<ParsedPlayer[]>([]);
  const [errors, setErrors] = useState<ParseError[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFileName(null);
    setPlayers([]);
    setErrors([]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const processFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (!(data instanceof ArrayBuffer)) return;
      const result = parseSpreadsheet(data, file.name);
      setFileName(file.name);
      setPlayers(result.players);
      setErrors(result.errors);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleAdd = () => {
    if (players.length === 0) return;
    onPlayersParsed?.(players);
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <h2 className={modalStyles.title}>Import spreadsheet</h2>
      <p className={modalStyles.body}>
        Upload a .xls, .xlsx, or .csv file. Columns for name, number, and
        position will be detected automatically from headers.
      </p>

      {!fileName ? (
        <div
          className={`mt-4 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
            dragOver
              ? "border-accent bg-accent/5"
              : "border-border hover:border-muted"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
        >
          <Upload size={24} className="text-muted" />
          <span className="text-body-sm font-semibold text-ink">
            Drop file here or click to browse
          </span>
          <span className="text-caption text-muted">
            .xls, .xlsx, or .csv
          </span>
          <input
            ref={inputRef}
            type="file"
            accept=".xls,.xlsx,.csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="mt-4">
          <div className="flex items-center justify-between rounded-md bg-surface-subtle px-3 py-2 mb-3">
            <span className="flex items-center gap-2 text-body-sm font-semibold text-ink truncate">
              <FileSpreadsheet size={14} className="shrink-0 text-muted" />
              {fileName}
            </span>
            <button
              type="button"
              onClick={reset}
              className="rounded p-1 text-muted hover:text-ink hover:bg-surface transition-colors"
              aria-label="Remove file"
            >
              <X size={14} />
            </button>
          </div>

          {errors.length > 0 && (
            <ul className="mb-3 max-h-24 overflow-y-auto space-y-0.5 text-left text-body-sm text-danger">
              {errors.map((e, i) => (
                <li key={i}>
                  Row {e.line}: {e.message}
                </li>
              ))}
            </ul>
          )}

          {players.length > 0 && (
            <div className="max-h-48 overflow-y-auto rounded-md border border-border">
              <table className="w-full text-body-sm">
                <thead className="sticky top-0 bg-surface-subtle">
                  <tr>
                    <th className="px-3 py-1.5 text-left text-caption font-semibold text-muted">
                      Name
                    </th>
                    <th className="px-3 py-1.5 text-center text-caption font-semibold text-muted w-12">
                      #
                    </th>
                    <th className="px-3 py-1.5 text-left text-caption font-semibold text-muted">
                      Position
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((p, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-1.5 text-ink font-medium truncate max-w-[180px]">
                        {p.name}
                      </td>
                      <td className="px-3 py-1.5 text-center text-muted tabular-nums">
                        {p.number || "—"}
                      </td>
                      <td className="px-3 py-1.5 text-muted truncate max-w-[120px]">
                        {p.position || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {players.length === 0 && errors.length === 0 && (
            <p className="text-body-sm text-muted text-center py-4">
              No valid players found in file.
            </p>
          )}
        </div>
      )}

      <div className={modalStyles.actions}>
        <Button type="button" variant="ghost" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleAdd}
          disabled={players.length === 0}
        >
          Add {players.length > 0 ? players.length : ""} player
          {players.length !== 1 ? "s" : ""}
        </Button>
      </div>
    </Modal>
  );
}

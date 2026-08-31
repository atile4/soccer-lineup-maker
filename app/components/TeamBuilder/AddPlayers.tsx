"use client";

import { useState } from "react";
import { Clipboard, FileSpreadsheet, UserPlus } from "lucide-react";
import { teamBuilderStyles as s } from "./TeamBuilder.styles";
import { MAX_PLAYER_NAME_CHARS } from "@/app/constants/playerLimits";
import { MAX_PLAYER_NUMBER_CHARS } from "@/app/constants/playerLimits";
import { MAX_PLAYER_POSITION_CHARS } from "@/app/constants/playerLimits";
import CopyPasteModal from "./CopyPasteModal";

import { ParsedPlayer } from "@/app/utils/playerListParser";

type AddPlayersProps = {
  playerName: string;
  number: string;
  position: string;
  onPlayerNameChange: (value: string) => void;
  onNumberChange: (value: string) => void;
  onPositionChange: (value: string) => void;
  onAddPlayer: (e: React.FormEvent) => void;
  onPlayersParsed: (players: ParsedPlayer[]) => void;
  playerNameRef: React.Ref<HTMLInputElement>;
};

export default function AddPlayers({
  playerName,
  number,
  position,
  onPlayerNameChange,
  onNumberChange,
  onPositionChange,
  onAddPlayer,
  onPlayersParsed,
  playerNameRef,
}: AddPlayersProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className={s.addCard}>
      <h3 className={s.addCardTitle}>Add players</h3>

      <div className={s.importBlock}>
        <span className={s.sectionLabel}>Import</span>
        <div className={s.importButtons}>
          <button
            type="button"
            className={s.importButton}
            onClick={() => setModalOpen(true)}
          >
            <Clipboard size={14} />
            Copy &amp; paste
          </button>
          <button type="button" className={s.importButton}>
            <FileSpreadsheet size={14} />
            Through .xls file
          </button>
        </div>
      </div>

      <div className={s.manualBlock}>
        <span className={s.sectionLabel}>Add manually</span>
        <form onSubmit={onAddPlayer} className={s.addForm}>
          <div className={s.formField}>
            <label className={s.formLabel}>Name</label>
            <div className={s.formInputWrap}>
              <input
                ref={playerNameRef}
                type="text"
                value={playerName}
                onChange={(e) =>
                  onPlayerNameChange(
                    e.target.value.slice(0, MAX_PLAYER_NAME_CHARS),
                  )
                }
                maxLength={MAX_PLAYER_NAME_CHARS}
                placeholder="e.g. Alex Morgan"
                className={s.formInput}
              />
              <span className={s.formCounter}>
                {playerName.length}/{MAX_PLAYER_NAME_CHARS}
              </span>
            </div>
          </div>
          <div className={s.formField}>
            <label className={s.formLabel}># (optional)</label>
            <div className={s.formInputWrap}>
              <input
                type="text"
                inputMode="numeric"
                value={number}
                onChange={(e) =>
                  onNumberChange(
                    e.target.value
                      .replace(/[^0-9]/g, "")
                      .slice(0, MAX_PLAYER_NUMBER_CHARS),
                  )
                }
                maxLength={MAX_PLAYER_NUMBER_CHARS}
                placeholder="00"
                className={`${s.formInput} ${s.formInputCenter}`}
              />
              <span className={s.formCounter}>
                {number.length}/{MAX_PLAYER_NUMBER_CHARS}
              </span>
            </div>
          </div>
          <div className={s.formField}>
            <label className={s.formLabel}>Position (optional)</label>
            <div className={s.formInputWrap}>
              <input
                type="text"
                value={position}
                onChange={(e) =>
                  onPositionChange(
                    e.target.value.slice(0, MAX_PLAYER_POSITION_CHARS),
                  )
                }
                maxLength={MAX_PLAYER_POSITION_CHARS}
                placeholder="e.g. OMF, DMF, LW"
                className={s.formInput}
              />
              <span className={s.formCounter}>
                {position.length}/{MAX_PLAYER_POSITION_CHARS}
              </span>
            </div>
          </div>
          <button type="submit" className={s.addButton}>
            <span className="inline-flex items-center gap-1.5">
              <UserPlus size={14} /> Add
            </span>
          </button>
        </form>
      </div>

      <CopyPasteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onPlayersParsed={onPlayersParsed}
      />
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Users, UserPlus, X } from "lucide-react";
import { teamBuilderStyles as s } from "./TeamBuilder.styles";
import { Division, Gender } from "@/app/types";
import { useAuth } from "@/context/AuthContext";
import { useTeam } from "@/context/TeamContext";
import { createTeamWithDefaultGame } from "@/services/teams";
import { createPlayers, NewPlayer } from "@/services/players";
import ColorSwitcher from "@/app/components/ui/ColorSwitcher";
import { useRouter } from "next/navigation";
import {
  MAX_PLAYER_NAME_CHARS,
  MAX_PLAYER_NUMBER_CHARS,
  MAX_PLAYER_POSITION_CHARS,
} from "@/app/constants/playerLimits";

const GENDER_OPTIONS: Gender[] = ["Boys", "Girls", "Coed"];

const MAX_TEAM_NAME_CHARS = 20;

export const DIVISIONS: Division[] = [
  "U-8",
  "U-10",
  "U-12",
  "U-14",
  "U-16",
  "U-18",
];

// A player the coach has added to the roster but hasn't saved yet.
// Only exists in this component's state until "Save team" is clicked.
type DraftPlayer = {
  draftId: string; // client-side only, not a DB id
  name: string;
  number: string; // kept as string while editing, parsed to int on save
  position: string;
};

export default function TeamBuilder() {
  const { session } = useAuth();
  const { refreshTeams } = useTeam();

  const [teamName, setTeamName] = useState("");
  const [division, setDivision] = useState<Division>("U-12");
  const [gender, setGender] = useState<Gender>("Coed");
  const [color, setColor] = useState("#2563eb");
  const [players, setPlayers] = useState<DraftPlayer[]>([]);

  // Add-player form fields
  const [playerName, setPlayerName] = useState("");
  const [number, setNumber] = useState("");
  const [position, setPosition] = useState("");

  const playerNameRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const router = useRouter();

  const isDirty =
    teamName.trim() !== "" || color !== "#2563eb" || players.length > 0;

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const showToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(null), 2500);
  };

  // Recomputed whenever the roster changes — flags any jersey number
  // used by more than one player so the coach can catch it before saving.
  const duplicateNumbers = useMemo(() => {
    const counts: Record<string, number> = {};
    players.forEach((p) => {
      if (p.number) counts[p.number] = (counts[p.number] ?? 0) + 1;
    });
    return Object.keys(counts).filter((n) => counts[n] > 1);
  }, [players]);

  const dupeMessage =
    duplicateNumbers.length === 1
      ? `${duplicateNumbers.length} players share #${duplicateNumbers[0]}`
      : duplicateNumbers.length > 1
        ? `${duplicateNumbers.length} jersey numbers are used more than once (${duplicateNumbers
            .map((n) => `#${n}`)
            .join(", ")})`
        : "";

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      showToast("Enter a player name first");
      return;
    }
    setPlayers((prev) => [
      ...prev,
      {
        draftId: crypto.randomUUID(),
        name: playerName.trim(),
        number: number.trim(),
        position: position.trim(),
      },
    ]);
    setPlayerName("");
    setNumber("");
    setPosition("");
    playerNameRef.current?.focus();
  };

  const handleRemovePlayer = (draftId: string) => {
    setPlayers((prev) => prev.filter((p) => p.draftId !== draftId));
  };

  const handleSaveTeam = async () => {
    if (!session?.user?.id) {
      showToast("You need to be logged in to save a team");
      return;
    }
    if (!teamName.trim()) {
      showToast("Give your team a name first");
      return;
    }

    setSaving(true);
    try {
      const team = await createTeamWithDefaultGame(
        session.user.id,
        teamName.trim(),
        division,
        gender,
        color,
      );

      if (players.length > 0) {
        const newPlayers: NewPlayer[] = players.map((p) => ({
          name: p.name || "Unnamed player",
          number: p.number ? parseInt(p.number, 10) : 0,
          position: p.position,
        }));
        await createPlayers(team.id, newPlayers);
      }

      showToast(`Saved "${team.name}" · ${players.length} players`);
      setTeamName("");
      setPlayers([]);
      // Pull the new team into shared state so the header/switcher reflect it
      // once we navigate back to "/".
      await refreshTeams();
    } catch (err) {
      console.error("Failed to save team:", err);
      showToast("Something went wrong saving your team. Try again.");
    } finally {
      setSaving(false);
      router.push("/");
    }
  };

  return (
    <div className={s.page}>
      <div className={s.container}>
        {/* Heading */}
        <div className={s.headingRow}>
          <div>
            <h2 className={s.title}>Team Builder</h2>
          </div>
          <div className={s.headingActions}>
            <span className={s.playerCountLabel}>{players.length} players</span>
            <button
              type="button"
              className={s.saveButton}
              onClick={handleSaveTeam}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save team"}
            </button>
          </div>
        </div>

        <div className={s.grid}>
          {/* Left: team details */}
          <section className={s.detailsCard}>
            <h3 className={s.cardTitle}>
              <span className={s.cardIcon}>
                <Users size={13} />
              </span>
              Team details
            </h3>

            {/* Jersey preview */}
            <div className={s.jerseyPreview}>
              <svg viewBox="0 0 100 90" width="52" height="47">
                <path
                  d="M25 10 L10 30 L25 35 L25 80 L75 80 L75 35 L90 30 L75 10 C70 18 60 22 50 22 C40 22 30 18 25 10Z"
                  fill={color}
                  stroke="var(--color-ink)"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="min-w-0">
                <div className={s.jerseyPreviewName}>
                  {teamName.trim() || "Your team name"}
                </div>
                <div className={s.jerseyPreviewMeta}>
                  {[division, gender].join(" · ")}
                </div>
              </div>
            </div>

            <label className={s.fieldLabel}>Team name</label>
            <div className={s.formInputWrap}>
              <input
                type="text"
                value={teamName}
                onChange={(e) =>
                  setTeamName(e.target.value.slice(0, MAX_TEAM_NAME_CHARS))
                }
                maxLength={MAX_TEAM_NAME_CHARS}
                placeholder="e.g. Thunderbolts"
                className={s.textInput}
              />
              <span className={s.formCounter}>
                {teamName.length}/{MAX_TEAM_NAME_CHARS}
              </span>
            </div>

            <label className={s.fieldLabel}>Division</label>
            <div className={s.selectWrapper}>
              <select
                value={division}
                onChange={(e) => setDivision(e.target.value as Division)}
                className={s.selectInput}
              >
                {DIVISIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <ChevronDown className={s.selectChevron} />
            </div>

            <label className={s.fieldLabel}>Team</label>
            <div className={s.segmentedGroup}>
              {GENDER_OPTIONS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`${s.segmentedOption} ${
                    gender === g
                      ? s.segmentedOptionActive
                      : s.segmentedOptionInactive
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            <label className={s.fieldLabel}>Jersey color</label>
            <ColorSwitcher value={color} onChange={setColor} />
          </section>

          {/* Right: roster */}
          <section className={s.rightCol}>
            {/* Add player */}
            <div className={s.addCard}>
              <h3 className={s.addCardTitle}>Add players</h3>
              <form onSubmit={handleAddPlayer} className={s.addForm}>
                <div className={s.formField}>
                  <label className={s.formLabel}>Name</label>
                  <div className={s.formInputWrap}>
                    <input
                      ref={playerNameRef}
                      type="text"
                      value={playerName}
                      onChange={(e) =>
                        setPlayerName(
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
                        setNumber(
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
                        setPosition(
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

            {/* Duplicate number warning */}
            {duplicateNumbers.length > 0 && (
              <div className={s.dupeWarning}>
                <span className={s.dupeWarningText}>{dupeMessage}</span>
              </div>
            )}

            {/* Roster */}
            <div className={s.rosterCard}>
              <div className={s.rosterHeader}>
                <h3 className={s.rosterTitle}>Roster</h3>
                <span className={s.rosterCount}>{players.length}</span>
              </div>

              {players.length === 0 ? (
                <div className={s.emptyState}>
                  <div className={s.emptyIcon}>
                    <Users size={22} />
                  </div>
                  <p className={s.emptyTitle}>No players yet</p>
                  <p className={s.emptySubtitle}>
                    Add your first player above to start the roster.
                  </p>
                </div>
              ) : (
                <ul className={s.rosterList}>
                  {players.map((p) => {
                    const isDupe =
                      p.number && duplicateNumbers.includes(p.number);
                    const name = p.name || "Unnamed player";
                    return (
                      <li
                        key={p.draftId}
                        className={`${s.rosterRow} ${isDupe ? s.rosterRowDupe : ""}`}
                      >
                        <div className={s.numberBadge}>{p.number || "–"}</div>
                        <div className="flex-1 min-w-0">
                          <div className={s.rosterName}>{name}</div>
                          <div className={s.rosterSub}>
                            {p.number ? `No. ${p.number}` : "No number"}
                          </div>
                        </div>
                        {p.position && (
                          <span className={s.positionChip}>{p.position}</span>
                        )}
                        <button
                          type="button"
                          aria-label="Delete player"
                          className={s.deleteButton}
                          onClick={() => handleRemovePlayer(p.draftId)}
                        >
                          <X size={16} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>

      {toast && <div className={s.toast}>{toast}</div>}
    </div>
  );
}

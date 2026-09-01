"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { teamBuilderStyles as s } from "./TeamBuilder.styles";
import { Division, Gender } from "@/app/types";
import { useAuth } from "@/context/AuthContext";
import { useTeam } from "@/context/TeamContext";
import { createTeamWithDefaultGame } from "@/services/teams";
import { createPlayers, NewPlayer } from "@/services/players";
import { ParsedPlayer } from "@/app/utils/playerListParser";
import { useRouter } from "next/navigation";
import TeamDetails from "./TeamDetails";
import AddPlayers from "./AddPlayers";
import Roster from "./Roster";

// A player the coach has added to the roster but hasn't saved yet.
// Only exists in this component's state until "Save team" is clicked.
export type DraftPlayer = {
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

  const handleUpdatePlayer = (
    draftId: string,
    updates: Partial<Pick<DraftPlayer, "name" | "number" | "position">>,
  ) => {
    setPlayers((prev) =>
      prev.map((p) => (p.draftId === draftId ? { ...p, ...updates } : p)),
    );
  };

  const handleRemovePlayer = (draftId: string) => {
    setPlayers((prev) => prev.filter((p) => p.draftId !== draftId));
  };

  const handlePlayersParsed = (parsed: ParsedPlayer[]) => {
    setPlayers((prev) => [
      ...prev,
      ...parsed.map((p) => ({
        draftId: crypto.randomUUID(),
        name: p.name,
        number: p.number,
        position: p.position,
      })),
    ]);
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
          <TeamDetails
            teamName={teamName}
            division={division}
            gender={gender}
            color={color}
            onTeamNameChange={setTeamName}
            onDivisionChange={setDivision}
            onGenderChange={setGender}
            onColorChange={setColor}
          />

          {/* Right: roster */}
          <section className={s.rightCol}>
            <AddPlayers
              playerName={playerName}
              number={number}
              position={position}
              onPlayerNameChange={setPlayerName}
              onNumberChange={setNumber}
              onPositionChange={setPosition}
              onAddPlayer={handleAddPlayer}
              onPlayersParsed={handlePlayersParsed}
              playerNameRef={playerNameRef}
            />

            <Roster
              players={players}
              duplicateNumbers={duplicateNumbers}
              onUpdatePlayer={handleUpdatePlayer}
              onRemovePlayer={handleRemovePlayer}
            />
          </section>
        </div>
      </div>

      {toast && <div className={s.toast}>{toast}</div>}
    </div>
  );
}

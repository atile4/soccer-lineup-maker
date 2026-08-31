"use client";

import { ChevronDown, Users } from "lucide-react";
import { teamBuilderStyles as s } from "./TeamBuilder.styles";
import ColorSwitcher from "@/app/components/ui/ColorSwitcher";
import { Division, Gender } from "@/app/types";
import { MAX_TEAM_NAME_CHARS } from "@/app/constants/playerLimits";

const GENDER_OPTIONS: Gender[] = ["Boys", "Girls", "Coed"];

export const DIVISIONS: Division[] = [
  "U-8",
  "U-10",
  "U-12",
  "U-14",
  "U-16",
  "U-18",
];

type TeamDetailsProps = {
  teamName: string;
  division: Division;
  gender: Gender;
  color: string;
  onTeamNameChange: (value: string) => void;
  onDivisionChange: (value: Division) => void;
  onGenderChange: (value: Gender) => void;
  onColorChange: (value: string) => void;
};

export default function TeamDetails({
  teamName,
  division,
  gender,
  color,
  onTeamNameChange,
  onDivisionChange,
  onGenderChange,
  onColorChange,
}: TeamDetailsProps) {
  return (
    <section className={s.detailsCard}>
      <h3 className={s.cardTitle}>
        <span className={s.cardIcon}>
          <Users size={13} />
        </span>
        Team details
      </h3>

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
          onChange={(e) => onTeamNameChange(e.target.value.slice(0, MAX_TEAM_NAME_CHARS))}
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
          onChange={(e) => onDivisionChange(e.target.value as Division)}
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
            onClick={() => onGenderChange(g)}
            className={`${s.segmentedOption} ${
              gender === g ? s.segmentedOptionActive : s.segmentedOptionInactive
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <label className={s.fieldLabel}>Jersey color</label>
      <ColorSwitcher value={color} onChange={onColorChange} />
    </section>
  );
}

// app/utils/playerListParser.ts

import {
  MAX_PLAYER_NAME_CHARS,
  MAX_PLAYER_NUMBER_CHARS,
  MAX_PLAYER_POSITION_CHARS,
} from "@/app/constants/playerLimits";

export interface ParsedPlayer {
  name: string;
  number: string; // kept as a string, same as the manual add form —
  // parsed to int only right before hitting the DB
  position: string;
}

export interface ParseError {
  line: number; // 1-indexed, so it matches what the user sees in the textarea
  message: string;
}

export interface ParseResult {
  players: ParsedPlayer[];
  errors: ParseError[];
}

// Parses pasted text into player rows.
// Each non-blank line is "name, number, position" — number and position
// are optional, but a position without a number is treated as an error
// (a player must have a number to have a position).
export function parsePlayerListText(text: string): ParseResult {
  const lines = text.split(/\r?\n/);
  const players: ParsedPlayer[] = [];
  const errors: ParseError[] = [];

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();
    if (!line) return; // silently skip blank lines (e.g. trailing newline)

    const lineNumber = idx + 1;
    const parts = line.split(",").map((p) => p.trim());

    if (parts.length > 3) {
      errors.push({
        line: lineNumber,
        message: "Too many commas — expected name, number, position.",
      });
      return;
    }

    const [name, number = "", position = ""] = parts;

    if (!name) {
      errors.push({ line: lineNumber, message: "Missing player name." });
      return; // no name means nothing else on this line is trustworthy
    }

    if (name.length > MAX_PLAYER_NAME_CHARS) {
      errors.push({
        line: lineNumber,
        message: `"${name}" is longer than ${MAX_PLAYER_NAME_CHARS} characters.`,
      });
    }

    if (position && !number) {
      errors.push({
        line: lineNumber,
        message: `"${name}" has a position but no number — a number is required first.`,
      });
    }

    if (number) {
      if (!/^\d+$/.test(number)) {
        errors.push({
          line: lineNumber,
          message: `"${number}" for ${name} must contain digits only.`,
        });
      } else if (number.length > MAX_PLAYER_NUMBER_CHARS) {
        errors.push({
          line: lineNumber,
          message: `"${number}" for ${name} is more than ${MAX_PLAYER_NUMBER_CHARS} digits.`,
        });
      }
    }

    if (position.length > MAX_PLAYER_POSITION_CHARS) {
      errors.push({
        line: lineNumber,
        message: `"${position}" for ${name} is longer than ${MAX_PLAYER_POSITION_CHARS} characters.`,
      });
    }

    players.push({ name, number, position });
  });

  return { players, errors };
}

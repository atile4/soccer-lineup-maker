import * as XLSX from "xlsx";
import type { ParseResult } from "./playerListParser";
import {
  MAX_PLAYER_NAME_CHARS,
  MAX_PLAYER_NUMBER_CHARS,
  MAX_PLAYER_POSITION_CHARS,
} from "@/app/constants/playerLimits";

const HEADER_ALIASES: Record<string, "name" | "number" | "position"> = {
  name: "name",
  player: "name",
  playername: "name",
  "player name": "name",
  "#": "number",
  num: "number",
  number: "number",
  jersey: "number",
  "# number": "number",
  pos: "position",
  position: "position",
};

function detectColumns(headers: string[]): {
  nameIdx: number;
  numberIdx: number;
  positionIdx: number;
} {
  let nameIdx = -1;
  let numberIdx = -1;
  let positionIdx = -1;

  headers.forEach((h, i) => {
    const key = h.toLowerCase().trim();
    const mapped = HEADER_ALIASES[key];
    if (mapped === "name" && nameIdx === -1) nameIdx = i;
    else if (mapped === "number" && numberIdx === -1) numberIdx = i;
    else if (mapped === "position" && positionIdx === -1) positionIdx = i;
  });

  // Fallback: if no header matched, assume first 3 columns are name, number, position
  if (nameIdx === -1 && numberIdx === -1 && positionIdx === -1) {
    nameIdx = 0;
    numberIdx = 1;
    positionIdx = 2;
  } else if (nameIdx === -1) {
    nameIdx = 0;
  }

  return { nameIdx, numberIdx, positionIdx };
}

export function parseSpreadsheet(
  data: ArrayBuffer,
  filename: string,
): ParseResult {
  const workbook = XLSX.read(data, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { players: [], errors: [{ line: 1, message: "Spreadsheet is empty." }] };
  }

  const sheet = workbook.Sheets[sheetName];
  const raw: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  if (raw.length === 0) {
    return { players: [], errors: [{ line: 1, message: "Spreadsheet contains no rows." }] };
  }

  const headers = (raw[0] ?? []).map(String);
  const { nameIdx, numberIdx, positionIdx } = detectColumns(headers);

  // Check if the first row looks like a header (any recognized keyword)
  const firstRowIsHeader = headers.some(
    (h) => HEADER_ALIASES[h.toLowerCase().trim()] !== undefined,
  );
  const startRow = firstRowIsHeader ? 1 : 0;

  const players: ParseResult["players"] = [];
  const errors: ParseResult["errors"] = [];

  for (let i = startRow; i < raw.length; i++) {
    const row = raw[i];
    const rowNum = i + 1; // 1-indexed for display

    // Skip completely empty rows
    if (!row || row.every((cell) => cell === null || cell === undefined || cell === "")) {
      continue;
    }

    const rawName = row[nameIdx];
    const name = String(rawName ?? "").trim();
    const rawNumber = numberIdx >= 0 ? row[numberIdx] : undefined;
    const number = String(rawNumber ?? "").trim();
    const rawPosition = positionIdx >= 0 ? row[positionIdx] : undefined;
    const position = String(rawPosition ?? "").trim();

    if (!name) {
      errors.push({ line: rowNum, message: "Missing player name." });
      continue;
    }

    if (name.length > MAX_PLAYER_NAME_CHARS) {
      errors.push({
        line: rowNum,
        message: `"${name}" exceeds ${MAX_PLAYER_NAME_CHARS} characters.`,
      });
    }

    if (position && !number) {
      errors.push({
        line: rowNum,
        message: `"${name}" has a position but no number — a number is required first.`,
      });
    }

    if (number) {
      if (!/^\d+$/.test(number)) {
        errors.push({
          line: rowNum,
          message: `"${number}" for ${name} must contain digits only.`,
        });
      } else if (number.length > MAX_PLAYER_NUMBER_CHARS) {
        errors.push({
          line: rowNum,
          message: `"${number}" for ${name} is more than ${MAX_PLAYER_NUMBER_CHARS} digits.`,
        });
      }
    }

    if (position.length > MAX_PLAYER_POSITION_CHARS) {
      errors.push({
        line: rowNum,
        message: `"${position}" for ${name} exceeds ${MAX_PLAYER_POSITION_CHARS} characters.`,
      });
    }

    players.push({ name, number, position });
  }

  return { players, errors };
}

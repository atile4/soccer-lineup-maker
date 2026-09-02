/**
 * Returns "black" or "white" depending on which provides better contrast
 * against the given jersey hex colour. Uses sRGB perceived luminance.
 */
export function numberColorFor(jerseyColor: string): string {
  const hex = jerseyColor.trim().replace(/^#/, "");
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  if (full.length !== 6 || /[^0-9a-fA-F]/.test(full)) return "white";

  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.6 ? "black" : "white";
}

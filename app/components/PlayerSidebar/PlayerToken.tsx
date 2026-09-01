// Presentational jersey + name, no card background

import type { CSSProperties } from "react";
import { numberColorFor } from "@/app/utils/color";

export type PlayerTokenVariant = "default" | "field" | "bench";

type PlayerTokenProps = {
  name: string;
  number: number;
  variant?: PlayerTokenVariant;
  jerseyColor?: string; // jersey fill color
  nameColor?: string; // player name text color (ignored for the "field" variant)
  // User-customizable size multiplier for the "field" and "bench" variants
  // (see PlayerSizeContext). Ignored by the "default" (sidebar) variant.
  scale?: number;
};

// For the "field" and "bench" variants, the base size lives in a `--tok` /
// `--tok-name` CSS variable (responsive so the tablet bump is preserved) and the
// final size is `base * scale` via calc(). The "default" (sidebar) variant keeps
// its static Tailwind size classes and ignores `scale`.
const SIZES: Record<
  PlayerTokenVariant,
  { svg: string; name: string; gap: string; scalable?: boolean }
> = {
  default: {
    svg: "w-20 h-20 sm:w-14 sm:h-14 md:w-16 md:h-16",
    name: "text-lg sm:text-sm",
    gap: "gap-1 sm:gap-2",
  },
  field: {
    svg: "[--tok:44px] md:[--tok:48px] lg:[--tok:44px]",
    name: "[--tok-name:11px] md:[--tok-name:14px] lg:[--tok-name:11px] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]",
    gap: "gap-0.5",
    scalable: true,
  },
  bench: {
    svg: "[--tok:36px]",
    name: "[--tok-name:10px]",
    gap: "gap-0.5",
    scalable: true,
  },
};

export default function PlayerToken({
  name,
  number,
  variant = "default",
  jerseyColor = "#7C3AED", // default jersey fill (user-selectable color data)
  nameColor = "var(--color-ink-2)", // default: body ink
  scale = 1,
}: PlayerTokenProps) {
  const size = SIZES[variant];
  const isField = variant === "field";
  const numberColor = numberColorFor(jerseyColor);

  // Scalable variants derive their pixel size from the CSS-var base × scale.
  const svgStyle = size.scalable
    ? {
        width: `calc(var(--tok) * ${scale})`,
        height: `calc(var(--tok) * ${scale})`,
      }
    : undefined;
  const nameStyle: CSSProperties | undefined = size.scalable
    ? {
        fontSize: `calc(var(--tok-name) * ${scale})`,
        ...(isField ? {} : { color: nameColor }),
      }
    : isField
      ? undefined
      : { color: nameColor };

  return (
    <div className={`flex flex-col items-center justify-center ${size.gap}`}>
      {/* Jersey SVG */}
      <svg
        viewBox="0 0 100 90"
        xmlns="http://www.w3.org/2000/svg"
        className={size.svg}
        style={svgStyle}
      >
        {/* Jersey body */}
        <path
          d="M25 10 L10 30 L25 35 L25 80 L75 80 L75 35 L90 30 L75 10 C70 18 60 22 50 22 C40 22 30 18 25 10Z"
          fill={jerseyColor}
          stroke="var(--color-ink)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Number */}
        <text
          x="50"
          y="58"
          textAnchor="middle"
          fontSize="26"
          fontWeight="bold"
          fill={numberColor}
          fontFamily="Arial, sans-serif"
        >
          {number}
        </text>
      </svg>

      {/* Player name */}
      <p
        className={`font-semibold text-center leading-tight ${size.name}`}
        style={nameStyle}
      >
        {name}
      </p>
    </div>
  );
}

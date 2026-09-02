"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { Button } from "@/app/components/ui/Button";
import { useLineup } from "@/context/LineupContext";
import { useRulesetWarnings } from "@/context/RulesetWarningsContext";
import { useRulesetEvaluation } from "@/app/hooks/useRulesetEvaluation";
import { AYSO_RULES } from "@/app/utils/ruleset/rules";
import { rulesetWarningStyles as styles } from "./RulesetWarning.styles";
import { cn } from "@/app/components/ui/cn";

const GAP = 8; // space between the anchor and the popover
const MARGIN = 8; // keep the popover this far from the viewport edges

// Field-side button reporting AYSO ruleset violations for the quarter being
// viewed. Hidden entirely when the preference is off; otherwise it turns amber
// with a count and opens a popover listing each offending player and the rule
// they break.
export default function RulesetWarning() {
  const { enabled } = useRulesetWarnings();
  const { current, elsewhere } = useRulesetEvaluation();
  const { players } = useLineup();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );

  // Position the popover to the right of the trigger button (the button hugs
  // the field's left edge, so right-of-trigger keeps it on-screen).
  useLayoutEffect(() => {
    if (!open) return;
    const button = buttonRef.current;
    const popover = popoverRef.current;
    if (!button || !popover) return;

    const anchorRect = button.getBoundingClientRect();
    const { offsetWidth: width, offsetHeight: height } = popover;

    const fitsBelow =
      anchorRect.bottom + GAP + height + MARGIN <= window.innerHeight;
    const top = fitsBelow
      ? anchorRect.bottom + GAP
      : Math.max(MARGIN, anchorRect.top - GAP - height);

    const fitsRight =
      anchorRect.left + width + GAP + MARGIN <= window.innerWidth;
    const left = fitsRight
      ? anchorRect.right + GAP
      : Math.max(MARGIN, anchorRect.left - GAP - width);

    setCoords({ top, left });
  }, [open]);

  // close on escape
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!enabled) return null;

  const count = current.length;
  const hasWarnings = count > 0;

  const ruleLabel = (ruleId: string) =>
    AYSO_RULES.find((r) => r.id === ruleId)?.label ?? ruleId;

  // "Jimmy, 10" — falls back to the id if the roster hasn't loaded yet.
  const playerLabel = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    return player ? `${player.name}, ${player.number}` : "Unknown player";
  };

  return (
    <>
      <div className={styles.buttonWrapper}>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          ref={buttonRef}
          className={cn(hasWarnings && styles.buttonWarning)}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={
            hasWarnings
              ? `${count} ruleset ${count === 1 ? "violation" : "violations"} this quarter`
              : "No ruleset violations this quarter"
          }
        >
          <AlertTriangle size={18} />
          {hasWarnings && (
            <span aria-hidden="true" className={styles.badge}>
              {count}
            </span>
          )}
        </Button>
        <div className={styles.tooltip}>
          <p>Shows players that violate guidelines</p>
          <p className={styles.tooltipHint}>To disable, go to profile menu</p>
        </div>
      </div>

      {open && (
        <>
          {/* Transparent full-screen layer to catch outside clicks. */}
          <div className={styles.overlay} onClick={() => setOpen(false)}>
            <div
              ref={popoverRef}
              role="dialog"
              aria-label="Ruleset warnings"
              className={cn(
                styles.popover,
                coords ? styles.popoverVisible : styles.popoverHidden,
              )}
              style={{ top: coords?.top ?? 0, left: coords?.left ?? 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {!hasWarnings ? (
                <p className={styles.clear}>
                  <CheckCircle2 size={16} className={styles.clearIcon} />
                  No violations in this quarter.
                </p>
              ) : (
                <ul className={styles.list} aria-label="Ruleset violations">
                  {current.map((violation, i) => (
                    <li
                      key={`${violation.ruleId}-${violation.playerId}-${i}`}
                      className={styles.item}
                    >
                      <div className={styles.itemHeader}>
                        <AlertTriangle size={14} className={styles.itemIcon} />
                        <span className={styles.itemPlayer}>
                          {playerLabel(violation.playerId)}
                        </span>
                        <span className={styles.itemRule}>
                          {ruleLabel(violation.ruleId)}
                        </span>
                      </div>
                      <p className={styles.itemMessage}>{violation.message}</p>
                    </li>
                  ))}
                </ul>
              )}

              {elsewhere.length > 0 && (
                <p className={styles.footnote}>
                  {elsewhere.length} more{" "}
                  {elsewhere.length === 1 ? "violation" : "violations"} in other
                  quarters.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

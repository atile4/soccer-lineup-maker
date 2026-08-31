export const benchStyles = {
  // Below lg: full-width strip below the field. At lg+: in-flow column beside it.
  wrapper: "flex w-full lg:w-auto flex-shrink-0 self-stretch",

  // Below lg: horizontal, full-width, auto-height bar. At lg+: the original
  // vertical column whose width animates open/closed. A recessed tray sitting
  // on the cream paper — surface-subtle fill with a soft inset shadow.
  benchArea:
    "bg-surface-subtle border border-border shadow-inner overflow-hidden flex flex-row lg:flex-col w-full lg:h-full rounded-lg lg:rounded-l-none transition-[width] duration-300 ease-in-out",
  benchAreaOpen: "min-h-20 lg:w-28 lg:min-h-0",
  benchAreaClosed: "lg:w-0 lg:border-0 lg:shadow-none",
  // Drop-target highlight when a player is dragged over the bench.
  benchAreaOver: "ring-2 ring-accent",

  innerWrapper:
    "w-full flex flex-row items-center gap-2 p-2 lg:flex-col lg:items-stretch lg:gap-0 lg:w-28 lg:min-w-28 lg:h-full",

  title:
    "text-overline text-muted text-center flex-shrink-0 mb-0 mr-2 lg:mb-2 lg:mr-0",

  // Below lg: horizontal scrolling row. At lg+: vertical scrolling list.
  list: "flex flex-row gap-2 overflow-x-auto flex-1 min-h-0 pr-0.5 lg:flex-col lg:gap-0 lg:space-y-2 lg:overflow-x-visible lg:overflow-y-auto",

  emptyText:
    "text-caption text-muted text-center px-1 lg:mt-2",

  // Wrapper around each benched player token (the DraggablePlayer).
  playerWrapper:
    "flex-shrink-0 rounded-lg bg-surface-subtle py-1 px-1 hover:bg-border transition-colors",

  // Placeholder tokens shown while the roster is still loading. They carry the
  // same --tok / --tok-name bases as the bench PlayerToken variant so the
  // skeletons occupy the same footprint as the real players (scale applied
  // inline, matching PlayerToken).
  skeletonWrapper:
    "flex-shrink-0 rounded-lg py-1 px-1 flex flex-col items-center gap-0.5 [--tok:36px] [--tok-name:10px]",
  skeletonJersey: "rounded-md bg-border animate-pulse",
  skeletonName: "rounded bg-border animate-pulse",

  // Collapse grip — desktop only; the mobile bench stays open as a drop target.
  gripButton:
    "hidden lg:flex self-center -mr-3 z-10 flex-shrink-0 w-6 h-14 rounded-md bg-muted hover:bg-ink-2 border border-border-strong shadow-sm items-center justify-center transition-colors",
  gripIcon: "h-4 w-4 text-white",
};

import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabase } from "@/lib/supabase";
import { fetchFieldPositionsForLineups } from "./fieldPositions";

vi.mock("@/lib/supabase", () => ({
  supabase: { from: vi.fn() },
}));

describe("fetchFieldPositionsForLineups", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns [] without hitting the database when given no lineups", async () => {
    const result = await fetchFieldPositionsForLineups([]);

    expect(result).toEqual([]);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("fetches every given lineup in a single query", async () => {
    const rows = [
      { id: "fp1", lineup_id: "q1", player_id: "a", x: 50, y: 50, bench: false },
      { id: "fp2", lineup_id: "q2", player_id: "a", x: null, y: null, bench: true },
    ];
    const mockIn = vi.fn(() => Promise.resolve({ data: rows, error: null }));
    const mockSelect = vi.fn(() => ({ in: mockIn }));
    (supabase.from as any).mockReturnValue({ select: mockSelect });

    const result = await fetchFieldPositionsForLineups(["q1", "q2"]);

    expect(supabase.from).toHaveBeenCalledWith("field_positions");
    expect(mockSelect).toHaveBeenCalledWith("*");
    expect(mockIn).toHaveBeenCalledWith("lineup_id", ["q1", "q2"]);
    expect(result).toEqual(rows);
  });

  it("throws when the query fails", async () => {
    const error = new Error("nope");
    const mockIn = vi.fn(() => Promise.resolve({ data: null, error }));
    (supabase.from as any).mockReturnValue({
      select: vi.fn(() => ({ in: mockIn })),
    });

    await expect(fetchFieldPositionsForLineups(["q1"])).rejects.toThrow("nope");
  });
});

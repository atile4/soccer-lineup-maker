import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchIsPremium } from "./premium";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from "@/lib/supabase";

describe("fetchIsPremium", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true when the user is on the allowlist", async () => {
    const mockMaybeSingle = vi.fn().mockResolvedValue({
      data: { user_id: "user-1" },
      error: null,
    });
    const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
    const mockSelect = vi.fn(() => ({ eq: mockEq }));
    (supabase.from as any).mockReturnValue({ select: mockSelect });

    const result = await fetchIsPremium("user-1");

    expect(supabase.from).toHaveBeenCalledWith("premium_users");
    expect(mockSelect).toHaveBeenCalledWith("user_id");
    expect(mockEq).toHaveBeenCalledWith("user_id", "user-1");
    expect(result).toBe(true);
  });

  it("returns false when the user is not on the allowlist", async () => {
    const mockMaybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });
    const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
    const mockSelect = vi.fn(() => ({ eq: mockEq }));
    (supabase.from as any).mockReturnValue({ select: mockSelect });

    const result = await fetchIsPremium("user-2");

    expect(result).toBe(false);
  });

  it("throws when Supabase returns an error", async () => {
    const mockMaybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "DB down" },
    });
    const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
    const mockSelect = vi.fn(() => ({ eq: mockEq }));
    (supabase.from as any).mockReturnValue({ select: mockSelect });

    await expect(fetchIsPremium("user-1")).rejects.toEqual({
      message: "DB down",
    });
  });
});

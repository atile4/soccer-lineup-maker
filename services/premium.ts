import { supabase } from "@/lib/supabase";

export async function fetchIsPremium(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("premium_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data !== null;
}

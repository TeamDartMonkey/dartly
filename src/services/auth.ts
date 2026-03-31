import { ApiError } from "@/lib/api-error";
import { createClient } from "@/lib/supabase-server";

export async function registerUser(email: string, password: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    if (error.message.includes("already registered")) {
      throw new ApiError(409, "Email is already registered. Please log in instead.");
    }
    throw new ApiError(400, error.message);
  }

  return data;
}

export async function loginUser(email: string, password: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw new ApiError(401, "Invalid email or password.");
  }

  return data;
}

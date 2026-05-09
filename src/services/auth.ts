import { ApiError } from "@/lib/api-error";
import logger from "@/lib/logger";
import { createClient } from "@/lib/supabase-server";

export async function registerUser(email: string, password: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    // Supabase returns AuthApiError with status 422 and code "user_already_exists"
    // when an email is taken (Supabase JS v2). Check both for resilience across versions.
    if (error.status === 422 || error.code === "user_already_exists") {
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

export async function logoutUser() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    // Log so an operator can diagnose persistent failures (cookie issues,
    // upstream Supabase outage). The user-facing message stays generic.
    logger.warn("Logout failed", { message: error.message });
    throw new ApiError(500, "Failed to log out.");
  }
}

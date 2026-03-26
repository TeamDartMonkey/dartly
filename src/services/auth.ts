import { supabase } from "@/services/supabase";

export async function registerUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    if (error.message.includes("already registered")) {
      throw new Error("Email is already registered. Please log in instead.");
    }
    throw new Error(error.message);
  }

  return data;
}

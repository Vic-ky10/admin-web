import { supabase } from "@/lib/supabase";

export async function login(email: string, password: string) {
  const response = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return response;
}
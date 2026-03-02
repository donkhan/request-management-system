import { supabase } from "../supabase";

export async function loginWithGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
    },
  });
}

export async function logout() {
  await supabase.auth.signOut();
  window.location.reload();
}
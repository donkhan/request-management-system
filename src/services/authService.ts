import { getSupabase } from "../supabase";

export async function loginWithGoogle() {
  await getSupabase().auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
    },
  });
}

export async function logout() {
  await getSupabase().auth.signOut();
  window.location.reload();
}
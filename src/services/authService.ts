import { getSupabase } from "../supabase";

export async function loginWithGoogle() {
  await getSupabase().auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        prompt: "select_account"
      }
    },
  });
}

export async function logout() {
  await getSupabase().auth.signOut();
  localStorage.removeItem("supabase.auth.token");
  Object.keys(localStorage).forEach((key) => {
  if (key.startsWith("sb-")) {
    localStorage.removeItem(key);
  }
});
  window.location.reload();
}
/** Posts to the server sign-out route, which clears the Supabase auth cookies
 *  with the correct options and redirects home — reliable across server + client
 *  (a client-only signOut often fails to clear the cookie set by the server). */
export default function SignOutButton({
  className = "btn-outline text-sm",
  full = false,
}: {
  className?: string;
  full?: boolean;
}) {
  return (
    <form action="/auth/signout" method="post" className={full ? "w-full" : "inline-flex"}>
      <button type="submit" className={`${className}${full ? " w-full" : ""}`}>
        Sign out
      </button>
    </form>
  );
}

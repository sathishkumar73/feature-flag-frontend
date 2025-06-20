import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirect root to /auth/signup
  redirect("/auth/signup");
  return null;
}

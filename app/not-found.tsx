import { redirect } from "next/navigation";

export default function NotFound() {
  // Redirect to /flags whenever a page is not found
  redirect("/flags");

  // Return null because redirect throws and doesn't render
  return null;
}

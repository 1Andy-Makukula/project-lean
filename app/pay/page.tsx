import { redirect } from "next/navigation";

// The pay flow requires an intent ID.
// Redirect bare /pay visitors back to the home page.
export default function PayIndexPage() {
    redirect("/");
}

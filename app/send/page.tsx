import { redirect } from "next/navigation";

// The send flow requires an item ID.
// Redirect bare /send visitors back to the home page.
export default function SendIndexPage() {
    redirect("/");
}

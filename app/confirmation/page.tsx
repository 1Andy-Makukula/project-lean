import { redirect } from "next/navigation";

// Confirmation is now shown inline on /pay/[intentId] after payment submission.
// Redirect bare /confirmation visitors back to the home page.
export default function ConfirmationPage() {
    redirect("/");
}

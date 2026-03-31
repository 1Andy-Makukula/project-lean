# KithLy 🎁

**A Trustless Escrow Engine for Cross-Border & Local Gifting**

KithLy is a lightweight, high-performance Next.js application designed to facilitate the secure gifting of physical items (like groceries or meals) using mobile money (Airtel Money). It acts as a state-driven escrow engine, ensuring that senders' funds are verified, recipients get secure claim codes, and local shops fulfill orders with zero friction.

## 🏗️ Architecture & Tech Stack

* **Framework:** Next.js 15 (App Router, Server Actions, Server Components)
* **Database:** Supabase PostgreSQL (Relational schema with strict foreign keys)
* **State Sync:** Supabase Realtime (WebSockets for instant UI updates)
* **Storage:** Supabase Storage (Public buckets for item imagery)
* **Styling:** Tailwind CSS & standard UI components (Shadcn/Lucide)
* **Deployment:** Vercel (Ready)

## ⚙️ The Core Escrow Loop

The platform is divided into four distinct, highly isolated portals:

### 1. The Sender Flow (Public)
Users browse a multi-vendor storefront. They select an item (or bundled combo) via a dual-action Item Card (Quick View or Direct Send). The system generates a unique **Intent ID**. The sender transfers funds via Airtel Money and inputs their resulting Transaction ID (TID) to lock the intent.

### 2. The Recipient Portal (`/claim/[code]`)
A hidden, real-time portal shared via WhatsApp. It listens to the database via WebSocket. While the intent is unverified, it shows a "Waiting for Payment" state. The exact millisecond the Admin verifies the TID, the UI performs a "Magic Flip" to reveal a secure 6-character alphanumeric claim code.

### 3. The Admin Control Room (`/admin`)
A central command center locked behind a Master PIN (`9999`). 
* **Transactions:** Verify incoming Airtel Money TIDs against the database and mark intents as `paid`.
* **Shops & Items (CRUD):** Add new partner shops, manage inventory, and upload item images directly from the PC to Supabase Storage. Includes 1-click stock toggling.

### 4. The Merchant Terminal (`/redeem`)
A multi-tenant dashboard for partner shops. Secured by unique Shop PINs (e.g., `2026` or `2027`). 
* **Fulfillment:** Shop owners input the customer's 6-character code to mark the intent as `redeemed` and hand over the physical good.
* **Metrics:** Displays isolated shop revenue, total sales, and active menu items.
* **Virality Engine:** Generates a custom WhatsApp share link (e.g., `?shop=ShopName`) for the merchant to market their specific KithLy storefront to their own customers.

## 🗄️ Database Schema Overview

* `shops`: Stores vendor data, locations, and unique secure PIN codes for multi-tenant login.
* `items`: Bound to shops. Stores pricing, descriptions for combos, stock status, and image URLs.
* `intents`: The core transactional table. Tracks state (`created` -> `payment_submitted` -> `paid` -> `redeemed`), the generated 6-character claim code, the sender's phone number, and the Airtel TID.

## 🚀 Getting Started Locally

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/1Andy-Makukula/project-lean.git](https://github.com/1Andy-Makukula/project-lean.git)
   cd project-lean

git add .
git commit -m "Update: Added dual-action item cards and TID flow"
2. Upgrade the Admin UI (components/admin-dashboard.tsx)
Now we add the input fields to the UI. Go to your ShopsTab component (around line 125).
Replace the Form state and handleCreate functions, and update the grid inputs with this exact block:

TypeScript
    // Form state
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [pinCode, setPinCode] = useState("");
    const [airtelNumber, setAirtelNumber] = useState("");
    const [airtelName, setAirtelName] = useState("");
    const [formError, setFormError] = useState("");

    useEffect(() => {
        getShops().then(setShops).finally(() => setLoading(false));
    }, []);

    function handleCreate() {
        if (!name.trim()) { setFormError("Shop name is required"); return; }
        if (!airtelNumber.trim()) { setFormError("Airtel Number is required for Direct-to-Shop payments"); return; }
        setFormError("");

        startTransition(async () => {
            const result = await createShop(name.trim(), location.trim(), pinCode.trim(), airtelNumber.trim(), airtelName.trim());
            if (result.success) {
                setName(""); setLocation(""); setPinCode(""); setAirtelNumber(""); setAirtelName(""); setShowForm(false);
                getShops().then(setShops);
            } else {
                setFormError(result.error || "Failed to create shop");
            }
        });
    }
(Inside the same ShopsTab, add these two fields to your form grid, right below the PIN code input):

TypeScript
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500">Airtel Number *</label>
                                <Input value={airtelNumber} onChange={(e) => setAirtelNumber(e.target.value)} placeholder="e.g. 097 357 5666" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500">Airtel Name *</label>
                                <Input value={airtelName} onChange={(e) => setAirtelName(e.target.value)} placeholder="e.g. Fresh Market Ltd" />
                            </div>
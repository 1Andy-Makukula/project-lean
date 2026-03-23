export type ShopItem = {
  id: string;
  shop: string;
  title: string;
  price: string;
  eta: string;
};

export const featuredItems: ShopItem[] = [
  {
    id: "meal-001",
    shop: "Mama Ruth Kitchen",
    title: "Family Lunch Pack",
    price: "MWK 18,000",
    eta: "Redeem today",
  },
  {
    id: "data-002",
    shop: "CityByte Telecom",
    title: "10GB Data Bundle",
    price: "MWK 22,500",
    eta: "Auto-issued in 5 mins",
  },
  {
    id: "fuel-003",
    shop: "SwiftFill Station",
    title: "Fuel Voucher",
    price: "MWK 30,000",
    eta: "Redeem at pump",
  },
  {
    id: "market-004",
    shop: "Fresh Basket Market",
    title: "Groceries Starter Pack",
    price: "MWK 25,000",
    eta: "Collected in-store",
  },
  {
    id: "clinic-005",
    shop: "Moyo Health Pharmacy",
    title: "Baby Care Essentials",
    price: "MWK 27,500",
    eta: "Pickup with code",
  },
  {
    id: "school-006",
    shop: "BrightPath Supplies",
    title: "School Kit",
    price: "MWK 16,800",
    eta: "Ready same day",
  },
];

export const senderContext = {
  senderName: "Naomi K.",
  recipientName: "Thandiwe",
  recipientPhone: "+265 991 120 455",
  message: "For the week ahead. Pick it up when it suits you.",
  shop: "Mama Ruth Kitchen",
  item: "Family Lunch Pack",
  price: "MWK 18,000",
  airtelMoneyNumber: "0999 220 220",
  referenceCode: "KLY-482771",
};

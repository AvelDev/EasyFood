export type Poll = {
  id: string;
  title: string;
  restaurantOptions: string[];
  createdBy: string;
  votingEndsAt: Date;
  orderingEndsAt?: Date;
  closed: boolean;
  selectedRestaurant: string | null;
};

export type Vote = {
  userId: string;
  restaurant: string;
  createdAt: Date;
};

export type Order = {
  userId: string;
  dish: string;
  notes: string;
  cost: number;
  createdAt: Date;
  userName?: string; // Nazwa użytkownika
  // Admin fields
  adminNotes?: string; // Uwagi administratora
  costAdjustment?: number; // Korekta kosztów
  paymentStatus?: "pending" | "paid" | "unpaid"; // Status płatności
  orderConfirmed?: boolean; // Czy zamówienie zostało potwierdzone
};

export type User = {
  uid: string;
  name: string;
  role: "admin" | "user";
  privacyPolicyAccepted?: boolean;
  privacyPolicyAcceptedAt?: Date;
};

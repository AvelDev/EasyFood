export type RestaurantOption = {
  name: string;
  url?: string; // Opcjonalny link do restauracji
};

export type Poll = {
  id: string;
  title: string;
  description?: string; // Opcjonalny opis głosowania
  restaurantOptions: string[] | RestaurantOption[]; // Może być tablicą stringów (backward compatibility) lub obiektów
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
  createdAt?: Date;
};

export type PollTemplate = {
  id: string;
  name: string;
  restaurantOptions: string[];
  votingDurationHours: number;
  orderingDurationHours?: number;
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
};

export type VotingOptionProposal = {
  id: string;
  pollId: string;
  restaurantName: string;
  proposedBy: string;
  proposedByName: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewedByName?: string;
  adminNotes?: string;
};

export type AppSettings = {
  discordWebhookUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string;
};

export type Poll = {
  id: string;
  title: string;
  restaurantOptions: string[];
  createdBy: string;
  votingEndsAt: Date;
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
};

export type User = {
  uid: string;
  name: string;
  email: string;
  role: "admin" | "user";
};
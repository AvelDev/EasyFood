import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot,
  documentId,
} from "firebase/firestore";
import { db } from "./firebase";
import { Poll, Vote, Order, User, VotingOptionProposal } from "@/types";
import type { Timestamp as TimestampType } from "firebase/firestore";

// Polls
export const createPoll = async (poll: Omit<Poll, "id">) => {
  const pollData: any = {
    ...poll,
    votingEndsAt: Timestamp.fromDate(poll.votingEndsAt),
    orderingEndsAt: poll.orderingEndsAt
      ? Timestamp.fromDate(poll.orderingEndsAt)
      : null,
  };

  // Ensure no undefined values
  if (pollData.description === undefined) {
    pollData.description = "";
  }

  // Ensure restaurant options don't have undefined url values
  if (pollData.restaurantOptions) {
    pollData.restaurantOptions = pollData.restaurantOptions.map(
      (option: any) => {
        if (typeof option === "string") {
          return { name: option };
        }
        const normalizedOption: { name: string; url?: string } = {
          name: option.name,
        };
        if (option.url && option.url.trim()) {
          normalizedOption.url = option.url.trim();
        }
        return normalizedOption;
      }
    );
  }

  const docRef = await addDoc(collection(db, "polls"), pollData);
  return docRef.id;
};

export const getPolls = async (): Promise<Poll[]> => {
  const querySnapshot = await getDocs(
    query(collection(db, "polls"), orderBy("votingEndsAt", "desc"))
  );
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    votingEndsAt: doc.data().votingEndsAt.toDate(),
    orderingEndsAt: doc.data().orderingEndsAt
      ? doc.data().orderingEndsAt.toDate()
      : undefined,
  })) as Poll[];
};

// Real-time polls listener
export const subscribeToPolls = (callback: (polls: Poll[]) => void) => {
  const q = query(collection(db, "polls"), orderBy("votingEndsAt", "desc"));

  return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
    const polls = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      votingEndsAt: doc.data().votingEndsAt.toDate(),
      orderingEndsAt: doc.data().orderingEndsAt
        ? doc.data().orderingEndsAt.toDate()
        : undefined,
    })) as Poll[];
    callback(polls);
  });
};

export const getPoll = async (id: string): Promise<Poll | null> => {
  const docRef = doc(db, "polls", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
      votingEndsAt: docSnap.data().votingEndsAt.toDate(),
      orderingEndsAt: docSnap.data().orderingEndsAt
        ? docSnap.data().orderingEndsAt.toDate()
        : undefined,
    } as Poll;
  }
  return null;
};

// Real-time poll listener
export const subscribeToPoll = (
  id: string,
  callback: (poll: Poll | null) => void
) => {
  const docRef = doc(db, "polls", id);

  return onSnapshot(docRef, (docSnap: DocumentSnapshot<DocumentData>) => {
    if (docSnap.exists()) {
      const poll = {
        id: docSnap.id,
        ...docSnap.data(),
        votingEndsAt: docSnap.data().votingEndsAt.toDate(),
        orderingEndsAt: docSnap.data().orderingEndsAt
          ? docSnap.data().orderingEndsAt.toDate()
          : undefined,
      } as Poll;
      callback(poll);
    } else {
      callback(null);
    }
  });
};

export const updatePoll = async (
  id: string,
  updates: Partial<
    Omit<Poll, "votingEndsAt" | "orderingEndsAt"> & {
      votingEndsAt?: Date | TimestampType;
      orderingEndsAt?: Date | TimestampType;
    }
  >
) => {
  const docRef = doc(db, "polls", id);
  const updateData = { ...updates };
  if (updates.votingEndsAt) {
    if (updates.votingEndsAt instanceof Date) {
      updateData.votingEndsAt = Timestamp.fromDate(updates.votingEndsAt);
    } else {
      updateData.votingEndsAt = updates.votingEndsAt;
    }
  }
  if (updates.orderingEndsAt) {
    if (updates.orderingEndsAt instanceof Date) {
      updateData.orderingEndsAt = Timestamp.fromDate(updates.orderingEndsAt);
    } else {
      updateData.orderingEndsAt = updates.orderingEndsAt;
    }
  }
  await updateDoc(docRef, updateData);
};

// Votes
export const addVote = async (pollId: string, vote: Vote) => {
  const voteData = {
    ...vote,
    createdAt: Timestamp.fromDate(vote.createdAt),
    // Ensure restaurants is an array for new votes
    restaurants: vote.restaurants || (vote.restaurant ? [vote.restaurant] : []),
    // Ensure userName is included
    userName: vote.userName || "Nieznany użytkownik",
  };

  // Remove deprecated restaurant field for new votes
  if (voteData.restaurant && voteData.restaurants.length > 0) {
    delete voteData.restaurant;
  }

  await addDoc(collection(db, "polls", pollId, "votes"), voteData);
};

export const getVotes = async (pollId: string): Promise<Vote[]> => {
  const querySnapshot = await getDocs(collection(db, "polls", pollId, "votes"));
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    // Handle backward compatibility
    const restaurants =
      data.restaurants || (data.restaurant ? [data.restaurant] : []);

    return {
      ...data,
      restaurants,
      userName: data.userName || "Nieznany użytkownik",
      createdAt: data.createdAt.toDate(),
    };
  }) as Vote[];
};

// Real-time votes listener
export const subscribeToVotes = (
  pollId: string,
  callback: (votes: Vote[]) => void
) => {
  const votesRef = collection(db, "polls", pollId, "votes");

  return onSnapshot(votesRef, (querySnapshot: QuerySnapshot<DocumentData>) => {
    const votes = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      // Handle backward compatibility
      const restaurants =
        data.restaurants || (data.restaurant ? [data.restaurant] : []);

      return {
        ...data,
        restaurants,
        userName: data.userName || "Nieznany użytkownik",
        createdAt: data.createdAt.toDate(),
      };
    }) as Vote[];
    callback(votes);
  });
};

export const getUserVote = async (
  pollId: string,
  userId: string
): Promise<Vote | null> => {
  const q = query(
    collection(db, "polls", pollId, "votes"),
    where("userId", "==", userId)
  );
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    // Handle backward compatibility
    const restaurants =
      data.restaurants || (data.restaurant ? [data.restaurant] : []);

    return {
      ...data,
      restaurants,
      userName: data.userName || "Nieznany użytkownik",
      createdAt: data.createdAt.toDate(),
    } as Vote;
  }
  return null;
};

export const updateUserVote = async (
  pollId: string,
  userId: string,
  newRestaurants: string[],
  userName?: string
) => {
  const q = query(
    collection(db, "polls", pollId, "votes"),
    where("userId", "==", userId)
  );
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const docRef = querySnapshot.docs[0].ref;
    await updateDoc(docRef, {
      restaurants: newRestaurants,
      userName: userName || "Nieznany użytkownik",
      createdAt: Timestamp.fromDate(new Date()),
    });
  } else {
    throw new Error("Vote not found");
  }
};

export const deleteUserVote = async (pollId: string, userId: string) => {
  const q = query(
    collection(db, "polls", pollId, "votes"),
    where("userId", "==", userId)
  );
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const docRef = querySnapshot.docs[0].ref;
    await deleteDoc(docRef);
  } else {
    throw new Error("Vote not found");
  }
};

// Calculate vote counts for restaurants with multi-vote support
export const calculateVoteCounts = (votes: Vote[]): Record<string, number> => {
  const counts: Record<string, number> = {};

  votes.forEach((vote) => {
    // Handle new multi-vote format
    if (vote.restaurants && vote.restaurants.length > 0) {
      vote.restaurants.forEach((restaurant) => {
        counts[restaurant] = (counts[restaurant] || 0) + 1;
      });
    }
    // Handle backward compatibility with single vote
    else if (vote.restaurant) {
      counts[vote.restaurant] = (counts[vote.restaurant] || 0) + 1;
    }
  });

  return counts;
};

// Find winner(s) with tie-breaking by random selection
export const determineWinnerWithTieBreaking = (
  voteCounts: Record<string, number>
): string | null => {
  const restaurants = Object.keys(voteCounts);
  if (restaurants.length === 0) return null;

  // Find maximum vote count
  const maxVotes = Math.max(...Object.values(voteCounts));

  // Find all restaurants with maximum votes (potential winners)
  const winners = restaurants.filter(
    (restaurant) => voteCounts[restaurant] === maxVotes
  );

  // If there's only one winner, return it
  if (winners.length === 1) {
    return winners[0];
  }

  // If there's a tie, randomly select one winner
  const randomIndex = Math.floor(Math.random() * winners.length);
  return winners[randomIndex];
};

// Get vote details showing what users voted for
export const getVoteDetails = (
  votes: Vote[]
): Array<{ userId: string; userName: string; restaurants: string[] }> => {
  return votes.map((vote) => ({
    userId: vote.userId,
    userName: vote.userName || "Nieznany użytkownik",
    restaurants: vote.restaurants || (vote.restaurant ? [vote.restaurant] : []),
  }));
};

// Get users who voted for each restaurant
export const getVotersByRestaurant = (
  votes: Vote[]
): Record<string, string[]> => {
  const votersByRestaurant: Record<string, string[]> = {};

  votes.forEach((vote) => {
    const restaurants =
      vote.restaurants || (vote.restaurant ? [vote.restaurant] : []);
    const userName = vote.userName || "Nieznany użytkownik";

    restaurants.forEach((restaurant) => {
      if (!votersByRestaurant[restaurant]) {
        votersByRestaurant[restaurant] = [];
      }
      votersByRestaurant[restaurant].push(userName);
    });
  });

  return votersByRestaurant;
};

// Orders
export const addOrder = async (pollId: string, order: Order) => {
  const orderData = {
    ...order,
    createdAt: Timestamp.fromDate(order.createdAt),
  };
  await addDoc(collection(db, "polls", pollId, "orders"), orderData);
};

export const getOrders = async (pollId: string): Promise<Order[]> => {
  const querySnapshot = await getDocs(
    collection(db, "polls", pollId, "orders")
  );
  return querySnapshot.docs.map((doc) => ({
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
  })) as Order[];
};

// Real-time orders listener
export const subscribeToOrders = (
  pollId: string,
  callback: (orders: Order[]) => void
) => {
  const ordersRef = collection(db, "polls", pollId, "orders");

  return onSnapshot(ordersRef, (querySnapshot: QuerySnapshot<DocumentData>) => {
    const orders = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    })) as Order[];
    callback(orders);
  });
};

export const getUserOrder = async (
  pollId: string,
  userId: string
): Promise<Order | null> => {
  const q = query(
    collection(db, "polls", pollId, "orders"),
    where("userId", "==", userId)
  );
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return {
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    } as Order;
  }
  return null;
};

export const updateUserOrder = async (
  pollId: string,
  userId: string,
  orderData: Partial<Order> & { dish?: string; notes?: string; cost?: number }
) => {
  const q = query(
    collection(db, "polls", pollId, "orders"),
    where("userId", "==", userId)
  );
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const docRef = querySnapshot.docs[0].ref;

    // Prepare update data, handling undefined values
    const updateData: any = {};

    if (orderData.dish !== undefined) updateData.dish = orderData.dish;
    if (orderData.notes !== undefined) updateData.notes = orderData.notes || "";
    if (orderData.cost !== undefined) updateData.cost = orderData.cost;
    if (orderData.adminNotes !== undefined)
      updateData.adminNotes = orderData.adminNotes;
    if (orderData.costAdjustment !== undefined)
      updateData.costAdjustment = orderData.costAdjustment;
    if (orderData.paymentStatus !== undefined)
      updateData.paymentStatus = orderData.paymentStatus;
    if (orderData.orderConfirmed !== undefined)
      updateData.orderConfirmed = orderData.orderConfirmed;

    // Update createdAt only if basic order data is being updated
    if (
      orderData.dish !== undefined ||
      orderData.notes !== undefined ||
      orderData.cost !== undefined
    ) {
      updateData.createdAt = Timestamp.fromDate(new Date());
    }

    await updateDoc(docRef, updateData);
  } else {
    throw new Error("Order not found");
  }
};

export const deleteUserOrder = async (pollId: string, userId: string) => {
  const q = query(
    collection(db, "polls", pollId, "orders"),
    where("userId", "==", userId)
  );
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const docRef = querySnapshot.docs[0].ref;
    await deleteDoc(docRef);
  } else {
    throw new Error("Order not found");
  }
};

// Users
export const getUser = async (uid: string): Promise<User | null> => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as User;
  }
  return null;
};

// Get multiple users by their UIDs
export const getUsers = async (uids: string[]): Promise<User[]> => {
  if (uids.length === 0) return [];

  const users: User[] = [];

  // Firebase doesn't support 'in' queries with more than 10 items,
  // so we need to batch the requests
  const batches: string[][] = [];
  for (let i = 0; i < uids.length; i += 10) {
    batches.push(uids.slice(i, i + 10));
  }

  // Execute all batches in parallel instead of sequentially
  const promises = batches.map((batch) => {
    const q = query(collection(db, "users"), where(documentId(), "in", batch));
    return getDocs(q);
  });

  const snapshots = await Promise.all(promises);

  // Process all snapshots
  for (const querySnapshot of snapshots) {
    querySnapshot.docs.forEach((doc) => {
      const userData = doc.data() as User;
      users.push({
        ...userData,
        uid: doc.id, // Ensure uid is set from document ID
      });
    });
  }

  return users;
};

export const updateUserRole = async (uid: string, role: "admin" | "user") => {
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, { role });
};

export const deletePoll = async (id: string) => {
  const docRef = doc(db, "polls", id);
  await deleteDoc(docRef);
};

// Voting Option Proposals
export const createVotingProposal = async (
  pollId: string,
  proposal: Omit<VotingOptionProposal, "id" | "createdAt">
): Promise<string> => {
  const proposalData: any = {
    ...proposal,
    createdAt: Timestamp.fromDate(new Date()),
  };

  // Ensure no undefined values for optional fields
  if (proposalData.reviewedAt === undefined) delete proposalData.reviewedAt;
  if (proposalData.reviewedBy === undefined) delete proposalData.reviewedBy;
  if (proposalData.reviewedByName === undefined)
    delete proposalData.reviewedByName;
  if (proposalData.adminNotes === undefined) delete proposalData.adminNotes;

  const docRef = await addDoc(
    collection(db, "polls", pollId, "votingProposals"),
    proposalData
  );
  return docRef.id;
};

export const getVotingProposals = async (
  pollId: string
): Promise<VotingOptionProposal[]> => {
  const querySnapshot = await getDocs(
    query(
      collection(db, "polls", pollId, "votingProposals"),
      orderBy("createdAt", "desc")
    )
  );
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
    reviewedAt: doc.data().reviewedAt?.toDate(),
  })) as VotingOptionProposal[];
};

// Real-time voting proposals listener
export const subscribeToVotingProposals = (
  pollId: string,
  callback: (proposals: VotingOptionProposal[]) => void
) => {
  const proposalsRef = collection(db, "polls", pollId, "votingProposals");
  const q = query(proposalsRef, orderBy("createdAt", "desc"));

  return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
    const proposals = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      reviewedAt: doc.data().reviewedAt?.toDate(),
    })) as VotingOptionProposal[];
    callback(proposals);
  });
};

export const updateVotingProposal = async (
  pollId: string,
  proposalId: string,
  updates: Partial<Omit<VotingOptionProposal, "id" | "createdAt" | "pollId">>
) => {
  const docRef = doc(db, "polls", pollId, "votingProposals", proposalId);
  const updateData = { ...updates };

  if (updates.reviewedAt && updates.reviewedAt instanceof Date) {
    (updateData as any).reviewedAt = Timestamp.fromDate(updates.reviewedAt);
  }

  await updateDoc(docRef, updateData);
};

export const deleteVotingProposal = async (
  pollId: string,
  proposalId: string
) => {
  const docRef = doc(db, "polls", pollId, "votingProposals", proposalId);
  await deleteDoc(docRef);
};

export const approveVotingProposal = async (
  pollId: string,
  proposalId: string,
  restaurantName: string,
  reviewedBy: string,
  reviewedByName: string
) => {
  // 1. Update the proposal status
  await updateVotingProposal(pollId, proposalId, {
    status: "approved",
    reviewedAt: new Date(),
    reviewedBy,
    reviewedByName,
  });

  // 2. Add the restaurant to the poll's options
  const pollRef = doc(db, "polls", pollId);
  const pollDoc = await getDoc(pollRef);

  if (pollDoc.exists()) {
    const currentOptions = pollDoc.data().restaurantOptions || [];
    if (!currentOptions.includes(restaurantName)) {
      await updateDoc(pollRef, {
        restaurantOptions: [...currentOptions, restaurantName],
      });
    }
  }
};

// Poll editing utilities
export const updatePollDetails = async (
  pollId: string,
  updates: {
    title?: string;
    description?: string;
    restaurantOptions?: Array<string | { name: string; url?: string }>;
    votingEndsAt?: Date;
    orderingEndsAt?: Date;
  }
) => {
  const docRef = doc(db, "polls", pollId);
  const updateData: any = {};

  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined)
    updateData.description = updates.description;
  if (updates.restaurantOptions !== undefined) {
    // Ensure no undefined values in restaurant options
    updateData.restaurantOptions = updates.restaurantOptions.map((option) => {
      if (typeof option === "string") {
        return { name: option };
      }
      const normalizedOption: { name: string; url?: string } = {
        name: option.name,
      };
      if (option.url && option.url.trim()) {
        normalizedOption.url = option.url.trim();
      }
      return normalizedOption;
    });
  }

  if (updates.votingEndsAt) {
    updateData.votingEndsAt = Timestamp.fromDate(updates.votingEndsAt);
  }
  if (updates.orderingEndsAt) {
    updateData.orderingEndsAt = Timestamp.fromDate(updates.orderingEndsAt);
  }

  await updateDoc(docRef, updateData);
};

// Helper function to normalize restaurant options for backward compatibility
export const normalizeRestaurantOptions = (
  options: string[] | Array<{ name: string; url?: string }>
): Array<{ name: string; url?: string }> => {
  return options.map((option) =>
    typeof option === "string" ? { name: option } : option
  );
};

// Helper function to get restaurant name from option (for backward compatibility)
export const getRestaurantName = (
  option: string | { name: string; url?: string }
): string => {
  return typeof option === "string" ? option : option.name;
};

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
} from "firebase/firestore";
import { db } from "./firebase";
import { Poll, Vote, Order, User } from "@/types";
import type { Timestamp as TimestampType } from "firebase/firestore";

// Polls
export const createPoll = async (poll: Omit<Poll, "id">) => {
  const pollData = {
    ...poll,
    votingEndsAt: Timestamp.fromDate(poll.votingEndsAt),
  };
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
    Omit<Poll, "votingEndsAt"> & { votingEndsAt?: Date | TimestampType }
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
  await updateDoc(docRef, updateData);
};

// Votes
export const addVote = async (pollId: string, vote: Vote) => {
  const voteData = {
    ...vote,
    createdAt: Timestamp.fromDate(vote.createdAt),
  };
  await addDoc(collection(db, "polls", pollId, "votes"), voteData);
};

export const getVotes = async (pollId: string): Promise<Vote[]> => {
  const querySnapshot = await getDocs(collection(db, "polls", pollId, "votes"));
  return querySnapshot.docs.map((doc) => ({
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
  })) as Vote[];
};

// Real-time votes listener
export const subscribeToVotes = (
  pollId: string,
  callback: (votes: Vote[]) => void
) => {
  const votesRef = collection(db, "polls", pollId, "votes");

  return onSnapshot(votesRef, (querySnapshot: QuerySnapshot<DocumentData>) => {
    const votes = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    })) as Vote[];
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
    return {
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    } as Vote;
  }
  return null;
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

// Users
export const getUser = async (uid: string): Promise<User | null> => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as User;
  }
  return null;
};

export const updateUserRole = async (uid: string, role: "admin" | "user") => {
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, { role });
};

export const deletePoll = async (id: string) => {
  const docRef = doc(db, "polls", id);
  await deleteDoc(docRef);
};

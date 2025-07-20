"use client";

import { useEffect, useState } from "react";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, Unsubscribe } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { User } from "@/types";

export interface AuthUser extends FirebaseUser {
  role?: "admin" | "user";
  privacyPolicyAccepted?: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let firestoreUnsubscribe: Unsubscribe | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Cleanup previous Firestore listener if exists
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
        firestoreUnsubscribe = null;
      }

      if (firebaseUser) {
        try {
          // Listen to real-time changes in user document
          const userRef = doc(db, "users", firebaseUser.uid);

          firestoreUnsubscribe = onSnapshot(
            userRef,
            (userDoc) => {
              if (!userDoc.exists()) {
                // Nowy użytkownik - nie ustawiaj jako zalogowanego dopóki nie zaakceptuje polityki
                setUser(null);
              } else {
                // Get existing user data
                const userData = userDoc.data() as User;

                // Sprawdź czy zaakceptował politykę prywatności
                if (!userData.privacyPolicyAccepted) {
                  setUser(null);
                } else {
                  setUser({
                    ...firebaseUser,
                    role: userData.role,
                    privacyPolicyAccepted: userData.privacyPolicyAccepted,
                  });
                }
              }
              setLoading(false);
            },
            (error) => {
              console.error("Error listening to user document:", error);
              setUser(null);
              setLoading(false);
            }
          );
        } catch (error) {
          console.error("Error setting up user listener:", error);
          setUser(null);
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
      }
    };
  }, []);

  return { user, loading };
};

"use client";

import { useEffect, useState } from "react";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Check if user exists in Firestore
          const userRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userRef);

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
        } catch (error) {
          console.error("Error handling user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
};

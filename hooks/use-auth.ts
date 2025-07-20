'use client';

import { useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';

export interface AuthUser extends FirebaseUser {
  role?: 'admin' | 'user';
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Check if user exists in Firestore
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);

          if (!userDoc.exists()) {
            // Create new user document
            const newUser: User = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'Unknown',
              role: 'user', // default role
            };
            await setDoc(userRef, newUser);
            setUser({ ...firebaseUser, role: 'user' });
          } else {
            // Get existing user data
            const userData = userDoc.data() as User;
            setUser({ ...firebaseUser, role: userData.role });
          }
        } catch (error) {
          console.error('Error handling user data:', error);
          setUser(firebaseUser as AuthUser);
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

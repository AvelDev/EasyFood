import { AuthProvider as FirebaseAuthProvider, User } from "firebase/auth";
import { auth, googleProvider, discordProvider } from "./firebase";
import { signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { User as AppUser } from "@/types";

export type AuthProviderType = "google" | "discord";

export const getAuthProvider = (
  providerType: AuthProviderType
): FirebaseAuthProvider => {
  switch (providerType) {
    case "google":
      return googleProvider;
    case "discord":
      return discordProvider;
    default:
      throw new Error(`Unsupported auth provider: ${providerType}`);
  }
};

export const signInWithProvider = async (
  providerType: AuthProviderType
): Promise<{ user: User; needsPrivacyConsent: boolean }> => {
  try {
    const provider = getAuthProvider(providerType);
    const result = await signInWithPopup(auth, provider);

    // Sprawdź czy użytkownik istnieje w Firestore i czy zaakceptował politykę prywatności
    const userRef = doc(db, "users", result.user.uid);
    const userDoc = await getDoc(userRef);

    let needsPrivacyConsent = false;

    if (!userDoc.exists()) {
      // Nowy użytkownik - wymaga akceptacji polityki prywatności
      needsPrivacyConsent = true;
    } else {
      // Istniejący użytkownik - sprawdź czy zaakceptował politykę prywatności
      const userData = userDoc.data() as AppUser;
      needsPrivacyConsent = !userData.privacyPolicyAccepted;
    }

    console.log(`User signed in with ${providerType}:`, result.user);

    return { user: result.user, needsPrivacyConsent };
  } catch (error: any) {
    console.error(`Error signing in with ${providerType}:`, error);

    // Obsługa specyficznych błędów
    if (error.code === "auth/popup-closed-by-user") {
      throw new Error("Logowanie zostało anulowane przez użytkownika");
    } else if (error.code === "auth/network-request-failed") {
      throw new Error("Błąd sieci. Sprawdź połączenie internetowe");
    } else if (error.code === "auth/invalid-oauth-provider") {
      throw new Error("Nieprawidłowa konfiguracja providera OAuth");
    } else {
      throw new Error(`Błąd logowania: ${error.message}`);
    }
  }
};

export const acceptPrivacyPolicy = async (user: User): Promise<void> => {
  try {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    const userData: AppUser = {
      uid: user.uid,
      name: user.displayName || "Unknown",
      role: "user",
      privacyPolicyAccepted: true,
      privacyPolicyAcceptedAt: new Date(),
    };

    if (!userDoc.exists()) {
      // Utwórz nowy dokument użytkownika
      await setDoc(userRef, userData);
    } else {
      // Zaktualizuj istniejący dokument
      await updateDoc(userRef, {
        privacyPolicyAccepted: true,
        privacyPolicyAcceptedAt: new Date(),
      });
    }

    console.log("Privacy policy accepted for user:", user.uid);
  } catch (error: any) {
    console.error("Error accepting privacy policy:", error);
    throw new Error(
      `Błąd podczas akceptacji polityki prywatności: ${error.message}`
    );
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
    console.log("User signed out successfully");
  } catch (error: any) {
    console.error("Error signing out:", error);
    throw new Error(`Błąd wylogowania: ${error.message}`);
  }
};

export const getProviderData = (user: User) => {
  return user.providerData.map((provider) => ({
    providerId: provider.providerId,
    uid: provider.uid,
    displayName: provider.displayName,
    email: provider.email,
    photoURL: provider.photoURL,
  }));
};

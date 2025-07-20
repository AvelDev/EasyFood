import { AuthProvider as FirebaseAuthProvider, User } from "firebase/auth";
import { auth, googleProvider, discordProvider } from "./firebase";
import { signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";

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
): Promise<User> => {
  try {
    const provider = getAuthProvider(providerType);
    const result = await signInWithPopup(auth, provider);

    // Możesz tutaj dodać dodatkową logikę, np. zapisanie informacji o providerze
    console.log(`User signed in with ${providerType}:`, result.user);

    return result.user;
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

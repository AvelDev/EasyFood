import { AuthProvider as FirebaseAuthProvider, User } from "firebase/auth";
import {
  auth,
  googleProvider,
  discordProvider,
  microsoftProvider,
} from "./firebase";
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  fetchSignInMethodsForEmail,
  linkWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  reload,
  updatePassword,
  EmailAuthProvider,
  linkWithCredential,
  sendPasswordResetEmail,
  reauthenticateWithCredential,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { User as AppUser } from "@/types";

export type AuthProviderType = "google" | "discord" | "microsoft" | "email";

// Providery, które są uważane za zaufane i nie wymagają weryfikacji emaila
const TRUSTED_PROVIDERS = [
  "google.com",
  "microsoft.com",
  "oidc.discord",
  "password",
];

export const isTrustedProvider = (providerId: string): boolean => {
  return TRUSTED_PROVIDERS.includes(providerId);
};

export const getAuthProvider = (
  providerType: AuthProviderType
): FirebaseAuthProvider => {
  switch (providerType) {
    case "google":
      return googleProvider;
    case "discord":
      return discordProvider;
    case "microsoft":
      return microsoftProvider;
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

    // Sprawdź czy to zaufany provider
    const primaryProvider = result.user.providerData[0];
    const isTrusted =
      primaryProvider && isTrustedProvider(primaryProvider.providerId);

    // Jeśli email nie jest zweryfikowany, ale provider jest zaufany,
    // oznacz email jako zweryfikowany w Firebase
    if (!result.user.emailVerified && isTrusted) {
      try {
        // Przeładuj dane użytkownika, aby upewnić się, że mamy najnowsze informacje
        await reload(result.user);

        // Jeśli nadal nie jest zweryfikowany, możemy założyć, że jest zaufany
        if (!result.user.emailVerified) {
          console.log(
            `Email automatically trusted for provider: ${primaryProvider.providerId}`
          );
          // Firebase nie pozwala na bezpośrednie ustawienie emailVerified,
          // ale możemy to obsłużyć w logice aplikacji
        }
      } catch (verificationError) {
        console.warn("Could not reload user data:", verificationError);
      }
    }

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
    } else if (error.code === "auth/account-exists-with-different-credential") {
      // Sprawdź jakie metody logowania są dostępne dla tego emaila
      const email = error.customData?.email;
      if (email) {
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);
        const providerNames = signInMethods
          .map((method) => {
            if (method.includes("google")) return "Google";
            if (method.includes("microsoft")) return "Microsoft";
            if (method.includes("discord")) return "Discord";
            return method;
          })
          .join(", ");

        throw new Error(
          `Konto z tym adresem e-mail już istnieje. Zaloguj się używając: ${providerNames}, a następnie w ustawieniach konta możesz połączyć konta.`
        );
      } else {
        throw new Error(
          "Konto z tym adresem e-mail już istnieje z innym dostawcą uwierzytelniania. Zaloguj się używając pierwotnego dostawcy."
        );
      }
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
      createdAt: new Date(),
    };

    if (!userDoc.exists()) {
      // Utwórz nowy dokument użytkownika
      await setDoc(userRef, userData);
    } else {
      // Zaktualizuj istniejący dokument (nie zmieniaj createdAt jeśli już istnieje)
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

export const linkProviderToAccount = async (
  providerType: AuthProviderType
): Promise<User> => {
  try {
    if (!auth.currentUser) {
      throw new Error("Musisz być zalogowany, aby połączyć konta");
    }

    const provider = getAuthProvider(providerType);
    const result = await linkWithPopup(auth.currentUser, provider);

    console.log(`Provider ${providerType} linked to account:`, result.user.uid);
    return result.user;
  } catch (error: any) {
    console.error(`Error linking ${providerType} provider:`, error);

    if (error.code === "auth/popup-closed-by-user") {
      throw new Error("Łączenie kont zostało anulowane przez użytkownika");
    } else if (error.code === "auth/provider-already-linked") {
      throw new Error(`Konto ${providerType} jest już połączone z tym kontem`);
    } else if (error.code === "auth/credential-already-in-use") {
      throw new Error(
        `To konto ${providerType} jest już używane przez innego użytkownika`
      );
    } else {
      throw new Error(`Błąd łączenia kont: ${error.message}`);
    }
  }
};

export const getAvailableProvidersForEmail = async (
  email: string
): Promise<string[]> => {
  try {
    return await fetchSignInMethodsForEmail(auth, email);
  } catch (error: any) {
    console.error("Error fetching sign-in methods:", error);
    return [];
  }
};

export const sendEmailVerificationToUser = async (): Promise<void> => {
  try {
    if (!auth.currentUser) {
      throw new Error("Musisz być zalogowany, aby wysłać email weryfikacyjny");
    }

    if (auth.currentUser.emailVerified) {
      throw new Error("Email jest już zweryfikowany");
    }

    await sendEmailVerification(auth.currentUser);
    console.log("Email verification sent to:", auth.currentUser.email);
  } catch (error: any) {
    console.error("Error sending email verification:", error);

    if (error.code === "auth/too-many-requests") {
      throw new Error(
        "Zbyt wiele prób wysłania emaila weryfikacyjnego. Spróbuj ponownie później"
      );
    } else if (error.code === "auth/user-disabled") {
      throw new Error("Konto zostało wyłączone");
    } else {
      throw new Error(
        `Błąd wysyłania emaila weryfikacyjnego: ${error.message}`
      );
    }
  }
};

export const reloadUserData = async (): Promise<void> => {
  try {
    if (!auth.currentUser) {
      throw new Error("Brak zalogowanego użytkownika");
    }

    await reload(auth.currentUser);
    console.log("User data reloaded");
  } catch (error: any) {
    console.error("Error reloading user data:", error);
    throw new Error(`Błąd odświeżania danych użytkownika: ${error.message}`);
  }
};

// Funkcja pomocnicza do sprawdzania, czy email powinien być uznany za zweryfikowany
export const isEmailEffectivelyVerified = (user: User): boolean => {
  // Jeśli Firebase mówi, że email jest zweryfikowany, to jest zweryfikowany
  if (user.emailVerified) {
    return true;
  }

  // Jeśli użytkownik loguje się przez zaufanego providera, uznajemy email za zweryfikowany
  return user.providerData.some((provider) =>
    isTrustedProvider(provider.providerId)
  );
};

// ===== FUNKCJE EMAIL/HASŁO =====

export const createUserWithEmail = async (
  email: string,
  password: string,
  displayName: string
): Promise<{ user: User; needsPrivacyConsent: boolean }> => {
  try {
    // Sprawdź czy email jest już używany przez innego providera
    const existingMethods = await fetchSignInMethodsForEmail(auth, email);
    if (existingMethods.length > 0) {
      const providerNames = existingMethods
        .map((method) => {
          if (method.includes("google")) return "Google";
          if (method.includes("microsoft")) return "Microsoft";
          if (method.includes("discord")) return "Discord";
          if (method === "password") return "Email/Hasło";
          return method;
        })
        .join(", ");

      throw new Error(
        `Konto z tym adresem e-mail już istnieje. Zaloguj się używając: ${providerNames}`
      );
    }

    // Utwórz nowe konto
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Ustaw displayName w profilu użytkownika
    await updateProfile(result.user, {
      displayName: displayName.trim(),
    });

    // Wyślij email weryfikacyjny
    await sendEmailVerification(result.user);

    // Sprawdź czy użytkownik istnieje w Firestore
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

    console.log("User created with email:", result.user.email);

    return { user: result.user, needsPrivacyConsent };
  } catch (error: any) {
    console.error("Error creating user with email:", error);

    if (error.code === "auth/email-already-in-use") {
      throw new Error("Konto z tym adresem e-mail już istnieje");
    } else if (error.code === "auth/invalid-email") {
      throw new Error("Nieprawidłowy adres e-mail");
    } else if (error.code === "auth/weak-password") {
      throw new Error("Hasło jest zbyt słabe. Użyj co najmniej 6 znaków");
    } else if (error.code === "auth/network-request-failed") {
      throw new Error("Błąd sieci. Sprawdź połączenie internetowe");
    } else {
      throw new Error(error.message || "Błąd podczas tworzenia konta");
    }
  }
};

export const signInWithEmail = async (
  email: string,
  password: string
): Promise<{ user: User; needsPrivacyConsent: boolean }> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);

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

    console.log("User signed in with email:", result.user.email);

    return { user: result.user, needsPrivacyConsent };
  } catch (error: any) {
    console.error("Error signing in with email:", error);

    if (error.code === "auth/invalid-credential") {
      throw new Error("Nieprawidłowy email lub hasło");
    } else if (error.code === "auth/user-disabled") {
      throw new Error("Konto zostało wyłączone");
    } else if (error.code === "auth/too-many-requests") {
      throw new Error(
        "Zbyt wiele nieudanych prób logowania. Spróbuj ponownie później"
      );
    } else if (error.code === "auth/network-request-failed") {
      throw new Error("Błąd sieci. Sprawdź połączenie internetowe");
    } else {
      throw new Error("Nieprawidłowy email lub hasło");
    }
  }
};

export const addPasswordToAccount = async (
  password: string,
  currentPassword?: string
): Promise<void> => {
  try {
    if (!auth.currentUser) {
      throw new Error("Musisz być zalogowany, aby dodać hasło");
    }

    const user = auth.currentUser;

    // Sprawdź czy użytkownik już ma hasło
    const userProviders = user.providerData.map((p) => p.providerId);
    if (userProviders.includes("password")) {
      throw new Error("Konto już ma hasło. Użyj funkcji zmiany hasła");
    }

    // Jeśli użytkownik ma tylko providery OAuth, możemy dodać hasło
    const credential = EmailAuthProvider.credential(user.email!, password);
    await linkWithCredential(user, credential);

    // Wyślij email weryfikacyjny jeśli email nie jest zweryfikowany
    if (!user.emailVerified) {
      await sendEmailVerification(user);
    }

    console.log("Password added to account for:", user.email);
  } catch (error: any) {
    console.error("Error adding password to account:", error);

    if (error.code === "auth/weak-password") {
      throw new Error("Hasło jest zbyt słabe. Użyj co najmniej 6 znaków");
    } else if (error.code === "auth/email-already-in-use") {
      throw new Error("Ten email jest już używany przez inne konto");
    } else if (error.code === "auth/requires-recent-login") {
      throw new Error(
        "Ze względów bezpieczeństwa musisz się ponownie zalogować"
      );
    } else {
      throw new Error(error.message || "Błąd podczas dodawania hasła");
    }
  }
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  try {
    if (!auth.currentUser) {
      throw new Error("Musisz być zalogowany, aby zmienić hasło");
    }

    const user = auth.currentUser;

    // Najpierw reautentykuj użytkownika
    const credential = EmailAuthProvider.credential(
      user.email!,
      currentPassword
    );
    await reauthenticateWithCredential(user, credential);

    // Zmień hasło
    await updatePassword(user, newPassword);

    console.log("Password changed for:", user.email);
  } catch (error: any) {
    console.error("Error changing password:", error);

    if (error.code === "auth/wrong-password") {
      throw new Error("Nieprawidłowe obecne hasło");
    } else if (error.code === "auth/weak-password") {
      throw new Error("Nowe hasło jest zbyt słabe. Użyj co najmniej 6 znaków");
    } else if (error.code === "auth/requires-recent-login") {
      throw new Error(
        "Ze względów bezpieczeństwa musisz się ponownie zalogować"
      );
    } else {
      throw new Error(error.message || "Błąd podczas zmiany hasła");
    }
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("Password reset email sent to:", email);
  } catch (error: any) {
    console.error("Error sending password reset email:", error);

    if (error.code === "auth/user-not-found") {
      throw new Error("Nie znaleziono konta z tym adresem e-mail");
    } else if (error.code === "auth/invalid-email") {
      throw new Error("Nieprawidłowy adres e-mail");
    } else if (error.code === "auth/too-many-requests") {
      throw new Error("Zbyt wiele prób. Spróbuj ponownie później");
    } else {
      throw new Error(
        error.message || "Błąd podczas wysyłania emaila resetującego hasło"
      );
    }
  }
};

export const hasPasswordProvider = (user: User): boolean => {
  return user.providerData.some(
    (provider) => provider.providerId === "password"
  );
};

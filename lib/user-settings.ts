import {
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { deleteUser, updateProfile } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { User } from "@/types";

export interface UserProfileUpdate {
  name?: string;
}

/**
 * Aktualizuje profil użytkownika w Firestore i Firebase Auth
 */
export const updateUserProfile = async (
  userId: string,
  updates: UserProfileUpdate,
): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId);

    // Aktualizuj w Firestore
    if (updates.name !== undefined) {
      await updateDoc(userRef, { name: updates.name });
    }

    // Aktualizuj w Firebase Auth jeśli użytkownik jest zalogowany
    if (auth.currentUser && auth.currentUser.uid === userId && updates.name) {
      await updateProfile(auth.currentUser, {
        displayName: updates.name,
      });
    }
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new Error("Nie udało się zaktualizować profilu użytkownika");
  }
};

/**
 * Pobiera dane użytkownika z Firestore
 */
export const getUserData = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data() as User;
    }

    return null;
  } catch (error) {
    console.error("Error getting user data:", error);
    throw new Error("Nie udało się pobrać danych użytkownika");
  }
};

/**
 * Usuwa konto użytkownika całkowicie (Firestore + Firebase Auth + powiązane dane)
 */
export const deleteUserAccount = async (userId: string): Promise<void> => {
  try {
    // 1. Usuń wszystkie głosy użytkownika
    await deleteUserVotes(userId);

    // 2. Usuń wszystkie zamówienia użytkownika
    await deleteUserOrders(userId);

    // 3. Usuń dane użytkownika z Firestore
    const userRef = doc(db, "users", userId);
    await deleteDoc(userRef);

    // 4. Usuń konto Firebase Auth
    if (auth.currentUser && auth.currentUser.uid === userId) {
      await deleteUser(auth.currentUser);
    }
  } catch (error) {
    console.error("Error deleting user account:", error);
    throw new Error("Nie udało się usunąć konta użytkownika");
  }
};

/**
 * Usuwa wszystkie głosy użytkownika ze wszystkich ankiet (aktywnych i zakończonych)
 */
const deleteUserVotes = async (userId: string): Promise<void> => {
  try {
    // Znajdź wszystkie ankiety (bez względu na status - aktywne i zakończone)
    const pollsSnapshot = await getDocs(collection(db, "polls"));

    // Dla każdej ankiety sprawdź i usuń głosy użytkownika
    for (const pollDoc of pollsSnapshot.docs) {
      const votesRef = collection(db, "polls", pollDoc.id, "votes");
      const userVotesQuery = query(votesRef, where("userId", "==", userId));
      const userVotesSnapshot = await getDocs(userVotesQuery);

      // Usuń wszystkie głosy tego użytkownika w tej ankiecie
      for (const voteDoc of userVotesSnapshot.docs) {
        await deleteDoc(voteDoc.ref);
      }
    }

    console.log(
      `Usunięto wszystkie głosy użytkownika ${userId} ze wszystkich ankiet`,
    );
  } catch (error) {
    console.error("Error deleting user votes:", error);
    // Nie rzucamy błędu tutaj, żeby nie zatrzymać procesu usuwania konta
  }
};

/**
 * Usuwa wszystkie zamówienia użytkownika ze wszystkich ankiet (aktywnych i zakończonych)
 */
const deleteUserOrders = async (userId: string): Promise<void> => {
  try {
    // Znajdź wszystkie ankiety (bez względu na status - aktywne i zakończone)
    const pollsSnapshot = await getDocs(collection(db, "polls"));

    // Dla każdej ankiety sprawdź i usuń zamówienia użytkownika
    for (const pollDoc of pollsSnapshot.docs) {
      const ordersRef = collection(db, "polls", pollDoc.id, "orders");
      const userOrdersQuery = query(ordersRef, where("userId", "==", userId));
      const userOrdersSnapshot = await getDocs(userOrdersQuery);

      // Usuń wszystkie zamówienia tego użytkownika w tej ankiecie
      for (const orderDoc of userOrdersSnapshot.docs) {
        await deleteDoc(orderDoc.ref);
      }
    }

    console.log(
      `Usunięto wszystkie zamówienia użytkownika ${userId} ze wszystkich ankiet`,
    );
  } catch (error) {
    console.error("Error deleting user orders:", error);
    // Nie rzucamy błędu tutaj, żeby nie zatrzymać procesu usuwania konta
  }
};

/**
 * Sprawdza czy użytkownik ma uprawnienia administratora
 */
export const checkAdminPermissions = async (
  userId: string,
): Promise<boolean> => {
  try {
    const userData = await getUserData(userId);
    return userData?.role === "admin";
  } catch (error) {
    console.error("Error checking admin permissions:", error);
    return false;
  }
};

export type SettingsSection = {
  id: string;
  title: string;
  description: string;
  icon: string;
  component: string;
  adminOnly?: boolean;
};

/**
 * Definicja dostępnych sekcji ustawień (łatwe do rozszerzania)
 */
export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: "profile",
    title: "Profil",
    description: "Zarządzaj informacjami o swoim profilu",
    icon: "User",
    component: "ProfileSettings",
  },
  {
    id: "account",
    title: "Konto",
    description: "Ustawienia związane z Twoim kontem",
    icon: "Settings",
    component: "AccountSettings",
  },
  {
    id: "security",
    title: "Bezpieczeństwo",
    description: "Zarządzaj bezpieczeństwem swojego konta",
    icon: "Shield",
    component: "SecuritySettings",
  },
  // Tutaj można łatwo dodawać nowe sekcje w przyszłości:
  // {
  //   id: "notifications",
  //   title: "Powiadomienia",
  //   description: "Zarządzaj preferencjami powiadomień",
  //   icon: "Bell",
  //   component: "NotificationSettings"
  // },
  // {
  //   id: "privacy",
  //   title: "Prywatność",
  //   description: "Ustawienia prywatności i widoczności",
  //   icon: "Eye",
  //   component: "PrivacySettings"
  // },
  // {
  //   id: "admin",
  //   title: "Panel administratora",
  //   description: "Zarządzanie aplikacją",
  //   icon: "Crown",
  //   component: "AdminSettings",
  //   adminOnly: true
  // }
];

/**
 * Filtruje sekcje ustawień na podstawie uprawnień użytkownika
 */
export const getAvailableSettingsSections = (
  isAdmin: boolean,
): SettingsSection[] => {
  return SETTINGS_SECTIONS.filter((section) => !section.adminOnly || isAdmin);
};

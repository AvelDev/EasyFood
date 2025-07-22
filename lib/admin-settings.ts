import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
  Timestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { PollTemplate, AppSettings, User } from "@/types";

// Szablony głosowań
export async function createPollTemplate(
  template: Omit<PollTemplate, "id" | "createdAt">,
): Promise<string> {
  try {
    const templateData = {
      ...template,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, "pollTemplates"), templateData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating poll template:", error);
    throw new Error("Nie udało się utworzyć szablonu");
  }
}

export async function updatePollTemplate(
  templateId: string,
  updates: Partial<Omit<PollTemplate, "id" | "createdAt" | "createdBy">>,
): Promise<void> {
  try {
    const templateRef = doc(db, "pollTemplates", templateId);
    await updateDoc(templateRef, updates);
  } catch (error) {
    console.error("Error updating poll template:", error);
    throw new Error("Nie udało się zaktualizować szablonu");
  }
}

export async function deletePollTemplate(templateId: string): Promise<void> {
  try {
    const templateRef = doc(db, "pollTemplates", templateId);
    await deleteDoc(templateRef);
  } catch (error) {
    console.error("Error deleting poll template:", error);
    throw new Error("Nie udało się usunąć szablonu");
  }
}

export async function getPollTemplates(): Promise<PollTemplate[]> {
  try {
    const q = query(
      collection(db, "pollTemplates"),
      orderBy("createdAt", "desc"),
    );

    const querySnapshot = await getDocs(q);
    const templates: PollTemplate[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      templates.push({
        id: doc.id,
        name: data.name,
        restaurantOptions: data.restaurantOptions,
        votingDurationHours: data.votingDurationHours,
        orderingDurationHours: data.orderingDurationHours,
        createdBy: data.createdBy,
        createdAt: data.createdAt.toDate(),
        isActive: data.isActive,
      });
    });

    return templates;
  } catch (error) {
    console.error("Error getting poll templates:", error);
    throw new Error("Nie udało się pobrać szablonów");
  }
}

export async function getActivePollTemplates(): Promise<PollTemplate[]> {
  try {
    const q = query(
      collection(db, "pollTemplates"),
      where("isActive", "==", true),
      orderBy("name", "asc"),
    );

    const querySnapshot = await getDocs(q);
    const templates: PollTemplate[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      templates.push({
        id: doc.id,
        name: data.name,
        restaurantOptions: data.restaurantOptions,
        votingDurationHours: data.votingDurationHours,
        orderingDurationHours: data.orderingDurationHours,
        createdBy: data.createdBy,
        createdAt: data.createdAt.toDate(),
        isActive: data.isActive,
      });
    });

    return templates;
  } catch (error) {
    console.error("Error getting active poll templates:", error);
    throw new Error("Nie udało się pobrać aktywnych szablonów");
  }
}

// Ustawienia aplikacji
export async function getAppSettings(): Promise<AppSettings | null> {
  try {
    const settingsRef = doc(db, "appSettings", "main");
    const settingsDoc = await getDoc(settingsRef);

    if (!settingsDoc.exists()) {
      return null;
    }

    const data = settingsDoc.data();
    return {
      discordWebhookUrl: data.discordWebhookUrl,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      updatedBy: data.updatedBy,
    };
  } catch (error) {
    console.error("Error getting app settings:", error);
    throw new Error("Nie udało się pobrać ustawień");
  }
}

export async function updateAppSettings(
  updates: Partial<Pick<AppSettings, "discordWebhookUrl">>,
  updatedBy: string,
): Promise<void> {
  try {
    const settingsRef = doc(db, "appSettings", "main");
    const settingsDoc = await getDoc(settingsRef);

    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
      updatedBy,
    };

    if (!settingsDoc.exists()) {
      // Utwórz nowe ustawienia, jeśli nie istnieją
      await setDoc(settingsRef, {
        ...updateData,
        createdAt: Timestamp.now(),
      });
    } else {
      // Zaktualizuj istniejące ustawienia
      await updateDoc(settingsRef, updateData);
    }
  } catch (error) {
    console.error("Error updating app settings:", error);
    throw new Error("Nie udało się zaktualizować ustawień");
  }
}

// Zarządzanie użytkownikami
export async function getAllUsers(): Promise<User[]> {
  try {
    // Pobierz wszystkich użytkowników bez sortowania, żeby uniknąć problemów z brakującymi polami
    const querySnapshot = await getDocs(collection(db, "users"));
    const users: User[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        uid: doc.id,
        name: data.name || "Nieznany użytkownik",
        role: data.role || "user",
        privacyPolicyAccepted: data.privacyPolicyAccepted || false,
        privacyPolicyAcceptedAt: data.privacyPolicyAcceptedAt?.toDate(),
        createdAt: data.createdAt?.toDate(),
      });
    });

    // Sortuj w aplikacji po pobraniu danych
    users.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
      if (a.createdAt && !b.createdAt) return -1;
      if (!a.createdAt && b.createdAt) return 1;
      return a.name.localeCompare(b.name);
    });

    return users;
  } catch (error) {
    console.error("Error getting all users:", error);
    throw new Error("Nie udało się pobrać listy użytkowników");
  }
}

// Test webhook Discord
export async function testDiscordWebhook(webhookUrl: string): Promise<void> {
  try {
    const message = {
      content: "🧪 **Test webhook EasyFood**",
      embeds: [
        {
          title: "Test połączenia",
          description: "To jest wiadomość testowa z aplikacji EasyFood.",
          color: 0x3b82f6, // blue-500
          timestamp: new Date().toISOString(),
          footer: {
            text: "EasyFood Bot",
          },
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error testing Discord webhook:", error);
    throw new Error("Webhook nie działa. Sprawdź URL i uprawnienia.");
  }
}

#### `lib/` (Logika aplikacji)

- **`auth.ts`**

  - **Przeznaczenie:** Zarządza całym procesem uwierzytelniania użytkowników za pomocą Firebase Authentication.
  - **Funkcje:**
    - `getAuthProvider`: Zwraca odpowiedniego dostawcę uwierzytelniania (Google, Discord, Microsoft) na podstawie podanego typu.
    - `signInWithProvider`: Obsługuje logowanie za pomocą wyskakującego okienka (popup). Sprawdza, czy użytkownik istnieje w bazie danych Firestore i czy zaakceptował politykę prywatności. Zwraca obiekt użytkownika oraz flagę `needsPrivacyConsent`.
    - `acceptPrivacyPolicy`: Tworzy lub aktualizuje dokument użytkownika w Firestore po zaakceptowaniu polityki prywatności. Zapisuje m.in. datę akceptacji.
    - `signOut`: Wylogowuje użytkownika z Firebase.
    - `getProviderData`: Pobiera szczegółowe dane o dostawcy uwierzytelniania dla zalogowanego użytkownika.

- **`firebase.ts`**

  - **Przeznaczenie:** Inicjalizuje i konfiguruje połączenie z Firebase.
  - **Funkcje i Zmienne:**
    - `firebaseConfig`: Obiekt konfiguracyjny z kluczami API Firebase pobieranymi ze zmiennych środowiskowych.
    - `app`: Instancja aplikacji Firebase.
    - `db`: Eksportowana instancja Firestore do interakcji z bazą danych.
    - `auth`: Eksportowana instancja Firebase Authentication.
    - `googleProvider`, `discordProvider`, `microsoftProvider`: Skonfigurowane instancje dostawców logowania OAuth.

- **`firestore.ts`**

  - **Przeznaczenie:** Centralny plik do wszystkich operacji na bazie danych Firestore. Zawiera funkcje do tworzenia, odczytywania, aktualizowania i usuwania (CRUD) danych.
  - **Funkcje (wybrane):**
    - `createPoll`, `getPolls`, `getPoll`, `updatePoll`, `deletePoll`: Zarządzanie ankietami (głosowaniami).
    - `subscribeToPolls`, `subscribeToPoll`: Funkcje do nasłuchiwania zmian w ankietach w czasie rzeczywistym.
    - `addVote`, `getVotes`, `getUserVote`, `updateUserVote`, `deleteUserVote`: Zarządzanie głosami w ramach ankiety.
    - `subscribeToVotes`: Nasłuchiwanie zmian w głosach w czasie rzeczywistym.
    - `addOrder`, `getOrders`, `getUserOrder`, `updateUserOrder`, `deleteUserOrder`: Zarządzanie zamówieniami.
    - `subscribeToOrders`: Nasłuchiwanie zmian w zamówieniach w czasie rzeczywistym.
    - `calculateVoteCounts`, `determineWinnerWithTieBreaking`: Logika biznesowa do obliczania wyników głosowania i wyłaniania zwycięzcy.
    - `getUser`, `getUsers`, `updateUserRole`: Funkcje do zarządzania danymi użytkowników.
    - `createVotingProposal`, `getVotingProposals`, `updateVotingProposal`, `approveVotingProposal`: Zarządzanie propozycjami nowych restauracji do ankiet.
    - `normalizeRestaurantOptions`: Funkcja pomocnicza zapewniająca wsteczną kompatybilność formatu opcji restauracji.

- **`poll-auto-closer.ts`**

  - **Przeznaczenie:** Implementuje klasę `PollAutoCloser`, która ma za zadanie automatycznie zamykać ankiety po upływie czasu głosowania.
  - **Funkcje i Działanie:**
    - `schedulePollClosure`: Ustawia `setTimeout` do wywołania funkcji zamykającej ankietę o określonej godzinie.
    - `cancelPollClosure`: Anuluje zaplanowane zamknięcie.
    - `closePoll`: Prywatna metoda, która pobiera głosy, wyłania zwycięzcę i aktualizuje ankietę w Firestore, oznaczając ją jako zamkniętą.
  - **Uwaga:** Ta implementacja bazuje na `setTimeout` w środowisku Node.js. W środowiskach serverless (np. Vercel) jej działanie może być zawodne, ponieważ funkcje mogą być usypiane. Lepszym rozwiązaniem byłyby usługi typu cron job lub Firebase Scheduled Functions.

- **`admin-settings.ts`**

  - **Przeznaczenie:** Zawiera logikę do zarządzania ustawieniami dostępnymi tylko dla administratorów.
  - **Funkcje:**
    - `createPollTemplate`, `updatePollTemplate`, `deletePollTemplate`, `getPollTemplates`: Zarządzanie szablonami ankiet.
    - `getAppSettings`, `updateAppSettings`: Zarządzanie globalnymi ustawieniami aplikacji (np. URL webhooka Discord).
    - `getAllUsers`: Pobieranie listy wszystkich użytkowników.
    - `testDiscordWebhook`: Wysyła testową wiadomość na podany URL webhooka, aby zweryfikować jego poprawność.

- **`user-settings.ts`**

  - **Przeznaczenie:** Logika związana z ustawieniami profilu i konta dla zalogowanego użytkownika.
  - **Funkcje:**
    - `updateUserProfile`: Aktualizuje nazwę wyświetlaną użytkownika w Firestore i Firebase Auth.
    - `getUserData`: Pobiera dane profilu użytkownika z Firestore.
    - `deleteUserAccount`: Kompleksowa funkcja do usuwania konta użytkownika – usuwa jego głosy, zamówienia, dokument z Firestore oraz konto z Firebase Auth.
    - `deleteUserVotes`, `deleteUserOrders`: Prywatne funkcje pomocnicze do usuwania powiązanych danych.

- **`utils.ts`**
  - **Przeznaczenie:** Plik pomocniczy, zawiera funkcję `cn` do warunkowego łączenia klas CSS (standard w projektach z `shadcn/ui` i `tailwindcss`).

---

#### `hooks/` (Logika UI)

- **`use-auth.ts`**

  - **Przeznaczenie:** Hook React, który dostarcza informacje o aktualnie zalogowanym użytkowniku w całej aplikacji.
  - **Działanie:** Nasłuchuje na zmiany stanu uwierzytelnienia z Firebase Auth (`onAuthStateChanged`). Gdy użytkownik jest zalogowany, dodatkowo nasłuchuje na zmiany w jego dokumencie w Firestore (`onSnapshot`), aby w czasie rzeczywistym aktualizować dane takie jak rola czy status akceptacji polityki prywatności.

- **`use-orders.ts`**

  - **Przeznaczenie:** Hook do zarządzania stanem i logiką na stronie zamówień (`/poll/[id]/orders`).
  - **Działanie:** Pobiera dane ankiety i zamówień, subskrybuje zmiany w czasie rzeczywistym, wzbogaca zamówienia o nazwy użytkowników.
  - **Zwraca:** Stan (ankieta, zamówienia, ładowanie) oraz funkcje do obsługi akcji: `submitOrder`, `closeOrdering` (dla admina), `deleteOrder`, `updateOrder` (dla admina), `updateMenuUrl` (dla admina).

- **`use-poll.ts`**

  - **Przeznaczenie:** Hook do zarządzania stanem i logiką na stronie głosowania (`/poll/[id]`).
  - **Działanie:** Subskrybuje zmiany w ankiecie i jej głosach. Wykorzystuje `pollAutoCloser` do zaplanowania automatycznego zamknięcia ankiety.
  - **Zwraca:** Stan (ankieta, głosy, ładowanie) oraz funkcje do obsługi akcji: `handleVote` (dodawanie, aktualizacja, usuwanie głosu), `handleClosePoll` (ręczne zamknięcie przez admina).

- **`use-privacy-protection.ts`**

  - **Przeznaczenie:** Hook do ochrony tras (stron), które wymagają zalogowanego i zweryfikowanego (po akceptacji polityki prywatności) użytkownika.
  - **Działanie:** Korzysta z `useAuthContext`. Jeśli po zakończeniu ładowania użytkownik nie jest zalogowany lub nie zaakceptował polityki, automatycznie przekierowuje go na stronę logowania.

- **`use-toast.ts`**

  - **Przeznaczenie:** Implementacja systemu powiadomień "toast" w aplikacji. Jest to standardowa implementacja z `shadcn/ui`.

- **`use-voting-proposals.ts`**
  - **Przeznaczenie:** Hook do zarządzania logiką propozycji nowych restauracji przez użytkowników.
  - **Działanie:** Subskrybuje listę propozycji dla danej ankiety w czasie rzeczywistym.
  - **Zwraca:** Stan (propozycje, ładowanie) oraz funkcje: `submitProposal` (dla użytkownika), `approveProposal`, `rejectProposal`, `deleteProposal` (dla admina).

---

#### `components/` (Komponenty UI)

Większość komponentów w `components/ui` to standardowe, stylizowane komponenty z biblioteki `shadcn/ui`, takie jak `Button`, `Card`, `Dialog`, `Input` itp. Poniżej opisano ważniejsze, niestandardowe komponenty.

- **`admin-controls.tsx`**

  - **Przeznaczenie:** Wyświetla przycisk "Zakończ zamówienia" dla administratora na stronie zamówień.
  - **Propsy:** `isAdmin`, `orderingEnded`, `onCloseOrdering`.

- **`admin-order-management.tsx`**

  - **Przeznaczenie:** Panel dla administratora na stronie zamówień, widoczny po ich zakończeniu. Pozwala na edycję każdego zamówienia (dodawanie notatek, korekta kosztów, status płatności, potwierdzenie).
  - **Propsy:** `orders`, `isAdmin`, `orderingEnded`, `onUpdateOrder`.

- **`admin-poll-editor.tsx`**

  - **Przeznaczenie:** Komponent umożliwiający administratorom edycję szczegółów ankiety (tytuł, opis, opcje, daty) po jej utworzeniu.
  - **Propsy:** `poll`, `isAdmin`, `onPollUpdated`.

- **`admin-proposals-management.tsx`**

  - **Przeznaczenie:** Panel dla administratora na stronie głosowania, który pozwala zarządzać propozycjami nowych restauracji (akceptować, odrzucać).
  - **Propsy:** `proposals`, `onApprove`, `onReject`, `onDelete`.

- **`create-poll-dialog.tsx`**

  - **Przeznaczenie:** Okno dialogowe z formularzem do tworzenia nowej ankiety. Umożliwia użycie predefiniowanych szablonów.
  - **Propsy:** `onPollCreated` (callback).

- **`delete-poll-dialog.tsx`**

  - **Przeznaczenie:** Okno dialogowe z potwierdzeniem usunięcia ankiety.
  - **Propsy:** `poll`, `onPollDeleted`.

- **`landing-page.tsx`**

  - **Przeznaczenie:** Strona główna wyświetlana niezalogowanym użytkownikom. Prezentuje funkcje aplikacji i zachęca do logowania.

- **`navbar.tsx`**

  - **Przeznaczenie:** Górny pasek nawigacyjny. Wyświetla logo, a w zależności od stanu logowania – przycisk "Zaloguj się" lub menu użytkownika z opcjami "Ustawienia" i "Wyloguj się".

- **`orders-list.tsx`**

  - **Przeznaczenie:** Wyświetla listę wszystkich złożonych zamówień w danej ankiecie. Podświetla zamówienie aktualnego użytkownika.
  - **Propsy:** `orders`, `currentUserId`, `totalCost`.

- **`poll-card.tsx`**

  - **Przeznaczenie:** Karta reprezentująca pojedynczą ankietę na stronie głównej. Wyświetla jej status, podstawowe informacje i przyciski akcji.
  - **Propsy:** `poll`, `onPollDeleted`.

- **`polls-by-date-grouping.tsx`**

  - **Przeznaczenie:** Komponent organizujący listę ankiet na stronie głównej. Grupuje je według daty ("Dzisiaj", "Przyszłe", "Archiwum").
  - **Propsy:** `polls`, `onPollDeleted`.

- **`results-section.tsx` & `voting-section.tsx`**

  - **Przeznaczenie:** Dwa główne komponenty na stronie ankiety. `VotingSection` obsługuje interfejs do oddawania głosów (gdy ankieta jest aktywna) lub wyświetla podsumowanie głosów (gdy jest zamknięta). `ResultsSection` zawsze pokazuje szczegółowe wyniki z paskami postępu.

- **Komponenty w `settings/`**
  - `profile-settings.tsx`, `account-settings.tsx`, `security-settings.tsx`: Komponenty do zarządzania ustawieniami użytkownika.
  - `poll-template-settings.tsx`, `webhook-settings.tsx`, `user-management.tsx`: Komponenty do zarządzania ustawieniami aplikacji przez administratora.

---

### Komponenty Nieużywane lub Zduplikowane

1.  **`toast-notification.tsx`**: Ten komponent jest **nieużywany**. Projekt wykorzystuje system powiadomień oparty na `use-toast.ts` i komponencie `Toaster` z `shadcn/ui`, co czyni ten plik zbędnym.
2.  **`sonner.tsx`**: Ten plik również jest **nieużywany**. Definiuje `Toaster` z biblioteki `sonner`, ale w pliku `layout.tsx` ani `providers.tsx` nie ma implementacji tego dostawcy. Aplikacja korzysta z własnej implementacji toastów (`use-toast.ts`).
3.  **Wiele komponentów z `components/ui/`**: Jest wysoce prawdopodobne, że nie wszystkie komponenty UI z `shadcn/ui` (np. `aspect-ratio.tsx`, `menubar.tsx`, `pagination.tsx`, `slider.tsx`, `toggle-group.tsx`) są faktycznie używane w aplikacji. Wymagałoby to dokładnego przeszukania projektu, ale na pierwszy rzut oka wiele z nich może być zbędnych.

---

### User Flow (Przepływ Użytkownika)

1.  **Niezalogowany użytkownik** trafia na `LandingPage`, która opisuje aplikację.
2.  Klika "Zacznij już teraz", co przenosi go na stronę logowania (`/auth/signin`).
3.  **Logowanie/Rejestracja:** Użytkownik wybiera dostawcę (Google, Discord, Microsoft).
    - **Nowy użytkownik:** Po udanym zalogowaniu przez OAuth, `signInWithProvider` wykrywa, że użytkownik nie ma konta w Firestore. Wyświetla się `PrivacyPolicyDialog`. Użytkownik musi zaakceptować politykę. Po akceptacji, funkcja `acceptPrivacyPolicy` tworzy dla niego dokument w kolekcji `users`.
    - **Istniejący użytkownik:** Jest logowany bezpośrednio.
4.  **Strona główna (`/`):** Zalogowany użytkownik widzi listę ankiet (`PollsByDateGrouping`). Ankiety są podzielone na aktywne (dzisiejsze), przyszłe i archiwalne.
5.  **Głosowanie:** Użytkownik klika na aktywną ankietę, przechodząc do `/poll/[id]`.
    - W `VotingSection` wybiera jedną lub więcej restauracji.
    - Klika przycisk "Oddaj głos". Jego głos jest zapisywany w podkolekcji `votes` w ankiecie.
    - Użytkownik może zmienić lub usunąć swój głos, dopóki ankieta jest aktywna.
    - W `ResultsSection` widzi wyniki w czasie rzeczywistym.
6.  **Koniec głosowania:** Ankieta jest zamykana (automatycznie przez `poll-auto-closer` lub ręcznie przez admina). Wyłaniany jest zwycięzca.
7.  **Składanie zamówień:** Po zamknięciu ankiety, na karcie ankiety i na jej stronie pojawia się przycisk "Zobacz zamówienia", który prowadzi do `/poll/[id]/orders`.
8.  **Strona zamówień:** Użytkownik widzi `OrderForm`, gdzie może wpisać swoje danie, cenę i uwagi. Po złożeniu, jego zamówienie pojawia się na `OrdersList`. Może je edytować lub usunąć, dopóki administrator nie zakończy zbierania zamówień.
9.  **Zakończenie zamówień:** Administrator klika przycisk "Zakończ zamówienia". Od tej pory nikt nie może już dodawać ani modyfikować zamówień.
10. **Zarządzanie (Admin):**
    - Admin może tworzyć nowe ankiety (`CreatePollDialog`).
    - Może edytować istniejące ankiety (`AdminPollEditor`).
    - Może zarządzać propozycjami restauracji (`AdminProposalsManagement`).
    - Na stronie zamówień może zarządzać każdym zamówieniem indywidualnie (`AdminOrderManagement`).
    - Ma dostęp do `/settings` (jak każdy użytkownik) oraz do `/settings/general` (tylko admin), gdzie zarządza szablonami, webhookami i listą użytkowników.

---

### Logowanie i Rejestracja

Proces jest zunifikowany. Nie ma oddzielnej rejestracji.

1.  Użytkownik wybiera zewnętrznego dostawcę tożsamości (Google, Discord, Microsoft).
2.  Firebase Authentication obsługuje przepływ OAuth.
3.  Po pomyślnym uwierzytelnieniu w Firebase, funkcja `signInWithProvider` sprawdza w bazie Firestore, czy istnieje dokument w kolekcji `users` o `uid` pasującym do `uid` z Firebase.
    - **Jeśli dokument nie istnieje:** To jest pierwsza wizyta użytkownika (rejestracja). System wymaga od niego akceptacji polityki prywatności. Po akceptacji tworzony jest nowy dokument w `users` z domyślną rolą `user`.
    - **Jeśli dokument istnieje:** To jest logowanie. System sprawdza, czy polityka była już zaakceptowana.

---

### Integracje

- **Framework:** Next.js (App Router).
- **Backend & Baza Danych:** Firebase
  - **Firebase Authentication:** Do uwierzytelniania użytkowników za pomocą dostawców OAuth.
  - **Firestore:** Jako baza danych NoSQL do przechowywania wszystkich danych aplikacji (ankiety, głosy, zamówienia, użytkownicy, ustawienia). Aplikacja intensywnie korzysta z subskrypcji w czasie rzeczywistym (`onSnapshot`) dla dynamicznego odświeżania danych.
- **Styling:** Tailwind CSS z `shadcn/ui` (co widać po strukturze komponentów, pliku `tailwind.config.ts` oraz `utils.ts`).
- **Animacje:** Framer Motion (używana w wielu komponentach do płynnych przejść i animacji).
- **Ikony:** Lucide React.
- **Analityka:** Microsoft Clarity (opcjonalnie włączane przez zmienne środowiskowe, skonfigurowane w `analytics-provider.tsx`).
- **Integracje zewnętrzne:** Discord Webhooks do wysyłania powiadomień.

---

### Kolekcje w Bazie Danych (Firestore)

1.  **`users`**

    - **Opis:** Przechowuje informacje o użytkownikach aplikacji. ID dokumentu to `uid` użytkownika z Firebase Auth.
    - **Pola:**
      - `uid: string`
      - `name: string`
      - `role: "admin" | "user"`
      - `privacyPolicyAccepted: boolean`
      - `privacyPolicyAcceptedAt: Date`
      - `createdAt: Date`

2.  **`polls`**

    - **Opis:** Główna kolekcja przechowująca wszystkie ankiety (głosowania).
    - **Pola:**
      - `title: string`
      - `description: string` (opcjonalnie)
      - `restaurantOptions: Array<{ name: string; url?: string }>`
      - `createdBy: string` (UID użytkownika)
      - `votingEndsAt: Timestamp`
      - `orderingEndsAt: Timestamp` (opcjonalnie)
      - `closed: boolean`
      - `selectedRestaurant: string | null`
    - **Podkolekcje:**
      - **`votes`**: Przechowuje głosy oddane w danej ankiecie.
        - **Pola:** `userId: string`, `userName: string`, `createdAt: Timestamp`, `restaurants: string[]`
      - **`orders`**: Przechowuje zamówienia złożone w danej ankiecie.
        - **Pola:** `userId: string`, `userName: string`, `dish: string`, `notes: string`, `cost: number`, `createdAt: Timestamp`, oraz pola admina (`adminNotes`, `costAdjustment`, `paymentStatus`, `orderConfirmed`).
      - **`votingProposals`**: Przechowuje propozycje nowych restauracji.
        - **Pola:** `pollId: string`, `restaurantName: string`, `proposedBy: string`, `proposedByName: string`, `status: "pending" | "approved" | "rejected"`, `createdAt: Timestamp`, oraz pola związane z recenzją admina.

3.  **`pollTemplates`**

    - **Opis:** Przechowuje szablony ankiet dla administratorów.
    - **Pola:**
      - `name: string`
      - `restaurantOptions: string[]`
      - `votingDurationHours: number`
      - `orderingDurationHours: number`
      - `createdBy: string`
      - `createdAt: Timestamp`
      - `isActive: boolean`

4.  **`appSettings`**
    - **Opis:** Kolekcja z jednym dokumentem o ID `main` do przechowywania globalnych ustawień.
    - **Pola:**
      - `discordWebhookUrl: string`
      - `createdAt: Timestamp`
      - `updatedAt: Timestamp`
      - `updatedBy: string`

---

### Pliki do Usunięcia lub Niepotrzebne

- **`components/ui/sonner.tsx`**: **Do usunięcia**. Aplikacja używa systemu powiadomień z `use-toast.ts`, a nie z biblioteki `sonner`.
- **`components/toast-notification.tsx`**: **Do usunięcia**. Jest to niestandardowy komponent powiadomień, który jest zduplikowany i nieużywany. Aplikacja korzysta z `Toaster` i `useToast`.
- **`middleware.ts`**: **Można usunąć**. Aktualnie ten plik nic nie robi, a komentarz w kodzie potwierdza, że ochrona tras jest realizowana po stronie klienta. Jeśli nie ma planów na dodanie logiki po stronie serwera w middleware, ten plik jest zbędny.
- **Nieużywane komponenty `shadcn/ui`**: Pliki takie jak `aspect-ratio.tsx`, `menubar.tsx`, `pagination.tsx` itd. w `components/ui/` można usunąć, jeśli nie są importowane i używane w żadnym miejscu w aplikacji. To by oczyściło strukturę projektu.

---

### Podsumowanie

Projekt **EasyFood** to w pełni funkcjonalna aplikacja webowa zbudowana w oparciu o Next.js i Firebase. Jej głównym celem jest uproszczenie procesu zamawiania jedzenia w grupach, np. w firmach.

**Jak działa:**

1.  **Uwierzytelnianie:** Użytkownicy logują się za pomocą kont Google, Discord lub Microsoft. Nowi użytkownicy muszą zaakceptować politykę prywatności.
2.  **Głosowanie:** Administratorzy tworzą ankiety, definiując listę restauracji i czas na głosowanie. Użytkownicy mogą głosować na wiele opcji i proponować nowe.
3.  **Wyniki:** Wyniki są widoczne w czasie rzeczywistym. Po zakończeniu głosowania system automatycznie wyłania zwycięską restaurację.
4.  **Zamawianie:** W określonym oknie czasowym użytkownicy mogą składać swoje indywidualne zamówienia z wybranej restauracji.
5.  **Zarządzanie:** Administratorzy mają szerokie uprawnienia: mogą zarządzać ankietami, użytkownikami, ustawieniami globalnymi (np. integracją z Discord) oraz moderować zamówienia.

Aplikacja jest nowoczesna, korzysta z technologii czasu rzeczywistego (real-time listeners z Firestore) do zapewnienia dynamicznego interfejsu i jest dobrze zorganizowana dzięki zastosowaniu haków (hooks) do separacji logiki oraz gotowych komponentów UI.

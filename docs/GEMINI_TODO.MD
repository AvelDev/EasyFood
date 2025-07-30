### Zidentyfikowane Złe Praktyki i Sugerowane Ulepszenia

#### 1. Brak Walidacji po Stronie Serwera (Krytyczna Luka Bezpieczeństwa)

- **Krótki opis:**
  Logika biznesowa, taka jak sprawdzanie, czy ankieta jest wciąż otwarta przed dodaniem głosu, jest zaimplementowana tylko po stronie klienta (w hookach React). Złośliwy użytkownik może z łatwością obejść te zabezpieczenia, wysyłając spreparowane zapytanie bezpośrednio do bazy danych, co pozwala na głosowanie w zamkniętych ankietach i potencjalne uszkodzenie danych.
- **Miejsca w kodzie:**
  - `hooks/use-poll.ts`: Funkcja `handleVote` sprawdza `if (poll.closed || poll.votingEndsAt <= new Date())` przed wysłaniem głosu.
  - `lib/firestore.ts`: Funkcje takie jak `addVote` czy `updateUserVote` przyjmują dane i zapisują je do bazy bez żadnej weryfikacji po stronie "serwera".
- **Sposób rozwiązania:**
  Należy zaimplementować **reguły bezpieczeństwa Firestore (Firestore Security Rules)**. Są to reguły zdefiniowane w panelu Firebase, które działają na serwerze i weryfikują każdą operację odczytu i zapisu.

  **Przykład reguły dla dodawania głosu:**

  ````
  match /polls/{pollId}/votes/{voteId} {
    // Zezwól na utworzenie głosu tylko jeśli:
    allow create: if request.auth != null && // Użytkownik jest zalogowany
                    request.auth.uid == request.resource.data.userId && // Użytkownik głosuje za siebie
                    exists(/databases/$(database)/documents/polls/$(pollId)) && // Ankieta istnieje
                    get(/databases/$(database)/documents/polls/$(pollId)).data.closed == false && // Ankieta nie jest zamknięta
                    get(/databases/$(database)/documents/polls/$(pollId)).data.votingEndsAt > request.time; // Czas na głosowanie nie minął
  }
  ```    Ta reguła uniemożliwiłaby dodanie głosu, nawet jeśli zabezpieczenia po stronie klienta zostałyby ominięte.
  ````

---

#### 2. Niezawodny Mechanizm Automatycznego Zamykania Ankiet

- **Krótki opis:**
  Klasa `PollAutoCloser` używa `setTimeout` do planowania zamknięcia ankiety. W środowiskach serverless (takich jak Vercel, na którym często wdraża się aplikacje Next.js) jest to bardzo zawodne. Funkcja serwerowa może zostać "uśpiona" lub zakończona, zanim `setTimeout` zdąży się wykonać, co spowoduje, że ankiety nigdy nie zostaną automatycznie zamknięte.
- **Miejsca w kodzie:**
  - `lib/poll-auto-closer.ts`: Cała logika klasy opiera się na `setTimeout`.
  - `hooks/use-poll.ts`: Wywołanie `pollAutoCloser.schedulePollClosure(...)`.
- **Sposób rozwiązania:**
  Należy użyć bardziej niezawodnego mechanizmu do planowania zadań. Idealnym rozwiązaniem w ekosystemie Firebase są **Firebase Scheduled Functions (Funkcje Harmonogramowe)**.
  1.  Należy napisać funkcję w Firebase Functions, która uruchamia się np. co 5 minut.
  2.  Funkcja ta odpytywałaby kolekcję `polls` o ankiety, które są wciąż otwarte (`closed == false`), ale których czas `votingEndsAt` już minął.
  3.  Dla każdej znalezionej ankiety funkcja wykonałaby logikę zamykania (wyłonienie zwycięzcy, aktualizacja dokumentu).

---

#### 3. Prop Drilling (Przekazywanie Właściwości przez Wiele Poziomów)

- **Krótki opis:**
  W komponencie `PollPage` dane i funkcje z haka `usePoll` są przekazywane jako propsy do komponentów podrzędnych (`PollHeader`, `VotingSection`, `ResultsSection`). To tworzy tzw. "prop drilling", co utrudnia czytelność, refaktoryzację i konserwację kodu, ponieważ komponenty pośrednie muszą przyjmować i przekazywać propsy, z których same nie korzystają.
- **Miejsca w kodzie:**
  - `app/poll/[id]/page.tsx`: Komponent pobiera dane z `usePoll` i przekazuje je dalej.
- **Sposób rozwiązania:**
  Można stworzyć dedykowany **kontekst React (React Context)** dla strony ankiety.
  1.  Utwórz `PollContext`.
  2.  W komponencie `PollPage` umieść `PollContext.Provider` i przekaż do niego całą wartość zwróconą przez hak `usePoll`.
  3.  W komponentach podrzędnych (`PollHeader`, `VotingSection` itd.) użyj haka `useContext(PollContext)`, aby uzyskać bezpośredni dostęp do potrzebnych danych i funkcji, bez konieczności odbierania ich przez propsy.

---

#### 4. Sekwencyjne Zamiast Równoległego Pobierania Danych

- **Krótki opis:**
  Funkcja `getUsers` w `lib/firestore.ts` pobiera dane użytkowników w partiach, aby ominąć limit 10 elementów w zapytaniu `in`. Jednak robi to w pętli `for...of` z `await` w środku, co oznacza, że każda partia jest pobierana sekwencyjnie – kolejna dopiero po zakończeniu poprzedniej. Przy dużej liczbie użytkowników może to znacząco spowolnić działanie.
- **Miejsca w kodzie:**
  - `lib/firestore.ts`: Funkcja `getUsers`.
- **Sposób rozwiązania:**
  Zapytania o poszczególne partie powinny być wykonywane równolegle za pomocą `Promise.all`.

  **Obecny kod:**

  ```typescript
  for (const batch of batches) {
    const q = query(collection(db, "users"), where(documentId(), "in", batch));
    const querySnapshot = await getDocs(q); // Czeka na zakończenie tego zapytania
    // ...
  }
  ```

  **Sugerowane rozwiązanie:**

  ```typescript
  const promises = batches.map((batch) => {
    const q = query(collection(db, "users"), where(documentId(), "in", batch));
    return getDocs(q);
  });

  const snapshots = await Promise.all(promises); // Wykonuje wszystkie zapytania równolegle

  for (const querySnapshot of snapshots) {
    querySnapshot.docs.forEach((doc) => {
      // ...
    });
  }
  ```

---

#### 5. Redundancja i Niespójność Danych Użytkownika

- **Krótki opis:**
  Pola takie jak `userName` są kopiowane z kolekcji `users` i zapisywane w dokumentach w podkolekcjach `votes` i `orders`. Jest to technika denormalizacji, często stosowana w NoSQL w celu optymalizacji odczytów. Jednak w tym projekcie stwarza to problem: jeśli użytkownik zmieni swoją nazwę, jego stara nazwa pozostanie we wszystkich historycznych głosach i zamówieniach, prowadząc do niespójności danych. Funkcja `enrichOrdersWithUserNames` próbuje to naprawić, ale tylko dla bieżącego odczytu, co jest niekonsekwentne.
- **Miejsca w kodzie:**
  - `lib/firestore.ts`: Funkcje `addVote`, `updateUserVote`, `addOrder` zapisują `userName`.
  - `hooks/use-orders.ts`: Funkcja `enrichOrdersWithUserNames` pobiera aktualne nazwy, co pokazuje, że zdenormalizowane dane są nieaktualne.
- **Sposób rozwiązania:**
  Należy wybrać jedną strategię i się jej trzymać.
  1.  **Pełna normalizacja (zalecane):** Usunąć pole `userName` z dokumentów `votes` i `orders`. Zamiast tego, zawsze pobierać aktualną nazwę z kolekcji `users` na podstawie `userId` w momencie wyświetlania danych (tak jak to robi `enrichOrdersWithUserNames`). Zwiększy to liczbę odczytów, ale zapewni spójność danych.
  2.  **Utrzymanie denormalizacji z aktualizacją:** Stworzyć Firebase Function, która będzie uruchamiana (`onUpdate`) za każdym razem, gdy dokument w kolekcji `users` zostanie zaktualizowany. Funkcja ta musiałaby przeszukać wszystkie ankiety, głosy i zamówienia danego użytkownika i zaktualizować w nich pole `userName`. Jest to rozwiązanie znacznie bardziej złożone i kosztowne.

---

### Podsumowanie

Projekt jest dobrze zorganizowany i wykorzystuje nowoczesne technologie, ale ma kilka istotnych wad, głównie w obszarze bezpieczeństwa i niezawodności logiki serwerowej. Poprawa tych elementów, zwłaszcza przez dodanie **reguł bezpieczeństwa Firestore** i zastąpienie `setTimeout` przez **Firebase Scheduled Functions**, znacząco podniosłaby jakość i bezpieczeństwo aplikacji. Optymalizacja zapytań i poprawa spójności danych to kolejne kroki, które uczyniłyby projekt jeszcze lepszym.

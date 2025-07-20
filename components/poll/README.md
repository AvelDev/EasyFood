# Dokumentacja Komponentów Głosowania

Ten katalog zawiera modularne komponenty dla funkcjonalności strony głosowania. Oryginalny plik `app/poll/[id]/page.tsx` został refaktoryzowany na mniejsze, skoncentrowane komponenty dla lepszej czytelności i możliwości ponownego użycia.

## Struktura Komponentów

### 1. `PollHeader` (`poll-header.tsx`)

**Odpowiedzialność:** Wyświetla tytuł głosowania, informacje o czasie, liczbie głosów i kontrole administratora

**Props:**

- `poll: Poll` - Dane głosowania
- `votesCount: number` - Całkowita liczba głosów
- `isActive: boolean` - Czy głosowanie jest obecnie aktywne
- `userRole?: string` - Rola obecnego użytkownika dla kontroli administratora
- `onTimeExpired: () => void` - Callback gdy countdown się skończy
- `onClosePoll: () => void` - Callback do zamknięcia głosowania
- `onPollDeleted: () => void` - Callback gdy głosowanie zostanie usunięte

**Funkcje:**

- Timer odliczający dla aktywnych głosowań
- Wyświetlanie liczby głosów z animowanym licznikiem
- Kontrole administratora (zamknij głosowanie, usuń głosowanie)
- Nawigacja powrotna do strony głównej
- Wyświetlanie terminu zamówień

### 2. `VotingSection` (`voting-section.tsx`)

**Odpowiedzialność:** Obsługuje interfejs głosowania i wyświetla opcje restauracji

**Props:**

- `poll: Poll` - Dane głosowania
- `canVote: boolean` - Czy użytkownik może głosować
- `userVote: Vote | null` - Obecny głos użytkownika
- `votes: Vote[]` - Wszystkie głosy do kalkulacji liczby głosów
- `onVote: (restaurant: string) => Promise<void>` - Callback do obsługi głosowania
- `voting: boolean` - Czy głos jest obecnie przetwarzany

**Funkcje:**

- Interaktywny wybór restauracji z animacjami
- Wysyłanie głosu ze stanem ładowania
- Widok tylko do odczytu gdy głosowanie jest wyłączone
- Wizualne informacje zwrotne dla wybranych opcji
- Wyświetlanie liczby głosów na restaurację

### 3. `ResultsSection` (`results-section.tsx`)

**Odpowiedzialność:** Wyświetla wyniki głosowania z paskami postępu i statystykami

**Props:**

- `poll: Poll` - Dane głosowania
- `votes: Vote[]` - Wszystkie głosy do kalkulacji

**Funkcje:**

- Animowane paski postępu pokazujące procenty głosów
- Wskaźnik zwycięzcy z ikoną korony
- Wyświetlanie liczby głosów i procentów
- Link do strony zamówień gdy głosowanie jest zamknięte
- Responsywny layout z animacjami

## Hook Niestandardowy

### `usePoll` (`hooks/use-poll.ts`)

**Odpowiedzialność:** Zarządza danymi głosowania, aktualizacjami w czasie rzeczywistym i operacjami głosowania

**Parametry:**

- `pollId: string` - ID głosowania
- `userId?: string` - ID obecnego użytkownika

**Zwraca:**

- `poll: Poll | null` - Obecne dane głosowania
- `votes: Vote[]` - Wszystkie głosy
- `userVote: Vote | null` - Głos użytkownika
- `loading: boolean` - Stan ładowania
- `voting: boolean` - Stan trwającego głosowania
- `isActive: boolean` - Czy głosowanie jest aktywne
- `canVote: boolean` - Czy użytkownik może głosować
- `handleVote: (restaurant: string) => Promise<void>` - Handler głosowania
- `handleClosePoll: () => void` - Handler zamykania głosowania
- `handleTimeExpired: () => void` - Handler wygaśnięcia czasu

**Funkcje:**

- Subskrypcje głosowania i głosów w czasie rzeczywistym
- Automatyczne zamykanie głosowania po wygaśnięciu czasu
- Wysyłanie głosów z obsługą błędów
- Integracja z auto-zamykaniem głosowania
- Powiadomienia toast dla informacji zwrotnej użytkownika

## Korzyści z Modularyzacji

1. **Separacja Obowiązków**: Każdy komponent ma jedną, dobrze zdefiniowaną odpowiedzialność
2. **Możliwość Ponownego Użycia**: Komponenty mogą być łatwo ponownie używane w innych częściach aplikacji
3. **Łatwość Utrzymania**: Łatwiejsze testowanie, debugowanie i modyfikowanie poszczególnych komponentów
4. **Organizacja Kodu**: Czystsza struktura plików i lepsza czytelność
5. **Wydajność**: Potencjał do lepszej optymalizacji i memoizacji
6. **Bezpieczeństwo Typów**: Dobrze zdefiniowane interfejsy dla wszystkich props i przepływu danych

## Przykład Użycia

```tsx
import { PollHeader, VotingSection, ResultsSection } from "@/components/poll";
import { usePoll } from "@/hooks/use-poll";

function PollPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const pollData = usePoll({ pollId: params.id, userId: user?.uid });

  return (
    <div>
      <PollHeader {...pollData} userRole={user?.role} />
      <div className="grid lg:grid-cols-2 gap-8">
        <VotingSection {...pollData} />
        <ResultsSection poll={pollData.poll} votes={pollData.votes} />
      </div>
    </div>
  );
}
```

## Przyszłe Ulepszenia

1. **Kompozycja Komponentów**: Rozważenie użycia wzorca compound components dla bardziej elastycznej kompozycji
2. **Zarządzanie Stanem**: Ocena czy biblioteka do zarządzania stanem byłaby przydatna dla złożonych interakcji
3. **Granice Błędów**: Dodanie granic błędów dla lepszej obsługi błędów
4. **Stany Ładowania**: Implementacja skeleton loading states dla lepszego UX
5. **Dostępność**: Zapewnienie że wszystkie komponenty spełniają standardy dostępności
6. **Wydajność**: Dodanie optymalizacji React.memo i useMemo gdzie potrzeba

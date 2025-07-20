# Dokumentacja Modułu Zamówień

## Przegląd

Moduł zamówień został zmodularyzowany w celu poprawy łatwości utrzymania, możliwości ponownego wykorzystania i testowalności. Oryginalny duży komponent `OrdersPage` został podzielony na kilka skoncentrowanych komponentów i niestandardowy hook.

## Struktura

```
components/orders/
├── index.ts                 # Plik barrel do eksportów
├── order-form.tsx          # Komponent formularza składania zamówień
├── orders-list.tsx         # Lista wszystkich zamówień z podsumowaniem
├── order-summary.tsx       # Nagłówek z informacjami o głosowaniu i statusie
├── admin-controls.tsx      # Kontrolki tylko dla administratorów
├── poll-not-found.tsx      # Stan błędu gdy głosowanie nie istnieje
├── poll-still-active.tsx   # Stan gdy głosowanie jest nadal aktywne
└── loading-spinner.tsx     # Komponent stanu ładowania

hooks/
└── use-orders.ts           # Niestandardowy hook dla logiki zamówień

app/poll/[id]/orders/
└── page.tsx               # Główny komponent strony (uproszczony)
```

## Komponenty

### 1. `OrderForm`

**Odpowiedzialność**: Obsługuje tworzenie zamówień i wyświetla istniejące zamówienia użytkownika.
**Props**:

- `userOrder: Order | null` - Istniejące zamówienie użytkownika (jeśli istnieje)
- `orderingEnded: boolean` - Czy okres składania zamówień się skończył
- `submitting: boolean` - Czy formularz jest wysyłany
- `onSubmit: (data: OrderFormData) => void` - Handler wysyłania formularza

**Funkcje**:

- Walidacja formularza za pomocą react-hook-form i zod
- Różne stany: można zamawiać, już zamówiono, zamówienia zakończone
- Responsywny design z odpowiednią dostępnością

### 2. `OrdersList`

**Odpowiedzialność**: Wyświetla wszystkie zamówienia z podsumowaniem kosztów.
**Props**:

- `orders: Order[]` - Tablica wszystkich zamówień
- `currentUserId?: string` - ID aktualnego użytkownika do podświetlenia jego zamówienia
- `totalCost: number` - Całkowity koszt wszystkich zamówień

**Funkcje**:

- Podświetla zamówienie aktualnego użytkownika
- Pokazuje podział kosztów i średnie
- Obsługa pustego stanu

### 3. `OrderSummary`

**Odpowiedzialność**: Pokazuje informacje o głosowaniu i status zamówień.
**Props**:

- `poll: Poll` - Dane głosowania
- `ordersCount: number` - Liczba zamówień
- `totalCost: number` - Całkowity koszt
- `orderingEnded: boolean` - Status zamówień
- `children?: ReactNode` - Dla kontrolek administratora

**Funkcje**:

- Tytuł głosowania i informacje o restauracji
- Wskaźnik pozostałego czasu/zakończenia
- Odznaki statusu

### 4. `AdminControls`

**Odpowiedzialność**: Kontrolki tylko dla administratorów do zarządzania zamówieniami.
**Props**:

- `isAdmin: boolean` - Czy użytkownik jest administratorem
- `orderingEnded: boolean` - Aktualny status zamówień
- `onCloseOrdering: () => void` - Handler zamykania zamówień

**Funkcje**:

- Warunkowe renderowanie tylko dla administratorów
- Dialog potwierdzenia dla destrukcyjnych akcji
- Odpowiedni styling dla akcji administratora

### 5. `PollNotFound` & `PollStillActive`

**Odpowiedzialność**: Stany błędów i pośrednie.
**Funkcje**:

- Jasne komunikaty o błędach
- Akcje nawigacyjne
- Spójny styling

### 6. `LoadingSpinner`

**Odpowiedzialność**: Wskaźnik stanu ładowania.
**Funkcje**:

- Wyśrodkowany spinner
- Spójny z designem aplikacji

## Niestandardowy Hook

### `useOrders`

**Odpowiedzialność**: Zarządza całym stanem i operacjami związanymi z zamówieniami.
**Parametry**:

- `pollId: string` - Identyfikator głosowania
- `userId?: string` - Identyfikator aktualnego użytkownika

**Zwraca**:

- `poll: Poll | null` - Dane głosowania
- `orders: Order[]` - Wszystkie zamówienia
- `userOrder: Order | null` - Zamówienie aktualnego użytkownika
- `loading: boolean` - Stan ładowania
- `submitting: boolean` - Stan wysyłania formularza
- `orderingEnded: boolean` - Czy zamówienia się skończyły
- `totalCost: number` - Obliczenie całkowitego kosztu
- `submitOrder: (data) => Promise<void>` - Funkcja składania zamówienia
- `closeOrdering: () => Promise<void>` - Funkcja administratora do zamykania zamówień

**Funkcje**:

- Aktualizacje w czasie rzeczywistym poprzez nasłuchiwanie Firestore
- Automatyczna obsługa błędów i powiadomienia toast
- Zarządzanie stanem dla wszystkich operacji zamówień
- Czyszczenie przy odmontowaniu

## Korzyści z Modularyzacji

### 1. **Zasada Pojedynczej Odpowiedzialności**

Każdy komponent ma jasny, pojedynczy cel:

- `OrderForm` obsługuje tylko tworzenie zamówień
- `OrdersList` tylko wyświetla zamówienia
- `useOrders` tylko zarządza stanem zamówień

### 2. **Lepsza Testowalność**

- Komponenty mogą być testowane w izolacji
- Łatwe mockowanie zależności
- Testowanie konkretnej funkcjonalności bez efektów ubocznych

### 3. **Lepsza Możliwość Ponownego Wykorzystania**

- Komponenty mogą być ponownie używane w innych częściach aplikacji
- Hook może być używany przez różne komponenty
- Łatwiejsze tworzenie wariantów

### 4. **Ulepszona Łatwość Utrzymania**

- Mniejsze, skoncentrowane pliki są łatwiejsze do zrozumienia
- Zmiany są zlokalizowane w konkretnych komponentach
- Zmniejszone powiązanie między funkcjonalnościami

### 5. **Lepsze Doświadczenie Developera**

- Jaśniejsza struktura plików
- Łatwiejsze znajdowanie konkretnej funkcjonalności
- Lepszy TypeScript intellisense

## Przykład Użycia

```tsx
import {
  OrderForm,
  OrdersList,
  OrderSummary,
  AdminControls,
  LoadingSpinner,
} from "@/components/orders";
import { useOrders } from "@/hooks/use-orders";

export default function OrdersPage({ params }: { params: { id: string } }) {
  const {
    poll,
    orders,
    userOrder,
    loading,
    submitting,
    orderingEnded,
    totalCost,
    submitOrder,
    closeOrdering,
  } = useOrders(params.id, user?.uid);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <OrderSummary poll={poll} /* ... inne propsy */>
        <AdminControls /* ... propsy */ />
      </OrderSummary>

      <div className="grid lg:grid-cols-2 gap-8">
        <OrderForm /* ... propsy */ />
        <OrdersList /* ... propsy */ />
      </div>
    </div>
  );
}
```

## Porównanie Rozmiarów Plików

**Wcześniej**: Pojedynczy plik z 569 liniami
**Teraz**:

- Główna strona: ~60 linii
- Komponenty: ~100-150 linii każdy
- Hook: ~120 linii
- **Całkowita poprawa**: Lepsza organizacja, łatwiejsze utrzymanie

To modularne podejście jest zgodne z najlepszymi praktykami React i czyni kod bardziej skalowalnym i łatwiejszym w utrzymaniu.

# Microsoft Clarity - Dokumentacja

Microsoft Clarity to bezpłatne narzędzie od Microsoftu do analizy zachowań użytkowników na stronie internetowej. Umożliwia nagrywanie sesji użytkowników, śledzenie klików, przewijania i innych interakcji.

## Konfiguracja

### 1. Uzyskanie Project ID z Microsoft Clarity

1. Przejdź do [Microsoft Clarity](https://clarity.microsoft.com/)
2. Zaloguj się kontem Microsoft
3. Kliknij "Add new project"
4. Wprowadź URL swojej strony
5. Skopiuj **Project ID** (ciąg znaków po "tag/" w URL)

### 2. Konfiguracja w projekcie

Dodaj do pliku `.env.local`:

```bash
# Microsoft Clarity Analytics
NEXT_PUBLIC_CLARITY_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_ENABLE_CLARITY=true
```

**Uwaga:** Ustaw `NEXT_PUBLIC_ENABLE_CLARITY=false` lub usuń tę zmienną, aby wyłączyć Clarity w środowisku deweloperskim.

## Funkcjonalności

### Automatyczne śledzenie

Clarity automatycznie śledzi:

- Kliknięcia użytkowników
- Przewijanie strony
- Ruch myszy i dotyki
- Błędy JavaScript
- Performance metryki

### Śledzenie niestandardowe

W projekcie zaimplementowano następujące zdarzenia:

#### Głosowania

- `poll_created` - utworzenie nowego głosowania
- `poll_voted` - oddanie głosu
- `poll_shared` - udostępnienie głosowania

#### Zamówienia

- `order_placed` - złożenie zamówienia
- `order_cancelled` - anulowanie zamówienia

#### Ustawienia

- `settings_opened` - otwarcie sekcji ustawień
- `webhook_configured` - konfiguracja webhook

#### Błędy

- `error_occurred` - wystąpienie błędu

### Korzystanie z API w komponenetach

```tsx
import { useAnalyticsEvents } from "@/components/analytics";

function MyComponent() {
  const { trackPollCreated, trackError } = useAnalyticsEvents();

  const handleCreatePoll = () => {
    try {
      // logika tworzenia głosowania
      trackPollCreated();
    } catch (error) {
      trackError("poll_creation", error.message);
    }
  };
}
```

### Zaawansowane funkcje

```tsx
import { useClarity } from "@/components/analytics";

function AdvancedComponent() {
  const clarity = useClarity();

  useEffect(() => {
    // Identyfikacja użytkownika
    clarity.identify("user-123", "session-456");

    // Ustawianie tagów
    clarity.set("user_type", "premium");

    // Śledzenie niestandardowego zdarzenia
    clarity.event("custom_action");

    // Upgrade ważności sesji
    clarity.upgrade("Important user action");
  }, []);
}
```

## Prywatność i RODO

### Automatyczne maskowanie

Clarity automatycznie maskuje:

- Pola typu `password`
- Pola z klasą CSS `clarity-mask`
- Elementy z atrybutem `data-clarity-mask`

### Ręczne maskowanie

Aby zamaskować element:

```html
<!-- Maskowanie treści -->
<div data-clarity-mask>Wrażliwe dane użytkownika</div>

<!-- Maskowanie przez CSS -->
<input class="clarity-mask" type="text" />
```

### Zgoda użytkownika

Jeśli potrzebujesz zbierać zgodę:

```tsx
import { useClarity } from "@/components/analytics";

function ConsentManager() {
  const clarity = useClarity();

  const handleConsent = () => {
    // Użytkownik wyraził zgodę
    clarity.consent();
    clarity.start();
  };

  const handleReject = () => {
    // Użytkownik nie wyraził zgody
    clarity.stop();
  };
}
```

## Dostęp do danych

1. Zaloguj się do [Microsoft Clarity](https://clarity.microsoft.com/)
2. Wybierz swój projekt
3. Przeglądaj:
   - **Recordings** - nagrania sesji użytkowników
   - **Heatmaps** - mapy ciepła klików i przewijania
   - **Insights** - automatyczne wykrywanie problemów UX

## Najlepsze praktyki

### Performance

- Clarity ma minimalny wpływ na wydajność
- Skrypt ładuje się asynchronicznie
- Nie blokuje renderowania strony

### Bezpieczeństwo

- Nigdy nie przesyłaj wrażliwych danych jako tagi
- Używaj maskowaniu dla pól z danymi osobowymi
- Regularnie przeglądaj nagrania pod kątem prywatności

### Analiza

- Regularnie sprawdzaj Insights dla automatycznego wykrywania problemów
- Używaj filtrów do analizy konkretnych grup użytkowników
- Śledź niestandardowe zdarzenia dla kluczowych akcji w aplikacji

## Rozwiązywanie problemów

### Clarity nie ładuje się

1. Sprawdź czy `NEXT_PUBLIC_CLARITY_PROJECT_ID` jest ustawione
2. Sprawdź czy `NEXT_PUBLIC_ENABLE_CLARITY=true`
3. Sprawdź Console przeglądarki pod kątem błędów
4. Upewnij się, że URL w ustawieniach Clarity jest poprawny

### Brak danych w dashboard

1. Poczekaj 1-2 minuty na pierwsze dane
2. Sprawdź czy projekt ID jest poprawny
3. Sprawdź czy strona jest dostępna publicznie
4. Sprawdź filtry w dashboard Clarity

### Błędy CORS

- Clarity działa z dowolnego URL
- Jeśli występują błędy CORS, sprawdź ustawienia Content Security Policy

## Linki

- [Microsoft Clarity](https://clarity.microsoft.com/)
- [Dokumentacja API](https://docs.microsoft.com/en-us/clarity/)
- [Polityka prywatności](https://privacy.microsoft.com/en-us/privacystatement)

# Aplikacja do głosowania na restauracje

Aplikacja Next.js do zespołowego głosowania na restauracje i zarządzania zamówieniami z uwierzytelnianiem Discord i backendem Firebase.

## Funkcje

- **Uwierzytelnianie Discord**: Bezpieczne logowanie z Discord OAuth2
- **Dostęp oparty na rolach**: Role administratora i użytkownika z różnymi uprawnieniami  
- **Głosowanie na restauracje**: Tworzenie głosowań, głosowanie na restauracje i przeglądanie wyników
- **Zarządzanie zamówieniami**: Składanie zamówień po zakończeniu głosowania
- **Aktualizacje na żywo**: Wyniki głosowania i śledzenie zamówień w czasie rzeczywistym
- **Responsywny design**: Działa na komputerach i urządzeniach mobilnych

## Stos technologiczny

- **Frontend**: Next.js 13 (App Router), TypeScript, Tailwind CSS
- **Uwierzytelnianie**: NextAuth.js z providerem Discord
- **Baza danych**: Firebase Firestore
- **Komponenty UI**: Komponenty Radix UI z shadcn/ui
- **Formularze**: React Hook Form z walidacją Zod

## Instrukcje konfiguracji

### 1. Klonowanie i instalacja

```bash
git clone <repository-url>
cd restaurant-voting-app
npm install
```

### 2. Konfiguracja Discord OAuth

1. Przejdź do [Discord Developer Portal](https://discord.com/developers/applications)
2. Utwórz nową aplikację
3. Przejdź do ustawień OAuth2
4. Dodaj URI przekierowania: `http://localhost:3000/api/auth/callback/discord`
5. Skopiuj Client ID i Client Secret

### 3. Konfiguracja Firebase

1. Utwórz nowy projekt Firebase
2. Włącz bazę danych Firestore
3. Pobierz konfigurację Firebase z ustawień projektu
4. Utwórz następujące kolekcje w Firestore:
   - `users` - Profile użytkowników i role
   - `polls` - Głosowania na restauracje
   - `votes` - Głosy użytkowników (podkolekcja pod polls)
   - `orders` - Zamówienia użytkowników (podkolekcja pod polls)

### 4. Zmienne środowiskowe

Utwórz plik `.env.local` i dodaj:

```env
# Discord OAuth
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 5. Uruchomienie aplikacji

```bash
npm run dev
```

Odwiedź `http://localhost:3000` aby zobaczyć aplikację.

## Role użytkowników

### Administratorzy
- Mogą tworzyć nowe głosowania na restauracje
- Mogą ręcznie zamykać głosowania
- Mogą przeglądać wszystkie zamówienia i obliczać sumy

### Zwykli użytkownicy
- Mogą głosować w aktywnych głosowaniach
- Mogą składać zamówienia po zamknięciu głosowań
- Mogą przeglądać wyniki głosowań

## Jak to działa

1. **Uwierzytelnianie**: Użytkownicy logują się przez Discord
2. **Tworzenie użytkownika**: Nowi użytkownicy są automatycznie dodawani do Firestore z rolą 'user'
3. **Tworzenie głosowania**: Administratorzy tworzą głosowania z opcjami restauracji i czasem zakończenia
4. **Głosowanie**: Użytkownicy głosują na preferowaną restaurację
5. **Wyniki**: Wyniki głosowania w czasie rzeczywistym z podziałem procentowym
6. **Zamówienia**: Po zamknięciu głosowania użytkownicy mogą składać zamówienia na jedzenie
7. **Podsumowanie**: Przeglądanie wszystkich zamówień i łącznych kosztów

## Struktura bazy danych

### Kolekcja Users
```typescript
{
  uid: string
  name: string
  email: string
  role: "admin" | "user"
}
```

### Kolekcja Polls
```typescript
{
  id: string
  title: string
  restaurantOptions: string[]
  createdBy: string
  votingEndsAt: Timestamp
  closed: boolean
  selectedRestaurant: string | null
}
```

### Podkolekcja Votes
```typescript
{
  userId: string
  restaurant: string
  createdAt: Timestamp
}
```

### Podkolekcja Orders
```typescript
{
  userId: string
  dish: string
  notes: string
  cost: number
  createdAt: Timestamp
}
```

## Wdrożenie

Ta aplikacja może być wdrożona na Vercel, Netlify lub innej platformie obsługującej Next.js.

1. Zbuduj aplikację: `npm run build`
2. Wdróż na preferowaną platformę
3. Zaktualizuj zmienne środowiskowe w produkcji
4. Zaktualizuj URI przekierowania Discord OAuth dla domeny produkcyjnej

## Współpraca

1. Zrób fork repozytorium
2. Utwórz branch z funkcją
3. Wprowadź swoje zmiany
4. Prześlij pull request

## Licencja

Licencja MIT
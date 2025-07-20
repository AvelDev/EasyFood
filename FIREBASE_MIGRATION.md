# Migracja z Discord Next-Auth na Google Firebase Auth

## Zmiany wprowadzone

### 1. Usunięto zależności Next-Auth

- Usunięto `next-auth` z package.json
- Usunięto pliki konfiguracyjne Next-Auth:
  - `app/api/auth/[...nextauth]/route.ts`
  - `lib/auth.ts`
  - `next-auth.d.ts`

### 2. Zaktualizowano Firebase konfigurację

- Dodano `GoogleAuthProvider` do `lib/firebase.ts`
- Wyeksportowano `googleProvider` dla użycia w komponencie logowania

### 3. Utworzono nowe hooki i konteksty

- `hooks/use-auth.ts` - hook do zarządzania stanem użytkownika Firebase
- `contexts/auth-context.tsx` - context provider dla całej aplikacji

### 4. Zaktualizowano komponenty

- `app/providers.tsx` - zmieniono z SessionProvider na AuthProvider
- `app/auth/signin/page.tsx` - zmieniono na logowanie przez Google z Firebase
- `components/navbar.tsx` - zaktualizowano do używania Firebase Auth
- `app/page.tsx` - zmieniono referencje z session na user
- `components/create-poll-dialog.tsx` - zaktualizowano do Firebase Auth
- `app/poll/[id]/page.tsx` - zmieniono z Next-Auth na Firebase Auth
- `app/poll/[id]/orders/page.tsx` - zaktualizowano do Firebase Auth

### 5. Uproszczono middleware

- `middleware.ts` - zmieniono na prostsze rozwiązanie ponieważ Firebase Auth działa po stronie klienta

## Wymagana konfiguracja Firebase

### 1. Konfiguracja Firebase Console

1. Przejdź do [Firebase Console](https://console.firebase.google.com/)
2. Wybierz swój projekt lub utwórz nowy
3. Idź do **Authentication** > **Sign-in method**
4. Włącz **Google** jako providera
5. Skonfiguruj OAuth consent screen w Google Cloud Console
6. Dodaj autoryzowane domeny (localhost:4444 dla rozwoju)

### 2. Zmienne środowiskowe

Upewnij się, że masz skonfigurowane następujące zmienne środowiskowe w `.env.local`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Firestore Security Rules

Zaktualizuj reguły Firestore aby używać Firebase Auth UID:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Polls collection
    match /polls/{pollId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid in resource.data.createdBy;
      allow update: if request.auth != null;

      // Votes subcollection
      match /votes/{voteId} {
        allow read, write: if request.auth != null;
      }

      // Orders subcollection
      match /orders/{orderId} {
        allow read, write: if request.auth != null;
      }
    }
  }
}
```

## Jak działa nowa autentykacja

### 1. Przepływ logowania

1. Użytkownik klika "Continue with Google" na stronie `/auth/signin`
2. Otwiera się popup Google OAuth
3. Po pomyślnym zalogowaniu, Firebase automatycznie tworzy/aktualizuje użytkownika
4. Hook `useAuth` sprawdza czy użytkownik istnieje w Firestore
5. Jeśli nie, tworzy nowy dokument użytkownika z domyślną rolą 'user'
6. Stan użytkownika jest zarządzany przez AuthContext

### 2. Ochrona tras

- Komponenty używają `useAuthContext()` aby sprawdzić stan autentykacji
- Jeśli użytkownik nie jest zalogowany, pokazywane są odpowiednie komunikaty
- Middleware jest uproszczone, ponieważ Firebase Auth działa po stronie klienta

### 3. Zarządzanie rolami

- Role użytkowników ('admin', 'user') są przechowywane w Firestore
- Domyślnie nowi użytkownicy otrzymują rolę 'user'
- Admini mogą tworzyć ankiety i zamykać głosowania

## Uruchamianie aplikacji

```bash
npm install
npm run dev
```

Aplikacja będzie dostępna na `http://localhost:4444`

## Migracja danych użytkowników

Jeśli masz istniejących użytkowników z Discord ID, będziesz musiał:

1. Poprosić użytkowników o ponowne zalogowanie przez Google
2. Opcjonalnie: utworzyć skrypt migracyjny aby połączyć stare Discord ID z nowymi Firebase UID
3. Zaktualizować istniejące dokumenty w Firestore aby używały nowych UID

## Korzyści z Firebase Auth

1. **Lepsze bezpieczeństwo** - Firebase zarządza tokenami i sesjami
2. **Prostsze zarządzanie** - mniej kodu do utrzymania
3. **Integracja z Firestore** - natywna integracja z bazą danych
4. **Elastyczność** - łatwo dodać kolejnych providerów (Facebook, Apple, itp.)
5. **Offline support** - Firebase automatycznie obsługuje tryb offline

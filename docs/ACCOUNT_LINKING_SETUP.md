# Konfiguracja łączenia kont w Firebase

## Problem: auth/account-exists-with-different-credential

Ten błąd występuje, gdy użytkownik próbuje zalogować się za pomocą nowego dostawcy (np. Microsoft), ale konto o tym samym adresie e-mail już istnieje z innym dostawcą (np. Google).

## Problem: Niezweryfikowany email przy logowaniu przez Microsoft

Dodatkowo, Firebase domyślnie nie oznacza emaili jako zweryfikowane przy logowaniu przez niektórych dostawców OAuth, w tym Microsoft. Nasza aplikacja rozwiązuje ten problem automatycznie.

## Rozwiązanie

### 1. Automatyczne łączenie kont (REKOMENDOWANE)

W Firebase Console:

1. Przejdź do **Authentication** > **Settings** > **User actions**
2. W sekcji **Account linking** włącz opcję:
   - **Allow creation of multiple accounts with the same email address** - WYŁĄCZ to
   - **Automatically link accounts with the same email address** - WŁĄCZ to

### 2. Ręczne łączenie kont (AKTUALNA IMPLEMENTACJA)

Jeśli nie chcesz włączać automatycznego łączenia, nasza aplikacja obsługuje ręczne łączenie kont:

1. Użytkownik musi najpierw zalogować się za pomocą pierwotnego dostawcy
2. W ustawieniach konta może dodać dodatkowe metody logowania
3. Po połączeniu może logować się używając dowolnej z połączonych metod

### 3. Automatyczna weryfikacja emaili dla zaufanych providerów (NOWA FUNKCJA)

Nasza aplikacja automatycznie uznaje emaile za zweryfikowane, gdy użytkownik loguje się przez zaufanych dostawców:

#### Zaufani dostawcy:

- **Google** (`google.com`)
- **Microsoft** (`microsoft.com`)
- **Discord** (`oidc.discord`)

#### Jak to działa:

1. **Funkcja `isEmailEffectivelyVerified()`** sprawdza:

   - Czy Firebase oznaczył email jako zweryfikowany
   - Czy użytkownik loguje się tylko przez zaufanych dostawców

2. **Interfejs użytkownika** wyświetla odpowiedni status:

   - "Zweryfikowany przez zaufanego dostawcę uwierzytelniania" dla OAuth
   - "Zweryfikowany" dla standardowej weryfikacji Firebase
   - "Niezweryfikowany" z opcjami weryfikacji dla niezweryfikowanych kont

3. **Funkcje weryfikacji emaila**:
   - `sendEmailVerificationToUser()` - wysyła email weryfikacyjny
   - `reloadUserData()` - odświeża status weryfikacji
   - Przyciski dostępne tylko dla użytkowników wymagających weryfikacji

### 4. Kod implementacji

#### W `lib/auth.ts`:

- Dodano obsługę błędu `auth/account-exists-with-different-credential`
- Dodano funkcję `linkProviderToAccount()` do łączenia kont
- Dodano funkcję `getAvailableProvidersForEmail()` do sprawdzania dostępnych metod

#### W `components/user-provider-info.tsx`:

- Interfejs do zarządzania połączonymi kontami
- Możliwość dodawania nowych metod logowania
- Wyświetlanie statusu połączonych kont

### 4. Instrukcje dla użytkowników

Gdy użytkownik napotka błąd:

1. Komunikat wskazuje, jakiej metody logowania powinien użyć
2. Po zalogowaniu może przejść do **Ustawienia** > **Konto**
3. W sekcji **Metody logowania** może dodać dodatkowe konta

### 5. Zalety tego podejścia

- **Bezpieczeństwo**: Użytkownik kontroluje łączenie kont
- **Transparentność**: Jasno widzi, które konta są połączone
- **Elastyczność**: Może logować się używając dowolnej metody
- **Zgodność**: Działa z wszystkimi dostawcami OAuth

### 6. Konfiguracja dostawców

#### Google:

```typescript
googleProvider.setCustomParameters({
  prompt: "select_account",
});
```

#### Microsoft:

```typescript
microsoftProvider.setCustomParameters({
  prompt: "select_account",
});
```

#### Discord:

```typescript
discordProvider.setCustomParameters({
  hd: "discord.com",
});
```

## Testowanie

### Test łączenia kont:

1. Utwórz konto z Google
2. Wyloguj się
3. Spróbuj zalogować się z Microsoft używając tego samego emaila
4. Powinieneś zobaczyć komunikat z instrukcją
5. Zaloguj się z Google
6. Przejdź do ustawień i połącz konto Microsoft
7. Wyloguj się i zaloguj ponownie z Microsoft - powinno działać

### Test weryfikacji emaila:

1. **Microsoft/Google/Discord**: Email automatycznie uznany za zweryfikowany
2. **Inne metody**: Dostępne opcje weryfikacji w ustawieniach bezpieczeństwa
3. **Status weryfikacji**: Sprawdź w Ustawienia > Konto i Ustawienia > Bezpieczeństwo

## Firebase Console - Dodatkowe konfiguracje

### Włączenie dostawców:

1. **Google**: Skonfigurowany
2. **Microsoft**: Skonfigurowany jako "Microsoft"
3. **Discord**: Skonfigurowany jako "OpenID Connect" z providerem Discord

### Domeny autoryzowane:

- `localhost` (dla developmentu)
- Twoja domena produkcyjna

### Ustawienia OAuth:

- Redirect URIs muszą być poprawnie skonfigurowane
- Scopes muszą obejmować `email` dla wszystkich dostawców

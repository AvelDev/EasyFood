# Konfiguracja Discord OIDC z Firebase Auth

## 1. Konfiguracja w Discord Developer Portal

1. Idź na https://discord.com/developers/applications
2. Utwórz nową aplikację lub wybierz istniejącą
3. W sekcji **OAuth2**:
   - Skopiuj **Client ID** i **Client Secret**
   - W **Redirects** dodaj: `https://twoja-domena.firebaseapp.com/__/auth/handler`
   - W **Scopes** wybierz: `identify`, `email`

## 2. Konfiguracja w Firebase Console

1. Idź do Firebase Console (https://console.firebase.google.com/)
2. Wybierz swój projekt
3. Przejdź do **Authentication** > **Sign-in method**
4. W sekcji **Custom providers** kliknij **Add new provider**
5. Wybierz **OpenID Connect (OIDC)**
6. Wprowadź następujące dane:
   - **Name**: Discord
   - **Provider ID**: `oidc.discord`
   - **Client ID**: [Client ID z Discord]
   - **Client Secret**: [Client Secret z Discord]
   - **Issuer (URL)**: `https://discord.com`

## 3. Zmienne środowiskowe

Dodaj do pliku `.env.local`:

```
# Discord OIDC (opcjonalne, jeśli potrzebujesz dodatkowych konfiguracji)
NEXT_PUBLIC_DISCORD_CLIENT_ID=twoj_discord_client_id
```

## 4. Dodatkowe konfiguracje

### Scopes Discord OIDC

W kodzie już skonfigurowane:

- `identify` - podstawowe informacje o użytkowniku
- `email` - adres email użytkownika

### Obsługa błędów

Implementuj odpowiednią obsługę błędów dla różnych scenariuszy:

- Użytkownik anuluje logowanie
- Błędy sieci
- Nieprawidłowa konfiguracja

## 5. Testowanie

1. Uruchom aplikację lokalnie
2. Przejdź na stronę logowania
3. Kliknij "Continue with Discord"
4. Zezwól na dostęp w Discord
5. Sprawdź czy użytkownik jest poprawnie zalogowany

## Uwagi bezpieczeństwa

- Nigdy nie commituj Client Secret do repozytorium
- Używaj zmiennych środowiskowych dla wrażliwych danych
- Regularnie rotuj klucze dostępu
- Ogranicz redirect URLs do zaufanych domen

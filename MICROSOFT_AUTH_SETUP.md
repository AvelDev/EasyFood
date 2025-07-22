# Microsoft Authentication Setup

## Wprowadzenie

Ten dokument opisuje proces konfiguracji Microsoft Authentication w aplikacji EasyFood przy użyciu Firebase Auth.

## Wymagania

- Konto Microsoft Azure
- Dostęp do Azure Active Directory (AAD)
- Skonfigurowana aplikacja Firebase

## Krok 1: Konfiguracja w Azure Active Directory

### 1.1 Tworzenie App Registration

1. Zaloguj się do [Azure Portal](https://portal.azure.com)
2. Przejdź do **Azure Active Directory**
3. Wybierz **App registrations** w menu bocznym
4. Kliknij **New registration**
5. Wypełnij formularz:
   - **Name**: EasyFood Auth (lub dowolna nazwa)
   - **Supported account types**: Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI**:
     - Type: Web
     - URI: `https://YOUR_PROJECT_ID.firebaseapp.com/__/auth/handler`

### 1.2 Konfiguracja po utworzeniu

1. W sekcji **Overview** skopiuj:

   - **Application (client) ID**
   - **Directory (tenant) ID**

2. Przejdź do **Certificates & secrets**
3. Kliknij **New client secret**
4. Dodaj opis i wybierz czas wygaśnięcia
5. Skopiuj **Client secret value** (będzie widoczny tylko raz!)

6. Przejdź do **API permissions**
7. Dodaj następujące uprawnienia Microsoft Graph:
   - `email`
   - `openid`
   - `profile`

## Krok 2: Konfiguracja w Firebase Console

### 2.1 Włączenie Microsoft Provider

1. Przejdź do [Firebase Console](https://console.firebase.google.com)
2. Wybierz swój projekt
3. Przejdź do **Authentication** → **Sign-in method**
4. Znajdź **Microsoft** i kliknij **Enable**
5. Wypełnij dane:
   - **Client ID**: Application (client) ID z Azure
   - **Client Secret**: Client secret z Azure
   - **Tenant ID**: Directory (tenant) ID z Azure (opcjonalne)

### 2.2 Dodanie domeny do autoryzowanych

1. W sekcji **Authorized domains** dodaj swoją domenę produkcyjną
2. Domyślnie `localhost` jest już autoryzowana dla developmentu

## Krok 3: Konfiguracja Redirect URI

### 3.1 Aktualizacja w Azure Portal

1. Wróć do Azure Portal → App registrations → Twoja aplikacja
2. Przejdź do **Authentication**
3. W sekcji **Redirect URIs** dodaj:
   - `https://YOUR_PROJECT_ID.firebaseapp.com/__/auth/handler`
   - `http://localhost:3000/__/auth/handler` (dla developmentu)

## Krok 4: Testowanie

### 4.1 Lokalnie

1. Uruchom aplikację: `npm run dev`
2. Przejdź do strony logowania
3. Kliknij "Kontynuuj z Microsoft"
4. Sprawdź czy popup się otwiera i czy logowanie działa

### 4.2 Produkcja

1. Wdróż aplikację
2. Sprawdź czy wszystkie domeny są poprawnie skonfigurowane
3. Przetestuj pełny flow logowania

## Możliwe problemy i rozwiązania

### Problem: "Invalid redirect URI"

**Rozwiązanie**: Sprawdź czy Redirect URI w Azure Portal dokładnie pasuje do tego używanego przez Firebase.

### Problem: "Client secret expired"

**Rozwiązanie**: Wygeneruj nowy client secret w Azure Portal i zaktualizuj go w Firebase Console.

### Problem: "Insufficient permissions"

**Rozwiązanie**: Sprawdź czy dodane są wszystkie wymagane uprawnienia Microsoft Graph w Azure Portal.

### Problem: Popup blokowany przez przeglądarkę

**Rozwiązanie**: Użytkownicy mogą potrzebować allowlisting domeny lub wyłączenie popup blockera.

## Dodatkowe ustawienia

### Ograniczenie do organizacji

Aby ograniczyć logowanie tylko do użytkowników z określonej organizacji:

1. W Azure Portal → App registrations → Authentication
2. W **Supported account types** wybierz "Accounts in this organizational directory only"

### Custom claims

Firebase automatycznie mapuje podstawowe informacje z Microsoft. Jeśli potrzebujesz dodatkowych danych, możesz skonfigurować custom claims w Cloud Functions.

## Bezpieczeństwo

- **Nigdy** nie commituj client secret do repozytorium
- Regularnie rotuj client secrets
- Monitoruj logi uwierzytelniania w Azure Portal
- Używaj HTTPS w produkcji

## Przydatne linki

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Microsoft Identity Platform](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [Azure App Registration](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)

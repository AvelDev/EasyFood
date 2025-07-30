# Zarządzanie administratorami w EasyFood

## Opis funkcjonalności

Nowa funkcjonalność pozwala na nadawanie i odbieranie roli administratora konkretnym użytkownikom poprzez ich UID. Administratorzy są oznaczeni w specjalny sposób w całej aplikacji.

## Nowe komponenty

### AdminManagement

Główny komponent do zarządzania administratorami, znajdujący się w `/components/settings/admin-management.tsx`.

**Funkcjonalności:**

- Wyświetlanie listy obecnych administratorów
- Wyszukiwanie użytkowników po UID
- Nadawanie roli administratora
- Odbieranie roli administratora
- Kopiowanie UID do schowka

### Zaktualizowane komponenty

#### UserManagement

- Dodano specjalne oznaczenia dla administratorów:
  - Animowana korona z efektem ping
  - Gradientowy badge z ikoną korony
  - Dodatkowy tekst "⭐ Administrator"
  - Wyróżnienie kolorami żółtymi/złotymi

#### Funkcje administratorskie (admin-settings.ts)

- `updateUserRole(uid: string, newRole: "admin" | "user")` - zmienia rolę użytkownika
- `getUser(uid: string)` - pobiera dane konkretnego użytkownika po UID

## Jak używać

### 1. Nadawanie roli administratora

1. Przejdź do ustawień ogólnych (`/settings/general`) jako administrator
2. W sekcji "Zarządzanie administratorami" kliknij "Dodaj administratora"
3. Wprowadź UID użytkownika w polu tekstowym
4. Kliknij przycisk wyszukiwania lub naciśnij Enter
5. Gdy użytkownik zostanie znaleziony, kliknij "Nadaj rangę admin"

### 2. Odbieranie roli administratora

1. W sekcji "Obecni Administratorzy" znajdź użytkownika
2. Kliknij "Usuń rangę" przy jego nazwie
3. Potwierdź akcję w oknie dialogowym

### 3. Identyfikacja administratorów

Administratorzy są oznaczeni w następujący sposób:

- **Animowana korona** z efektem ping
- **Gradientowy badge** "👑 Administrator"
- **Żółte/złote kolory** w interfejsie
- **Dodatkowy tekst** "⭐ Administrator" pod nazwą

## Uprawnienia

Tylko użytkownicy z rolą "admin" mają dostęp do:

- Sekcji zarządzania administratorami
- Funkcji nadawania/odbierania roli administratora
- Pełnych ustawień ogólnych

## Bezpieczeństwo

- Wszystkie operacje na rolach są zabezpieczone autoryzacją
- Sprawdzanie uprawnień na poziomie komponentów i funkcji
- Walidacja UID przed wykonaniem operacji
- Komunikaty o błędach i sukcesach

## Struktura plików

```
components/
├── settings/
│   ├── admin-management.tsx     # Nowy komponent zarządzania adminami
│   └── user-management.tsx      # Zaktualizowany z oznakowaniem adminów
lib/
└── admin-settings.ts            # Nowe funkcje updateUserRole() i getUser()
app/
└── settings/
    └── general/
        └── page.tsx             # Zaktualizowana strona z nowym komponentem
```

## Baza danych

Funkcjonalność wykorzystuje istniejące pole `role` w kolekcji `users` w Firestore:

- `"admin"` - użytkownik z uprawnieniami administratora
- `"user"` - zwykły użytkownik (domyślne)

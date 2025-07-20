# Polityka Prywatności - Implementacja

## Opis funkcjonalności

Implementacja obowiązkowej akceptacji polityki prywatności podczas logowania/rejestracji w aplikacji EasyFood.

## Funkcjonalności

### 1. Dialog Polityki Prywatności

- **Plik**: `components/privacy-policy-dialog.tsx`
- Modal z pełną treścią polityki prywatności
- Wymaga zaznaczenia checkboxa przed akceptacją
- Przyciski "Akceptuję i kontynuuję" oraz "Odrzuć"

### 2. Zaktualizowany proces logowania

- **Plik**: `app/auth/signin/page.tsx`
- Po uwierzytelnieniu sprawdza czy użytkownik zaakceptował politykę
- Wyświetla dialog polityki prywatności dla nowych użytkowników
- Wylogowuje użytkowników którzy odrzucą politykę

### 3. Funkcje uwierzytelniania

- **Plik**: `lib/auth.ts`
- `signInWithProvider()` - zwraca informację czy potrzebna jest akceptacja polityki
- `acceptPrivacyPolicy()` - zapisuje akceptację polityki w Firestore

### 4. Hook zabezpieczający

- **Plik**: `hooks/use-privacy-protection.ts`
- Automatycznie przekierowuje użytkowników bez akceptacji polityki
- Używany w chronionych stronach aplikacji

### 5. Zaktualizowane typy

- **Plik**: `types/index.ts`
- Dodano pola `privacyPolicyAccepted` i `privacyPolicyAcceptedAt` do typu `User`

## Jak to działa

1. **Logowanie nowego użytkownika**:

   - Użytkownik klika "Kontynuuj z Google/Discord"
   - System sprawdza czy użytkownik istnieje w bazie danych
   - Jeśli nie lub nie zaakceptował polityki - wyświetla dialog polityki prywatności

2. **Akceptacja polityki**:

   - Użytkownik musi przeczytać politykę i zaznaczyć checkbox
   - Po kliknięciu "Akceptuję i kontynuuję" - dane są zapisywane w Firestore
   - Użytkownik zostaje przekierowany do strony głównej

3. **Odrzucenie polityki**:

   - Użytkownik zostaje wylogowany
   - Wyświetla się komunikat o konieczności akceptacji polityki

4. **Ochrona aplikacji**:
   - Wszystkie chronione strony używają hooka `usePrivacyProtection`
   - Automatyczne przekierowanie na stronę logowania dla nieuwierzytelnionych użytkowników
   - Sprawdzanie akceptacji polityki prywatności

## Pliki zmodyfikowane

1. `components/privacy-policy-dialog.tsx` - nowy komponent
2. `hooks/use-privacy-protection.ts` - nowy hook
3. `app/auth/signin/page.tsx` - zaktualizowana strona logowania
4. `lib/auth.ts` - nowe funkcje uwierzytelniania
5. `types/index.ts` - zaktualizowane typy
6. `hooks/use-auth.ts` - sprawdzanie polityki prywatności
7. `app/page.tsx` - użycie nowego hooka zabezpieczającego
8. `app/poll/[id]/page.tsx` - użycie nowego hooka zabezpieczającego
9. `app/poll/[id]/orders/page.tsx` - użycie nowego hooka zabezpieczającego

## Baza danych

W Firestore, w kolekcji `users`, każdy dokument użytkownika zawiera teraz:

```javascript
{
  uid: "user-id",
  name: "User Name",
  role: "admin" | "user",
  privacyPolicyAccepted: true,
  privacyPolicyAcceptedAt: Date
}
```

## Testowanie

1. Nowy użytkownik:

   - Zaloguj się po raz pierwszy
   - Powinien wyświetlić się dialog polityki prywatności
   - Spróbuj odrzucić - zostaniesz wylogowany
   - Zaloguj się ponownie i zaakceptuj politykę

2. Istniejący użytkownik:

   - Jeśli wcześniej nie zaakceptował polityki - powinien zobaczyć dialog
   - Jeśli już zaakceptował - bezpośrednie przejście do aplikacji

3. Zabezpieczenia:
   - Spróbuj wejść bezpośrednio na chronione strony bez logowania
   - Powinieneś zostać przekierowany na stronę logowania

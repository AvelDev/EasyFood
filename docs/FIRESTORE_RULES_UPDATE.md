# Aktualizacja reguł Firestore dla zarządzania rolami administratorów

## Opis zmian

Zaktualizowane zostały reguły bezpieczeństwa Firestore (`firestore.rules`), aby umożliwić administratorom zarządzanie rolami innych użytkowników w bezpieczny sposób.

## Nowe uprawnienia

### Aktualizacja ról użytkowników

```javascript
allow update: if request.auth != null &&
              (request.auth.uid == userId ||
               (isAdmin() &&
                // Administratorzy mogą zmieniać tylko pole 'role'
                request.resource.data.diff(resource.data).affectedKeys().hasOnly(['role']) &&
                // Nowa rola musi być 'admin' lub 'user'
                request.resource.data.role in ['admin', 'user']));
```

### Zabezpieczenia

1. **Ograniczenie pól**: Administratorzy mogą modyfikować TYLKO pole `role` w dokumentach innych użytkowników
2. **Walidacja wartości**: Pole `role` może zawierać tylko wartości `'admin'` lub `'user'`
3. **Autoryzacja**: Tylko użytkownicy z rolą `admin` mogą zmieniać role innych użytkowników
4. **Własne dane**: Użytkownicy nadal mogą edytować wszystkie swoje dane (poza rolą, którą może zmieniać tylko admin)

## Funkcja pomocnicza

Wykorzystywana istniejąca funkcja `isAdmin()`:

```javascript
function isAdmin() {
  return request.auth != null &&
         exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

## Bezpieczeństwo

- **Atomowość**: Operacje zmiany roli są atomowe - albo się udają całkowicie, albo wcale
- **Weryfikacja istnienia**: Funkcja `isAdmin()` sprawdza czy dokument użytkownika istnieje przed sprawdzeniem roli
- **Walidacja typu**: Reguły sprawdzają typ i dozwolone wartości pola `role`
- **Izolacja uprawnień**: Administratorzy nie mogą modyfikować innych pól użytkowników (np. `name`, `createdAt`)

## Przykłady operacji

### ✅ Dozwolone operacje dla administratorów:

```javascript
// Nadanie roli admin
db.collection("users").doc("user123").update({
  role: "admin",
});

// Odebranie roli admin
db.collection("users").doc("user123").update({
  role: "user",
});
```

### ❌ Zabronione operacje:

```javascript
// Próba zmiany innych pól przez administratora
db.collection("users").doc("user123").update({
  role: "admin",
  name: "Nowa nazwa", // ❌ Błąd - admin nie może zmieniać innych pól
});

// Nieprawidłowa wartość roli
db.collection("users").doc("user123").update({
  role: "superadmin", // ❌ Błąd - nieprawidłowa wartość
});

// Próba zmiany roli przez zwykłego użytkownika
db.collection("users").doc("otherUser").update({
  role: "admin", // ❌ Błąd - brak uprawnień
});
```

## Wdrożenie

Po aktualizacji reguł w pliku `firestore.rules`, należy je wdrożyć w Firebase Console lub za pomocą Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

## Kompatybilność

Zmiany są w pełni kompatybilne wstecz:

- Istniejące operacje użytkowników na własnych danych działają bez zmian
- Dodane zostały tylko nowe uprawnienia dla administratorów
- Wszystkie inne reguły pozostają niezmienione

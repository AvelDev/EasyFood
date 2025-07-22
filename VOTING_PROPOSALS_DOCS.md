# Dokumentacja Propozycji Opcji Głosowania

## Przegląd funkcjonalności

System propozycji opcji głosowania pozwala zwykłym użytkownikom proponować nowe restauracje podczas aktywnego głosowania, a administratorom zarządzać tymi propozycjami na żywo.

## Struktura systemu

### 1. Typy danych

#### VotingOptionProposal

```typescript
{
  id: string;
  pollId: string;
  restaurantName: string;
  proposedBy: string;
  proposedByName: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewedByName?: string;
  adminNotes?: string;
}
```

### 2. Reguły Firebase

Propozycje są przechowywane jako podkolekcja `votingProposals` w ramach każdego dokumentu głosowania:

- **Czytanie**: Wszyscy zalogowani użytkownicy
- **Tworzenie**: Wszyscy zalogowani użytkownicy (tylko własne propozycje ze statusem "pending")
- **Aktualizacja**: Administratorzy (zatwierdzanie/odrzucanie) lub autorzy (edycja propozycji oczekujących)
- **Usuwanie**: Administratorzy lub autorzy propozycji

### 3. Komponenty

#### ProposeOptionForm

- Formularz proponowania nowych opcji restauracji
- Walidacja duplikatów (istniejące opcje i własne propozycje)
- Wyświetlanie statusu własnych propozycji
- Animowane rozwijanie/zwijanie formularza

#### AdminProposalsManagement

- Panel administratora do zarządzania propozycjami
- Sekcje: oczekujące propozycje i historia
- Możliwość zatwierdzania, odrzucania i usuwania propozycji
- Dodawanie uwag administratora

#### VotingSection (rozszerzony)

- Integracja z systemem propozycji
- Wyświetlanie formularza propozycji dla zalogowanych użytkowników
- Wyświetlanie panelu administratora dla adminów

### 4. Hook useVotingProposals

#### Parametry:

- `pollId` - ID głosowania
- `userId` - ID użytkownika
- `userName` - Nazwa użytkownika
- `userRole` - Rola użytkownika ("admin" | "user")

#### Zwracane wartości:

- `proposals` - wszystkie propozycje
- `userProposals` - propozycje obecnego użytkownika
- `pendingProposals` - propozycje oczekujące na weryfikację
- `approvedProposals` - zatwierdzone propozycje
- `rejectedProposals` - odrzucone propozycje
- `loading` - stan ładowania
- `submitting` - stan wysyłania nowej propozycji
- `submitProposal` - funkcja wysyłania propozycji
- `approveProposal` - funkcja zatwierdzania (tylko admin)
- `rejectProposal` - funkcja odrzucania (tylko admin)
- `deleteProposal` - funkcja usuwania

### 5. Funkcje Firestore

#### Dla zwykłych operacji:

- `createVotingProposal()` - tworzenie nowej propozycji
- `getVotingProposals()` - pobieranie propozycji
- `subscribeToVotingProposals()` - nasłuchiwanie zmian w czasie rzeczywistym
- `updateVotingProposal()` - aktualizacja propozycji
- `deleteVotingProposal()` - usuwanie propozycji

#### Dla administratorów:

- `approveVotingProposal()` - zatwierdzanie propozycji i dodawanie do opcji głosowania

## Przepływ pracy

### Dla użytkowników:

1. Użytkownik klika "Dodaj propozycję" w sekcji głosowania
2. Wpisuje nazwę restauracji w formularzu
3. System waliduje czy restauracja już nie istnieje
4. Po wysłaniu propozycja otrzymuje status "pending"
5. Użytkownik widzi status swojej propozycji w formularzu

### Dla administratorów:

1. Administratorzy widzą panel z oczekującymi propozycjami
2. Mogą zatwierdzić propozycję - restauracja zostaje dodana do opcji głosowania
3. Mogą odrzucić propozycję z opcjonalnymi uwagami
4. Mogą usunąć propozycje z historii
5. Wszystkie akcje są logowane z datą i autorem

## Bezpieczeństwo

- Użytkownicy mogą proponować tylko podczas aktywnego głosowania
- Walidacja po stronie frontendu i backendu
- Reguły Firebase zapobiegają nieautoryzowanym operacjom
- Wszystkie zmiany są audytowane (autor, data, uwagi)

## Aktualizacje na żywo

System wykorzystuje Firestore Real-time Listeners:

- Propozycje są synchronizowane w czasie rzeczywistym
- Administratorzy widzą nowe propozycje natychmiast
- Użytkownicy widzą zmiany statusu swoich propozycji na żywo
- Opcje głosowania są aktualizowane automatycznie po zatwierdzeniu propozycji

## Integracja z istniejącym systemem

System został zaprojektowany jako rozszerzenie istniejącej funkcjonalności:

- Nie wpływa na podstawowe głosowanie
- Wykorzystuje istniejące komponenty UI
- Zgodny z obecnymi regułami autoryzacji
- Zachowuje spójność wizualną z resztą aplikacji

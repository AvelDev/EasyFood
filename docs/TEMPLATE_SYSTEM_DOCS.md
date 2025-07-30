# System szablonów głosowań - Instrukcja użycia

## Opis funkcjonalności

System szablonów pozwala administratorom na tworzenie predefiniowanych szablonów głosowań z gotowymi restauracjami i linkami do menu. Użytkownicy mogą następnie używać tych szablonów do szybkiego tworzenia nowych głosowań.

## Jak używać systemu szablonów

### Dla administratorów - tworzenie szablonów

1. **Przejdź do ustawień ogólnych**:

   - Zaloguj się jako administrator
   - Przejdź do `/settings/general`
   - Znajdź sekcję "Szablony głosowań"

2. **Utwórz nowy szablon**:

   - Kliknij "Dodaj szablon"
   - Wypełnij formularz:
     - **Nazwa szablonu**: np. "Lunch w biurze"
     - **Tytuł głosowania**: np. "Gdzie zamawiamy lunch?"
     - **Opis**: opcjonalny opis głosowania
     - **Restauracje**: minimum 2 restauracje, każda z opcjonalnym linkiem do menu
   - Ustaw czy szablon ma być aktywny
   - Kliknij "Utwórz"

3. **Zarządzanie szablonami**:
   - Edytuj istniejące szablony klikając ikonę ołówka
   - Usuń szablony klikając ikonę kosza
   - Włączaj/wyłączaj szablony edytując je

### Dla wszystkich użytkowników - tworzenie głosowań z szablonów

1. **Utwórz nowe głosowanie**:

   - Na stronie głównej kliknij przycisk tworzenia głosowania (tylko administratorzy)
   - W oknie dialogowym zobaczysz sekcję "Użyj szablonu (opcjonalne)"

2. **Wybierz szablon**:

   - Z listy wybierz jeden z dostępnych szablonów
   - Formularz automatycznie wypełni się danymi z szablonu:
     - Tytuł głosowania
     - Opis
     - Lista restauracji z linkami
   - Możesz modyfikować wszystkie dane po wyborze szablonu

3. **Ustaw czasy**:

   - Wybierz datę i godzinę zakończenia głosowania
   - Ustaw godzinę zakończenia przyjmowania zamówień
   - Kliknij "Utwórz głosowanie"

4. **Opcja "Utwórz od zera"**:
   - Wybierz tę opcję aby utworzyć głosowanie bez szablonu
   - Wypełnij wszystkie pola ręcznie

## Struktura szablonu

Każdy szablon zawiera:

- **Nazwę szablonu**: identyfikuje szablon w liście
- **Tytuł głosowania**: będzie użyty jako tytuł nowego głosowania
- **Opis**: opcjonalny opis dla głosowania
- **Restauracje**: lista restauracji, każda z:
  - Nazwą restauracji (wymagane)
  - Linkiem do menu (opcjonalne)
- **Status aktywności**: czy szablon jest dostępny do użycia

## Zalety systemu szablonów

- ⚡ **Szybkość**: Tworzenie głosowań w kilku kliknięciach
- 🎯 **Konsystentność**: Jednolite nazwy restauracji i linki
- 📝 **Elastyczność**: Możliwość modyfikacji po wyborze szablonu
- 🔧 **Zarządzanie**: Łatwe dodawanie, edytowanie i usuwanie szablonów
- 👥 **Dla zespołu**: Wszystkie popularne restauracje zawsze dostępne

## Uwagi techniczne

- Szablony są przechowywane w Firestore w kolekcji `pollTemplates`
- Tylko administratorzy mogą tworzyć, edytować i usuwać szablony
- Wszyscy zalogowani użytkownicy mogą czytać aktywne szablony
- System nie przechowuje czasów w szablonach - są ustawiane przy każdym głosowaniu
- Minimum 2 restauracje są wymagane w każdym szablonie

# 🛡️ Sistema di Qualità e Error Handling

## 📋 Panoramica

Il gestionale ora include un sistema completo di error handling, validazione e gestione qualità del codice.

---

## 🛠️ Componenti Creati

### 1. **Error Handler (`src/utils/errorHandler.js`)**

Sistema centralizzato per logging e gestione errori.

**Funzionalità:**
- ✅ Log errori in localStorage per debugging
- ✅ Livelli di errore (info, warning, error, critical)
- ✅ Wrapper per funzioni async/sync
- ✅ Messaggi errore user-friendly
- ✅ Limite automatico log (ultimi 50 errori)

**Esempio uso:**
```javascript
import { logError, withErrorHandling, getUserFriendlyMessage } from '../utils/errorHandler';

// Log errore
logError(error, { context: 'Login' }, ERROR_LEVELS.ERROR);

// Wrapper async
const data = await withErrorHandling(
  async () => fetchData(),
  'Errore nel caricamento dati',
  { userId: 123 }
);

// Messaggio user-friendly
const message = getUserFriendlyMessage(error);
```

---

### 2. **Storage Migliorato (`src/utils/storage.js`)**

Sistema storage con validazione e error handling avanzato.

**Miglioramenti:**
- ✅ Validazione dati prima di salvare
- ✅ Controllo spazio disponibile
- ✅ Gestione errori specifici (QuotaExceededError, ecc.)
- ✅ Validazione formato dati
- ✅ Ritorno strutturato `{ success, error }`

**Formato ritorno:**
```javascript
// Prima (solo booleano)
const saved = setItem('key', value); // true/false

// Ora (oggetto strutturato)
const result = setItem('key', value);
if (result.success) {
  // Successo
} else {
  console.error(result.error);
  console.error(result.code); // Codice errore specifico
}
```

**Funzioni disponibili:**
- `getItem(key, defaultValue)` - Leggi (formato invariato)
- `setItem(key, value)` - Salva con validazione
- `removeItem(key)` - Rimuovi
- `clearAll()` - Pulisci tutto
- `getStorageKeys()` - Lista chiavi

---

### 3. **ErrorBoundary (`src/components/ErrorBoundary.jsx`)**

Componente React per catturare errori nel rendering.

**Caratteristiche:**
- ✅ Cattura errori React automaticamente
- ✅ UI di fallback user-friendly
- ✅ Log errori automatico
- ✅ Opzioni di recovery (reload, reset, home)

**Integrato in:**
- `src/main.jsx` - Avvolge tutta l'app

---

### 4. **Toast Notifications (`src/components/Toast.jsx`)**

Sistema notifiche toast moderno e accessibile.

**Funzionalità:**
- ✅ 4 tipi: success, error, warning, info
- ✅ Auto-dismiss configurabile
- ✅ Animazioni smooth
- ✅ Mobile-friendly
- ✅ Context API per uso globale

**Esempio uso:**
```javascript
import { useToast } from '../components/Toast';

const MyComponent = () => {
  const toast = useToast();

  const handleSave = () => {
    try {
      saveData();
      toast.success('Salvato con successo!');
    } catch (error) {
      toast.error('Errore nel salvataggio');
    }
  };
};
```

**Integrato in:**
- `src/main.jsx` - Provider globale

---

### 5. **Validators (`src/utils/validators.js`)**

Utility per validazione input centralizzata.

**Validatori disponibili:**
- `isValidEmail(email)`
- `isValidPhone(phone)`
- `isRequired(value)`
- `hasLength(value, min, max)`
- `isPositiveNumber(value)`
- `isValidDate(date)`
- `isValidPrice(value)`
- `isValidUsername(username)`
- `isValidPassword(password)`
- `validateForm(formData, schema)`

**Esempio validazione form:**
```javascript
import { validateForm, isRequired, isValidEmail, hasLength } from '../utils/validators';

const schema = {
  name: [isRequired, (v) => hasLength(v, 2, 50) || 'Nome deve essere tra 2 e 50 caratteri'],
  email: [isRequired, isValidEmail || 'Email non valida']
};

const result = validateForm(formData, schema);
if (result.valid) {
  // Submit form
} else {
  console.log(result.errors);
}
```

---

## 📊 Standard Qualità Codice

### **Error Handling**

✅ **Obbligatorio:**
- Usare `withErrorHandling` per operazioni async
- Loggare errori con `logError`
- Mostrare messaggi user-friendly

✅ **Best Practices:**
- Validare input prima di processare
- Gestire casi edge (storage full, network error, ecc.)
- Fornire feedback all'utente (toast/notifiche)

---

### **Storage**

✅ **Obbligatorio:**
- Controllare `result.success` dopo `setItem`/`removeItem`
- Gestire errori di storage

✅ **Best Practices:**
- Non salvare dati troppo grandi
- Validare dati prima di salvare
- Usare chiavi con prefisso `studio_`

---

### **Validazione Input**

✅ **Obbligatorio:**
- Validare form critici (login, transazioni, ecc.)
- Mostrare errori di validazione all'utente

✅ **Best Practices:**
- Usare validatori centralizzati da `validators.js`
- Validare client-side e server-side (quando avremo backend)
- Sanitizzare input utente

---

## 🔄 Migrazione Codice Esistente

### **Storage**

**Prima:**
```javascript
const saved = setItem('key', value);
if (saved) {
  // Success
}
```

**Dopo:**
```javascript
const result = setItem('key', value);
if (result.success) {
  // Success
} else {
  toast.error(result.error);
}
```

### **Error Handling**

**Prima:**
```javascript
try {
  await someAsyncOperation();
} catch (error) {
  console.error(error);
  alert('Errore!');
}
```

**Dopo:**
```javascript
import { withErrorHandling } from '../utils/errorHandler';
import { useToast } from '../components/Toast';

const toast = useToast();

const result = await withErrorHandling(
  async () => someAsyncOperation(),
  'Errore nell\'operazione'
);

if (result) {
  toast.success('Operazione completata!');
}
```

---

## 📝 Checklist Qualità

Quando crei/modifichi un componente:

- [ ] Error handling presente?
- [ ] Validazione input se necessario?
- [ ] Toast/notifiche per feedback utente?
- [ ] Storage errors gestiti?
- [ ] Loading states per operazioni async?
- [ ] Mobile-friendly?
- [ ] Accessibilità (aria-labels, ecc.)?

---

## 🚀 Prossimi Passi

1. ✅ **Completato**: Error handling centralizzato
2. ✅ **Completato**: Validators utility
3. ✅ **Completato**: Toast notifications
4. ⏳ **Da fare**: Integrare toast in componenti esistenti
5. ⏳ **Da fare**: Sostituire `alert()` con toast
6. ⏳ **Da fare**: Aggiungere validazione form critici

---

**Sistema pronto per scalare! 🎯**


# 🎵 Vibes Studio - Management System

Sistema gestionale modulare completo per studi di registrazione e produzione musicale. Applicazione web moderna, mobile-friendly, con architettura modulare e gestione centralizzata di prodotti, servizi, clienti, inventario e transazioni.

---

## 📋 Indice

- [Caratteristiche Principali](#-caratteristiche-principali)
- [Moduli Disponibili](#-moduli-disponibili)
- [Tecnologie Utilizzate](#-tecnologie-utilizzate)
- [Installazione e Setup](#-installazione-e-setup)
- [Architettura](#-architettura)
- [Sistema di Autenticazione](#-sistema-di-autenticazione)
- [Configurazione](#-configurazione)
- [Flusso di Lavoro](#-flusso-di-lavoro)
- [Accesso Mobile](#-accesso-mobile)
- [Deploy](#-deploy)
- [Sviluppo Futuro](#-sviluppo-futuro)

---

## ✨ Caratteristiche Principali

- 🔐 **Sistema di Autenticazione**: Login sicuro con gestione sessioni
- 📱 **Mobile-Friendly**: Interfaccia responsive ottimizzata per smartphone, tablet e desktop
- 🔄 **Architettura Modulare**: Moduli indipendenti che comunicano tramite database centrale
- 📦 **Gestione Centralizzata**: Catalogo unificato per prodotti e servizi
- 📊 **Analytics Avanzati**: Dashboard con statistiche e report dettagliati
- 🛡️ **Error Handling**: Sistema centralizzato di gestione errori e log
- 💾 **Local Storage**: Database locale (pronto per migrazione a Supabase)
- 🎨 **Branding Personalizzato**: Logo e colori configurabili per Vibes Studio

---

## 🎯 Moduli Disponibili

### 📋 Catalogo Prodotti & Servizi (BASE)
**Route**: `/catalogo`  
**Descrizione**: Modulo fondamentale per la gestione centralizzata di prodotti e servizi.

**Funzionalità**:
- ✅ Creazione e gestione prodotti (nome, codice, categoria, prezzo)
- ✅ Creazione e gestione servizi (nome, codice, categoria, prezzo/ora, icona, colore)
- ✅ Gestione categorie personalizzate
- ✅ Filtri e ricerca avanzata
- ✅ Validazione dati completa

**Dipendenze**: Nessuna (modulo base)  
**Usato da**: Magazzino, Cassa, Transaction Manager

---

### 🔐 Login & Autenticazione
**Route**: `/login`  
**Descrizione**: Sistema di autenticazione integrato con protezione route.

**Funzionalità**:
- ✅ Login con username/password
- ✅ Gestione sessioni con scadenza
- ✅ Protezione route (AuthRoute)
- ✅ Logout sicuro
- ✅ Default user: `Administrator` / `admin`

**Utenti Default**:
- Username: `Administrator`
- Password: `admin` (modificabile dall'Admin Panel)

---

### 📦 Magazzino & Inventario
**Route**: `/magazzino`  
**Descrizione**: Gestione completa dell'inventario con sincronizzazione automatica dal Catalogo.

**Funzionalità**:
- ✅ Visualizzazione prodotti dal Catalogo
- ✅ Gestione stock (entrate, uscite, trasferimenti, rettifiche, scarti)
- ✅ Tracciamento movimenti inventario
- ✅ Allarmi stock basso/esaurito
- ✅ Statistiche inventario (valore totale, quantità, movimenti)
- ✅ Sincronizzazione automatica con Catalogo
- ✅ Rimozione automatica prodotti non più nel Catalogo

**Viste**:
- **Prodotti**: Grid prodotti con filtri per categoria
- **Movimenti**: Storico completo movimenti inventario
- **Statistiche**: Dashboard con metriche chiave
- **Allarmi**: Notifiche stock basso/esaurito

**Dipendenze**: Catalogo

---

### 💰 Cassa & Vendite
**Route**: `/cassa`  
**Descrizione**: Punto vendita per accessori e prodotti dello studio.

**Funzionalità**:
- ✅ POS (Point of Sale) con carrello
- ✅ Selezione cliente (integrazione Client Hub)
- ✅ Gestione sconti per articolo
- ✅ Metodi pagamento multipli (Contanti, Carta, Bonifico, PayPal, Satispay)
- ✅ Storico vendite completo
- ✅ Sincronizzazione automatica stock con Magazzino
- ✅ Statistiche vendite (oggi, totale, incassi)

**Viste**:
- **POS**: Interfaccia vendita con ricerca prodotti
- **Storico**: Lista completa vendite con filtri
- **Analytics**: Statistiche vendite e grafici

**Dipendenze**: Catalogo, Magazzino

---

### 💵 Transaction Manager
**Route**: `/transactions`  
**Descrizione**: Gestione transazioni e pagamenti per servizi studio.

**Funzionalità**:
- ✅ Creazione transazioni per clienti
- ✅ Gestione pagamenti multipli (acconto, parziale, completo)
- ✅ Tracking stato pagamenti (pending, partial, paid)
- ✅ Integrazione con servizi dal Catalogo
- ✅ Calcolo automatico totali in base a ore servizio
- ✅ Storico completo transazioni

**Dipendenze**: Catalogo, Client Hub

---

### 👥 Client Hub
**Route**: `/clients`  
**Descrizione**: CRM completo per gestione artisti e clienti.

**Funzionalità**:
- ✅ Gestione completa clienti (nome, email, telefono, genere, social)
- ✅ Classificazione VIP
- ✅ Note e storia interazioni
- ✅ Statistiche cliente (speso totale, sessioni, ultima sessione)
- ✅ Grafici trend ultimi 6 mesi
- ✅ Ricerca e filtri avanzati

**Viste per Cliente**:
- **Panoramica**: Info generali e statistiche
- **Sessioni**: Storico sessioni studio
- **Note**: Annotazioni e memo
- **Statistiche**: Grafici performance

**Dipendenze**: Nessuna (ma usato da Transaction Manager e Booking System)

---

### 📅 Booking System
**Route**: `/bookings`  
**Descrizione**: Calendario prenotazioni sale e gestione appuntamenti.

**Funzionalità**:
- ✅ Calendario interattivo prenotazioni
- ✅ Gestione sale multiple
- ✅ Selezione cliente e servizio
- ✅ Durata personalizzata
- ✅ Note e dettagli prenotazione
- ✅ Visualizzazione disponibilità

**Dipendenze**: Client Hub

---

### 📊 Analytics Dashboard
**Route**: `/analytics`  
**Descrizione**: Dashboard business intelligence con report avanzati.

**Funzionalità**:
- ✅ Revenue tracking (giornaliero, mensile, totale)
- ✅ Statistiche transazioni e vendite
- ✅ Grafici trend temporali
- ✅ Top clienti e servizi
- ✅ Metriche performance studio

**Dipendenze**: Transaction Manager, Booking System

---

### ⚙️ Admin Panel
**Route**: `/admin`  
**Descrizione**: Pannello amministrativo per configurazione sistema.

**Funzionalità**:
- ✅ Gestione moduli (attivazione/disattivazione)
- ✅ Gestione utenti e permessi
- ✅ Configurazione studio
- ✅ Log attività
- ✅ Backup e ripristino dati

**Accesso**: Solo utenti con ruolo `admin`

---

## 🛠️ Tecnologie Utilizzate

### Frontend
- **React 18.3.1** - Framework UI
- **React Router DOM 6.23.0** - Navigazione e routing
- **Recharts 2.12.7** - Grafici e visualizzazioni

### Build Tools
- **Vite 5.3.1** - Build tool e dev server
- **@vitejs/plugin-react 4.3.1** - Plugin React per Vite

### Storage
- **localStorage** - Database locale (pronto per Supabase)

### Styling
- CSS-in-JS (inline styles)
- Google Fonts (Inter)
- Responsive Design (mobile-first)

---

## 🚀 Installazione e Setup

### Prerequisiti
- Node.js 16+ e npm
- Git (per clonare il repository)

### Installazione

```bash
# Clona il repository
git clone https://github.com/raydalessandro/Gestionale_ear.git
cd Gestionale_ear

# Installa dipendenze
npm install

# Avvia server di sviluppo
npm run dev

# Build per produzione
npm run build

# Preview build produzione
npm run preview
```

### Accesso Locale

Dopo aver avviato `npm run dev`:

- **PC**: `http://localhost:3000`
- **Rete Locale**: `http://TUO_IP:3000` (vedi [Accesso Mobile](#-accesso-mobile))

### Credenziali Default

- **Username**: `Administrator`
- **Password**: `admin`

⚠️ **Importante**: Cambia la password dall'Admin Panel dopo il primo accesso!

---

## 🏗️ Architettura

### Struttura Progetto

```
Gestionale_ear/
├── public/
│   └── assets/              # Logo e immagini (vibes-logo.png, vibes-logo-small.png)
├── src/
│   ├── components/          # Componenti riutilizzabili
│   │   ├── AuthRoute.jsx    # Protezione route
│   │   ├── ErrorBoundary.jsx # Gestione errori React
│   │   ├── Header.jsx       # Header comune
│   │   ├── Toast.jsx        # Notifiche toast
│   │   └── VibesLogo.jsx    # Componente logo SVG
│   ├── config/              # File di configurazione
│   │   ├── catalogo.config.js    # Config catalogo
│   │   ├── cassa.config.js       # Config cassa
│   │   ├── magazzino.config.js   # Config magazzino
│   │   ├── modules.config.js     # Registry moduli
│   │   └── studio.config.js      # Config principale studio
│   ├── pages/               # Pagine moduli
│   │   ├── Admin/
│   │   │   └── AdminPanel.jsx
│   │   ├── Analytics.jsx
│   │   ├── BookingSystem.jsx
│   │   ├── Cassa.jsx
│   │   ├── Catalogo.jsx
│   │   ├── ClientHub.jsx
│   │   ├── Launcher.jsx    # Dashboard principale
│   │   ├── Login.jsx
│   │   ├── Magazzino.jsx
│   │   └── TransactionManager.jsx
│   ├── utils/               # Utility functions
│   │   ├── auth.js          # Autenticazione
│   │   ├── catalogo.js      # Gestione catalogo
│   │   ├── cleanInventory.js # Pulizia inventario
│   │   ├── errorHandler.js  # Error handling
│   │   ├── inventory.js     # Gestione magazzino
│   │   ├── storage.js       # Wrapper localStorage
│   │   └── validators.js    # Validazione input
│   ├── App.jsx              # Router principale
│   ├── main.jsx             # Entry point
│   └── index.css            # Stili globali
├── index.html
├── package.json
├── vite.config.js           # Configurazione Vite
└── README.md
```

### Architettura Modulare

Il sistema è progettato con architettura modulare:

1. **Moduli Indipendenti**: Ogni modulo è autonomo e può essere attivato/disattivato
2. **Database Centralizzato**: Tutti i moduli comunicano tramite `localStorage` (chiavi organizzate per modulo)
3. **Dipendenze Gestite**: Sistema di dipendenze tra moduli (es. Magazzino dipende da Catalogo)
4. **Config Centralizzata**: Configurazione brand e studio in `studio.config.js`

### Comunicazione tra Moduli

```
Catalogo (Base)
    ├──→ Magazzino (legge prodotti, gestisce stock)
    ├──→ Cassa (legge prodotti da Magazzino)
    └──→ Transaction Manager (legge servizi)

Client Hub
    ├──→ Transaction Manager
    ├──→ Booking System
    └──→ Cassa (selezione cliente)
```

---

## 🔐 Sistema di Autenticazione

### Funzionalità

- **Login sicuro** con username/password
- **Sessioni** con scadenza automatica
- **Protezione route** - Accesso negato a route protette se non autenticati
- **Gestione utenti** in Admin Panel
- **Ruoli utente** (admin, user)

### File Correlati

- `src/utils/auth.js` - Logica autenticazione
- `src/pages/Login.jsx` - Pagina login
- `src/components/AuthRoute.jsx` - Protezione route

### Storage Keys

- `studio_auth_session` - Sessione utente corrente
- `studio_users` - Lista utenti

---

## ⚙️ Configurazione

### Brand Identity (`src/config/studio.config.js`)

Personalizza nome, colori e logo:

```javascript
brand: {
  name: "Vibes Studio",
  tagline: "Where Vibes Come to Life",
  colors: {
    primary: "#1F2937",    // Dark Grey
    secondary: "#F97316",  // Orange
    accent: "#FCD34D"      // Yellow
  },
  gradient: "linear-gradient(135deg, #1F2937 0%, #000000 50%, #1F2937 100%)"
}
```

### Logo

Posiziona i file logo in `public/assets/`:
- `vibes-logo.png` - Logo grande (dashboard, login)
- `vibes-logo-small.png` - Logo piccolo (header)

### Moduli (`src/config/modules.config.js`)

Gestisci attivazione/disattivazione moduli:

```javascript
{
  id: 'catalogo',
  name: 'Catalogo Prodotti & Servizi',
  enabled: true,
  dependencies: []
}
```

---

## 🔄 Flusso di Lavoro

### 1. Setup Iniziale

1. **Catalogo**: Crea prodotti e servizi
2. **Client Hub**: Aggiungi clienti/artisti
3. **Magazzino**: Imposta stock e prezzi prodotti

### 2. Operazioni Giornaliere

**Vendite Prodotti**:
```
Catalogo → Magazzino (imposta stock/prezzo) → Cassa (vendi) → Stock aggiornato automaticamente
```

**Vendite Servizi**:
```
Catalogo (servizi) → Transaction Manager (crea transazione) → Pagamenti multipli
```

**Prenotazioni**:
```
Client Hub → Booking System (prenota sala) → Analytics (statistiche)
```

### 3. Sincronizzazione Automatica

- ✅ Prodotti eliminati dal Catalogo → Rimossi automaticamente da Magazzino
- ✅ Nuovi prodotti nel Catalogo → Appaiono in Magazzino (stock 0)
- ✅ Vendite in Cassa → Stock aggiornato automaticamente in Magazzino
- ✅ Transazioni → Analizzate in Analytics

---

## 📱 Accesso Mobile

Il sistema è completamente ottimizzato per dispositivi mobile.

### Configurazione

Il server è configurato per accesso da rete locale:

```javascript
// vite.config.js
server: {
  host: '0.0.0.0',  // Accesso da rete locale
  port: 3000
}
```

### Come Accedere dal Telefono

1. **Trova IP del PC**:
   ```bash
   ipconfig  # Windows
   # Cerca "Indirizzo IPv4" (es. 192.168.1.5)
   ```

2. **Accedi dal telefono** (stessa Wi-Fi):
   ```
   http://192.168.1.5:3000
   ```

3. **Firewall**: Apri porta 3000 nel firewall Windows se necessario

Vedi `ACCESSO_MOBILE.md` per dettagli completi.

### Ottimizzazioni Mobile

- ✅ Touch-friendly (min 44px tap targets)
- ✅ Font responsive (no zoom su iOS)
- ✅ Grid responsive su tutti i moduli
- ✅ Safe area insets per iPhone X+
- ✅ Viewport ottimizzato

---

## 📦 Deploy

### Deploy su Vercel

1. **Push su GitHub**:
   ```bash
   git push origin main
   ```

2. **Importa su Vercel**:
   - Vai su [vercel.com](https://vercel.com)
   - Importa repository GitHub
   - Framework Preset: **Vite**
   - Deploy! 🚀

3. **Configurazione** (già presente in `vercel.json`):
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

### Variabili d'Ambiente (Futuro Supabase)

Quando integrerai Supabase, aggiungi in Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 🔮 Sviluppo Futuro

### Prossime Fasi

- [ ] **Integrazione Supabase**: Migrazione da localStorage a database cloud
- [ ] **TypeScript**: Conversione graduale per type safety
- [ ] **Booking System**: Integrazione con Catalogo servizi
- [ ] **Analytics**: Integrazione completa con tutti i moduli
- [ ] **Notifiche Push**: Alert real-time
- [ ] **Backup Automatico**: Sync cloud periodico
- [ ] **Multi-utente Avanzato**: Permessi granulari per ruolo
- [ ] **Export Report**: PDF/Excel export
- [ ] **API REST**: Backend per integrazioni esterne

---

## 📚 Documentazione Aggiuntiva

- `PIANO_LAVORO.md` - Piano di sviluppo dettagliato
- `QUALITA_CODICE.md` - Standard di qualità e error handling
- `ACCESSO_MOBILE.md` - Guida completa accesso mobile

---

## 🐛 Troubleshooting

### Errore "Qualcosa è andato storto"

1. Apri console browser (F12)
2. Controlla errori JavaScript
3. Verifica che tutti i moduli siano correttamente inizializzati

### Prodotti non appaiono in Magazzino

1. Verifica che il prodotto esista nel **Catalogo**
2. Controlla che sia attivo (`attivo: true`)
3. Ricarica la pagina Magazzino (sincronizzazione automatica)

### Cliente non salvato

1. Verifica che nome e nome d'arte siano compilati
2. Controlla console per errori storage
3. Verifica spazio disponibile in localStorage

### Accesso mobile non funziona

1. Verifica che PC e telefono siano sulla stessa Wi-Fi
2. Controlla firewall Windows (porta 3000)
3. Verifica IP del PC con `ipconfig`

---

## 📄 Licenza

MIT License - Vedi `LICENSE` per dettagli

---

## 👨‍💻 Sviluppato da

**EAR LAB** - Made with ❤️

---

## 🔗 Link Utili

- **Repository**: https://github.com/raydalessandro/Gestionale_ear.git
- **Live Demo**: gestionale-ear.vercel.app

---

## 📝 Note

- **Database Locale**: Attualmente usa `localStorage` - i dati sono salvati nel browser locale
- **Backup**: Esegui export manuale prima di migrare a Supabase
- **Browser Support**: Chrome, Firefox, Safari, Edge (moderni)
- **Mobile**: Ottimizzato per iOS Safari e Chrome Mobile

---

**Versione**: 1.0.0  
**Ultimo Aggiornamento**: Gennaio 2025

# Idrettskart - Turneringssystem
## IT-eksamensoppgave: Idrettsturneringssystem

Dette er et komplett turneringssystem for idrettsarrangører med rollebasert tilgang, database og webgrensesnitt.

### 1. Brukergrupper + rettigheter

| Rolle | Rettigheter |
|-------|-------------|
| **Admin (arrangør)** | • Opprette turneringer<br>• Registrere lag og spillere<br>• Sette opp kamper<br>• Registrere resultater<br>• Full tilgang til alt |
| **Lagleder** | • Registrere eget lag<br>• Legge til spillere<br>• Se kampoppsett<br>• Se resultater |
| **Deltaker (spiller)** | • Se kampoppsett<br>• Se resultater<br>• Melde seg på via lag |
| **Publikum** | • Kun se kampoppsett og resultater |

**Demo-brukere:**<br>
`admin/admin123` | `lagleder/leder123` | `deltaker/spiller123`

### 2. ER-diagram (database)

```mermaid
erDiagram
    BRUKER ||--o{ LAG : "leder for"
    BRUKER ||--o{ SPILLER : "har"
    TURNERING ||--o{ LAG : "har"
    LAG ||--o{ SPILLER : "har"
    TURNERING ||--o{ KAMP : "har"
    KAMP }|--|| LAG : "lag1"
    KAMP }|--|| LAG : "lag2"

    BRUKER {
        int id PK
        string navn
        string rolle
        string passord_hash
    }
    TURNERING {
        int id PK
        string navn
        date dato
    }
    LAG {
        int id PK
        string navn
        int turnering_id FK
        int leder_user_id FK
    }
    SPILLER {
        int id PK
        string navn
        int alder
        int lag_id FK
        int user_id FK
    }
    KAMP {
        int id PK
        int turnering_id FK
        int lag1_id FK
        int lag2_id FK
        datetime tidspunkt
        int resultat1
        int resultat2
    }
```

### 3. Brukerflow

```mermaid
flowchart TD
    A[Start] --> B{Publikum?}
    B -->|Ja| C[Se kampoppsett/resultater]
    B -->|Nei| D[Login]
    D --> E{Rolle?}
    E -->|Admin| F[Full CRUD]
    E -->|Lagleder| G[Eget lag + spillere]
    E -->|Deltaker| H[Meld på lag]
    F --> I[Dashboard]
    G --> I
    H --> I
    C --> I
    I --> J{Logout?}
```

### 4. Personvern (GDPR)

✅ **Krav oppfylt:**
- Minimal datainnsamling: kun navn + alder
- Passord hashet med bcrypt
- Barnedata: alder-synlig, foresatt-samtykke anbefales
- Session-only auth, ingen tracking cookies
- SQLite WAL for dataintegritet
- Ikke-vis persondata offentlig (kun navn/alder)

**Databehandleravtale:** Arrangør ansvarlig.

### 5. Drift / Arkitektur

```mermaid
graph TB
    subgraph INTERNETT["Internet"]
        BRUKER[Brukere/Publikum]
    end
    BRUKER -->|HTTPS:443| WEBSERVER[Node.js server<br/>10.12.2.230:3000]
    WEBSERVER -->|Intern:27017| MONGODB[MongoDB<br/>10.12.2.231]
    
    subgraph "Internett (privat)"
        ADMINPC[Admin-PC 10.12.2.20]
    end
    ADMINPC -.->|VPN/LAN| WEBSERVER
```

**Tech stack:**
- **Frontend:** HTML/CSS/JS (vanilla)
- **Backend:** Node.js/Express + session auth
- **Database:** MongoDB (prod), SQLite (dev/demo)
- **Deployment:** PM2 + Nginx reverse proxy

### 6. IP-plan

| Enhet | Rolle | IP-adresse | Port | Kommentar |
|-------|-------|------------|------|-----------|
| **Webserver** | Node.js app | **10.12.2.230** | 3000 | Frontend/backend |
| **DB-server** | MongoDB | **10.12.2.231** | 27017 | Kun intern tilgang |
| **Admin-PC** | Administrasjon | 10.12.2.20 | - | VPN/LAN |

**Nettverk:**
- Subnett: `10.12.2.0/24`
- Firewall: MongoDB kun fra 10.12.2.230
- Backup: Daglig MongoDB dump → NAS

### 7. Feilhåndtering

| Feil | Løsning |
|------|---------|
| Server nede | PM2 restart, backup-server 10.12.2.232 |
| DB krasj | MongoDB replica set, daily backup |
| Internett ned | Lokal admin-tilgang via LAN |
| Passord glemt | Admin reset via DB |

### 8. Brukerveiledning

1. **Publikum:** Gå til nettsiden → Se kamper direkte
2. **Login:** Brukernavn/passord (demo over)
3. **Admin:** Opprett turnering → lag → spillere → kamper → resultater
4. **Lagleder:** Registrer lag → legg til spillere
5. **Resultater:** Admin oppdaterer live
6. **Oppdater:** Klikk "Oppdater" eller F5

### 9. Prosjektplan (3 uker)

| Uke | Aktiviteter |
|-----|-------------|
| **1** | Planlegging, DB-design, ER-diagram |
| **2** | Backend API, frontend, roller |
| **3** | Testing, dokumentasjon, deployment |

### 10. Testing

✅ **Testet:**
- [x] Alle roller + rettigheter
- [x] CRUD turnering/lag/spiller/kamp/resultat
- [x] Publikum-visning
- [x] Validering (unike lag, alder>0)
- [x] Responsive UI
- [x] Demo-data auto-seed

**Kjør demo:**
```bash
npm install
npm run dev
# Åpne http://localhost:3000
```

**Prod-deploy (10.12.2.230):**
```bash
# Installer MongoDB på 10.12.2.231
# npm install mongodb
# Oppdater connection string
npm start
```

---

**Status:** ✅ Ferdig og testet eksamensløsning.

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
`admin / admin123`<br>
`leader / leader123`<br>
`participant / participant123`

### 2. Datamodell (MongoDB)

```mermaid
erDiagram
    TOURNAMENT ||--o{ TEAM : "har"
    TEAM ||--o{ PLAYER : "har"
    TEAM ||--o{ MATCH : "team1"
    TEAM ||--o{ MATCH : "team2"

    USER {
        string name
        string role
        string password
    }

    TOURNAMENT {
        objectid _id PK
        string name
        date date
    }

    TEAM {
        objectid _id PK
        string name
        objectid tournament FK
    }

    PLAYER {
        objectid _id PK
        string name
        int age
        objectid team FK
    }

    MATCH {
        objectid _id PK
        objectid team1 FK
        objectid team2 FK
        datetime time
        string result
    }
```

### 3. Brukerflyt

```mermaid
flowchart TD
    A["Start"] --> B["Hjemmeside"]
    B --> C["/login"]
    C --> D["Velkomst / dashboard"]
    D --> E{"Rolle?"}
    E -->|admin| F["Admin-tilgang"]
    E -->|leader| G["Lagleder-tilgang"]
    E -->|participant| H["Lesetilgang"]
    E -->|publikum| H

    F --> I["Turneringer"]
    F --> J["Lag"]
    F --> K["Spillere"]
    F --> L["Kamper"]
    F --> M["Brukerhåndtering"]
    F --> N["Rolle-assignering"]

    G --> I
    G --> J
    G --> K
    G --> L

    H --> O["Se turneringer"]
    H --> P["Se lag"]
    H --> Q["Se spillere"]
    H --> R["Se kamper"]

    M --> S["Opprett ny bruker"]
    N --> T["Endre rolle"]
    S --> H
    T --> H

    I --> U["Logout"]
    J --> U
    K --> U
    L --> U
    M --> U
    N --> U
    O --> U
    P --> U
    Q --> U
    R --> U
```

```mermaid
flowchart TD
    A["Innlogging"] --> B{"Hvem er brukeren?"}
    B -->|Admin| C["Admin-dashboard"]
    B -->|Leader| D["Lagleder-dashboard"]
    B -->|Participant| E["Publikum-visning"]
    B -->|Ny bruker| F["Registrer bruker"]

    C --> G["Kan gjøre alt leader kan"]
    C --> H["Opprette bruker"]
    C --> I["Endre rolle på bruker"]
    C --> J["Gi publikum-bruker rollen leader"]

    D --> K["Turneringer"]
    D --> L["Lag"]
    D --> M["Spillere"]
    D --> N["Kamper"]

    E --> K
    E --> L
    E --> M
    E --> N
    F --> E
    H --> C
    I --> C
    J --> D
```

**Tilgangsnivåer:**
- **Publikum / participant** kan bare se innhold
- **Ny bruker** registreres med samme lesetilgang som publikum
- **Lagleder / leader** kan se og jobbe med turneringer, lag, spillere og kamper
- **Admin** får alt lagleder kan gjøre, pluss brukerhåndtering og rolle-assignering
- **Admin** kan endre en bruker fra publikum til for eksempel `leader`

### 4. Personvern (GDPR)

✅ **Krav oppfylt:**
- Minimal datainnsamling: kun navn + alder
- Passord hashet med bcrypt
- Barnedata: alder-synlig, foresatt-samtykke anbefales
- Session-only auth, ingen tracking cookies
- MongoDB med tilgangsstyring og backup-rutiner
- Ikke-vis persondata offentlig (kun navn/alder)

**Databehandleravtale:** Arrangør ansvarlig.

### 5. Drift / Arkitektur

```mermaid
graph TD
    Modem((Modem)) --> Firewall{Firewall}
    Firewall --> L3Core01[L3 Core Switch 01]
    L3Core01 --> PVE_Back[PVE-Backend Server]

    subgraph PVE_Backend_Hypervisor [PVE-Backend Virtual Environment]
        VRouter[Virtual Router]

        subgraph V_VLAN_1202 [Virtual VLAN 1202]
            VSwitch2[vSwitch 1202]
            VSwitch2 --> VM230[230 eksam-node<br/>10.12.2.230/24]
            VSwitch2 --> VM231[231 eksam-mongodb<br/>10.12.2.231/24]
        end
        
        PVE_Back --> VRouter
        VRouter --> VSwitch2
    end
```

**IP-plan for eksamensmiljøet:**

| Komponent | IP-adresse | Subnett | Gateway |
|-----------|------------|---------|---------|
| `230 eksam-node` | `10.12.2.230` | `255.255.255.0` (/24) | `10.12.2.1` |
| `231 eksam-mongodb` | `10.12.2.231` | `255.255.255.0` (/24) | `10.12.2.1` |
| `vSwitch 1202` | - | `10.12.2.0/24` | `10.12.2.1` |

**Tech stack:**
- **Frontend:** EJS, CSS, og litt klient-JS
- **Backend:** Node.js/Express + session auth
- **Database:** MongoDB på egen VM (`231 eksam-mongodb`)
- **Deployment:** PM2 + Nginx reverse proxy

### 6. Nettverk / VM-oppsett

Nettverket er beskrevet som et fysisk og virtuelt mermaid-diagram i stedet for en tradisjonell IP-tabell. Det gir et bedre bilde av hvordan VM-ene, switchene og VLAN-ene henger sammen.

**Kort forklart:**
- Modem går inn i firewall, videre til L3 Core Switch 01
- L3 Core Switch 01 går videre til PVE-Backend Server
- PVE-Backend Virtual Environment er detaljert videre med Virtual Router og vSwitch 1202
- Under vSwitch 1202 ligger `230 eksam-node` og `231 eksam-mongodb`
- Dette er den delen som skal vises i README-previewen

**Relevante VM-er for dette prosjektet:**
- `230 eksam-node` kjører Node/Express-appen
- `231 eksam-mongodb` kjører MongoDB i miljøet
- Tjenestene kommuniserer over intern nettverkstrafikk, ikke direkte ut på internett

### 7. Sider og ruter

- `/` - Hjemmeside med innloggingsstatus
- `/login` - egen innloggingsside
- `/readme` - rendret README-preview med Mermaid-diagrammer
- `/admin` - admin-dashboard for full oversikt og hurtighandlinger
- `/tournaments` - turneringer
- `/teams` - lag
- `/players` - spillere
- `/matches` - kamper

### 8. Login og tilgang

- Innlogging skjer med `name` + `password`
- Session håndteres med `express-session`
- Admin kan åpne `/admin`
- Roller som ikke er admin blir stoppet fra admin-siden på serversiden
- Demo-brukere opprettes automatisk ved oppstart

### 9. Feilhåndtering

| Feil | Løsning |
|------|---------|
| Server nede | PM2 restart, backup-server 10.12.2.232 |
| DB krasj | MongoDB replica set, daily backup |
| Internett ned | Lokal admin-tilgang via LAN |
| Passord glemt | Admin reset via DB |

### 10. Brukerveiledning

1. **Publikum:** Gå til nettsiden → Se kamper direkte
2. **Login:** Brukernavn/passord (demo over)
3. **Admin:** Opprett turnering → lag → spillere → kamper → resultater
4. **Lagleder:** Registrer lag → legg til spillere
5. **Resultater:** Admin oppdaterer live
6. **Oppdater:** Klikk "Oppdater" eller F5

### 11. Prosjektplan (3 uker)

| Uke | Aktiviteter |
|-----|-------------|
| **1** | Planlegging, DB-design, ER-diagram |
| **2** | Backend API, frontend, roller |
| **3** | Testing, dokumentasjon, deployment |

### 12. Testing

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

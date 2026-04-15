# Issueboard

Kort oversikt over det som ble gjort i prosjektet.

## Ferdig gjort

| Område | Endring |
|--------|---------|
| Database | Opprettet `config/database.js` med Mongoose-tilkobling til `turneringDB` |
| Modellering | La inn Mongoose-modeller for `Tournament`, `Team`, `Player`, `Match` og `User` |
| Auth | La inn innlogging med `express-session` og rollebasert tilgang |
| Registrering | La inn `/register` slik at nye brukere opprettes med `participant`-rolle |
| Admin | La inn rolleendring og sletting av brukere fra admin-panelet |
| Views | Lagde EJS-sider for hjem, login, admin og README-preview |
| README preview | Lagde `/readme` som rendrer `README.md` med Mermaid-diagrammer |
| Mermaid | Oppdaterte nettverksdiagrammet og brukerflyten til å passe prosjektet |
| Opprydding | Fjernet gamle statiske filer og ubrukte frontend-rester |

## Viktige detaljer

- Demo-brukere:
  - `admin / admin123`
  - `leader / leader123`
  - `participant / participant123`
- Ny bruker får automatisk lesetilgang
- Admin kan:
  - opprette turneringer, lag, spillere og kamper
  - endre roller
  - slette brukere

## Notater

- `participant` og vanlige registrerte brukere har kun lesetilgang
- `leader` får tilgang til å jobbe med turneringer, lag, spillere og kamper
- `admin` får alt dette pluss brukeradministrasjon

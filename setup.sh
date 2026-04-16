# =========================
# LABELS
# =========================

gh label create "epic-utvikling" --color "0e8a16"
gh label create "epic-drift" --color "1d76db"
gh label create "epic-brukerstøtte" --color "fbca04"

gh label create "backend" --color "5319e7"
gh label create "frontend" --color "0e8a16"
gh label create "database" --color "d4c5f9"
gh label create "nettverk" --color "c2e0c6"
gh label create "sikkerhet" --color "d93f0b"
gh label create "testing" --color "f9d0c4"
gh label create "planlegging" --color "bfd4f2"

# =========================
# EPIC 1
# =========================

gh issue create --title "EPIC: Utvikle turneringssystemet" --label "epic-utvikling" --body "Overordnet mål: bygge digitalt system for Vind IL"

gh issue create --title "Brukerroller og tilgangssystem" --label "backend,planlegging" --body "
- Admin
- Lagleder
- Spiller
- Dommer
"

gh issue create --title "Database design (ER-diagram + struktur)" --label "database" --body "
- Bruker
- Lag
- Kamp
- Turnering
- Resultat
"

gh issue create --title "Backend API utvikling" --label "backend" --body "
- Opprette bruker
- Opprette lag
- Kampoppsett
- Resultatregistrering
- API endpoints
"

gh issue create --title "Frontend utvikling" --label "frontend" --body "
- Login
- Turneringsoversikt
- Kampoppsett
- Resultater
- Admin dashboard
"

gh issue create --title "Testing av system" --label "testing" --body "
- Unit test
- Integrasjonstest
- Brukertest
- Stress test
"

# =========================
# EPIC 2
# =========================

gh issue create --title "EPIC: Driftsarkitektur" --label "epic-drift" --body "Systemarkitektur og drift"

gh issue create --title "Nettverksarkitektur og sikkerhet" --label "nettverk,sikkerhet" --body "
- Public frontend
- Private backend
- Database internt
- DMZ struktur
"

gh issue create --title "IP-plan og segmentering" --label "nettverk" --body "
- Subnett
- Statiske IP-er
- DHCP
"

gh issue create --title "Backup og feilhåndtering" --label "sikkerhet" --body "
- Backup database
- Restore plan
- Failover
"

# =========================
# EPIC 3
# =========================

gh issue create --title "EPIC: Brukerstøtte" --label "epic-brukerstøtte" --body "Brukerdokumentasjon og støtte"

gh issue create --title "Brukerveiledning" --label "frontend" --body "
- Login
- Registrere lag
- Se kamper
- Registrere resultater
"

gh issue create --title "Prosjektplan (3 uker)" --label "planlegging" --body "
Uke 1: design + database  
Uke 2: backend + frontend  
Uke 3: testing + feilretting  
Buffer: 2-3 dager
"

gh issue create --title "Brukertesting" --label "testing" --body "
- Test med frivillige
- Finne bugs
- Fikse feil
"

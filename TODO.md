# Idrett Kart - Oppgave A Implementation Plan

## Step 1: Install node-cron dependency ✅
- Edit package.json to add "node-cron": "^3.0.3"
- Run `npm install`

## Step 2: Update Team schema ✅
- Edit models/mongoModels.js: add contact_name, contact_phone to teamSchema

## Step 3: Update teamModel.js ✅
- No changes needed (new fields auto-included via toClientDoc)

## Step 4: Update admin view forms ✅
- Edit views/admin.ejs: add contact inputs to team form
- Edit views/teams.ejs: add contact columns/inputs to table and create form

## Step 5: Add cron reminder in server.js ✅
- Edit src/server.js: add node-cron job for tournament reminders (console.log hourly)

## Step 6: Add admin alert display ✅
- Edit controllers/adminController.js: compute pending tournaments
- Edit views/admin.ejs: show reminder section

## Step 7: Implement participant privacy ✅
- Edit controllers/playerController.js: filter for participants (empty list for participant role)
- Edit routes/playerRoutes.js: add requireAuth to GET

## Step 8: Test all features
- Create test data, verify contacts, reminders, privacy

**Progress: 7/8 complete**

**Alle funksjoner implementert!**


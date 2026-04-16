const app = require('./app');
const { initializeDatabase } = require('../models/database');
const cron = require('node-cron');
const tournamentModel = require('../models/tournamentModel');
const matchModel = require('../models/matchModel');

const PORT = process.env.PORT || 3000;

async function checkTournamentReminders() {
  const now = new Date();
  const cutoff = now.getTime() + 48 * 60 * 60 * 1000; // 48 hours
  const tournaments = await tournamentModel.list();
  const matches = await matchModel.list();

  for (const t of tournaments) {
    if (new Date(t.date).getTime() < cutoff) {
      const incompleteMatches = matches.some(m => m.result === '' && new Date(m.time).getTime() >= now.getTime());
      if (incompleteMatches) {
        console.log(`🚨 PÅMINNELSE: Turnering "${t.name}" starter innen 48 timer og mangler kampresultater!`);
      }
    }
  }
}

async function startServer() {
  await app.locals.databaseReady;
  await initializeDatabase();

  // Run reminder check hourly
  cron.schedule('0 * * * *', checkTournamentReminders);
  console.log('Påminnelsescron job startet (kjører hver time).');

  app.listen(PORT, () => {
    console.log(`Server kjører på http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Kunne ikke starte serveren:', error);
  process.exit(1);
});

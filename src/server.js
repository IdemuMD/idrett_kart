const app = require('./app');
const { initializeDatabase } = require('../models/database');

const PORT = process.env.PORT || 3000;

async function startServer() {
  await initializeDatabase();

  app.listen(PORT, () => {
    console.log(`Server kjører på http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Kunne ikke starte serveren:', error);
  process.exit(1);
});

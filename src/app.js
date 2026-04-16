const path = require('node:path');
const express = require('express');
const session = require('express-session');
const { connectDatabase } = require('../config/database');
const { attachCurrentUser } = require('../middleware/auth');

const adminRoutes = require('../routes/adminRoutes');
const authRoutes = require('../routes/authRoutes');
const pageRoutes = require('../routes/pageRoutes');
const playerRoutes = require('../routes/playerRoutes');
const matchRoutes = require('../routes/matchRoutes');
const teamRoutes = require('../routes/teamRoutes');
const tournamentRoutes = require('../routes/tournamentRoutes');

const app = express();
app.locals.databaseReady = connectDatabase();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  express.static(path.join(__dirname, '..', 'public'), {
    index: false,
  }),
);
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'idrett-kart-utvikling',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    },
  }),
);

app.use(attachCurrentUser);

app.use('/', pageRoutes);
app.use('/', authRoutes);
app.use('/tournaments', tournamentRoutes);
app.use('/teams', teamRoutes);
app.use('/leader', require('../routes/leaderRoutes'));
app.use('/players', playerRoutes);
app.use('/matches', matchRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).render('index', {
    error: 'Fant ikke siden.',
    matches: [],
    pageTitle: 'Fant ikke siden',
    success: '',
    teams: [],
    tournaments: [],
  });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).render('index', {
    error: 'Uventet feil i serveren.',
    matches: [],
    pageTitle: 'Serverfeil',
    success: '',
    teams: [],
    tournaments: [],
  });
});

module.exports = app;

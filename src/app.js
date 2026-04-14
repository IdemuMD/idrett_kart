const path = require('node:path');
const express = require('express');
const session = require('express-session');
const { attachCurrentUser, requireAuth, requireRole } = require('../middleware/auth');

const authRoutes = require('../routes/authRoutes');
const pageRoutes = require('../routes/pageRoutes');
const publicRoutes = require('../routes/publicRoutes');
const secureRoutes = require('../routes/secureRoutes');
const adminRoutes = require('../routes/adminRoutes');
const leaderRoutes = require('../routes/leaderRoutes');
const participantRoutes = require('../routes/participantRoutes');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '..', 'public')));
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
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/secure', requireAuth, secureRoutes);
app.use('/api/admin', requireAuth, requireRole('admin'), adminRoutes);
app.use('/api/leader', requireAuth, requireRole('leader'), leaderRoutes);
app.use('/api/participant', requireAuth, requireRole('participant'), participantRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Fant ikke siden.' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Uventet feil i serveren.' });
});

module.exports = app;

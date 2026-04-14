const path = require('node:path');
const express = require('express');
const session = require('express-session');
const { initializeDatabase } = require('./models/database');

initializeDatabase();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'idrett-kart-utvikling',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: false },
}));

app.use(express.static(path.join(__dirname, '..', 'public')));

// Middleware
function getUserFromSession(req) {
  if (!req.session.userId) return null;
  const userModel = require('../models/userModel');
  return userModel.findById(req.session.userId);
}

function requireAuth(req, res, next) {
  const user = getUserFromSession(req);
  if (!user) return res.status(401).json({ error: 'Du må være logget inn.' });
  req.user = user;
  next();
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Du har ikke tilgang til dette.' });
    }
    next();
  };
}

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));
app.use('/api/secure', requireAuth, require('./routes/secureRoutes'));
app.use('/api/admin', requireAuth, requireRole('admin'), require('./routes/adminRoutes'));
app.use('/api/leader', requireAuth, requireRole('leader'), require('./routes/leaderRoutes'));
app.use('/api/participant', requireAuth, requireRole('participant'), require('./routes/participantRoutes'));

app.use((error, req, res) => {
  console.error(error);
  res.status(500).json({ error: 'Uventet feil i serveren.' });
});

app.listen(PORT, () => {
  console.log(`Server kjører på http://localhost:${PORT}`);
});


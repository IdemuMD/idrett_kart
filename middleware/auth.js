const userModel = require('../models/userModel');

async function attachCurrentUser(req, res, next) {
  if (!req.session?.userId) {
    req.user = null;
    res.locals.currentUser = null;
    return next();
  }

  try {
    const user = await userModel.findById(req.session.userId);
    req.user = user
      ? {
          id: user._id?.toString?.() || user.id,
          name: user.name,
          username: user.username,
          role: user.role,
          age: user.age ?? null,
        }
      : null;
    res.locals.currentUser = req.user;
    return next();
  } catch (error) {
    return next(error);
  }
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Du må være logget inn.' });
  }

  return next();
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Du har ikke tilgang til dette.' });
    }

    return next();
  };
}

module.exports = {
  attachCurrentUser,
  requireAuth,
  requireRole,
};

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
          role: user.role,
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
    return res.redirect('/?error=' + encodeURIComponent('Du må være logget inn.'));
  }

  return next();
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.redirect('/?error=' + encodeURIComponent('Du har ikke tilgang til dette.'));
    }

    return next();
  };
}

function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.redirect('/?error=' + encodeURIComponent('Du må være logget inn.'));
  }

  if (req.user.role !== 'admin') {
    return res.redirect('/?error=' + encodeURIComponent('Kun admin har tilgang til denne siden.'));
  }

  return next();
}

module.exports = {
  attachCurrentUser,
  requireAdmin,
  requireAuth,
  requireRole,
};

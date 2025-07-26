// middlewares/verifyAdminAccess.js

function verifyAdminAccess(...requiredAccessKeys) {
  return (req, res, next) => {
    if (!req.session || !req.session.admin_auth) {
      return res.status(401).json({ error: 'Unauthorized: Admin not logged in' });
    }

    const sectors = req.session.authenticated_sectors || {};
    const hasAccess = requiredAccessKeys.every(key => sectors[key] === true);

    if (!hasAccess) {
      return res.status(403).json({
        error: `Forbidden: Missing required access rights (${requiredAccessKeys.join(', ')})`
      });
    }

    next();
  };
}

module.exports = verifyAdminAccess;

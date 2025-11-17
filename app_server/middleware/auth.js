function ensureAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  const returnTo = encodeURIComponent(req.originalUrl || '/');
  return res.redirect(`/auth/login?next=${returnTo}`);
}

function ensureGuest(req, res, next) {
  if (req.session && req.session.user) {
    return res.redirect('/');
  }
  next();
}

module.exports = { ensureAuth, ensureGuest };

module.exports = function requireActiveSession(req, res, next) {
  const session = req.examSession;

  if (session.status !== "ACTIVE" && session.status !== "PAUSED") {
    return res.status(403).json({
      status: session.status,
      reason: session.terminatedReason
    });
  }

  next();
};
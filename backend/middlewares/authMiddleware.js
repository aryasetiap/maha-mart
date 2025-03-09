const { verifyToken } = require("../utils/auth");

module.exports = (req, res, next) => {
  const token = req.body.token
  if (!token)
    return res.status(401).json({ error: "Unauthorized: No token provided" });

  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    return res.status(403).json({ error: "Forbidden: Invalid token" });
  }
};

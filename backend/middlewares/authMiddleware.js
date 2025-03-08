const { verifyToken } = require("../utils/auth");

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(401).json({ error: "Unauthorized: No token provided" });

  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    return res.status(403).json({ error: "Forbidden: Invalid token" });
  }
};

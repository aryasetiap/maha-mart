/**
 * Authentication middleware for protecting routes.
 *
 * This middleware verifies the token provided in the request body and
 * assigns the user object to the request object if the token is valid.
 *
 * @param {import('express').Request} req - The request object.
 * @param {import('express').Response} res - The response object.
 * @param {import('express').NextFunction} next - The next function.
 */
module.exports = (req, res, next) => {
  const token = req.body?.token;
  if (typeof token !== "string") {
    // No token provided
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    const user = verifyToken(token);
    if (!user) {
      // Invalid token
      return res.status(403).json({ error: "Forbidden: Invalid token" });
    }

    // Assign the user object to the request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in auth middleware:", error);
    // Invalid token
    return res.status(403).json({ error: "Forbidden: Invalid token" });
  }
};

/**
 * Verifies a JWT token and returns the user object if the token is valid.
 *
 * @param {string} token - The JWT token to verify.
 * @returns {object} The user object if the token is valid, null otherwise.
 * @throws {Error} If the token is invalid or expired.
 */
const verifyToken = (token) => {
  // Verify the token using the secret key
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return user;
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      throw new Error("Invalid token");
    }
    throw error;
  }
};


/**
 * Limits a route to one or more roles.
 * Example: `authorize("ADMIN", "EMPLOYER")`.
 */
export const authorize = (...roles) => {
  const allowedRoles = new Set(roles.flat().map((role) => String(role).toUpperCase()));

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication is required.",
      });
    }

    if (!allowedRoles.has(String(req.user.role).toUpperCase())) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource.",
      });
    }

    return next();
  };
};

export const requireRole = authorize;

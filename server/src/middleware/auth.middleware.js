import { verifyToken } from "../utils/jwt.js";

/**
 * Requires a valid access token in the Authorization header.
 *
 * The JWT payload is deliberately used as the request identity so every
 * protected handler gets the same `{ id, role }` shape used by the API.
 */
export const authenticate = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication token is required.",
    });
  }

  const token = authorization.slice(7).trim();
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication token is required.",
    });
  }

  try {
    const decoded = verifyToken(token);

    if (!decoded?.id || !decoded?.role) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    req.user = { id: decoded.id, role: decoded.role };
    return next();
  } catch (_error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
};

// Common alias for route declarations: `router.get("/me", protect, handler)`.
export const protect = authenticate;

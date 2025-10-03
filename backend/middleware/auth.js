import jwt from "jsonwebtoken";

/**
 * 🔹 Auth Middleware
 * Verifies JWT token and attaches user info to req.user
 */
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Invalid token format" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role }
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

/**
 * 🔹 Role-based Middleware
 * Accepts allowedRoles array, e.g., ['teamleader'], ['employee'], ['admin', 'teamleader']
 */
export const allowRoles = (allowedRoles = []) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const userRole = req.user.role?.toLowerCase();
  const isAllowed = allowedRoles.map(r => r.toLowerCase()).includes(userRole);

  if (!isAllowed) return res.status(403).json({ message: "Access denied" });

  next();
};

// Convenience middlewares
export const teamLeaderOnly = allowRoles(["teamleader"]);
export const employeeOnly = allowRoles(["employee"]);

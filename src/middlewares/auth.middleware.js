import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized access, token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({
          status: "fail",
          message:
            err.name === "TokenExpiredError"
              ? "Token expired, please log in again"
              : "Invalid token",
        });
      }

      req.user = { id: decoded.id, role: decoded.role };
      next();
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: "fail",
      message: "Unauthorized access, no user found",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      status: "fail",
      message: "Forbidden access, only admin endpoint",
    });
  }

  next();
};

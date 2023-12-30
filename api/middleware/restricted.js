module.exports = (req, res, next) => {
  const jwt = require("jsonwebtoken");
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "token required" });
  }

  jwt.verify(token, "", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "token invalid" });
    }

    req.user = decoded;
    next();
  });
};

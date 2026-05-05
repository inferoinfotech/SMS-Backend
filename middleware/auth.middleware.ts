const jwt = require("jsonwebtoken");

const protect = async (req: any, res: any, next: any) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("Auth Error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
module.exports = protect;

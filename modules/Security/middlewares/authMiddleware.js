const jwt = require('jsonwebtoken');
const { SecurityGuard } = require('../../admin/models');

const securityMiddleware = async (req, res, next) => {
  let token;
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else {
    return res.status(401).json({ message: 'Authentication token is missing' });
  }

  try {
    const currentTime = Math.floor(Date.now() / 1000);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (currentTime > decoded.exp) {
      return res.status(401).json({ message: 'Token expired, please log in again' });
    }
    const securityGuard = await SecurityGuard.findById(decoded.id);
    if (!securityGuard) {
      return res.status(401).json({ message: 'Security guard not found' });
    }
    req.security = securityGuard;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please log in again' });
    }
    return res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

module.exports = { securityMiddleware };
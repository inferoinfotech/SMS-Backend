const jwt = require('jsonwebtoken');
const { Resident } = require('../../admin/models'); 

const residentMiddleware = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    // console.log("Token received:", token);
  } else {
    return res.status(401).json({ message: 'Authentication token is missing' });
  }

  try {
    const currentTime = Math.floor(Date.now() / 1000);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (currentTime > decoded.exp) {
      return res.status(401).json({ message: 'Token expired, please log in again' });
    }

    const resident = await Resident.findById(decoded.id);
    if (!resident) {
      return res.status(401).json({ message: 'Resident not found' });
    }

     if (!resident.society) {
      return res.status(400).json({ message: 'Resident does not belong to a society' });
    }

    req.resident = resident;
    req.society = resident.society;

    next();
  } catch (error) {
    console.error("Error verifying token:", error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please log in again' });
    }

    return res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

module.exports = { residentMiddleware };

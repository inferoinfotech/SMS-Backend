const jwt = require('jsonwebtoken');
const { Resident } = require('../../admin/models');

exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    try {
        const resident = await Resident.findOne({ email }).select('+password');

        if (!resident) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await resident.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        sendTokenResponse(resident, 200, res);
    } catch (error) {
        console.error('Login error:', error);
        next(error);
    }
};

exports.getResidentById = async (req, res) => {
  try {
    const resident = await Resident.findOne({ _id: req.params.id, isDeleted: false })

    if (!resident) {
      return res.status(404).json({ message: 'Resident not found' });
    }

    res.status(200).json(resident);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resident', error });
  }
};
const sendTokenResponse = (resident, statusCode, res) => {
    const token = jwt.sign({ id: resident._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        // secure: process.env.NODE_ENV === 'production',
        path: "/",
        maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
        sameSite: 'None'
        // sameSite: 'Strict',
    });
    
    res.status(statusCode).json({
        success: true,
        message: 'Logged in successfully',
        token,
        residentId: resident._id
    });
};
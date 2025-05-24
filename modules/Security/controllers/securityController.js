const jwt = require('jsonwebtoken');
const { SecurityGuard } = require('../../admin/models');

exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    try {
        const securityGuard = await SecurityGuard.findOne({ email }).select('+password');

        console.log("securityGuard",securityGuard);
        
        if (!securityGuard) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await securityGuard.matchPassword(password);
        
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        sendTokenResponse(securityGuard, 200, res);
    } catch (error) {
        next(error);
    }
};

exports.getSecurityGuardById = async (req, res, next) => {
    const { id } = req.params;

    try {
        const securityGuard = await SecurityGuard.findById(id)
            .populate('society', 'name') // Populate the society field with the society name
            .populate('createdBy', 'name'); // Populate the createdBy field with the admin name

        if (!securityGuard) {
            return res.status(404).json({ success: false, message: 'Security guard not found' });
        }

        res.status(200).json({ success: true, data: securityGuard });
    } catch (error) {
        next(error);
    }
};

exports.getAllSecurityGuards = async (req, res, next) => {
    try {
        const securityGuards = await SecurityGuard.find({ isDeleted: false })
            .populate('society', 'name') // Populate the society field with the society name
            .populate('createdBy', 'name'); // Populate the createdBy field with the admin name

        res.status(200).json({ success: true, count: securityGuards.length, data: securityGuards });
    } catch (error) {
        next(error);
    }
};

const sendTokenResponse = (securityGuard, statusCode, res) => {
    const token = jwt.sign({ id: securityGuard._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        // secure: process.env.NODE_ENV === 'production',
        path: "/",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        sameSite: 'None'
        // sameSite: 'Strict',
    });

    res.status(statusCode).json({
        success: true,
        message: 'Logged in successfully',
        token,
        securityId: securityGuard._id
    });
};
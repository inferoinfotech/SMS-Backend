const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadPath = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Check if the file exists
    if (!file) {
        cb(null, false);
        return;
    }

    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/pdf'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, JPEG, PNG and PDF files are allowed.'), false);
    }
};

const uploadMultiple = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}).fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'frontAadharCard', maxCount: 1 },
    { name: 'backAadharCard', maxCount: 1 },
    { name: 'addressProof', maxCount: 1 },
    { name: 'rentAgreement', maxCount: 1 }
]);
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware creator for single file upload with dynamic field name
const uploadSingle = (fieldName) => {
    return upload.single(fieldName);
};

module.exports = { uploadMultiple, uploadSingle, upload };
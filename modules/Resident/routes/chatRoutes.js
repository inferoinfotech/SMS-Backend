// route call resident list
const express = require('express');
const { residentMiddleware } = require('../middlewares/authMiddleware');
const { chatMemberController } = require('../controllers');
const { handleMessage, getChatHistory } = require('../controllers/chatController');
const path = require('path');
const fs = require('fs');
const uploadPath = path.join(__dirname, '..', 'uploads');

const router = express.Router();
router.use(residentMiddleware);

router.get('/', chatMemberController.getAllResidents);

// coudinary
const multer = require("multer");
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "modules/Resident/uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 10 } // Limit file size to 10MB
});

router.post("/message", upload.single("file"), handleMessage);
router.get("/history/:senderId/:receiverId", getChatHistory);

module.exports = router;
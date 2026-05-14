const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any, file: any) => {
    let resource_type = "auto"; // Automatically detect if it's image, video (for audio), or raw (for pdf)
    let folder = "SMS_Chat_Uploads";
    
    return {
      folder: folder,
      resource_type: resource_type,
      // For Cloudinary, resource_type: 'auto' handles PDF, Image, and Audio
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for chat files
  },
});

module.exports = upload;

const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    const allowedExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;

    const isValidMimeType = allowedMimeTypes.includes(file.mimetype);
    const isValidExtension = allowedExtensions.test(file.originalname);

    if (isValidMimeType || isValidExtension) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, JPEG, PNG, GIF, and WEBP images are allowed"));
    }
  },
});

module.exports = upload;
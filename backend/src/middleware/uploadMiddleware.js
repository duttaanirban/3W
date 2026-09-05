const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: 25 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    const allowedExtensions = /\.(jpg|jpeg|png|gif|webp|mp4|webm|mov)$/i;

    const isValidMimeType = allowedMimeTypes.includes(file.mimetype);
    const isValidExtension = allowedExtensions.test(file.originalname);

    if (isValidMimeType || isValidExtension) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, JPEG, PNG, GIF, WEBP, MP4, WEBM, and MOV files are allowed"));
    }
  },
});

module.exports = upload;
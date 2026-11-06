
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads');

// Create uploads folder if it does not exist
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, uploadDir);
    },
    filename: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const uniqueName =
            `${Date.now()}-${require('crypto').randomUUID()}${extension}`;

        callback(null, uniqueName);
    }
});


const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
];

const fileFilter = (req, file, callback) => {
    if (allowedTypes.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(
            new Error('Only JPG, PNG, WEBP, and PDF files are allowed.')
        );
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    }
});

module.exports = upload;

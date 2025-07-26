const fs = require('fs');
const path = require('path');

// Define storage paths
const storagePaths = {
    studentDocs: path.join(__dirname, '../storage/student_docs'),
    wardenImages: path.join(__dirname, '../storage/images/warden_profile_images'),
    studentImages: path.join(__dirname, '../storage/images/student_profile_images'),
    qrCodes: path.join(__dirname, '../storage/qrcodes'),
    temp: path.join(__dirname, '../storage/temp'),
};

// Ensure storage directories exist
Object.values(storagePaths).forEach((dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created storage directory: ${dir}`);
    }
});

module.exports = storagePaths;
const path = require('path');

const BASE_UPLOAD_PATH = path.join(__dirname, '..', 'static', 'TEMP');

const STATIC_PATHS = {
  announcements_pdf: 'pdfs/announcements',
  department_banner_image: 'images/department_banner',
  events_image: 'images/events',
};

module.exports = {
  BASE_UPLOAD_PATH,
  STATIC_PATHS
};

const galleryHandler = require("../controllers/second_navbar/gallery_controllers/gallery_busboy");
const transportHandler = require("../controllers/second_navbar/transport_controllers/transport_busboy");
const iqacHandler= require ('../controllers/second_navbar/iqac_controller/iqac_busboy');
const aboutusHandler = require('../controllers/top_navbar/about_us_controllers/about_us_busboy')
const administrationHandler = require('../controllers/top_navbar/administration_controllers/administration_busboy')

const busboyModels = {
  gallery: galleryHandler,
  transport: transportHandler,
  iqac: iqacHandler,
  about_us: aboutusHandler,
  administration : administrationHandler
};

module.exports = busboyModels;

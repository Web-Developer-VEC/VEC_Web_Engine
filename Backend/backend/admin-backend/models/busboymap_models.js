const galleryHandler = require("../controllers/second_navbar/gallery_controllers/gallery_busboy");
const transportHandler = require("../controllers/second_navbar/transport_controllers/transport_busboy");
const iqacHandler= require ('../controllers/second_navbar/iqac_controller/iqac_busboy');

const busboyModels = {
  gallery: galleryHandler,
  transport: transportHandler,
  iqac: iqacHandler
};

module.exports = busboyModels;

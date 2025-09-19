const galleryHandler = require("../controllers/second_navbar/gallery_controllers/gallery_busboy");
const transportHandler = require("../controllers/second_navbar/transport_controllers/transport_busboy");
const iicHandler= require ('../controllers/second_navbar/iic_controllers/iic_busboy');

const busboyModels = {
  gallery: galleryHandler,
  transport: transportHandler
};

module.exports = busboyModels;

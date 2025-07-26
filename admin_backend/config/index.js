const db = require('./db');
const aws = require('./aws');
const multerConfig = require('./multer');
const paths = require('./paths');

module.exports = {
  db,
  aws,
  multerConfig,
  paths
};

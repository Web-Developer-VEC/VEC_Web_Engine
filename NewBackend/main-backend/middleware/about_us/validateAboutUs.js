const validateAboutUs = (req, res, next) => {
    console.log('Validating About Us request');
    next();
};

module.exports = validateAboutUs;

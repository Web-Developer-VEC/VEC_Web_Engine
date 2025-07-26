const session = require('express-session');

module.exports = session({
    secret: '12345678',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
});
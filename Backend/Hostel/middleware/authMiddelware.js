const ensureAuthenticatedStudent = (req, res, next) => {
    if (!req.session || req.session.studentauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }
    next();
};

const ensureAuthenticatedWarden = (req, res, next) => {
    if (!req.session || req.session.wardenauth !== true) {  
        return res.status(401).json({ error: "Unauthorized access" });
    }
    next();
};

const ensureAuthenticatedSuperior = (req, res, next) => {
    if (!req.session || req.session.superiorauth !== true) {  
        return res.status(401).json({ error: "Unauthorized access" });
    }
    next();
};

const ensureAuthenticatedSecurity = (req, res, next) => {
    if (!req.session || req.session.securityauth !== true) {  
        return res.status(401).json({ error: "Unauthorized access" });
    }
    next();
};
const ensureAuthenticated = (req, res, next) => {
    if (!req.session || (!req.session.wardenauth && !req.session.superiorauth)) {  
        return res.status(401).json({ error: "Unauthorized access" });
    }
    next();
};

module.exports = {
    ensureAuthenticatedStudent,
    ensureAuthenticatedWarden,
    ensureAuthenticatedSuperior,
    ensureAuthenticatedSecurity,
    ensureAuthenticated
};

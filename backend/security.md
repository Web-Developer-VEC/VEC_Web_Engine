## 🛡️ THREATS TO PROTECT AGAINST

### ✅ 1. **Injection Attacks**

* **NoSQL Injection** (MongoDB-specific)
* **SQL Injection** (if using any SQL DB in future)
* **Command Injection** (from shell command usage)
* **Cross-Site Scripting (XSS)**
* **Path Traversal** (for file uploads)
* **Prototype Pollution**
* **Mass Assignment (overwriting internal fields)**

---

## ✅ 2. **Sanitization & Validation Targets**

* `req.body`
* `req.query`
* `req.params`
* `req.headers`
* File names and file paths (especially uploads)

---

## ✅ 3. **Common Middleware Functionalities to Build**

We’ll define these as separate utilities and combine them into a middleware chain:

---

## 🔧 FUNCTION 1: Input Sanitizer (`sanitizeInput`)

Use [validator.js](https://www.npmjs.com/package/validator) + custom logic to sanitize malicious input patterns.

```bash
npm install validator
```

```js
// middleware/sanitizeInput.js
const validator = require('validator');

function sanitizeObject(obj) {
    for (let key in obj) {
        if (typeof obj[key] === 'string') {
            // Remove dangerous characters & trim
            obj[key] = validator.escape(obj[key].trim());
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitizeObject(obj[key]); // Recursively sanitize
        }
    }
}

const sanitizeInput = (req, res, next) => {
    sanitizeObject(req.body);
    sanitizeObject(req.query);
    sanitizeObject(req.params);
    next();
};

module.exports = sanitizeInput;
```

---

## 🔧 FUNCTION 2: MongoDB NoSQL Injection Guard

NoSQL injections often exploit `$gt`, `$ne`, etc. You must block or sanitize those.

```js
// middleware/blockMongoInjection.js
const blockMongoInjection = (req, res, next) => {
    const check = (obj) => {
        for (const key in obj) {
            if (key.startsWith('$')) {
                return true;
            }
            if (typeof obj[key] === 'object') {
                if (check(obj[key])) return true;
            }
        }
        return false;
    };

    if (check(req.body) || check(req.query) || check(req.params)) {
        return res.status(400).json({ message: 'Possible injection detected' });
    }
    next();
};

module.exports = blockMongoInjection;
```

---

## 🔧 FUNCTION 3: XSS Cleaner

To clean any residual HTML/JS code from being injected, use `xss-clean`.

```bash
npm install xss-clean
```

Then use it globally in your app:

```js
const xss = require('xss-clean');
app.use(xss());  // Apply early
```

This works on `req.body`, `req.query`, and `req.params`.

---

## 🔧 FUNCTION 4: Rate Limiting (to prevent brute-force)

```bash
npm install express-rate-limit
```

```js
// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests, please try again later.",
});

module.exports = limiter;
```

Use in `server.js`:

```js
const rateLimiter = require('./middleware/rateLimiter');
app.use(rateLimiter);
```

---

## 🔧 FUNCTION 5: Allowed Fields Validator (Mass Assignment Prevention)

```js
// middleware/validateAllowedFields.js
const validateAllowedFields = (allowedFields) => {
    return (req, res, next) => {
        const invalidFields = Object.keys(req.body).filter(
            key => !allowedFields.includes(key)
        );

        if (invalidFields.length > 0) {
            return res.status(400).json({
                message: `Invalid fields: ${invalidFields.join(', ')}`
            });
        }
        next();
    };
};

module.exports = validateAllowedFields;
```

Use it like this in your route:

```js
router.post('/add-user', validateAllowedFields(['name', 'email', 'password']), yourController);
```

---

## 🔧 FUNCTION 6: Path Traversal & File Upload Sanitizer

When dealing with uploads, sanitize file names:

```js
const path = require('path');
const sanitizeFilename = (name) => {
    return path.basename(name).replace(/[^a-z0-9_\-.]/gi, '_');
};
```

And in Multer:

```js
filename: function (req, file, cb) {
    const cleanName = sanitizeFilename(file.originalname);
    cb(null, Date.now() + '-' + cleanName);
}
```

---

## 🧱 Combine Into Common Middleware

You can group your common middlewares in one module and use per route or globally:

```js
// middleware/commonSecurity.js
const sanitizeInput = require('./sanitizeInput');
const blockMongoInjection = require('./blockMongoInjection');
const xss = require('xss-clean');

const commonSecurity = [
    xss(),
    sanitizeInput,
    blockMongoInjection,
];

module.exports = commonSecurity;
```

And in routes:

```js
const commonSecurity = require('../middleware/commonSecurity');
router.post('/something', commonSecurity, validateAllowedFields([...]), controllerFunction);
```

---

## ✅ EXTRA RECOMMENDATIONS

1. **HTTP Headers**: Use Helmet

   ```bash
   npm install helmet
   ```

   ```js
   const helmet = require('helmet');
   app.use(helmet());
   ```

2. **CORS Whitelisting**:

   ```js
   const corsOptions = {
     origin: ['https://yourdomain.com'],
     methods: ['GET', 'POST', 'PUT', 'DELETE'],
   };
   app.use(cors(corsOptions));
   ```

3. **Use HTTPS** in production.

4. **Log Suspicious Input**: for monitoring abuse.

---

## ✅ Summary of Middleware Functions to Create

| Middleware              | Purpose                                      |
| ----------------------- | -------------------------------------------- |
| `sanitizeInput`         | Escapes dangerous chars in body/query/params |
| `blockMongoInjection`   | Blocks `$gt`, `$ne`, etc. from reaching DB   |
| `xss-clean`             | Cleans input from XSS injection              |
| `rateLimiter`           | Prevents brute-force & DoS                   |
| `validateAllowedFields` | Prevents unexpected keys (mass assignment)   |
| `helmet`                | Sets secure HTTP headers                     |
| File name sanitizer     | Prevents path traversal in uploads           |

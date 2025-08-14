// middleware/cors.js

const cors = require('cors');

// Define trusted frontend origins (adjust as per actual domains)
const allowedOrigins = [
  'https://yourcollegefrontend.com', //add that local link for access and need to test this out, if it doesnt work, comment it
  'http://localhost:5000'
];

const corsOptions = {
  /**
   * Only allow requests from specified trusted domains.
   */
  origin: function (origin, callback) {
    // Allow no-origin requests (like curl or mobile apps) or if origin is whitelisted
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },

  /**
   * Allow credentials (cookies, Authorization headers, etc.).
   */
  credentials: true,

  /**
   * Accept only certain HTTP methods.
   */
  methods: ['GET', 'POST'],

  /**
   * Allow specific headers from client.
   */
  allowedHeaders: ['Content-Type', 'Authorization'],

  /**
   * Expose additional headers (optional).
   * You can include things like: 'Content-Length', 'X-Total-Count'
   */
  exposedHeaders: ['X-Custom-Header'],

  /**
   * Set the status for successful OPTIONS requests.
   * Needed for legacy browsers that choke on 204.
   */
  optionsSuccessStatus: 200,

  /**
   * Cache preflight results for 10 minutes (600 seconds)
   * Reduces number of preflight requests.
   */
  maxAge: 600
};

module.exports = cors(corsOptions);

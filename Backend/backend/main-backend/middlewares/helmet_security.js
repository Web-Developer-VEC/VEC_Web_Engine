const helmet = require('helmet');

/**
 * Helmet middleware config to enhance API security for the website.
 * This adds the default settings and enables extra configs accordingly, please change them if the security policy changes.
 */
const securityMiddleware = helmet({
  /**
   * Prevents the browser from guessing the MIME type of a response.
   * This helps block MIME-based attacks (like treating a .txt file as .js).
   */
  noSniff: true,

  /**
   * Prevents your app from being embedded in an <iframe> on another site.
   * This protects against clickjacking attacks.
   * 'deny' = disallow all iframe embedding.
   */
  frameguard: {
    action: 'deny'
  },

  /**
   * Enforces HTTPS connections by telling browsers to only use HTTPS
   * for future requests to your domain (even if the user types HTTP).
   * `maxAge`: time in seconds to enforce HTTPS (1 year here).
   * `includeSubDomains`: apply to subdomains.
   * `preload`: allow submission to Chrome's preload list.
   */
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true
  },

  /**
   * Hides the `X-Powered-By: Express` header, which reveals tech stack info.
   * Helps reduce stack exposure for attackers performing reconnaissance.
   */
  hidePoweredBy: true,

  /**
   * Prevents DNS prefetching in browsers, which can leak private domain data.
   * `allow: false` = disable DNS prefetching.
   */
  dnsPrefetchControl: {
    allow: false
  },

  /**
   * Prevents cross-origin resource abuse by restricting resource access policies.
   * `cross-origin` allows safe public assets to be shared while restricting harmful use.
   * Since you're serving public college data, this is a balanced choice.
   */
  crossOriginResourcePolicy: {
    policy: 'cross-origin'
  },

  /**
   * Limits what is sent in the Referer header to reduce info leakage.
   * 'no-referrer' = do not send the Referer header at all.
   */
  referrerPolicy: {
    policy: 'no-referrer'
  },

  /**
   * Blocks access by old Adobe Flash/Acrobat clients via crossdomain.xml.
   * These are mostly obsolete but blocking reduces the attack surface.
   */
  permittedCrossDomainPolicies: {
    permittedPolicies: 'none'
  }

  /**
   * Content Security Policy (CSP) is powerful but disabled here
   * because you're not serving complex frontend scripts from here.
   * Enable only if you're building frontend under this same backend.
   */
  // contentSecurityPolicy: false
});

module.exports = securityMiddleware;

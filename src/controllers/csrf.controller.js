import logger from "../utils/logger.js";
const getCsrfToken = (req, res) => {
    // Set the CSRF token in an HttpOnly cookie
    logger.info("this is hit")
    // You can also respond with the CSRF token in the response body if necessary
    res.json({ csrfToken: req.csrfToken() });
  };
  


export {getCsrfToken};
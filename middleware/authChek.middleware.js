const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');

module.exports = (role) => async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).send({ error: `not found authorization headers` });
    }
    const accessToken = req.headers.authorization.split(' ')[1];
    const payload = jwt.verify(accessToken, config.tokenKey);
    if (
      (Date.now() - payload.iat) / (1000 * 60) <
      config.accessTokenLifeInMin
    ) {
      if (role && payload.role !== role) {
        return res
          .status(403)
          .send({ error: `your role does not have access to this route` });
      }
      req.headers.user_id = payload._id;
      req.headers.user_email = payload.email;
      req.headers.user_role = payload.role;
      return next();
    }
    return res.status(401).send({ error: `accessToken expired` });
  } catch (error) {
    logger.error(`Error in authChek.middleware: ${error}`);
    return res.status(500).send({ error });
  }
};

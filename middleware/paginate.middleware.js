const logger = require('../utils/logger');

module.exports = async (req, res, next) => {
  try {
    req.query.sort = req.query.sort && req.query.sort === 'DESC' ? -1 : 1;
    req.query.page =
      req.query.page && req.query.page > 0
        ? Number.parseInt(req.query.page, 10)
        : 1;
    req.query.limit =
      req.query.limit && req.query.limit > 10
        ? Number.parseInt(req.query.limit, 10)
        : 10;
    req.query.skip = (req.query.page - 1) * req.query.limit;
    next();
  } catch (error) {
    logger.error(`Error in paginate.middleware: ${error}`);
    res.status(500).send({ error });
  }
};

const { error } = require('../../services/logger');
const { badRequest, serverError, notFound } = require('../../utils/response-utils');

const CommonError = (req, err, res) => {
  error(`${req.method} ${req.originalUrl}`, err.message);

  if (/must not be/.test(err.message) || /must be/.test(err.message)) return res.json(badRequest(err.message));
  if (/not found/.test(err.message)) return res.json(notFound(err.message));

  return res.json(serverError(err.message));
};

module.exports = {
  CommonError
};

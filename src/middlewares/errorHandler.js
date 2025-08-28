import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
  const error = {
    success: false,
    code: err.code || 500,
    message: err.message || "Something went wrong",
    errors: err.error,
  };
  logger.error({ error });
  return res.status(err.code || 500).json(error);
};

export default errorHandler;

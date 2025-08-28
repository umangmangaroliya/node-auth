import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

const auth = async (req, res, next) => {
  try {
    let auth;
    const token = req.cookies.token;
    if (!token) {
      throw new ApiError(401, "Unauthorized");
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
      if (err) {
        throw new ApiError(401, "Unauthorized");
      }
      auth = decoded;
    });
    req.user = auth;
    return next();
  } catch (err) {
    next(err);
  }
};

export default auth;

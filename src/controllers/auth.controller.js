import jwt from "jsonwebtoken";
import sendMail from "../emails/nodemailer.js";
import Token from "../models/token.modal.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import logger from "../utils/logger.js";
import ValidationError from "../utils/ValidationError.js";
import {
  loginSchema,
  registerSchema,
  resetPassWordSchema,
} from "../../validation/auth.validation.js";

const register = async (req, res, next) => {
  try {
    const validatedDataError = (await registerSchema.safeParseAsync(req.body))
      .error;
    if (validatedDataError) {
      throw new ApiError(
        400,
        "Validation Error",
        ValidationError(validatedDataError?.errors)
      );
    }

    const { name, email, password } = req.body;

    const findUser = await User.findOne({ email });

    if (findUser) {
      throw new ApiError(400, "User already exists");
    }

    const user = await User.create({
      name,
      email,
      password,
    });
    const token = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await Token.create({
      token,
      userId: user._id,
      expiresAt,
    });

    const verificationLink = `${process.env.BASE_URL}/api/v1/admin/verify/${token}`;

    sendMail(
      "test@yopmail.com",
      "Verify Email",
      `<div><h1>Verify Email</h1><a href=${verificationLink}>Verify Email</a></div>`
    );
    return res
      .status(200)
      .json({ code: 200, message: "User created successfully", success: true });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const validatedDataError = (await loginSchema.safeParseAsync(req.body))
      .error;
    if (validatedDataError) {
      throw new ApiError(
        400,
        "Validation Error",
        ValidationError(validatedDataError?.errors)
      );
    }
    const { email, password } = req.body;

    const findUser = await User.findOne({ email });

    if (!findUser) {
      throw new ApiError(404, "User does not exist");
    }

    if (!findUser.isVerify) {
      throw new ApiError(401, "User is not verified");
    }

    const isMatch = await findUser.comparePassword(password);

    if (!isMatch) {
      throw new ApiError(401, "Invalid credentials");
    }

    const token = await findUser.generateAuthToken();

    const loggedInUser = await User.findById(findUser._id).select([
      "-password",
      "-__v",
    ]);

    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        maxAge: 8 * 60 * 60 * 1000,
      })
      .json({
        code: 200,
        message: "Login successful",
        success: true,
        data: loggedInUser,
      });
  } catch (err) {
    next(err);
  }
};

const logout = (req, res, next) => {
  try {
    return res
      .status(200)
      .clearCookie("token", {
        httpOnly: true,
        secure: true,
      })
      .json({
        code: 200,
        message: "Logout successful",
        success: true,
      });
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new ApiError(400, "Validation Error", [
        {
          field: "email",
          message: "Email is required",
        },
      ]);
    }

    const findUser = await User.findOne({ email });

    if (!findUser) {
      throw new ApiError(404, "User does not exist");
    }

    if (!findUser.isVerify) {
      throw new ApiError(401, "Email is not verified");
    }

    const token = jwt.sign(
      { _id: findUser._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1h",
      }
    );
    logger.info("token", token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await Token.create({
      token,
      userId: findUser._id,
      expiresAt,
    });

    return res.status(200).json({
      code: 200,
      message: "Send reset password link successfully",
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

const resetPassWord = async (req, res, next) => {
  try {
    let verifyToken;

    const { password, confirmPassword, token } = req.body;
    const validatedDataError = (
      await resetPassWordSchema.safeParseAsync(req.body)
    ).error;
    if (validatedDataError) {
      throw new ApiError(
        400,
        "Validation Error",
        ValidationError(validatedDataError?.errors)
      );
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        throw new ApiError(400, "Token is invalid");
      }
      verifyToken = decoded;
    });
    const findUser = await User.findOne({ _id: verifyToken._id });
    const findToken = await Token.findOne({ userId: verifyToken._id });

    if (!findUser) {
      throw new ApiError(404, "User does not exist");
    }
    if (findToken.isUsed) {
      throw new ApiError(400, "Token is invalid");
    }

    if (findToken.expiresAt < new Date()) {
      throw new ApiError(400, "Reset password link is expired");
    }

    if (password !== confirmPassword) {
      throw new ApiError(400, "Password and confirm password must be match");
    }

    findUser.password = password;
    await findUser.save();
    findToken.isUsed = true;
    await findToken.save();

    return res.status(200).json({
      code: 200,
      message: "Password reset successfully",
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    let verifyToken;
    const { token } = req.params;

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        throw new ApiError(400, "Token is invalid");
      }
      verifyToken = decoded;
    });
    const findUser = await User.findOne({ _id: verifyToken._id });
    const findToken = await Token.findOne({ userId: verifyToken._id });

    if (!findUser) {
      throw new ApiError(404, "User does not exist");
    }

    if (findUser.isVerify) {
      throw new ApiError(400, "User is already verified");
    }

    if (findToken.isUsed) {
      throw new ApiError(400, "Token is invalid");
    }

    if (findToken.expiresAt < new Date()) {
      throw new ApiError(400, "Token is expired");
    }

    findUser.isVerify = true;
    findUser.verifyAt = new Date();
    await findUser.save();
    findToken.isUsed = true;
    await findToken.save();

    return res.status(200).json({
      code: 200,
      message: "User verified successfully",
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

export { forgotPassword, login, logout, register, resetPassWord, verifyEmail };

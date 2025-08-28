import express from "express";
import {
  forgotPassword,
  login,
  logout,
  register,
  resetPassWord,
  verifyEmail,
} from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.route("/register").post(register);
authRouter.route("/login").post(login);
authRouter.route("/logout").get(logout);
authRouter.route("/verify/:token").get(verifyEmail);
authRouter.route("/forgot-password").post(forgotPassword);
authRouter.route("/reset-password").post(resetPassWord);

export default authRouter;

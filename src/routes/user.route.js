import express from "express";
import { me, userList } from "../controllers/user.controller.js";
import auth from "../middlewares/auth.js";

const userRouter = express.Router();
userRouter.use(auth);
userRouter.route("/me").get(me);
userRouter.route("/").get(userList);

export default userRouter;

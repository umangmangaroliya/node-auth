import cookieParser from "cookie-parser";
import express from "express";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

import authRouter from "./routes/admin/auth.route.js";
import userRouter from "./routes/admin/user.route.js";

app.use("/api/v1/admin", authRouter);
app.use("/api/v1/admin/user", userRouter);

app.use(errorHandler);
export default app;

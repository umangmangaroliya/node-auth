import mongoose from "mongoose";
import logger from "../utils/logger.js";
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.info("mongodb connected");
  } catch (err) {
    logger.error("mongodb connection failed", err);
    process.exit(1);
  }
};

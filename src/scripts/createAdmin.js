import "dotenv/config";
import { connectDB } from "../db/connection.js";
import User from "../models/user.model.js";

const createAdmin = () => {
  connectDB()
    .then(async () => {
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;
      const adminName = process.env.ADMIN_NAME;

      const findAdmin = await User.findOne({ email: adminEmail });
      if (findAdmin) {
        console.log("Admin already exists");
        return process.exit();
      }

      const admin = new User({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: "admin",
      });
      await admin.save();
      console.log("Admin user created successfully");
      process.exit();
    })
    .catch((err) => {
      logger.error("MONGODB connection FAILED ", err);
      process.exit(1);
    });
  return;
};

createAdmin();

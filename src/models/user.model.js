import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      index: true,
      required: true,
      trim: true,
      minLength: 3,
    },
    email: {
      type: String,
      unique: [true, "Email already exists"],
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    verifyAt: {
      type: Date,
    },
    isVerify: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  user.password = await bcrypt.hash(user.password, 10);
  next();
});

userSchema.methods.generateAuthToken = function () {
  const user = this;
  const token = jwt.sign(
    { _id: user._id, email: user.email, name: user.name },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );

  return token;
};

userSchema.methods.comparePassword = async function (password) {
  const user = this;
  const isMatch = await bcrypt.compareSync(password, user.password);
  return isMatch;
};

const User = mongoose.model("User", userSchema);

export default User;

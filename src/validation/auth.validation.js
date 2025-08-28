import { z } from "zod";
const registerSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(3, { message: "Name must be at least 3 characters long" }),
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(20, { message: "Password must be at most 20 characters long" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and be at least 8 characters long",
      }
    ),
});
const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z.string({ required_error: "Password is required" }),
});
const resetPassWordSchema = z
  .object({
    password: z
      .string({ required_error: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(20, { message: "Password must be at most 20 characters long" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
          message:
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and be at least 8 characters long",
        }
      ),
    confirmPassword: z.string({
      required_error: "Confirm Password is required",
    }),
    token: z.string({ required_error: "Token is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password and confirm password must be match",
    path: ["confirmPassword"],
  });
export { loginSchema, registerSchema, resetPassWordSchema };

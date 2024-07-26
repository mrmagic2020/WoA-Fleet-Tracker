import * as Yup from "yup";
import { Limits } from "@mrmagic2020/shared/dist/constants";

const passwordSchema = Yup.string()
  .min(
    Limits.MinPasswordLength,
    `Password must be at least ${Limits.MinPasswordLength} characters`
  )
  .max(
    Limits.MaxPasswordLength,
    `Password must be at most ${Limits.MaxPasswordLength} characters`
  )
  .test({
    name: "password",
    skipAbsent: true,
    test: (value, ctx) => {
      if (!value) {
        return false;
      }
      const hasLetter = /[a-zA-Z]/.test(value);
      if (!hasLetter) {
        return ctx.createError({ message: "Password must contain a letter" });
      }
      const hasNumber = /\d/.test(value);
      if (!hasNumber) {
        return ctx.createError({ message: "Password must contain a number" });
      }
      return true;
    }
  })
  .required("Password is required");

export default passwordSchema;

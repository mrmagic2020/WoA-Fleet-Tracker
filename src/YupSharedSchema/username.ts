import * as Yup from "yup";
import { Limits } from "@mrmagic2020/shared/dist/constants";
import { checkUsernameAvailability } from "../services/AuthService";

const usernameSchema = Yup.string()
  .min(
    Limits.MinUsernameLength,
    `Username must be at least ${Limits.MinUsernameLength} characters`
  )
  .max(
    Limits.MaxUsernameLength,
    `Username must be at most ${Limits.MaxUsernameLength} characters`
  )
  .test({
    name: "username",
    skipAbsent: true,
    test: (value, ctx) => {
      if (!value) {
        return false;
      }
      const isUsernameValid = /^[a-zA-Z0-9_ ]*$/.test(value);
      if (!isUsernameValid) {
        return ctx.createError({
          message: "Username can only contain letters, numbers, and underscores"
        });
      }
      return new Promise((resolve, reject) => {
        checkUsernameAvailability(value)
          .then((available) => {
            if (!available) {
              reject(ctx.createError({ message: "Username is taken" }));
            }
            resolve(true);
          })
          .catch((err) => {
            reject(ctx.createError({ message: err.message }));
          });
      });
    }
  })
  .required("Username is required");

export default usernameSchema;

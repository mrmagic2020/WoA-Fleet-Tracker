import { Aircraft } from "../../models/aircraft";
import { JwtPayload } from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request {
    user?: any;
  }
  interface Response {
    aircraft?: Aircraft;
  }
}

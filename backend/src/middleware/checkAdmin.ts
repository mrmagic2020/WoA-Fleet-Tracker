import { Request, Response, NextFunction } from "express";
import User from "../models/user";
import { UserRole } from "@mrmagic2020/shared/dist/enums";

export const checkAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById((req.user as any).id);
    if (user && user.role === UserRole.Admin) {
      next();
    } else {
      res.status(403).json({ message: "Access denied" });
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
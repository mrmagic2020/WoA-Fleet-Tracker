import { Router, Request, Response } from "express";
import User from "../models/user";
import { auth } from "../middleware/auth";
import { checkAdmin } from "../middleware/checkAdmin";

const router = Router();

router.use(auth);

// Get all users (protected route)
router.get("/users", checkAdmin, async (req: Request, res: Response) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/me", auth, async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req.user as any).id);
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

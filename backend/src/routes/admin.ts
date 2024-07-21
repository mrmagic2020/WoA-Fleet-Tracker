import express, { Router, Request, Response } from "express";
import User from "../models/user";
import Aircraft from "../models/aircraft";
import AircraftGroup from "../models/aircraftGroup";
import { auth } from "../middleware/auth";
import { checkAdmin } from "../middleware/checkAdmin";

const router = express.Router();

router.use(auth);

// GET all users (protected route)
router.get("/users", checkAdmin, async (req: Request, res: Response) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a user (protected route)
router.delete("/users/:id", checkAdmin, async (req: Request, res: Response) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Aircraft.deleteMany({ user: req.params.id });
    await AircraftGroup.deleteMany({ owner: req.params.id });
    res.json({ message: "Deleted User" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

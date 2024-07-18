import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/user";
import { auth } from "../middleware/auth";

const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role });
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err: any) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
});

// Login a user
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: "User not found" });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET ?? "defaultSecret",
    {
      expiresIn: "1h"
    }
  );
  res.json({ token });
});

// GET current user's information
router.get("/me", auth, async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req.user as any).id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

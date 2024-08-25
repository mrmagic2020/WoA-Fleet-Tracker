import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user";
import Invitation from "../models/invitation";
import {
  auth,
  INVITATION_MODE,
  checkInvitationCode,
  checkUniqueUsername
} from "../middleware/auth";

const router = express.Router();

// GET check username availability
router.get("/username/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    res.json({ available: !user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST Register a new user
router.post(
  "/register",
  checkInvitationCode,
  checkUniqueUsername,
  async (req, res) => {
    const { username, password, role, invitationCode } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ username, password: hashedPassword, role });
      const newUser = await user.save();
      // If invitation mode is enabled, decrement the remaining uses of the invitation code
      if (INVITATION_MODE) {
        const invitation = await Invitation.findOne({ code: invitationCode });
        if (invitation && invitation.remainingUses > 0) {
          invitation.remainingUses -= 1;
          await invitation.save();
        }
      }
      // Automatically log in the user after registration
      const token = jwt.sign(
        { id: newUser._id, role: newUser.role },
        process.env.JWT_SECRET ?? "defaultSecret",
        {
          expiresIn: "1h"
        }
      );
      res.status(201).json({ token, user: newUser });
    } catch (err: any) {
      console.log(err);
      res.status(400).json({ message: err.message });
    }
  }
);

// Login a user
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ message: "User not found" });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET ?? "defaultSecret",
    {
      expiresIn: "3d"
    }
  );
  res.json({ token, user: { username: user.username, role: user.role } });
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

// PUT update current user's username
router.put(
  "/me/username",
  auth,
  checkUniqueUsername,
  async (req: Request, res: Response) => {
    try {
      const user = await User.findById((req.user as any).id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      user.username = req.body.username;
      await user.save();
      res.json(user);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;

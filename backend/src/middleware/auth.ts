import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user";
import Invitation from "../models/invitation";

dotenv.config();
export const INVITATION_MODE = process.env.INVITATION_MODE === "true";

// Middleware to authenticate user
export const auth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res
      .status(500)
      .json({ message: "Internal server error: JWT secret not set" });
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

// Middleware to check if user is logged in
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.header("Authorization");

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "");
      req.user = decoded;
    } catch (err) {
      return res.status(401).json({ message: "Token is not valid" });
    }
  }

  next();
};

// Middleware to check if username is unique
export const checkUniqueUsername = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
    next();
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Middleware to check if invitation code is valid
export const checkInvitationCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!INVITATION_MODE) {
    return next();
  }
  const invitationCode = req.body.invitationCode;
  if (!invitationCode) {
    return res.status(400).json({ message: "Invitation code is required" });
  }
  try {
    const invitation = await Invitation.findOne({ code: invitationCode });
    if (!invitation) {
      return res.status(400).json({ message: "Invalid invitation code" });
    }
    if (invitation.remainingUses === 0) {
      return res.status(400).json({ message: "Invitation code has expired" });
    }
    req.body.invitation = invitation;
    next();
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

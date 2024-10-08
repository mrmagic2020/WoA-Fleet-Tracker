import express from "express";
import jwt from "jsonwebtoken";
import AircraftGroup from "../models/aircraftGroup";
import User from "../models/user";
import { AircraftGroupVisibility } from "@mrmagic2020/shared/dist/enums";
import { optionalAuth } from "../middleware/auth";

const router = express.Router();

// GET a shared group by id
router.get("/:user/:groupId", optionalAuth, async (req, res) => {
  const { user, groupId } = req.params;

  try {
    const foundGroup = await AircraftGroup.findById(groupId).populate(
      "aircrafts"
    );
    if (!foundGroup) {
      return res.status(404).json({ message: "Group not found" });
    }

    const groupOwner = await User.findById(foundGroup.owner);
    const groupOwnerName = groupOwner?.username;

    if (user !== groupOwnerName) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (foundGroup.visibility === AircraftGroupVisibility.Private) {
      if (!req.user || groupOwnerName !== user) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    if (foundGroup.visibility === AircraftGroupVisibility.Registered) {
      const authHeader = req.header("Authorization");
      if (!authHeader) {
        return res
          .status(401)
          .json({ message: "Only registered users can view this group." });
      }

      // Verify token
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "");
        req.user = decoded;
      } catch (err) {
        return res.status(401).json({ message: "Token is not valid" });
      }
    }

    res.status(200).json(foundGroup);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET a shared aircraft by id
router.get("/:user/:groupId/:aircraftId", optionalAuth, async (req, res) => {
  const { user, groupId, aircraftId } = req.params;

  try {
    const foundGroup = await AircraftGroup.findById(groupId).populate(
      "aircrafts"
    );
    if (!foundGroup) {
      return res.status(404).json({ message: "Group not found" });
    }

    const groupOwner = await User.findById(foundGroup.owner);
    const groupOwnerName = groupOwner?.username;
    if (foundGroup.visibility === AircraftGroupVisibility.Private) {
      if (!req.user || groupOwnerName !== user) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    if (foundGroup.visibility === AircraftGroupVisibility.Registered) {
      const authHeader = req.header("Authorization");
      if (!authHeader) {
        return res
          .status(401)
          .json({ message: "Only registered users can view this group." });
      }

      // Verify token
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "");
        req.user = decoded;
      } catch (err) {
        return res.status(401).json({ message: "Token is not valid" });
      }
    }

    const foundAircraft = foundGroup.aircrafts.find(
      (ac) => ac._id.toString() === aircraftId
    );
    if (!foundAircraft) {
      return res.status(404).json({ message: "Aircraft not found" });
    }

    res.status(200).json(foundAircraft);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

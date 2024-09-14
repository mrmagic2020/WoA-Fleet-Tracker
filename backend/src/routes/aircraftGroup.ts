import express from "express";
import Aircraft from "../models/aircraft";
import AircraftGroup from "../models/aircraftGroup";
import { auth } from "../middleware/auth";
import { Limits } from "@mrmagic2020/shared/dist/constants";

const router = express.Router();

// POST a new aircraft group (protected route)
router.post("/", auth, async (req, res) => {
  const { name, description, colour, visibility, aicrafts } = req.body;
  const newGroup = new AircraftGroup({
    name,
    description,
    colour,
    visibility,
    aicrafts,
    owner: req.user.id
  });

  try {
    const groupCount = await AircraftGroup.countDocuments({
      owner: req.user.id
    });
    if (groupCount >= Limits.MaxAircraftGroups) {
      return res.status(400).json({
        message: `Aircraft group limit reached. Maximum ${Limits.MaxAircraftGroups} groups allowed`
      });
    }
    const savedGroup = await newGroup.save();
    res.status(201).json(savedGroup);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// GET all aircraft groups (protected route)
router.get("/", auth, async (req, res) => {
  try {
    const groups = await AircraftGroup.find({
      owner: req.user.id
    });
    res.status(200).json(groups);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// GET a single aircraft group (protected route)
router.get("/:id", auth, async (req, res) => {
  try {
    const group = await AircraftGroup.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    res.status(200).json(group);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update an aircraft group (protected route)
router.put("/:id", auth, async (req, res) => {
  try {
    const group = await AircraftGroup.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    if (group.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    group.set(req.body);
    await group.save();
    res.status(200).json(group);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE an aircraft group (protected route)
router.delete("/:id", auth, async (req, res) => {
  try {
    const group = await AircraftGroup.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    if (group.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await group.deleteOne();
    // Remove group from all aircrafts
    await Aircraft.updateMany(
      { aircraftGroup: req.params.id },
      { $unset: { aircraftGroup: "" } }
    );
    res.json({ message: "Deleted Group" });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

export default router;

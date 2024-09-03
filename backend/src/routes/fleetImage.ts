import express, { Request, Response } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "../middleware/auth";
import path from "path";
import fs from "fs";
import Aircraft from "../models/aircraft";

const router = express.Router();
// router.use(auth);

// Set up storage engine
const storage = multer.diskStorage({
  destination: "./uploads/aircraft_images",
  filename: function (req, file, cb) {
    cb(
      null,
      `${req.params.aircraftId}-${Date.now()}${path.extname(file.originalname)}`
    );
  }
});

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).single("image");

// Check file type
function checkFileType(
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif|webp|svg|heic/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Images Only!"));
  }
}

function getPublicId(aircraftId: string) {
  return `aircraft_images/${aircraftId}`;
}

// POST aircraft image
router.post("/:aircraftId", auth, async (req: Request, res: Response) => {
  const aircraftId = req.params.aircraftId;
  // Check existing aicraft image
  const aircraft = await Aircraft.findById(aircraftId);
  if (!aircraft) {
    return res.status(404).json({ message: "Aircraft not found" });
  }
  const oldImageURL = aircraft.imageURL;
  upload(req, res, async (err: any) => {
    if (err) {
      res.status(400).json({ message: err.message });
    } else {
      if (req.file === undefined) {
        res.status(400).json({ message: "No file selected" });
      } else {
        res.json({
          message: "Image uploaded successfully",
          file: req.file
        });
        if (oldImageURL) {
          await cloudinary.uploader.destroy(getPublicId(aircraftId));
        }
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "aircraft_images",
          public_id: `${aircraftId}`
        });
        const newImageURL = result.secure_url;
        aircraft.imageURL = newImageURL;
        await aircraft.save();
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error("Error deleting image:", err);
          }
        }); // Delete image from uploads folder
      }
    }
  });
});

// GET aircraft image
router.get("/:aircraftId", async (req: Request, res: Response) => {
  const aircraftId = req.params.aircraftId;
  const aircraft = await Aircraft.findById(aircraftId);
  if (!aircraft) {
    return res.status(404).json({ message: "Aircraft not found" });
  }
  const imageURL = aircraft.imageURL;
  if (!imageURL) {
    return res.status(404).json({ message: "Image not found" });
  }
  res.json({ imageURL });
});

// DELETE aircraft image
router.delete("/:aircraftId", auth, async (req: Request, res: Response) => {
  const aircraftId = req.params.aircraftId;
  const aircraft = await Aircraft.findById(aircraftId);
  if (!aircraft) {
    return res.status(404).json({ message: "Aircraft not found" });
  }
  const imageURL = aircraft.imageURL;
  if (!imageURL) {
    return res.status(404).json({ message: "Image not found" });
  }
  await cloudinary.uploader.destroy(getPublicId(aircraftId));
  aircraft.imageURL = undefined;
  await aircraft.save();
  res.json({ message: "Image deleted successfully" });
});

export default router;

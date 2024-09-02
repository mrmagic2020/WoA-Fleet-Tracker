import express, { Request, Response } from "express";
import multer from "multer";
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
        const newImageURL = req.file.path;
        aircraft.imageURL = newImageURL;
        await aircraft.save();
        if (oldImageURL) {
          fs.unlink(oldImageURL, (err) => {
            if (err) {
              console.error("Error deleting old image:", err);
            }
          });
        }
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
  const filePath = path.join(__dirname, "../../", imageURL);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ message: "Image not found" });
  }
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
  fs.unlink(imageURL, async (err) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    aircraft.imageURL = undefined;
    await aircraft.save();
    res.json({ message: "Image deleted successfully" });
  });
});

export default router;

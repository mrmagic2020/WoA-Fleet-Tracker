import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import aircraftRoutes from "./routes/aircraft";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import invitationRoutes from "./routes/invitation";
import { auth } from "./middleware/auth";

dotenv.config();

const app = express();
const port = process.env.PORT || 6060; // Backend port

app.use(cors());
app.use(express.json());

// MongoDB connection
const uri: string = process.env.MONGODB_URI || "";
mongoose
  .connect(uri, {})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/aircraft", auth, aircraftRoutes);
app.use("/api/admin", auth, adminRoutes);
app.use("/api/invitation", auth, invitationRoutes);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../client")));

// The "catchall" handler: for any request that doesn't match one above, send back index.html
app.get("*", (req, res) => {
  console.log("catchall");
  res.sendFile(path.join(__dirname, "/../client/index.html"), (err) => {
    if (err) {
      res.status(500).send(err);
    }
  });
});

// Basic route for testing
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

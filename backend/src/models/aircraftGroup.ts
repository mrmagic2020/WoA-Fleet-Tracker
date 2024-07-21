import mongoose, { Schema } from "mongoose";
import { AircraftGroupVisibility } from "@mrmagic2020/shared/dist/enums";
import { IAircraftGroup } from "@mrmagic2020/shared/dist/interfaces";

const aircraftGroupSchema: Schema = new Schema({
  owner: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  description: { type: String },
  colour: { type: String, required: true },
  visibility: {
    type: String,
    enum: Object.values(AircraftGroupVisibility),
    required: true
  },
  aircrafts: [{ type: mongoose.Types.ObjectId, ref: "Aircraft" }]
});

export default mongoose.model<IAircraftGroup>(
  "AircraftGroup",
  aircraftGroupSchema
);

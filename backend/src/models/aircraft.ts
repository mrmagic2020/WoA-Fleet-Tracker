import mongoose, { Schema } from "mongoose";
import {
  AircraftSize,
  AircraftStatus,
  AircraftType,
  AirportCode,
  ContractType
} from "@mrmagic2020/shared/dist/enums";
import { IAircraft } from "@mrmagic2020/shared/dist/interfaces";

const aircraftSchema: Schema = new Schema({
  user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  ac_model: { type: String, required: true },
  size: { type: String, enum: Object.values(AircraftSize), required: true },
  type: { type: String, enum: Object.values(AircraftType), required: true },
  registration: { type: String, required: true },
  configuration: {
    e: { type: Number, required: true },
    b: { type: Number, required: true },
    f: { type: Number, required: true },
    cargo: { type: Number, required: true }
  },
  airport: { type: String, enum: Object.values(AirportCode), required: true },
  status: { type: String, enum: Object.values(AircraftStatus), required: true },
  totalProfits: { type: Number, required: true },
  contracts: [
    {
      contractType: {
        type: String,
        enum: Object.values(ContractType),
        required: true
      },
      player: { type: String },
      destination: { type: String, required: true },
      profits: { type: [Number], required: true },
      progress: { type: Number, required: true },
      finished: { type: Boolean, required: true },
      lastHandled: { type: Date, required: true }
    }
  ],
  aircraftGroup: { type: mongoose.Types.ObjectId, ref: "AircraftGroup" },
  imageURL: { type: String, required: false }
});

export default mongoose.model<IAircraft>("Aircraft", aircraftSchema);

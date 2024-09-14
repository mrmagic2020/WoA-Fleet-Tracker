import {
  AircraftGroupVisibility,
  AircraftSize,
  AircraftStatus,
  AirportCode,
  ContractType
} from "./enums";
import { Types, Document } from "mongoose";

export interface IAircraftConfiguration {
  e: number;
  b: number;
  f: number;
  cargo: number;
}

export interface IAircraftContract extends Document {
  contractType: ContractType;
  player?: string;
  destination: string;
  profits: number[];
  progress: number;
  finished: boolean;
  lastHandled: Date;
  _id: string;
}

export interface IAircraft extends Document {
  user: Types.ObjectId;
  ac_model: string;
  size: AircraftSize;
  type: string;
  registration: string;
  configuration: IAircraftConfiguration;
  airport: AirportCode;
  status: AircraftStatus;
  totalProfits: number;
  contracts: IAircraftContract[];
  aircraftGroup?: Types.ObjectId;
  imageURL?: string;
  _id: string;
}

export interface IPopulatedAircraft extends Omit<IAircraft, "aircraftGroup"> {
  aircraftGroup: IAircraftGroup;
}

export interface IAircraftGroup extends Document {
  owner: Types.ObjectId;
  name: string;
  description: string;
  colour: string;
  visibility: AircraftGroupVisibility;
  aircrafts: Types.ObjectId[];
  _id: string;
}

export interface IPopulatedAircraftGroup
  extends Omit<IAircraftGroup, "aircrafts"> {
  aircrafts: IAircraft[];
}

import { AircraftSize, AircraftStatus, AirportCode, ContractType } from "./enums";

export interface IAircraftConfiguration {
  e: number;
  b: number;
  f: number;
  cargo: number;
}

export interface IAircraftContract {
  contractType: ContractType;
  player?: string;
  destination: string;
  profits: number[];
  progress: number;
  finished: boolean;
  _id: string;
}

export interface IAircraft {
  ac_model: string;
  size: AircraftSize;
  type: string;
  registration: string;
  configuration: IAircraftConfiguration;
  airport: AirportCode;
  status: AircraftStatus;
  contracts: IAircraftContract[];
}

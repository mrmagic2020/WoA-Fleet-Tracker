import aircraftData from "./assets/aircraft_data.json";

export interface IJSONAircraftType {
  Aircraft: string;
  Size: string;
  Type: string;
}

export const aircraftTypes: IJSONAircraftType[] = aircraftData.filter(
  (aircraft: IJSONAircraftType) => aircraft.Aircraft !== "Aircraft"
).sort((a: IJSONAircraftType, b: IJSONAircraftType) => a.Aircraft.localeCompare(b.Aircraft));

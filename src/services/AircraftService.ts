import api from "./api";
import { IAircraft } from "@mrmagic2020/shared/dist/interfaces";

export enum SortBy {
  None = "none",
  Registration = "registration",
  Status = "status",
  Airport = "airport",
  Type = "type",
  Size = "size",
  TotalProfits = "total profits"
}

export const getAircraft = async (sortBy: SortBy = SortBy.None) => {
  const response = await api.get("/aircraft");
  switch (sortBy) {
    case SortBy.Registration:
      response.data.sort((a: IAircraft, b: IAircraft) =>
        a.registration.localeCompare(b.registration)
      );
      break;
    case SortBy.Status:
      response.data.sort((a: IAircraft, b: IAircraft) =>
        a.status.localeCompare(b.status)
      );
      break;
    case SortBy.Airport:
      response.data.sort((a: IAircraft, b: IAircraft) =>
        a.airport.localeCompare(b.airport)
      );
      break;
    case SortBy.Type:
      response.data.sort((a: IAircraft, b: IAircraft) =>
        a.type.localeCompare(b.type)
      );
      break;
    case SortBy.Size:
      response.data.sort((a: IAircraft, b: IAircraft) => {
        const sizeOrder = ["S", "M", "L", "X"];
        return sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size);
      });
      break;
    case SortBy.TotalProfits:
      response.data.sort(
        (a: IAircraft, b: IAircraft) => a.totalProfits - b.totalProfits
      );
      break;
    default:
      break;
  }
  return response.data as IAircraft[];
};

export const getAircraftById = async (id: string) => {
  const response = await api.get(`/aircraft/${id}`);
  return response.data as IAircraft;
};

export const createAircraft = async (aircraft: any) => {
  try {
    const response = await api.post("/aircraft", aircraft);
    if (response.status === 201) {
      return response.data as IAircraft;
    }
    throw new Error(`Unexpected response status: ${response.status}`);
  } catch (error: any) {
    // Check if the error response exists and contains a message
    if (error.response) {
      throw new Error(error.response.data.message || error.message);
    }
    throw error;
  }
};

export const deleteAircraft = async (id: string) => {
  const response = await api.delete(`/aircraft/${id}`);
  return response.data;
};

export const createContract = async (aircraftId: string, contract: any) => {
  const response = await api.post(
    `/aircraft/${aircraftId}/contracts`,
    contract
  );
  if (response.status === 201) {
    return response.data as IAircraft;
  }
  return response.status;
};

export const deleteContract = async (
  aircraftId: string,
  contractId: string
) => {
  const response = await api.delete(
    `/aircraft/${aircraftId}/contracts/${contractId}`
  );
  return response.data as IAircraft;
};

export const logProfit = async (
  aircraftId: string,
  contractId: string,
  profit: number
) => {
  const response = await api.post(
    `/aircraft/${aircraftId}/contracts/${contractId}/profits`,
    { profit }
  );
  if (response.status === 201) {
    return response.data as IAircraft;
  }
  return null;
};

export const finishContract = async (
  aircraftId: string,
  contractId: string
) => {
  const response = await api.put(
    `/aircraft/${aircraftId}/contracts/${contractId}/finish`
  );
  if (response.status === 201) {
    return response.data as IAircraft;
  }
  return null;
};

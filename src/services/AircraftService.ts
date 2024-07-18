import api from "./api";
import { IAircraft } from "shared/src/interfaces";

export const getAircraft = async () => {
  const response = await api.get("/aircraft");
  return response.data as IAircraft[];
};

export const getAircraftById = async (id: string) => {
  const response = await api.get(`/aircraft/${id}`);
  return response.data as IAircraft;
};

export const createAircraft = async (aircraft: any) => {
  const response = await api.post("/aircraft", aircraft);
  if (response.status === 201) {
    return response.data as IAircraft;
  }
  return null;
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
  return null;
};

export const deleteContract = async (aircraftId: string, contractId: string) => {
  const response = await api.delete(
    `/aircraft/${aircraftId}/contracts/${contractId}`
  );
  return response.data as IAircraft;
}

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

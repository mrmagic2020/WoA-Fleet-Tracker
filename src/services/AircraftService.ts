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

export enum SortMode {
  Ascending,
  Descending
}

export enum FilterBy {
  None = "none",
  Model = "model",
  Size = "size",
  Type = "type",
  Registration = "registration",
  Airport = "airport",
  Destination = "destination",
  Status = "status"
}

export const getAircraft = async (
  sortBy: SortBy = SortBy.None,
  sortMode: SortMode = SortMode.Ascending,
  filterBy: FilterBy = FilterBy.None,
  filterValue: string = ""
) => {
  const response = await api.get("/aircraft");
  switch (filterBy) {
    case FilterBy.Model:
      response.data = response.data.filter((aircraft: IAircraft) =>
        aircraft.ac_model.toLowerCase().includes(filterValue.toLowerCase())
      );
      break;
    case FilterBy.Size:
      response.data = response.data.filter(
        (aircraft: IAircraft) => aircraft.size === filterValue
      );
      break;
    case FilterBy.Type:
      response.data = response.data.filter((aircraft: IAircraft) =>
        aircraft.type.toLowerCase().includes(filterValue.toLowerCase())
      );
      break;
    case FilterBy.Registration:
      response.data = response.data.filter((aircraft: IAircraft) =>
        aircraft.registration.toLowerCase().includes(filterValue.toLowerCase())
      );
      break;
    case FilterBy.Airport:
      response.data = response.data.filter(
        (aircraft: IAircraft) => aircraft.airport === filterValue
      );
      break;
    case FilterBy.Destination:
      response.data = response.data.filter((aircraft: IAircraft) =>
        aircraft.contracts.some((contract) =>
          contract.destination.toLowerCase().includes(filterValue.toLowerCase())
        )
      );
      break;
    case FilterBy.Status:
      response.data = response.data.filter((aircraft: IAircraft) =>
        aircraft.status.toLowerCase().includes(filterValue.toLowerCase())
      );
      break;
    default:
      break;
  }
  switch (sortBy) {
    case SortBy.Registration:
      response.data.sort((a: IAircraft, b: IAircraft) => {
        if (sortMode === SortMode.Ascending) {
          return a.registration.localeCompare(b.registration);
        }
        return b.registration.localeCompare(a.registration);
      });
      break;
    case SortBy.Status:
      response.data.sort((a: IAircraft, b: IAircraft) => {
        if (sortMode === SortMode.Ascending) {
          return a.status.localeCompare(b.status);
        }
        return b.status.localeCompare(a.status);
      });
      break;
    case SortBy.Airport:
      response.data.sort((a: IAircraft, b: IAircraft) => {
        if (sortMode === SortMode.Ascending) {
          return a.airport.localeCompare(b.airport);
        }
        return b.airport.localeCompare(a.airport);
      });
      break;
    case SortBy.Type:
      response.data.sort((a: IAircraft, b: IAircraft) => {
        if (sortMode === SortMode.Ascending) {
          return a.type.localeCompare(b.type);
        }
        return b.type.localeCompare(a.type);
      });
      break;
    case SortBy.Size:
      response.data.sort((a: IAircraft, b: IAircraft) => {
        const sizeOrder = ["S", "M", "L", "X"];
        if (sortMode === SortMode.Ascending) {
          return sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size);
        }
        return sizeOrder.indexOf(b.size) - sizeOrder.indexOf(a.size);
      });
      break;
    case SortBy.TotalProfits:
      response.data.sort((a: IAircraft, b: IAircraft) => {
        if (sortMode === SortMode.Ascending) {
          return a.totalProfits - b.totalProfits;
        }
        return b.totalProfits - a.totalProfits;
      });
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

export const sellAircraft = async (id: string) => {
  const response = await api.put(`/aircraft/${id}/sell`);
  return response.data as IAircraft;
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

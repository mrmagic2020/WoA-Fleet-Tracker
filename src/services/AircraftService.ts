import api from "./api";
import { getSharedAircraftGroup } from "./AircraftGroupService";
import { IAircraft } from "@mrmagic2020/shared/dist/interfaces";

export enum SortBy {
  None = "none",
  Registration = "registration",
  Status = "status",
  Airport = "airport",
  Type = "type",
  Size = "size",
  TotalProfits = "total profits",
  CurrentMeanProfit = "current mean profit",
  LastHandledDate = "last handled date"
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
  Status = "status",
  ContractType = "active contract type",
  ContractPlayer = "active contract player"
}

const sortAndFilterAircraft = (
  aircrafts: IAircraft[],
  sortBy: SortBy,
  sortMode: SortMode,
  filterBy: FilterBy,
  filterValue: string
) => {
  switch (filterBy) {
    case FilterBy.Model:
      aircrafts = aircrafts.filter((aircraft: IAircraft) =>
        aircraft.ac_model.toLowerCase().includes(filterValue.toLowerCase())
      );
      break;
    case FilterBy.Size:
      aircrafts = aircrafts.filter(
        (aircraft: IAircraft) => aircraft.size === filterValue
      );
      break;
    case FilterBy.Type:
      aircrafts = aircrafts.filter((aircraft: IAircraft) =>
        aircraft.type.toLowerCase().includes(filterValue.toLowerCase())
      );
      break;
    case FilterBy.Registration:
      aircrafts = aircrafts.filter((aircraft: IAircraft) =>
        aircraft.registration.toLowerCase().includes(filterValue.toLowerCase())
      );
      break;
    case FilterBy.Airport:
      aircrafts = aircrafts.filter(
        (aircraft: IAircraft) => aircraft.airport === filterValue
      );
      break;
    case FilterBy.Destination:
      aircrafts = aircrafts.filter((aircraft: IAircraft) =>
        aircraft.contracts.some((contract) =>
          contract.destination.toLowerCase().includes(filterValue.toLowerCase())
        )
      );
      break;
    case FilterBy.Status:
      aircrafts = aircrafts.filter((aircraft: IAircraft) =>
        aircraft.status.toLowerCase().includes(filterValue.toLowerCase())
      );
      break;
    case FilterBy.ContractType:
      aircrafts = aircrafts.filter((aircraft: IAircraft) =>
        aircraft.contracts.some((contract) =>
          contract.contractType
            .toLowerCase()
            .includes(filterValue.toLowerCase())
        )
      );
      break;
    case FilterBy.ContractPlayer:
      aircrafts = aircrafts.filter((aircraft: IAircraft) =>
        aircraft.contracts.some((contract) => {
          if (contract.player) {
            return contract.player
              .toLowerCase()
              .includes(filterValue.toLowerCase());
          }
          return false;
        })
      );
      break;
    default:
      break;
  }
  switch (sortBy) {
    case SortBy.Registration:
      aircrafts.sort((a: IAircraft, b: IAircraft) => {
        if (sortMode === SortMode.Ascending) {
          return a.registration.localeCompare(b.registration);
        }
        return b.registration.localeCompare(a.registration);
      });
      break;
    case SortBy.Status:
      aircrafts.sort((a: IAircraft, b: IAircraft) => {
        if (sortMode === SortMode.Ascending) {
          return a.status.localeCompare(b.status);
        }
        return b.status.localeCompare(a.status);
      });
      break;
    case SortBy.Airport:
      aircrafts.sort((a: IAircraft, b: IAircraft) => {
        if (sortMode === SortMode.Ascending) {
          return a.airport.localeCompare(b.airport);
        }
        return b.airport.localeCompare(a.airport);
      });
      break;
    case SortBy.Type:
      aircrafts.sort((a: IAircraft, b: IAircraft) => {
        if (sortMode === SortMode.Ascending) {
          return a.type.localeCompare(b.type);
        }
        return b.type.localeCompare(a.type);
      });
      break;
    case SortBy.Size:
      aircrafts.sort((a: IAircraft, b: IAircraft) => {
        const sizeOrder = ["S", "M", "L", "X"];
        if (sortMode === SortMode.Ascending) {
          return sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size);
        }
        return sizeOrder.indexOf(b.size) - sizeOrder.indexOf(a.size);
      });
      break;
    case SortBy.TotalProfits:
      aircrafts.sort((a: IAircraft, b: IAircraft) => {
        if (sortMode === SortMode.Ascending) {
          return a.totalProfits - b.totalProfits;
        }
        return b.totalProfits - a.totalProfits;
      });
      break;
    case SortBy.CurrentMeanProfit:
      aircrafts.sort((a: IAircraft, b: IAircraft) => {
        if (!a.contracts[0] || !a.contracts[0].profits.length) return 1;
        if (!b.contracts[0] || !b.contracts[0].profits.length) return -1;
        const aMeanProfit =
          a.contracts[0]?.profits.reduce((acc, profit) => acc + profit, 0) /
          a.contracts[0]?.profits.length;
        const bMeanProfit =
          b.contracts[0]?.profits.reduce((acc, profit) => acc + profit, 0) /
          b.contracts[0]?.profits.length;
        if (sortMode === SortMode.Ascending) {
          return aMeanProfit - bMeanProfit;
        }
        return bMeanProfit - aMeanProfit;
      });
      break;
    case SortBy.LastHandledDate:
      aircrafts.sort((a: IAircraft, b: IAircraft) => {
        if (!a.contracts[0] || !a.contracts[0].lastHandled) return 1;
        if (!b.contracts[0] || !b.contracts[0].lastHandled) return -1;
        if (sortMode === SortMode.Ascending) {
          return (
            new Date(a.contracts[0].lastHandled).getTime() -
            new Date(b.contracts[0].lastHandled).getTime()
          );
        }
        return (
          new Date(b.contracts[0].lastHandled).getTime() -
          new Date(a.contracts[0].lastHandled).getTime()
        );
      });
      break;
    default:
      break;
  }
  return aircrafts;
};

export const getAircraft = async (
  sortBy: SortBy = SortBy.None,
  sortMode: SortMode = SortMode.Ascending,
  filterBy: FilterBy = FilterBy.None,
  filterValue: string = ""
) => {
  const response = await api.get("/aircraft");
  const aircrafts = response.data as IAircraft[];
  const processedAircrafts = sortAndFilterAircraft(
    aircrafts,
    sortBy,
    sortMode,
    filterBy,
    filterValue
  );
  return processedAircrafts;
};

export const getAircraftsByGroup = async (
  user: string,
  groupId: string,
  sortBy: SortBy = SortBy.None,
  sortMode: SortMode = SortMode.Ascending,
  filterBy: FilterBy = FilterBy.None,
  filterValue: string = ""
) => {
  try {
    const group = await getSharedAircraftGroup(user, groupId);
    const aircrafts = group.aircrafts; // Since the group is populated
    const processedAircrafts = sortAndFilterAircraft(
      aircrafts,
      sortBy,
      sortMode,
      filterBy,
      filterValue
    );
    return processedAircrafts;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || error.message);
    }
    throw error;
  }
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

export const updateAircraft = async (
  id: string,
  aircraft: Partial<IAircraft>
) => {
  const response = await api.put(`/aircraft/${id}`, aircraft);
  return response.data as IAircraft;
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

export const logPastProfits = async (
  aircraftId: string,
  contractId: string,
  handles: number,
  profit: number,
  overwrite: boolean
) => {
  const response = await api.post(
    `/aircraft/${aircraftId}/contracts/${contractId}/profits/past`,
    { handles, profit, overwrite }
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

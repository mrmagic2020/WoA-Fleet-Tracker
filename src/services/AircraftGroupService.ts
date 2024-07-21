import api from "./api";
import { IAircraftGroup } from "@mrmagic2020/shared/dist/interfaces";

export const getAircraftGroups = async (): Promise<IAircraftGroup[]> => {
  const response = await api.get("/aircraftGroup");
  return response.data;
};

export const getAircraftGroupById = async (
  id: string
): Promise<IAircraftGroup> => {
  const response = await api.get(`/aircraftGroup/${id}`);
  return response.data;
};

export const createAircraftGroup = async (
  group: Partial<IAircraftGroup>
): Promise<IAircraftGroup> => {
  try {
    const response = await api.post("/aircraftGroup", group);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || error.message);
    }
    throw error;
  }
};

export const updateAircraftGroup = async (
  id: string,
  group: Partial<IAircraftGroup>
): Promise<IAircraftGroup> => {
  const response = await api.put(`/aircraftGroup/${id}`, group);
  return response.data;
};

export const deleteAircraftGroup = async (id: string): Promise<void> => {
  await api.delete(`/aircraftGroup/${id}`);
};

/**
 * @important **The group returned has `aircrafts` populated.**
 * @param user 
 * @param groupId 
 * @returns 
 */
export const getSharedAircraftGroup = async (user: string, groupId: string) => {
  const response = await api.get<IAircraftGroup>(
    `/sharedGroups/${user}/${groupId}`
  );
  return response.data;
};

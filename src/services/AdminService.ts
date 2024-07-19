import api from "./api";

export const getUsers = async () => {
  try {
    const response = await api.get("/admin/users", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const deleteUser = async (id: string) => {
  try {
    const response = await api.delete(`/admin/users/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export const getAllInvitations = async () => {
  try {
    const response = await api.get("/invitation", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching invitations:", error);
    throw error;
  }
};

export const createInvitation = async (code: string, remainingUses: number) => {
  try {
    const response = await api.post(
      "/invitation",
      { code, remainingUses },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating invitation:", error);
    throw error;
  }
};

export const deleteInvitation = async (id: string) => {
  try {
    const response = await api.delete(`/invitation/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting invitation:", error);
    throw error;
  }
};

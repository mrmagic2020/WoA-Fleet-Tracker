import api from "./api";

const uploadImage = async (image: File, aircraftId: string) => {
  const formData = new FormData();
  formData.append("image", image);

  const response = await api.post(`/fleetImage/${aircraftId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return response.data;
};

const fetchImage = async (aircraftId: string) => {
  const response = await api.get(`/fleetImage/${aircraftId}`);
  return response.data.imageURL;
};

const deleteImage = async (aircraftId: string) => {
  const response = await api.delete(`/fleetImage/${aircraftId}`);
  return response.data;
};

export { uploadImage, fetchImage, deleteImage };

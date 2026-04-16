import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000",
});

// --------------------
// GET all apps
// --------------------
export const getApps = async () => {
  const res = await API.get("/apps");
  return res.data;
};

// --------------------
// CREATE app
// --------------------
export const createAppApi = async (data: any) => {
  const res = await API.post("/apps", data);
  return res.data;
};

// --------------------
// ADD version
// --------------------
export const addVersionApi = async (id: string, data: any) => {
  const res = await API.post(`/apps/${id}/versions`, data);
  return res.data;
};

// --------------------
// UPDATE version (MISSING BEFORE ❌ NOW FIXED ✅)
// --------------------
export const updateVersionApi = async (
  id: string,
  index: number,
  data: any,
) => {
  const res = await API.patch(`/apps/${id}/versions/${index}`, data);
  return res.data;
};

// --------------------
// DELETE app
// --------------------
export const deleteAppApi = async (id: string) => {
  const res = await API.delete(`/apps/${id}`);
  return res.data;
};
// --------------------
// DELETE version
// --------------------
export const deleteVersionApi = async (id: string, index: number) => {
  const res = await API.delete(`/apps/${id}/versions/${index}`);
  return res.data;
};

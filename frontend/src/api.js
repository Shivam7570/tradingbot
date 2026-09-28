import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const getStatus = () => axios.get(`${API_BASE}/status`).then((r) => r.data);
export const startBot = () => axios.post(`${API_BASE}/start`).then((r) => r.data);
export const stopBot = () => axios.post(`${API_BASE}/stop`).then((r) => r.data);
export const updateConfig = (config) =>
  axios.put(`${API_BASE}/config`, config).then((r) => r.data);
export const getTrades = () => axios.get(`${API_BASE}/trades`).then((r) => r.data);
export const getMarketData = () => axios.get(`${API_BASE}/market`).then((r) => r.data);


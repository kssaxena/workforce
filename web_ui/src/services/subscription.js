import api from "./api";

export const getAvailablePlans = () => api.get("/subscription/plans");

export const getCurrentSubscription = () => api.get("/subscription/current");

import { apiRequest, clearAuthStorage, setAccessToken } from "./api";

export const login = async ({ email, password }) => {
  const result = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = result?.data;

  if (!data?.accessToken) {
    throw new Error("Login response did not contain an access token");
  }

  setAccessToken(data.accessToken);

  /*
   * Immediately load the real backend identity.
   */
  const me = await getCurrentUser();

  localStorage.setItem("authUser", JSON.stringify(me));

  localStorage.setItem("companyId", data.companyId || me.company?._id || "");

  return me;
};

export const getCurrentUser = async () => {
  const result = await apiRequest("/auth/me", {
    method: "GET",
  });

  return result?.data;
};

export const logout = () => {
  /*
   * Server-side session revocation will be added
   * with the logout endpoint.
   */
  clearAuthStorage();
};

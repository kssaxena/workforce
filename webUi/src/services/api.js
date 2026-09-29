const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const ACCESS_TOKEN_KEY = "accessToken";

export const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const setAccessToken = (token) => {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
};

export const clearAuthStorage = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("authUser");
  localStorage.removeItem("companyId");
  localStorage.removeItem("role");
  localStorage.removeItem("activeSection");
};

const refreshAccessToken = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || "Session expired");
  }

  const token = result?.data?.accessToken;

  if (!token) {
    throw new Error("Unable to refresh session");
  }

  setAccessToken(token);

  return token;
};

export const apiRequest = async (path, options = {}, retry = true) => {
  const token = getAccessToken();

  const headers = new Headers(options.headers || {});

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  /*
   * Access token expired.
   * Try refreshing it once.
   */
  if (response.status === 401 && retry && path !== "/auth/refresh") {
    try {
      await refreshAccessToken();

      return apiRequest(path, options, false);
    } catch (error) {
      clearAuthStorage();

      throw error;
    }
  }

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || "Request failed");
  }

  return result;
};

/*
 * Compatibility API
 *
 * Your existing components can continue using:
 *
 * api.get(...)
 * api.post(...)
 * api.patch(...)
 * api.delete(...)
 */
export const api = {
  get: (path, options = {}) =>
    apiRequest(path, {
      ...options,
      method: "GET",
    }),

  post: (path, body, options = {}) =>
    apiRequest(path, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: (path, body, options = {}) =>
    apiRequest(path, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: (path, body, options = {}) =>
    apiRequest(path, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: (path, options = {}) =>
    apiRequest(path, {
      ...options,
      method: "DELETE",
    }),
};

export { API_BASE_URL, refreshAccessToken };

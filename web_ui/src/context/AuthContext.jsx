import { createContext, useCallback, useEffect, useState } from "react";

import {
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  refreshSession,
} from "../services/auth";

import api, { getAccessToken, setAccessToken } from "../services/api";

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    company: null,
    employee: null,
    roles: [],
    roleCodes: [],
    permissions: [],
  });

  const [loading, setLoading] = useState(true);

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const applyAuthData = useCallback((data) => {
    if (!data) return;

    if (data.accessToken) {
      setAccessToken(data.accessToken);
    }

    setAuth({
      user: data.user || null,

      company: data.company || null,

      employee: data.employee || null,

      roles: data.roles || [],

      roleCodes: data.roleCodes || [],

      permissions: data.permissions || [],
    });

    setIsAuthenticated(true);
  }, []);

  const clearAuth = useCallback(() => {
    setAccessToken(null);

    setAuth({
      user: null,
      company: null,
      employee: null,
      roles: [],
      roleCodes: [],
      permissions: [],
    });

    setIsAuthenticated(false);
  }, []);

  const login = useCallback(
    async ({ email, password, portal, companyId }) => {
      const response = await loginRequest({
        email,
        password,
        portal,
        companyId,
      });

      const authData = response.data.data;

      applyAuthData(authData);

      return authData;
    },
    [applyAuthData],
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  useEffect(() => {
    const initialize = async () => {
      try {
        let response;

        try {
          response = await getMe();
        } catch (error) {
          if (error.response?.status !== 401) {
            throw error;
          }

          response = await refreshSession();
        }

        applyAuthData(response.data.data);
      } catch {
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [applyAuthData, clearAuth]);

  const hasRole = useCallback(
    (role) => auth.roleCodes.includes(role),
    [auth.roleCodes],
  );

  const hasPermission = useCallback(
    (permission) => auth.permissions.some((item) => item.code === permission),
    [auth.permissions],
  );

  return (
    <AuthContext.Provider
      value={{
        ...auth,

        loading,

        isAuthenticated,

        login,

        logout,

        hasRole,

        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

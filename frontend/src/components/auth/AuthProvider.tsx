"use client";

import axios from "axios";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  getCurrentUser,
  logout as logoutRequest,
  type AuthResponse,
  type UserResponse,
} from "@/api/auth";
import { clearAuthSession, initializeAuthSession } from "@/api/client";
import { hasStoredSession, subscribeToAuthSession } from "@/lib/authStorage";

type AuthContextValue = {
  isAuthenticated: boolean;
  isHydrated: boolean;
  isLoadingUser: boolean;
  currentUser: UserResponse | null;
  completeAuth: (response: AuthResponse) => void;
  refreshCurrentUser: () => Promise<UserResponse | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const subscribeToHydration = () => () => {};
const getHydratedSnapshot = () => true;
const getServerHydratedSnapshot = () => false;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useSyncExternalStore(
    subscribeToAuthSession,
    hasStoredSession,
    () => false,
  );
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydratedSnapshot,
    getServerHydratedSnapshot,
  );
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const requestIdRef = useRef(0);

  const refreshCurrentUser = async () => {
    if (!hasStoredSession()) {
      setCurrentUser(null);
      return null;
    }

    const requestId = ++requestIdRef.current;
    setIsLoadingUser(true);

    try {
      const user = await getCurrentUser();

      if (requestIdRef.current === requestId) {
        setCurrentUser(user);
      }

      return user;
    } catch (error) {
      const isAuthFailure = axios.isAxiosError(error) && error.response?.status === 401;

      if (requestIdRef.current === requestId && isAuthFailure) {
        setCurrentUser(null);
      }

      if (isAuthFailure) {
        clearAuthSession();
      }

      return null;
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoadingUser(false);
      }
    }
  };

  useEffect(() => {
    initializeAuthSession();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      requestIdRef.current += 1;
      return;
    }

    queueMicrotask(() => {
      void refreshCurrentUser();
    });
  }, [isAuthenticated]);

  const value: AuthContextValue = {
    isAuthenticated,
    isHydrated,
    isLoadingUser: isAuthenticated ? isLoadingUser : false,
    currentUser: isAuthenticated ? currentUser : null,
    completeAuth: (response) => {
      requestIdRef.current += 1;
      setCurrentUser(response.user);
      setIsLoadingUser(false);
    },
    refreshCurrentUser,
    logout: async () => {
      requestIdRef.current += 1;
      setCurrentUser(null);
      setIsLoadingUser(false);
      await logoutRequest();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return value;
}

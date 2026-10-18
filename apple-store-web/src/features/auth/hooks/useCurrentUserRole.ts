import { useAuthStore } from "../store/auth.store";

/**
 * Hook to retrieve the current user's role from RAM.
 * Ensures the role cannot be tampered with via localStorage.
 */
export const useCurrentUserRole = (): string | null => {
  return useAuthStore((state) => state.user?.role || null);
};

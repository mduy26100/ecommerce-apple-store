import { useAuthStore } from "../store/auth.store";

export const useCurrentUserRole = (): string | null => {
  return useAuthStore((state) => state.user?.role || null);
};

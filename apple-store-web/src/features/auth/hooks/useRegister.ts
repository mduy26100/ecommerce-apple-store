import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../store/auth.store";
import type { RegisterRequest } from "../types/auth.types";

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: RegisterRequest) => {
      const data = await authApi.register(credentials);
      useAuthStore.getState().setAuth(data.accessToken, data.user);
      return data;
    },
    onSuccess: () => {
      message.success("Account registration and workspace creation successful!");
      navigate("/admin/dashboard");
    },
    onError: (error: any) => {
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Registration failed. Please try again.";
      message.error(errorMsg);
    },
  });
};

export default useRegister;

import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../store/auth.store";
import type { RegisterRequest } from "../types/auth.types";
import { USER_ROLES } from "@core/constants/role.constants";

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: RegisterRequest) => {
      const data = await authApi.register(credentials);
      useAuthStore.getState().setAuth(data.accessToken, data.user);
      return data;
    },
    onSuccess: (data) => {
      message.success("Đăng ký tài khoản thành công!");
      if (data?.user?.role === USER_ROLES.SUPER_ADMIN) {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    },
    onError: (error: any) => {
      const errorMsg =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Đăng ký thất bại. Vui lòng thử lại!";
      message.error(errorMsg);
    },
  });
};

export default useRegister;

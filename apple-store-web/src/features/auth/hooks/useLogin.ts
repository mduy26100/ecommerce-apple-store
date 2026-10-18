import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import type { LoginRequest } from '../types/auth.types';

export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const data = await authApi.login(credentials);
      useAuthStore.getState().setAuth(data.accessToken, data.user);
      return data;
    },
    onSuccess: () => {
      message.success('Sign in successful!');
      navigate('/admin/dashboard');
    },
    onError: (error: any) => {
      const errorMsg = error?.message || 'Sign in failed. Please try again.';
      message.error(errorMsg);
    },
  });
};

export default useLogin;

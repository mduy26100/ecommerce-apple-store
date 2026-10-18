import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

export const useLogout = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout();
      } finally {
        useAuthStore.getState().clearAuth();
      }
    },
    onSuccess: () => {
      message.success('Sign out successful.');
    },
    onSettled: () => {
      navigate('/auth/login');
    },
  });
};

export default useLogout;

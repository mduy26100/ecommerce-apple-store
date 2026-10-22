import { LoginForm, useLogin } from "@features/auth";

interface LoginPageProps {
  isAdmin?: boolean;
}

export const LoginPage = ({ isAdmin = false }: LoginPageProps) => {
  const { mutate: login, isPending, error } = useLogin();

  return (
    <LoginForm
      onSubmit={login}
      isPending={isPending}
      error={error}
      isAdmin={isAdmin}
    />
  );
};

export default LoginPage;

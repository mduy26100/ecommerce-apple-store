import { LoginForm, useLogin } from "@features/auth";

export const LoginPage = () => {
  const { mutate: login, isPending, error } = useLogin();

  return (
    <LoginForm
      onSubmit={login}
      isPending={isPending}
      error={error}
    />
  );
};

export default LoginPage;

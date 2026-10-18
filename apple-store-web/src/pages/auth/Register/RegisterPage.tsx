import { RegisterForm, useRegister } from "@features/auth";

export const RegisterPage = () => {
  const { mutate: register, isPending, error } = useRegister();

  return (
    <RegisterForm
      onSubmit={register}
      isPending={isPending}
      error={error}
    />
  );
};

export default RegisterPage;

import { useEffect } from "react";
import AppRouter from "./routes/AppRouter";
import { useAuthStore } from "@features/auth";

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return <AppRouter />;
}

export default App;

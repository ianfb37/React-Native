import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";

// 1. Crea el cliente fuera del componente
const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    // 2. Envuelve toda la app aquí
    <QueryClientProvider client={queryClient}>
      <Stack />
    </QueryClientProvider>
  );
}

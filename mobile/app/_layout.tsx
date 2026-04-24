import { Stack } from "expo-router";
import "../global.css";


export default function RootLayout() {

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'default'
      }}
    >
      <Stack.Screen name="index" options={{ title: "Inicio" }} />
      <Stack.Screen name="login/index" options={{ title: "Login" }} />
      <Stack.Screen name="dashboard/index" options={{ title: "Dashboard" }} />
      <Stack.Screen name="productos/index" options={{ title: "Productos" }} />
      <Stack.Screen name="ventas/index" options={{ title: "Ventas" }} />
      <Stack.Screen name="compras/index" options={{ title: "Compras" }} />
      <Stack.Screen name="menu/index" options={{ title: "Menú" }} />
      <Stack.Screen name="configuracion/index" options={{ title: "Configuración" }} />
      <Stack.Screen name="notificacion/email" options={{ title: "Configuración Email" }} />
    </Stack>
  );
}
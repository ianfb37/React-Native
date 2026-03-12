import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';

const queryClient = new QueryClient();

// Cambia esta IP por la de tu PC
const BASE_URL = `https://busan.dvpla.com`; 


const UserHeader = () => {
  const [usuario, setUsuario] = useState<any>(null);
  const router = useRouter();

  const cargarUsuario = async () => {
    try {
    
// FORMA CORRECTA PARA PHP
const response = await fetch(`${BASE_URL}/server_api/usuarios.php?perfil_actual=true&id_usuario=1`);
      const data = await response.json();
      if (data.success) {
        setUsuario(data);
      }
    } catch (e) {
      console.log("Aún no hay sesión");
    }
  };

  useEffect(() => {
    cargarUsuario();
    const interval = setInterval(cargarUsuario, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!usuario) return null;

  const imageUri = usuario.imagen.startsWith('http') 
    ? usuario.imagen 
    : `${BASE_URL}${usuario.imagen}`;

  return (
    <TouchableOpacity 
      style={styles.headerContainer} 
      onPress={() => router.push("/settings")}
    >
      <Text style={styles.userName}>{usuario.nombre}</Text>
      <Image source={{ uri: imageUri }} style={styles.avatar} />
    </TouchableOpacity>
  );
};

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerRight: () => <UserHeader />,
          headerTitle: "Recetario",
        }}
      >
        <Stack.Screen name="index" options={{ title: "Login", headerRight: () => null }} />
        <Stack.Screen name="botones" options={{ title: "Menú" }} />
      </Stack>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  headerContainer: { flexDirection: 'row', alignItems: 'center', paddingRight: 15 },
  userName: { marginRight: 10, fontSize: 14, fontWeight: 'bold', color: '#333' },
  avatar: { width: 35, height: 35, borderRadius: 17.5, backgroundColor: '#eee', borderWidth: 1, borderColor: '#ddd' },
});
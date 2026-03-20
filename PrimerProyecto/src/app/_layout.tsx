import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from './ThemeContext';
import { colors } from './colors';

const queryClient = new QueryClient();
const BASE_URL = `https://busan.dvpla.com`; 

interface Usuario {
  id: string | number;
  nombre: string;
  imagen: string;
  success?: boolean;
}

const UserHeader = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [imagenError, setImagenError] = useState(false);
  const { isDarkMode } = useTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  const router = useRouter();

  const cargarUsuario = async () => {
    try {
      const idUsuarioLocal = await AsyncStorage.getItem('id_usuario');

      if (!idUsuarioLocal) {
        if (usuario) setUsuario(null);
        return;
      }

      const response = await fetch(
        `${BASE_URL}/server_api/usuarios.php?id_usuario=${idUsuarioLocal}`
      );
      
      if (!response.ok) {
        console.log("Error HTTP:", response.status);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setUsuario(data);
        setImagenError(false);
      } else {
        console.log("Usuario no encontrado:", data.error);
      }
    } catch (e) {
      console.log("Error al conectar con el servidor:", e);
    }
  };

  useEffect(() => {
    cargarUsuario();
    const interval = setInterval(cargarUsuario, 100000);
    return () => clearInterval(interval);
  }, []);

  if (!usuario) return null;

  const imageUri = usuario.imagen?.startsWith('http') 
    ? usuario.imagen 
    : usuario.imagen 
      ? `${BASE_URL}${usuario.imagen.startsWith('/') ? '' : '/'}${usuario.imagen}`
      : `${BASE_URL}dist/assets/default.jpg`;

  if (imagenError || !usuario.imagen) {
    return (
      <TouchableOpacity 
        style={[styles.headerContainer, { paddingRight: 15 }]} 
        onPress={() => router.push("/settings")}
      >
        <Text style={[styles.userName, { color: currentColors.text }]}>
          {usuario.nombre}
        </Text>
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarText}>
            {usuario.nombre?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.headerContainer, { paddingRight: 15 }]} 
      onPress={() => router.push("/settings")}
    >
      <Text style={[styles.userName, { color: currentColors.text }]}>
        {usuario.nombre}
      </Text>
      <Image 
        source={{ uri: imageUri }} 
        style={[styles.avatar, { borderColor: currentColors.border }]}
        onError={() => {
          console.log("Error cargando imagen:", imageUri);
          setImagenError(true);
        }}
      />
    </TouchableOpacity>
  );
};

const BottomButtons = ({ isLoginPage }: { isLoginPage: boolean }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [imagenError, setImagenError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const idUsuarioLocal = await AsyncStorage.getItem('id_usuario');

        if (!idUsuarioLocal) {
          setUsuario(null);
          return;
        }

        const response = await fetch(
          `${BASE_URL}/server_api/usuarios.php?id_usuario=${idUsuarioLocal}`
        );

        if (!response.ok) {
          setUsuario(null);
          return;
        }

        const data = await response.json();

        if (data.success) {
          setUsuario(data);
          setImagenError(false);
        } else {
          setUsuario(null);
        }
      } catch (e) {
        console.log("Error al cargar usuario:", e);
        setUsuario(null);
      }
    };

    cargarUsuario();
  }, []);

  // No mostrar botones si no hay usuario logueado O si estamos en login
  if (!usuario || isLoginPage) {
    return null;
  }

  const irARecetas = () => router.push('/recetas');
  const irAAlumnos = () => router.push('/alumnos');
  const irAMensajeria = () => router.push('/mesajeria');
  const irAConfiguracion = () => router.push('/settings');

  const imageUri = usuario.imagen?.startsWith('http') 
    ? usuario.imagen 
    : usuario.imagen 
      ? `${BASE_URL}${usuario.imagen.startsWith('/') ? '' : '/'}${usuario.imagen}`
      : `${BASE_URL}dist/assets/default.jpg`;

  return (
    <View style={styles.footerContainer}>
      <TouchableOpacity
        style={styles.buttonSmall}
        onPress={irARecetas}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonIcon}>📖</Text>
        <Text style={styles.buttonLabel}>Recetas</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonSmall}
        onPress={irAAlumnos}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonIcon}>👥</Text>
        <Text style={styles.buttonLabel}>Alumnos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.centerButton}
        onPress={irAConfiguracion}
        activeOpacity={0.8}
      >
        {imagenError || !usuario.imagen ? (
          <View style={styles.avatarFallbackCenter}>
            <Text style={styles.avatarTextCenter}>
              {usuario.nombre?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
        ) : (
          <Image
            source={{ uri: imageUri }}
            style={styles.profileImageCenter}
            onError={() => setImagenError(true)}
          />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonSmall}
        onPress={irAMensajeria}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonIcon}>💬</Text>
        <Text style={styles.buttonLabel}>Mensajes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonSmall}
        onPress={irAConfiguracion}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonIcon}>⚙️</Text>
        <Text style={styles.buttonLabel}>Config</Text>
      </TouchableOpacity>
    </View>
  );
};

function RootLayoutNav() {
  const { isDarkMode } = useTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  const [currentRoute, setCurrentRoute] = useState('index');

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerRight: () => <UserHeader />,
          headerTitle: "Recetario",
          headerStyle: {
            backgroundColor: currentColors.background,
          },
          headerTintColor: currentColors.text,
          headerTitleStyle: {
            color: currentColors.text,
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: currentColors.background,
          },
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: "Login", 
            headerRight: () => null,
            headerShown: false,
          }}
          listeners={{
            focus: () => setCurrentRoute('index'),
          }}
        />
        <Stack.Screen 
          name="botones" 
          options={{ 
            title: "Menú",
            headerBackTitle: "Atrás",
          }}
          listeners={{
            focus: () => setCurrentRoute('botones'),
          }}
        />
        <Stack.Screen 
          name="settings" 
          options={{ 
            title: "Configuración",
            headerBackTitle: "Atrás",
          }}
          listeners={{
            focus: () => setCurrentRoute('settings'),
          }}
        />
        <Stack.Screen 
          name="recetas" 
          options={{ 
            title: "Recetas",
            headerBackTitle: "Atrás",
          }}
          listeners={{
            focus: () => setCurrentRoute('recetas'),
          }}
        />
        <Stack.Screen 
  name="calendario" 
  options={{ 
    title: "Calendario",
    headerBackTitle: "Atrás",
  }}
  
/>

        <Stack.Screen 
          name="alumnos" 
          options={{ 
            title: "Alumnos",
            headerBackTitle: "Atrás",
          }}
          listeners={{
            focus: () => setCurrentRoute('alumnos'),
          }}
        />
        <Stack.Screen 
          name="mesajeria" 
          options={{ 
            title: "Mensajería",
            headerBackTitle: "Atrás",
          }}
          listeners={{
            focus: () => setCurrentRoute('mesajeria'),
          }}
        />
      </Stack>
      <BottomButtons isLoginPage={currentRoute === 'index'} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  headerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  userName: { 
    marginRight: 10, 
    fontSize: 14, 
    fontWeight: 'bold',
  },
  avatar: { 
    width: 35, 
    height: 35, 
    borderRadius: 17.5, 
    backgroundColor: '#eee', 
    borderWidth: 1,
  },
  avatarFallback: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0051D5',
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  footerContainer: {
    paddingBottom: 8,
    paddingHorizontal: 5,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    height: 90,
  },
  buttonSmall: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
  },
  buttonIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  buttonLabel: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  profileImageCenter: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarFallbackCenter: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTextCenter: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 24,
  },
});

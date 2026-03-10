import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const IniciarSesionScreen = () => {
  const [nombre, setNombre] = useState<string>('');
  const [contraseña, setContraseña] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(false);
  
  const router = useRouter();

  // URL de tu API en Node.js (Asegúrate de que la IP sea la de tu PC)
  const API_URL = `http://192.168.0.132:3000/api/usuarios`; 

  // --- FUNCIÓN PARA INICIAR SESIÓN (GET) ---
  const manejarLogin = async () => {
    if (!nombre || !contraseña) {
      Alert.alert('Error', 'Por favor, introduce usuario y contraseña');
      return;
    }

    setCargando(true);
    try {
      // Al llamar a esta URL, el servidor en tu PC guarda el ID en su variable global
      const urlConParams = `${API_URL}?nombre=${encodeURIComponent(nombre)}&contraseña=${encodeURIComponent(contraseña)}`;
      const response = await fetch(urlConParams);
      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ Login OK. El PC ahora recuerda al usuario:', data.usuario);
        
        // Navegamos a la siguiente pantalla. 
        // El PC ya sabe quién eres, así que no necesitamos pasar el ID por aquí.
        router.replace('/botones'); 
      } else {
        Alert.alert('Error', data.error || 'No se pudo iniciar sesión');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error de conexión', 'No se pudo conectar con el servidor en tu PC.');
    } finally {
      setCargando(false);
    }
  };

  // --- FUNCIÓN PARA REGISTRO (POST) ---
  const manejarRegistro = async () => {
    if (!nombre || !contraseña) {
      Alert.alert('Error', 'Rellena los campos para crear una cuenta');
      return;
    }

    setCargando(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nombre,
          contraseña: contraseña,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('¡Éxito!', 'Usuario registrado. Ahora puedes entrar.');
      } else {
        Alert.alert('Error', data.error || 'No se pudo registrar');
      }
    } catch (error) {
      Alert.alert('Error de conexión', 'No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Recetario</Text>
      
      <TextInput 
        style={styles.input} 
        placeholder="Nombre de usuario" 
        value={nombre}
        onChangeText={setNombre}
        autoCapitalize="none"
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Contraseña" 
        value={contraseña}
        onChangeText={setContraseña}
        secureTextEntry 
      />

      {cargando ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <View style={{ width: '100%' }}>
          <TouchableOpacity style={styles.button} onPress={manejarLogin}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.buttonSecondary]} 
            onPress={manejarRegistro}
          >
            <Text style={styles.buttonTextSecondary}>Crear cuenta nueva</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#007AFF',
    width: '100%',
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextSecondary: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default IniciarSesionScreen;
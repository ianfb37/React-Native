import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IniciarSesionScreen = () => {
  const [nombre, setNombre] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [cargando, setCargando] = useState(false);
  
  const router = useRouter();
  const API_URL = `https://busan.dvpla.com/server_api/usuarios.php`; 

  const manejarLogin = async () => {
    if (!nombre || !contraseña) {
      Alert.alert('Error', 'Por favor, introduce usuario y contraseña');
      return;
    }

    setCargando(true);
    
    try {
      const urlConParams = `${API_URL}?nombre=${encodeURIComponent(nombre)}&contraseña=${encodeURIComponent(contraseña)}`;
      
      const response = await fetch(urlConParams, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ Login OK:', data);

        // --- PASO CRUCIAL PARA EL LAYOUT ---
        // Guardamos el ID que devuelve tu PHP (asegúrate que tu PHP devuelva 'id')
        if (data.id) {
          await AsyncStorage.setItem('id_usuario', String(data.id));
          console.log('ID guardado correctamente');
        }
        // ------------------------------------

        router.replace('/botones'); 
      } else {
        Alert.alert('Error', data.error || 'Usuario o contraseña incorrectos');
      }
    } catch (error) {
      console.error('Error de red:', error);
      Alert.alert('Error de conexión', 'No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  };

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
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nombre,
          password: contraseña, 
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert('¡Éxito!', 'Usuario registrado. Ya puedes entrar.');
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
            <Text style={styles.buttonText}>ENTRAR</Text>
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
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, color: '#333' },
  input: { width: '100%', height: 50, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, backgroundColor: '#f9f9f9' },
  button: { backgroundColor: '#007AFF', width: '100%', height: 50, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  buttonSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#007AFF' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  buttonTextSecondary: { color: '#007AFF', fontSize: 16, fontWeight: 'bold' },
});

export default IniciarSesionScreen;
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const IniciarSesionScreen = () => {
  const [nombre, setNombre] = useState<string>('');
  const [contraseña, setContraseña] = useState<string>('');
  const [imagen, setImagen] = useState<any>(null); 
  const [cargando, setCargando] = useState<boolean>(false);
  
  const router = useRouter();

  const API_URL = `http://192.168.0.132:3000/api/usuarios`; 

  const seleccionarImagen = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Sin permisos de cámara');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImagen(result.assets[0]);
    }
  };

  const manejarLogin = async () => {
    if (!nombre || !contraseña) {
      Alert.alert('Error', 'Introduce datos');
      return;
    }

    setCargando(true);
    try {
      const urlConParams = `${API_URL}?nombre=${encodeURIComponent(nombre)}&contraseña=${encodeURIComponent(contraseña)}`;
      const response = await fetch(urlConParams);
      const data = await response.json();

      if (response.ok && data.success) {
        router.replace('/botones'); 
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Sin conexión');
    } finally {
      setCargando(false);
    }
  };

  const manejarRegistro = async () => {
    if (!nombre || !contraseña) {
      Alert.alert('Error', 'Faltan datos');
      return;
    }

    setCargando(true);

    const formData = new FormData();
    formData.append('nombre', nombre);

    // CAMBIO CLAVE: Usamos 'password' en lugar de 'contraseña'
    formData.append('password', contraseña);
    
    if (imagen) {
      const uriParts = imagen.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      // @ts-ignore
      formData.append('imagen', {
        uri: imagen.uri,
        name: `perfil.${fileType}`,
        type: `image/${fileType}`,
      });
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Éxito', 'Usuario creado');
        setImagen(null);
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Error de red');
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Recetario</Text>
      
      <TouchableOpacity style={styles.imagePicker} onPress={seleccionarImagen}>
        {imagen ? (
          <Image source={{ uri: imagen.uri }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>Foto</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput 
        style={styles.input} 
        placeholder="Usuario" 
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
            <Text style={styles.buttonTextSecondary}>Crear cuenta</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30 },
  imagePicker: { marginBottom: 20 },
  previewImage: { width: 100, height: 100, borderRadius: 50 },
  placeholderImage: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderStyle: 'dashed' },
  placeholderText: { color: '#888', fontSize: 12 },
  input: { width: '100%', height: 50, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 15, marginBottom: 15 },
  button: { backgroundColor: '#007AFF', width: '100%', height: 50, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  buttonSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#007AFF' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  buttonTextSecondary: { color: '#007AFF', fontSize: 16, fontWeight: 'bold' },
});

export default IniciarSesionScreen;
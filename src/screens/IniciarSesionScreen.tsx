import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Button,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface Props {
  navigation: any; 
}

const IniciarSesionScreen: React.FC<Props> = ({ navigation }) => {
  const [nombre, setNombre] = useState<string>('');
  const [contraseña, setContraseña] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const API_URL = `http://192.168.0.132:3000/api/usuarios`; 

  const handleIniciarSesionPress = async () => {
    if (!nombre || !contraseña) {
      Alert.alert('Error', 'Por favor, rellena todos los campos');
      return;
    }

    setIsLoading(true);
    try {
      const url = `${API_URL}?nombre=${encodeURIComponent(nombre)}&contraseña=${encodeURIComponent(contraseña)}`;
      const response = await fetch(url);
      const data = await response.json();

      console.log('Respuesta de API:', data);

      if (response.ok && data.success) {
        const finalId = data.id;

        if (finalId) {
          const idString = String(finalId);
          console.log('--- PROCESO DE GUARDADO ---');
          
          await AsyncStorage.setItem('usuarioId', idString);
          
          const comprobacion = await AsyncStorage.getItem('usuarioId');
          console.log('ID en Storage tras guardar:', comprobacion);

          if (comprobacion === idString) {
            console.log(' Guardado verificado. Navegando...');
            navigation.navigate('BotonesScreen');
          } else {
            throw new Error('Error al verificar el almacenamiento');
          }
        } else {
          Alert.alert('Error', 'El servidor no devolvió un ID');
        }
      } else {
        Alert.alert('Error', data.error || 'Usuario o contraseña incorrectos');
      }
    } catch (error) {
      console.error('Error detallado:', error);
      Alert.alert('Error', 'No se pudo completar el inicio de sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrarPress = async () => {
    if (!nombre || !contraseña) {
      Alert.alert('Error', 'Rellena los campos para el registro');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, contraseña }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Éxito', 'Usuario creado. Ahora inicia sesión.');
      } else {
        Alert.alert('Error', data.error || 'No se pudo registrar');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Recetario</Text>
      
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

      {isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <View style={styles.buttonContainer}>
          <Button 
            title="Iniciar Sesión" 
            onPress={handleIniciarSesionPress} 
            color="#007AFF"
          />
          
          <View style={{ height: 15 }} />
          
          <TouchableOpacity 
            style={styles.registerButton} 
            onPress={handleRegistrarPress}
          >
            <Text style={styles.registerText}>¿No tienes cuenta? Regístrate aquí</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, backgroundColor: '#fffefe' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, color: '#333' },
  input: { width: '100%', height: 45, borderColor: '#ccc', borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, marginBottom: 15, backgroundColor: '#fff' },
  buttonContainer: { width: '100%', marginTop: 10 },
  registerButton: { alignItems: 'center', padding: 10 },
  registerText: { color: '#007AFF', fontSize: 14, fontWeight: '500' },
});

export default IniciarSesionScreen;
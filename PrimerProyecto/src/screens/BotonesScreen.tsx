import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const BotonesScreen: React.FC = () => {
  const router = useRouter();
  
  const { usuarioId } = useLocalSearchParams();

  const irARecetas = () => {
    router.push({
      pathname: '/recetas',
      params: { usuarioId: usuarioId }
    });
  };

  const irAAlumnos = () => {
    router.push({
      pathname: '/alumnos',
      params: { usuarioId: usuarioId }
    });
  };

  const irAMensajeria = () => {
    router.push({
      pathname: '/mesajeria',
      params: { usuarioId: usuarioId }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Panel de Control</Text>
        <Text style={styles.idText}>Sesión iniciada (ID: {usuarioId})</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={irARecetas}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Ir a Recetas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={irAAlumnos}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Ir a Alumnos</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.buttonChat]} 
          onPress={irAMensajeria}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Ir a Mensajería</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  header: {
    marginTop: 50,
    padding: 20,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  idText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  buttonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginVertical: 10,
    width: '100%', 
    alignItems: 'center',
    elevation: 3, // Sombra en Android
    shadowColor: '#000', // Sombra en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonChat: {
    backgroundColor: '#34C759', // Color verde para diferenciar el chat
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default BotonesScreen;
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

interface Alumno {
id: string;
nombre: string;
descripcion: string;
fecha: string;
}

export default function AlumnosScreen() {
const router = useRouter();

const datos: Recetas[] = [
  { id: '1', nombre: 'Juan García', },
  { id: '2', nombre: 'María López' },
  { id: '3', nombre: 'Carlos Rodríguez' },
  { id: '4', nombre: 'Ana Martínez' },
];

const renderAlumno = ({ item }: { item: Alumno }) => (
  <Text style={styles.alumno}>{item.nombre}</Text>
);

return (
 <View style={styles.container}>
      {/* ENCABEZADO */}
      <View style={styles.fila}>
        <Text style={[styles.celda, styles.encabezado]}>Nombre</Text>
        <Text style={[styles.celda, styles.encabezado]}>Edad</Text>
        <Text style={[styles.celda, styles.encabezado]}>Ciudad</Text>
      </View>

      {/* FILAS */}
      <FlatList
        data={datos}
        renderItem={({ item }) => (
          <View style={styles.fila}>
            <Text style={styles.celda}>{item.nombre}</Text>
            <Text style={styles.celda}>{item.edad}</Text>
            <Text style={styles.celda}>{item.ciudad}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  fila: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
  },
  celda: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  encabezado: {
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    color: '#000',
  },
});
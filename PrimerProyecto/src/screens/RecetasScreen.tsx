import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface Receta {
  id: number;
  estado: number;
  nombre: string;
  descripcion: string;
  fecha: string;
  imagen: string;
  firma: string;
  orden: number;
}

export default function RecetasScreen() {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [cargando, setCargando] = useState(true);

  // --- NUEVOS ESTADOS PARA EDICIÓN ---
  const [recetaSeleccionada, setRecetaSeleccionada] = useState<Receta | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editEstado, setEditEstado] = useState(0); // Nuevo estado para el campo "estado"
  const [guardando, setGuardando] = useState(false);

  const API_URL = `http://192.168.0.132:3000/api/recetas`; 

  const cargarDatos = async () => {
    try {
      const respuesta = await fetch(API_URL);
      const datos = await respuesta.json();
      setRecetas(datos);
    } catch (error) {
      console.error("Error cargando recetas:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // --- FUNCIÓN PARA ABRIR EL EDITOR ---
  const abrirEditor = (receta: Receta) => {
    setRecetaSeleccionada(receta);
    setEditNombre(receta.nombre);
    setEditDescripcion(receta.descripcion);
  };

  // --- FUNCIÓN PARA GUARDAR (PUT) ---
  const guardarCambios = async () => {
    if (!recetaSeleccionada) return;

    setGuardando(true);
    try {
      const respuesta = await fetch(`${API_URL}/${recetaSeleccionada.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: editNombre,
          descripcion: editDescripcion,
          estado: editEstado
        }),
      });

      if (respuesta.ok) {
        Alert.alert("Éxito", "Receta actualizada correctamente");
        setRecetaSeleccionada(null); // Cerramos el modal
        cargarDatos(); // Recargamos la lista
      } else {
        Alert.alert("Error", "No se pudo actualizar la receta");
      }
    } catch (error) {
      Alert.alert("Error", "Error de conexión con el servidor");
    } finally {
      setGuardando(false);
    }
  };

  const renderItem = ({ item }: { item: Receta }) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.9}
      onPress={() => abrirEditor(item)} // <--- ABRIR EDITOR AL PULSAR
    >
      <Image 
        source={{ uri: `https://busan.dvpla.com/images/com_recetas/platos/${item.imagen}` }} 
        style={styles.image} 
        resizeMode="cover"
      />
      
      <View style={styles.cardContent}>
        <View style={styles.headerRow}>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <View style={[styles.badge, { backgroundColor: item.estado === 1 ? '#4CAF50' : '#F44336' }]}>
            <Text style={styles.badgeText}>{item.estado === 1 ? 'Activo' : 'Inactivo'}</Text>
          </View>
        </View>
        <Text style={styles.descripcion} numberOfLines={2}>{item.descripcion}</Text>
        <View style={styles.footer}>
          <Text style={styles.footerText}>📅 {new Date(item.fecha).toLocaleDateString()}</Text>
          <Text style={styles.footerText}>✍️ {item.firma || 'Anónimo'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerPrincipal}>
        <Text style={styles.tituloApp}>Recetas Busan</Text>
      </View>

      {cargando ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={recetas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <Modal
        visible={recetaSeleccionada !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Editar Receta</Text>
            <TouchableOpacity onPress={() => setRecetaSeleccionada(null)}>
              <Text style={styles.closeText}>Cancelar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 20 }}>
            <Text style={styles.label}>Nombre de la Receta</Text>
            <TextInput
              style={styles.input}
              value={editNombre}
              onChangeText={setEditNombre}
              placeholder="Ej. Paella"
            />

            <Text style={styles.label}>Descripción / Instrucciones</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editDescripcion}
              onChangeText={setEditDescripcion}
              multiline
              numberOfLines={6}
              placeholder="Escribe aquí los pasos..."
            />
<Text style={styles.label}>Estado</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editEstado}
              onChangeText={setEditEstado}
              multiline
              numberOfLines={6}
              placeholder="Estado (1 para Activo, 0 para Inactivo)"
            />
            <TouchableOpacity 
              style={[styles.btnGuardar, guardando && { opacity: 0.7 }]}
              onPress={guardarCambios}
              disabled={guardando}
            >
              {guardando ? (
                <ActivityIndicator color="#f6f6f6" />
              ) : (
                <Text style={styles.btnGuardarText}>Guardar Cambios</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  headerPrincipal: { padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#DDD' },
  tituloApp: { fontSize: 26, fontWeight: 'bold', color: '#000' },
  listContainer: { padding: 15 },
  card: { backgroundColor: '#FFF', borderRadius: 12, marginBottom: 20, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  image: { width: '100%', height: 160 },
  cardContent: { padding: 15 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  nombre: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5 },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  descripcion: { fontSize: 14, color: '#3A3A3C', marginBottom: 15, lineHeight: 20 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F2F2F7', paddingTop: 10 },
  footerText: { fontSize: 12, color: '#8E8E93' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Estilos del Modal
  modalContent: { flex: 1, backgroundColor: '#FFF' },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: '#EEE' 
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  closeText: { color: '#FF3B30', fontSize: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#8E8E93', marginBottom: 8, marginTop: 15 },
  input: { 
    backgroundColor: '#F2F2F7', 
    borderRadius: 10, 
    padding: 15, 
    fontSize: 16, 
    color: '#000' 
  },
  textArea: { height: 150, textAlignVertical: 'top' },
  btnGuardar: { 
    backgroundColor: '#007AFF', 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 30,
    marginBottom: 50
  },
  btnGuardarText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});
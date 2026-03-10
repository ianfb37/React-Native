import * as ImagePicker from 'expo-image-picker';
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

  const [recetaSeleccionada, setRecetaSeleccionada] = useState<Receta | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editEstado, setEditEstado] = useState(1); 
  const [guardando, setGuardando] = useState(false);

  // IP de tu servidor
  const API_URL = `http://192.168.0.132:3000/api/recetas`; 
  const ASSETS_URL = `http://192.168.0.132:3000/assets/platos`;

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

  const seleccionarImagen = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para subir fotos.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!resultado.canceled) {
      const uri = resultado.assets[0].uri;
      setRecetaSeleccionada(prev => prev ? { ...prev, imagen: uri } : null);
    }
  };

  const abrirEditor = (receta: Receta) => {
    setRecetaSeleccionada(receta); 
    setEditNombre(receta.nombre);
    setEditDescripcion(receta.descripcion);
    setEditEstado(receta.estado);
  };

  const prepararFormData = () => {
    const formData = new FormData();
    formData.append('nombre', editNombre);
    formData.append('descripcion', editDescripcion);
    formData.append('estado', editEstado.toString());
    formData.append('fecha', new Date().toISOString().split('T')[0]);

    if (recetaSeleccionada?.imagen) {
      // Solo enviamos el archivo si es una URI local (nueva foto)
      if (recetaSeleccionada.imagen.startsWith('file') || recetaSeleccionada.imagen.startsWith('content')) {
        formData.append('foto_receta', {
          uri: recetaSeleccionada.imagen,
          name: 'imagen_receta.jpg', 
          type: 'image/jpeg',
        } as any);
      }
    }
    return formData;
  };

  const guardarCambios = async () => {
    if (!recetaSeleccionada) return;
    setGuardando(true);
    try {
      const formData = prepararFormData();
      const respuesta = await fetch(`${API_URL}/${recetaSeleccionada.id}`, {
        method: 'PUT',
        body: formData,
        headers: { 'Accept': 'application/json' },
      });

      if (respuesta.ok) {
        Alert.alert("Éxito", "Receta actualizada");
        setRecetaSeleccionada(null);
        cargarDatos(); 
      }
    } catch (error) {
      Alert.alert("Error", "Error de conexión");
    } finally {
      setGuardando(false);
    }
  };

  const nuevaReceta = async () => {
    if (!editNombre || !editDescripcion) {
      Alert.alert("Error", "Nombre y descripción son obligatorios");
      return;
    }

    setGuardando(true);
    try {
      const formData = prepararFormData();
      const respuesta = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
      });

      const resultado = await respuesta.json();

      if (respuesta.ok) {
        Alert.alert("Éxito", "Receta creada correctamente");
        setRecetaSeleccionada(null);
        cargarDatos();
      } else {
        Alert.alert("Error del servidor", resultado.error || "No se pudo crear");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Error de conexión con el servidor");
    } finally {
      setGuardando(false);
    }
  };

  const renderItem = ({ item }: { item: Receta }) => {
    // Construimos la URL: si ya es una URL completa la dejamos, si no, añadimos el prefijo del servidor
    const uriImagen = item.imagen 
      ? (item.imagen.startsWith('http') ? item.imagen : `${ASSETS_URL}/${item.imagen}`)
      : null;

    return (
      <View style={styles.card}>
        {uriImagen && (
          <Image 
            source={{ uri: uriImagen }} 
            style={{ width: '100%', height: 200, borderTopLeftRadius: 12, borderTopRightRadius: 12 }} 
            resizeMode="cover"
          />
        )}
        <View style={styles.cardContent}>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={styles.descripcion}>{item.descripcion}</Text>
          <View style={styles.footer}>
            <View>
              <Text style={styles.footerText}>{item.fecha}</Text>
              <Text style={styles.footerText}>{item.firma}</Text>
            </View>
            <TouchableOpacity onPress={() => abrirEditor(item)}>
              <Text style={{ color: '#007AFF', fontSize: 14, fontWeight: '600' }}>Editar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerPrincipal}>
        <Text style={styles.tituloApp}>Recetas Busan</Text>
        <TouchableOpacity onPress={() => {
          setEditNombre('');
          setEditDescripcion('');
          setEditEstado(1);
          setRecetaSeleccionada({ id: 0, estado: 1, nombre: '', descripcion: '', fecha: new Date().toISOString(), imagen: '', firma: '', orden: 0 });
        }}>
          <Text style={{ color: '#007AFF', fontSize: 16 }}>Nueva Receta</Text>
        </TouchableOpacity>
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

      <Modal visible={recetaSeleccionada !== null} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{recetaSeleccionada?.id === 0 ? 'Nueva Receta' : 'Editar Receta'}</Text>
            <TouchableOpacity onPress={() => setRecetaSeleccionada(null)}>
              <Text style={styles.closeText}>Cancelar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 20 }}>
            <Text style={styles.label}>Nombre de la Receta</Text>
            <TextInput style={styles.input} value={editNombre} onChangeText={setEditNombre} placeholder="Ej. Paella" />

            <Text style={styles.label}>Descripción / Instrucciones</Text>
            <TextInput style={[styles.input, styles.textArea]} value={editDescripcion} onChangeText={setEditDescripcion} multiline placeholder="Escribe aquí los pasos..." />

            <Text style={styles.label}>Imagen de la Receta</Text>
            <TouchableOpacity style={styles.imageBox} onPress={seleccionarImagen}>
              {recetaSeleccionada?.imagen ? (
                <Image 
                  source={{ 
                    uri: recetaSeleccionada.imagen.startsWith('file') || recetaSeleccionada.imagen.startsWith('content')
                      ? recetaSeleccionada.imagen 
                      : `${ASSETS_URL}/${recetaSeleccionada.imagen}`
                  }} 
                  style={styles.imagePreview} 
                />
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#007AFF' }}>Seleccionar Foto de Galería</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.label}>Estado (1 Activo, 0 Inactivo)</Text>
            <TextInput style={styles.input} value={editEstado.toString()} onChangeText={(t) => setEditEstado(parseInt(t) || 0)} keyboardType="numeric" />
        
            <TouchableOpacity 
              style={[styles.btnGuardar, guardando && { opacity: 0.7 }]}
              onPress={() => recetaSeleccionada?.id === 0 ? nuevaReceta() : guardarCambios()}
              disabled={guardando}
            >
              {guardando ? <ActivityIndicator color="#f6f6f6" /> : <Text style={styles.btnGuardarText}>{recetaSeleccionada?.id === 0 ? 'Crear Receta' : 'Guardar Cambios'}</Text>}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  headerPrincipal: { padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#DDD', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tituloApp: { fontSize: 26, fontWeight: 'bold', color: '#000' },
  listContainer: { padding: 15 },
  card: { backgroundColor: '#FFF', borderRadius: 12, marginBottom: 20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardContent: { padding: 15 },
  nombre: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 5 },
  descripcion: { fontSize: 14, color: '#3A3A3C', marginBottom: 15, lineHeight: 20 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F2F2F7', paddingTop: 10 },
  footerText: { fontSize: 12, color: '#8E8E93' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContent: { flex: 1, backgroundColor: '#FFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  closeText: { color: '#FF3B30', fontSize: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#8E8E93', marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: '#F2F2F7', borderRadius: 10, padding: 15, fontSize: 16, color: '#000' },
  textArea: { height: 100, textAlignVertical: 'top' },
  imageBox: { height: 150, backgroundColor: '#F2F2F7', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 5, overflow: 'hidden', borderStyle: 'dashed', borderWidth: 1, borderColor: '#007AFF' },
  imagePreview: { width: '100%', height: '100%' },
  btnGuardar: { backgroundColor: '#007AFF', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 30, marginBottom: 50 },
  btnGuardarText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});
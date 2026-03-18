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
import { useTheme } from '../app/ThemeContext';
import { colors } from '../app/colors';

interface Alergeno {
  id: number;
  nombre: string;
}

interface Receta {
  id: number;
  estado: number;
  nombre: string;
  descripcion: string;
  fecha: string;
  imagen: string;
  firma: string;
  orden: number;
  alergenos?: Alergeno[];
}

export default function RecetasScreen() {
  const { isDarkMode } = useTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [recetaSeleccionada, setRecetaSeleccionada] = useState<Receta | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editEstado, setEditEstado] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [todosLosAlergenos, setTodosLosAlergenos] = useState<Alergeno[]>([]);
  const [alergenosSeleccionados, setAlergenosSeleccionados] = useState<number[]>([]);

  const API_URL = `https://busan.dvpla.com/server_api/recetas.php`;
  const ALERGENOS_API = `https://busan.dvpla.com/server_api/alergenos.php`;
  const ASSETS_URL = `https://busan.dvpla.com/dist/assets/platos`;

  const cargarDatos = async () => {
    try {
      const respuesta = await fetch(API_URL);
      const datos = await respuesta.json();
      
      const recetasConAlergenos = await Promise.all(
        datos.map(async (receta: Receta) => {
          const alergenos = await cargarAlergenosReceta(receta.id);
          return { ...receta, alergenos };
        })
      );
      
      setRecetas(recetasConAlergenos);
    } catch (error) {
      console.error("Error cargando recetas:", error);
      Alert.alert("Error", "No se pudieron cargar las recetas");
    } finally {
      setCargando(false);
    }
  };

  const cargarAlergenosReceta = async (recetaId: number): Promise<Alergeno[]> => {
    try {
      const respuesta = await fetch(`${ALERGENOS_API}?id_receta=${recetaId}`);
      const datos = await respuesta.json();
      return datos.alergenos || [];
    } catch (error) {
      console.error(`Error cargando alérgenos para receta ${recetaId}:`, error);
      return [];
    }
  };

  const cargarTodosLosAlergenos = async () => {
    try {
      const respuesta = await fetch(`${ALERGENOS_API}?todos=true`);
      const datos = await respuesta.json();
      setTodosLosAlergenos(datos.alergenos || []);
    } catch (error) {
      console.error("Error cargando lista de alérgenos:", error);
    }
  };

  useEffect(() => {
    cargarDatos();
    cargarTodosLosAlergenos();
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

  const abrirEditor = async (receta: Receta) => {
    setRecetaSeleccionada(receta);
    setEditNombre(receta.nombre);
    setEditDescripcion(receta.descripcion);
    setEditEstado(receta.estado);
    
    const alergenos = await cargarAlergenosReceta(receta.id);
    setAlergenosSeleccionados(alergenos.map(a => a.id));
  };

  const prepararFormData = () => {
    const formData = new FormData();
    formData.append('nombre', editNombre);
    formData.append('descripcion', editDescripcion);
    formData.append('estado', editEstado.toString());
    formData.append('fecha', new Date().toISOString().split('T')[0]);

    if (recetaSeleccionada?.imagen) {
      if (recetaSeleccionada.imagen.startsWith('file') || recetaSeleccionada.imagen.startsWith('content')) {
        formData.append('foto_receta', {
          uri: recetaSeleccionada.imagen,
          name: 'imagen_receta.jpg',
          type: 'image/jpeg',
        } as any);
      }
    }

    formData.append('alergenos', JSON.stringify(alergenosSeleccionados));

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
      } else {
        Alert.alert("Error", "No se pudo actualizar la receta");
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
        setEditNombre('');
        setEditDescripcion('');
        setAlergenosSeleccionados([]);
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

  const toggleAlergeno = (alergenoId: number) => {
    setAlergenosSeleccionados(prev =>
      prev.includes(alergenoId)
        ? prev.filter(id => id !== alergenoId)
        : [...prev, alergenoId]
    );
  };

  const renderItem = ({ item }: { item: Receta }) => {
    const uriImagen = item.imagen && item.imagen.trim() !== ''
      ? (item.imagen.startsWith('http') ? item.imagen : `${ASSETS_URL}/${item.imagen}`)
      : null;

    return (
      <View style={[styles.card, { backgroundColor: currentColors.card }]}>
        {uriImagen ? (
          <Image
            source={{ uri: uriImagen }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.cardImageBlank, { backgroundColor: currentColors.card }]} />
        )}
        <View style={styles.cardContent}>
          <Text style={[styles.nombre, { color: currentColors.text }]}>{item.nombre}</Text>
          <Text style={[styles.descripcion, { color: currentColors.text }]} numberOfLines={2}>{item.descripcion}</Text>

          {item.alergenos && item.alergenos.length > 0 ? (
            <View style={[styles.alergenosContainer, { borderBottomColor: currentColors.border }]}>
              <Text style={styles.alergenosLabel}>Contiene:</Text>
              <View style={styles.alergenos}>
                {item.alergenos.map(alergeno => (
                  <View key={alergeno.id} style={styles.alergenoBadge}>
                    <Text style={styles.alergenitoText}>{alergeno.nombre}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={[styles.sinAlergenos, { borderBottomColor: currentColors.border }]}>
              <Text style={styles.sinAlergenosText}>Sin alérgenos comunes</Text>
            </View>
          )}

          <View style={styles.footer}>
            <View>
              <Text style={[styles.footerText, { color: currentColors.border }]}>{item.fecha}</Text>
              <Text style={[styles.footerText, { color: currentColors.border }]}>Por: {item.firma}</Text>
            </View>
            <TouchableOpacity 
              style={styles.btnEditar}
              onPress={() => abrirEditor(item)}
            >
              <Text style={styles.btnEditarText}>Editar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <View style={[styles.headerPrincipal, { backgroundColor: currentColors.card, borderBottomColor: currentColors.border }]}>
        <Text style={[styles.tituloApp, { color: currentColors.text }]}>Recetas Busan</Text>
        <TouchableOpacity 
          style={styles.btnNueva}
          onPress={() => {
            setEditNombre('');
            setEditDescripcion('');
            setEditEstado(1);
            setAlergenosSeleccionados([]);
            setRecetaSeleccionada({ 
              id: 0, 
              estado: 1, 
              nombre: '', 
              descripcion: '', 
              fecha: new Date().toISOString(), 
              imagen: '', 
              firma: '', 
              orden: 0 
            });
          }}
        >
          <Text style={styles.btnNuevaText}>Nueva</Text>
        </TouchableOpacity>
      </View>

      {cargando ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 10, color: currentColors.text }}>Cargando recetas...</Text>
        </View>
      ) : recetas.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 18, color: currentColors.border }}>No hay recetas aún</Text>
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
        <SafeAreaView style={[styles.modalContent, { backgroundColor: currentColors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: currentColors.card, borderBottomColor: currentColors.border }]}>
            <Text style={[styles.modalTitle, { color: currentColors.text }]}>
              {recetaSeleccionada?.id === 0 ? 'Nueva Receta' : 'Editar Receta'}
            </Text>
            <TouchableOpacity onPress={() => setRecetaSeleccionada(null)}>
              <Text style={styles.closeText}>X</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            <Text style={[styles.label, { color: currentColors.text }]}>Nombre de la Receta</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: currentColors.card, color: currentColors.text, borderColor: currentColors.border }]} 
              value={editNombre} 
              onChangeText={setEditNombre} 
              placeholder="Ej. Paella"
              placeholderTextColor={currentColors.border}
            />

            <Text style={[styles.label, { color: currentColors.text }]}>Descripción / Instrucciones</Text>
            <TextInput 
              style={[styles.input, styles.textArea, { backgroundColor: currentColors.card, color: currentColors.text, borderColor: currentColors.border }]} 
              value={editDescripcion} 
              onChangeText={setEditDescripcion} 
              multiline 
              placeholder="Escribe aquí los pasos..."
              placeholderTextColor={currentColors.border}
            />

            <Text style={[styles.label, { color: currentColors.text }]}>Imagen de la Receta</Text>
            <TouchableOpacity style={[styles.imageBox, { backgroundColor: isDarkMode ? '#2a2a3a' : '#f9f9ff', borderColor: '#007AFF' }]} onPress={seleccionarImagen}>
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
                  <Text style={{ fontSize: 30, color: currentColors.text }}>Seleccionar Foto</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={[styles.label, { color: currentColors.text }]}>Alérgenos</Text>
            {todosLosAlergenos.length === 0 ? (
              <Text style={{ color: '#e80000', padding: 10 }}>Cargando alérgenos...</Text>
            ) : (
              <View style={[styles.alergenosSelector, { backgroundColor: currentColors.card }]}>
                {todosLosAlergenos.map(alergeno => (
                  <TouchableOpacity
                    key={alergeno.id}
                    style={[
                      styles.alergenoCheckbox,
                      { backgroundColor: currentColors.card, borderColor: currentColors.border },
                      alergenosSeleccionados.includes(alergeno.id) && styles.alergenoCheckboxSelected
                    ]}
                    onPress={() => toggleAlergeno(alergeno.id)}
                  >
                    <Text style={[
                      styles.alergenoCheckboxText,
                      { color: currentColors.text },
                      alergenosSeleccionados.includes(alergeno.id) && styles.alergenoCheckboxTextSelected
                    ]}>
                      {alergenosSeleccionados.includes(alergeno.id) ? 'X ' : ''}
                      {alergeno.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={[styles.label, { color: currentColors.text }]}>Estado</Text>
            <View style={styles.estadoContainer}>
              <TouchableOpacity 
                style={[styles.estadoBtn, { backgroundColor: currentColors.card, borderColor: currentColors.border }, editEstado === 1 && styles.estadoBtnActive]}
                onPress={() => setEditEstado(1)}
              >
                <Text style={[styles.estadoBtnText, { color: currentColors.text }, editEstado === 1 && styles.estadoBtnTextActive]}>
                  Activo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.estadoBtn, { backgroundColor: currentColors.card, borderColor: currentColors.border }, editEstado === 0 && styles.estadoBtnActive]}
                onPress={() => setEditEstado(0)}
              >
                <Text style={[styles.estadoBtnText, { color: currentColors.text }, editEstado === 0 && styles.estadoBtnTextActive]}>
                  Inactivo
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.btnGuardar, guardando && { opacity: 0.7 }]}
              onPress={() => recetaSeleccionada?.id === 0 ? nuevaReceta() : guardarCambios()}
              disabled={guardando}
            >
              {guardando ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.btnGuardarText}>
                  {recetaSeleccionada?.id === 0 ? 'Crear Receta' : 'Guardar Cambios'}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  headerPrincipal: { 
    padding: 20, 
    borderBottomWidth: 1, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  tituloApp: { 
    fontSize: 26, 
    fontWeight: 'bold',
  },
  btnNueva: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  btnNuevaText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14
  },
  listContainer: { 
    padding: 15,
    paddingBottom: 30
  },
  card: { 
    borderRadius: 12, 
    marginBottom: 20, 
    overflow: 'hidden',
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4 
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  cardImageBlank: {
    width: '100%',
    height: 200,
  },
  cardContent: { 
    padding: 15 
  },
  nombre: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 8 
  },
  descripcion: { 
    fontSize: 14, 
    marginBottom: 12, 
    lineHeight: 20 
  },
  alergenosContainer: { 
    marginBottom: 12, 
    paddingBottom: 12, 
    borderBottomWidth: 1,
  },
  alergenosLabel: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: '#FF3B30', 
    marginBottom: 8 
  },
  alergenos: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8 
  },
  alergenoBadge: { 
    backgroundColor: '#FFE5E5', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#FF3B30' 
  },
  alergenitoText: { 
    fontSize: 12, 
    color: '#FF3B30', 
    fontWeight: '600' 
  },
  sinAlergenos: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  sinAlergenosText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600'
  },
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingTop: 10 
  },
  footerText: { 
    fontSize: 12,
    marginBottom: 2
  },
  btnEditar: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6
  },
  btnEditarText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 13
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    flex: 1,
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    borderBottomWidth: 1,
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold',
  },
  closeText: { 
    color: '#FF3B30', 
    fontSize: 24,
    fontWeight: '300'
  },
  scrollContent: {
    padding: 20
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600', 
    marginBottom: 10, 
    marginTop: 18 
  },
  input: { 
    borderRadius: 10, 
    padding: 15, 
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: { 
    height: 120, 
    textAlignVertical: 'top' 
  },
  imageBox: { 
    height: 150, 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 5, 
    overflow: 'hidden', 
    borderStyle: 'dashed', 
    borderWidth: 2, 
  },
  imagePreview: { 
    width: '100%', 
    height: '100%',
    resizeMode: 'cover'
  },
  alergenosSelector: { 
    borderRadius: 10, 
    padding: 10, 
    marginTop: 5 
  },
  alergenoCheckbox: { 
    paddingVertical: 12, 
    paddingHorizontal: 14, 
    marginVertical: 6, 
    borderRadius: 8, 
    borderWidth: 1,
  },
  alergenoCheckboxSelected: { 
    backgroundColor: '#FFE5E5', 
    borderColor: '#FF3B30' 
  },
  alergenoCheckboxText: { 
    fontSize: 14,
    fontWeight: '500'
  },
  alergenoCheckboxTextSelected: { 
    color: '#FF3B30', 
    fontWeight: '700' 
  },
  estadoContainer: {
    flexDirection: 'row',
    gap: 10
  },
  estadoBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center'
  },
  estadoBtnActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  estadoBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  estadoBtnTextActive: {
    color: '#FFF'
  },
  btnGuardar: { 
    backgroundColor: '#007AFF', 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 30, 
    marginBottom: 50 
  },
  btnGuardarText: { 
    color: '#FFF', 
    fontSize: 18, 
    fontWeight: 'bold' 
  }
});
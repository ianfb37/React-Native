import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../app/ThemeContext';
import { colors } from '../app/colors';

interface Contacto {
  id: number;
  nombre: string;
  imagen?: string;
}

interface Mensaje {
  id: number;
  id_emisor: number;
  id_receptor: number;
  contenido: string;
  fecha_envio?: string;
}

const API_URL = `https://busan.dvpla.com/server_api/mensajes.php`;

export default function MesajeriaScreen() {
  const { isDarkMode } = useTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  
  const [miId, setMiId] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [chatActivo, setChatActivo] = useState<Contacto | null>(null);
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState<string>('');
  const flatListRef = useRef<FlatList>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const ultimoIdRef = useRef<number>(0);

  // 1. OBTENER MI ID Y CARGAR CONTACTOS
  useEffect(() => {
    const inicializar = async () => {
      try {
        const idGuardado = await AsyncStorage.getItem('id_usuario');
        if (idGuardado) {
          const idNum = parseInt(idGuardado);
          setMiId(idNum);
          
          // Cargar contactos
          const response = await fetch(`${API_URL}?modo=contactos&mi_id=${idNum}`);
          const data = await response.json();
          if (Array.isArray(data)) setContactos(data);
        }
      } catch (e) {
        console.error('Error inicializando:', e);
      } finally {
        setCargando(false);
      }
    };
    inicializar();
  }, []);

  // 2. CARGAR HISTORIAL INICIAL
  useEffect(() => {
    if (chatActivo && miId) {
      const cargarHistorial = async () => {
        try {
          const response = await fetch(
            `${API_URL}?mi_id=${miId}&otro_id=${chatActivo.id}`
          );
          const data = await response.json();
          
          if (Array.isArray(data)) {
            setMensajes(data);
            if (data.length > 0) {
              ultimoIdRef.current = Math.max(...data.map(m => m.id));
            }
          }
        } catch (e) {
          console.error('Error cargando historial:', e);
        }
      };
      
      cargarHistorial();
    }
  }, [chatActivo, miId]);

  // 3. CONECTAR A SSE (Server-Sent Events)
  useEffect(() => {
    if (chatActivo && miId) {
      const conectarSSE = () => {
        try {
          const url = `${API_URL}?modo=sse&mi_id=${miId}&otro_id=${chatActivo.id}&ultimo_id=${ultimoIdRef.current}`;
          
          eventSourceRef.current = new EventSource(url);
          
          eventSourceRef.current.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              if (Array.isArray(data) && data.length > 0) {
                setMensajes(prev => {
                  const nuevos = data.filter(m => !prev.find(p => p.id === m.id));
                  const todos = [...prev, ...nuevos];
                  ultimoIdRef.current = Math.max(...todos.map(m => m.id));
                  return todos;
                });
              }
            } catch (e) {
              console.error('Error parseando SSE:', e);
            }
          };
          
          eventSourceRef.current.onerror = () => {
            console.log('SSE desconectado, reconectando...');
            eventSourceRef.current?.close();
            // Reconectar después de 3 segundos
            setTimeout(conectarSSE, 3000);
          };
        } catch (e) {
          console.error('Error conectando SSE:', e);
        }
      };
      
      conectarSSE();
      
      return () => {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }
      };
    }
  }, [chatActivo, miId]);

  // 4. ENVIAR MENSAJE
  const enviar = () => {
    if (!texto.trim() || !chatActivo || !miId) return;

    const body = {
      id_emisor: miId,
      id_receptor: chatActivo.id,
      contenido: texto
    };

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      .then((data) => {
        if (data.success) {
          const nuevoMsg: Mensaje = {
            id: data.id,
            id_emisor: miId,
            id_receptor: chatActivo.id,
            contenido: texto,
            fecha_envio: data.mensaje.fecha_envio
          };
          setMensajes([...mensajes, nuevoMsg]);
          ultimoIdRef.current = nuevoMsg.id;
          setTexto('');
        }
      })
      .catch(e => Alert.alert("Error", "No se pudo enviar el mensaje"));
  };

  if (cargando) {
    return (
      <View style={[styles.centrado, { backgroundColor: currentColors.background }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ color: currentColors.text }}>Cargando chats...</Text>
      </View>
    );
  }

  // VISTA DE LISTA DE CONTACTOS
  if (!chatActivo) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
        <View style={[styles.headerSimple, { backgroundColor: currentColors.card, borderBottomColor: currentColors.border }]}>
          <Text style={[styles.titulo, { color: currentColors.text }]}>Mis Chats</Text>
          <Text style={[styles.subtitulo, { color: currentColors.border }]}>Conversaciones recientes</Text>
        </View>
        <FlatList
          data={contactos}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => (
            <TouchableOpacity 
              style={[styles.item, { backgroundColor: currentColors.card, borderBottomColor: currentColors.border }]} 
              onPress={() => setChatActivo(item)}
            >
              <View style={styles.avatar}>
                <Text style={{color:'white'}}>{item.nombre[0].toUpperCase()}</Text>
              </View>
              <View>
                <Text style={[styles.nombre, { color: currentColors.text }]}>{item.nombre}</Text>
                <Text style={{color: currentColors.border, fontSize: 12}}>Toca para ver mensajes</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.vacioContainer}>
              <Text style={[styles.vacio, { color: currentColors.text }]}>No tienes chats activos.</Text>
              <Text style={[styles.vacioSub, { color: currentColors.border }]}>Los contactos aparecerán cuando recibas o envíes un mensaje.</Text>
            </View>
          }
        />
      </SafeAreaView>
    );
  }

  // VISTA DEL CHAT
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      <View style={[styles.header, { backgroundColor: currentColors.card, borderBottomColor: currentColors.border }]}>
        <TouchableOpacity onPress={() => { 
          setChatActivo(null); 
          setMensajes([]);
          ultimoIdRef.current = 0;
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
          }
        }}>
          <Text style={{color: currentColors.text, fontWeight: 'bold', fontSize: 16}}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: currentColors.text }]}>{chatActivo.nombre}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={mensajes}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({item}) => {
          const esMio = Number(item.id_emisor) === Number(miId);
          return (
            <View style={[styles.msg, esMio ? styles.msgDerecha : styles.msgIzquierda]}>
              <Text style={esMio ? {color:'white'} : { color: currentColors.text }}>{item.contenido}</Text>
            </View>
          );
        }}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
        <View style={[styles.inputArea, { backgroundColor: currentColors.card, borderTopColor: currentColors.border }]}>
          <TextInput 
            style={[styles.input, { backgroundColor: currentColors.background, color: currentColors.text, borderColor: currentColors.border }]} 
            value={texto} 
            onChangeText={setTexto}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={currentColors.border}
            multiline
          />
          <TouchableOpacity style={styles.btn} onPress={enviar}>
            <Text style={{color:'white', fontWeight:'bold'}}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerSimple: { padding: 20, borderBottomWidth: 1, paddingTop: 40 },
  titulo: { fontSize: 24, fontWeight: 'bold' },
  subtitulo: { fontSize: 14 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 15, marginBottom: 1, borderBottomWidth: 1 },
  avatar: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  nombre: { fontSize: 16, fontWeight: 'bold' },
  header: { padding: 15, flexDirection: 'row', alignItems: 'center', paddingTop: 40, borderBottomWidth: 1 },
  headerText: { marginLeft: 20, fontSize: 18, fontWeight: 'bold' },
  msg: { padding: 12, borderRadius: 18, margin: 5, maxWidth: '80%' },
  msgDerecha: { alignSelf: 'flex-end', backgroundColor: '#007AFF', borderBottomRightRadius: 2 },
  msgIzquierda: { alignSelf: 'flex-start', backgroundColor: '#E5E5EA', borderBottomLeftRadius: 2 },
  inputArea: { flexDirection: 'row', padding: 10, borderTopWidth: 1, alignItems: 'center' },
  input: { flex: 1, borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, maxHeight: 100, borderWidth: 1 },
  btn: { marginLeft: 10, backgroundColor: '#007AFF', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, justifyContent: 'center' },
  vacioContainer: { padding: 40, alignItems: 'center' },
  vacio: { textAlign: 'center', fontSize: 16, fontWeight: 'bold' },
  vacioSub: { textAlign: 'center', fontSize: 14, marginTop: 10 }
});
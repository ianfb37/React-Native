import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView, Platform, SafeAreaView,
  StyleSheet,
  Text,
  TextInput, TouchableOpacity,
  View
} from 'react-native';

interface Contacto {
  id: number;
  nombre: string;
}

interface Mensaje {
  id: number;
  id_emisor: number;
  id_receptor: number;
  contenido: string;
  tipo: string;
  fecha_envio?: string;
}

const API_URL = 'http://192.168.0.132:3000/api'; 

export default function MesajeriaScreen() {
  const [miId, setMiId] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [chatActivo, setChatActivo] = useState<Contacto | null>(null);
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState<string>('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const cargarDatosDesdePC = async () => {
      try {
        const response = await fetch(`${API_URL}/mis-contactos`);
        const data = await response.json();

        if (response.ok) {
          setContactos(data);
          
         
        } else {
          console.log("Error: El PC no recuerda ninguna sesión activa.");
        }
      } catch (e) {
        console.error('Error conectando con el PC:', e);
      } finally {
        setCargando(false);
      }
    };

    cargarDatosDesdePC();
  }, []);

  // 2. CARGAR MENSAJES (Cuando entramos en un chat)
  useEffect(() => {
    let intervalo: ReturnType<typeof setInterval> | undefined;
    
    if (chatActivo) {
      const traerMensajes = () => {
        
        fetch(`${API_URL}/mensajes/${chatActivo.id}/sesion-pc`) 
          .then(res => res.json())
          .then((data: Mensaje[]) => setMensajes(data))
          .catch(e => console.log("Error mensajes:", e));
      };

      traerMensajes();
      intervalo = setInterval(traerMensajes, 3000);
    }
    
    return () => { if (intervalo) clearInterval(intervalo); };
  }, [chatActivo]);

  const enviar = () => {
    if (!texto.trim() || !chatActivo) return;

    const body = {
      // Enviamos un flag o el ID 0 para que el servidor use 'ultimoIdLogueado'
      id_emisor: 'auto', 
      id_receptor: chatActivo.id,
      contenido: texto,
      tipo: 'texto',
      id_referencia: null
    };

    fetch(`${API_URL}/mensajes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    .then(() => {
      setTexto('');
      // Recargar tras enviar
    });
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Conectando con el PC...</Text>
      </View>
    );
  }

  // VISTA DE LISTA DE CONTACTOS
  if (!chatActivo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerSimple}>
          <Text style={styles.titulo}>Mensajería PC</Text>
          <Text style={styles.subtitulo}>Sesión gestionada por el servidor</Text>
        </View>
        <FlatList
          data={contactos}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => (
            <TouchableOpacity style={styles.item} onPress={() => setChatActivo(item)}>
              <View style={styles.avatar}><Text style={{color:'white'}}>{item.nombre[0]}</Text></View>
              <Text style={styles.nombre}>{item.nombre}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.vacio}>No se encontraron otros usuarios</Text>}
        />
      </SafeAreaView>
    );
  }

  // VISTA DEL CHAT
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setChatActivo(null)}>
          <Text style={{color: 'white', fontWeight: 'bold'}}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>{chatActivo.nombre}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={mensajes}
        keyExtractor={item => item.id.toString()}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({item}) => {
            // Aquí el servidor debería decirnos si el mensaje es nuestro o no
            const esMio = item.id_emisor !== chatActivo.id; 
            return (
                <View style={[styles.msg, esMio ? styles.msgDerecha : styles.msgIzquierda]}>
                    <Text style={esMio ? {color:'white'} : {color:'black'}}>{item.contenido}</Text>
                </View>
            );
        }}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.inputArea}>
          <TextInput 
            style={styles.input} 
            value={texto} 
            onChangeText={setTexto}
            placeholder="Escribe un mensaje..."
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
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerSimple: { padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#DDD', paddingTop: 50 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  subtitulo: { fontSize: 12, color: '#666' },
  item: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: 'white', marginBottom: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  nombre: { fontSize: 16, fontWeight: '500' },
  header: { padding: 15, backgroundColor: '#007AFF', flexDirection: 'row', alignItems: 'center', paddingTop: 50 },
  headerText: { color: 'white', marginLeft: 20, fontSize: 18, fontWeight: 'bold' },
  msg: { padding: 12, borderRadius: 15, margin: 5, maxWidth: '75%' },
  msgDerecha: { alignSelf: 'flex-end', backgroundColor: '#007AFF', borderBottomRightRadius: 2 },
  msgIzquierda: { alignSelf: 'flex-start', backgroundColor: '#E5E5EA', borderBottomLeftRadius: 2 },
  inputArea: { flexDirection: 'row', padding: 15, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#EEE' },
  input: { flex: 1, backgroundColor: '#F0F0F0', borderRadius: 25, paddingHorizontal: 20, height: 45 },
  btn: { marginLeft: 10, backgroundColor: '#007AFF', paddingHorizontal: 20, borderRadius: 25, justifyContent: 'center' },
  vacio: { textAlign: 'center', marginTop: 50, color: '#999' }
});
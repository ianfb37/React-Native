import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';

export default function SettingsScreen() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [form, setForm] = useState({
    emailNotifications: true,
    pushNotifications: false,
  });

  // IP de tu servidor
  const BASE_URL = "http://192.168.0.132:3000";

  useEffect(() => {
    fetch(`${BASE_URL}/api/usuarios/perfil-actual`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setUsuario(data);
      })
      .catch(err => console.log("Error cargando perfil:", err));
  }, []);

  const manejarLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sí, salir", onPress: () => router.replace('/') }
    ]);
  };

  // Construir URL de la imagen
  const imageUri = usuario?.imagen 
    ? (usuario.imagen.startsWith('http') ? usuario.imagen : `${BASE_URL}${usuario.imagen}`)
    : 'https://via.placeholder.com/150';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f8f8' }}>
      <View style={styles.header}>
        <View style={styles.headerAction}>
          <TouchableOpacity onPress={() => router.back()}>
            <FeatherIcon color="#000" name="arrow-left" size={24} />
          </TouchableOpacity>
        </View>

        <Text numberOfLines={1} style={styles.headerTitle}>
          Ajustes
        </Text>

        <View style={[styles.headerAction, { alignItems: 'flex-end' }]}>
          <TouchableOpacity>
            <FeatherIcon color="#000" name="more-vertical" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.section, { paddingTop: 4 }]}>
          <Text style={styles.sectionTitle}>Cuenta</Text>

          <View style={styles.sectionBody}>
            <TouchableOpacity style={styles.profile}>
              <Image
                source={{ uri: imageUri }}
                style={styles.profileAvatar} 
              />

              <View style={styles.profileBody}>
                <Text style={styles.profileName}>
                  {usuario ? usuario.nombre : 'Cargando...'}
                </Text>
                <Text style={styles.profileHandle}>Perfil de usuario</Text>
              </View>

              <FeatherIcon color="#bcbcbc" name="chevron-right" size={22} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferencias</Text>

          <View style={styles.sectionBody}>
            <View style={[styles.rowWrapper, styles.rowFirst]}>
              <TouchableOpacity style={styles.row}>
                <Text style={styles.rowLabel}>Idioma</Text>
                <View style={styles.rowSpacer} />
                <Text style={styles.rowValue}>Español</Text>
                <FeatherIcon color="#bcbcbc" name="chevron-right" size={19} />
              </TouchableOpacity>
            </View>

            <View style={styles.rowWrapper}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Notificaciones Email</Text>
                <View style={styles.rowSpacer} />
                <Switch
                  onValueChange={emailNotifications => setForm({ ...form, emailNotifications })}
                  value={form.emailNotifications} 
                />
              </View>
            </View>

            <View style={[styles.rowWrapper, styles.rowLast]}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Notificaciones Push</Text>
                <View style={styles.rowSpacer} />
                <Switch
                  onValueChange={pushNotifications => setForm({ ...form, pushNotifications })}
                  value={form.pushNotifications} 
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionBody}>
            <View style={[styles.rowWrapper, styles.rowFirst, styles.rowLast, { alignItems: 'center' }]}>
              <TouchableOpacity onPress={manejarLogout} style={styles.row}>
                <Text style={[styles.rowLabel, styles.rowLabelLogout]}>
                  Cerrar Sesión
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={styles.contentFooter}>Ajustes</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 16, paddingVertical: 10 },
  headerAction: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 19, fontWeight: '600', color: '#000', flexGrow: 1, textAlign: 'center' },
  content: { paddingHorizontal: 16 },
  contentFooter: { marginTop: 24, fontSize: 13, fontWeight: '500', textAlign: 'center', color: '#a69f9f' },
  section: { paddingVertical: 12 },
  sectionTitle: { margin: 8, marginLeft: 12, fontSize: 13, fontWeight: '500', color: '#a69f9f', textTransform: 'uppercase' },
  sectionBody: { borderRadius: 12, backgroundColor: '#fff', overflow: 'hidden' },
  profile: { padding: 12, flexDirection: 'row', alignItems: 'center' },
  profileAvatar: { width: 60, height: 60, borderRadius: 9999, marginRight: 12 },
  profileBody: { marginRight: 'auto' },
  profileName: { fontSize: 18, fontWeight: '600', color: '#292929' },
  profileHandle: { marginTop: 2, fontSize: 14, color: '#858585' },
  row: { height: 50, width: '100%', flexDirection: 'row', alignItems: 'center', paddingRight: 12 },
  rowWrapper: { paddingLeft: 16, borderTopWidth: 1, borderColor: '#f0f0f0' },
  rowFirst: { borderTopWidth: 0 },
  rowLast: {},
  rowLabel: { fontSize: 16, color: '#000' },
  rowSpacer: { flex: 1 },
  rowValue: { fontSize: 16, color: '#ababab', marginRight: 4 },
  rowLabelLogout: { width: '100%', textAlign: 'center', fontWeight: '600', color: '#dc2626' },
});
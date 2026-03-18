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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../app/ThemeContext';
import { colors } from '../app/colors';

export default function SettingsScreen() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  
  const [usuario, setUsuario] = useState<any>(null);
  const [form, setForm] = useState({
    emailNotifications: true,
    pushNotifications: false,
    DarkTheme: isDarkMode,
  });

  const BASE_URL = `https://busan.dvpla.com`;

  useEffect(() => {
    cargarUsuario();
    // Sincronizar el estado del switch con el tema actual
    setForm(prev => ({ ...prev, DarkTheme: isDarkMode }));
  }, [isDarkMode]);

  const cargarUsuario = async () => {
    try {
      const idUsuario = await AsyncStorage.getItem('id_usuario');
      const nombreUsuario = await AsyncStorage.getItem('usuario');
      const imagenUsuario = await AsyncStorage.getItem('imagen');

      if (idUsuario && nombreUsuario) {
        setUsuario({
          id: idUsuario,
          nombre: nombreUsuario,
          imagen: imagenUsuario || '/assets/default.jpg'
        });
      } else {
        console.log("No hay usuario en AsyncStorage");
      }
    } catch (err) {
      console.log("Error cargando perfil:", err);
    }
  };

  const manejarLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sí, salir",
        onPress: async () => {
          await AsyncStorage.removeItem('id_usuario');
          await AsyncStorage.removeItem('usuario');
          await AsyncStorage.removeItem('imagen');
          router.replace('/');
        }
      }
    ]);
  };

  // Construir URL de la imagen
  const imageUri = usuario?.imagen
    ? (usuario.imagen.startsWith('http')
      ? usuario.imagen
      : `${BASE_URL}${usuario.imagen.startsWith('/') ? '' : '/'}${usuario.imagen}`)
    : 'https://via.placeholder.com/150';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      

      <ScrollView contentContainerStyle={styles.content}>
        {/* SECCIÓN CUENTA */}
        <View style={[styles.section, { paddingTop: 4 }]}>
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
            Cuenta
          </Text>

          <View style={[styles.sectionBody, { backgroundColor: currentColors.card }]}>
            <TouchableOpacity style={styles.profile}>
              <Image
                source={{ uri: imageUri }}
                style={styles.profileAvatar}
                onError={() => console.log("Error cargando imagen")}
              />

              <View style={styles.profileBody}>
                <Text style={[styles.profileName, { color: currentColors.text }]}>
                  {usuario ? usuario.nombre : 'Cargando...'}
                </Text>
                <Text style={[styles.profileHandle, { color: currentColors.border }]}>
                  Perfil de usuario
                </Text>
              </View>

              <FeatherIcon color={currentColors.border} name="chevron-right" size={22} />
            </TouchableOpacity>
          </View>
        </View>

        {/* SECCIÓN PREFERENCIAS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
            Preferencias
          </Text>

          <View style={[styles.sectionBody, { backgroundColor: currentColors.card }]}>
            {/* Idioma */}
            <View style={[styles.rowWrapper, styles.rowFirst, { borderTopColor: currentColors.border }]}>
              <TouchableOpacity style={styles.row}>
                <Text style={[styles.rowLabel, { color: currentColors.text }]}>
                  Idioma
                </Text>
                <View style={styles.rowSpacer} />
                <Text style={[styles.rowValue, { color: currentColors.border }]}>
                  Español
                </Text>
                <FeatherIcon color={currentColors.border} name="chevron-right" size={19} />
              </TouchableOpacity>
            </View>

            {/* Notificaciones Email */}
            <View style={[styles.rowWrapper, { borderTopColor: currentColors.border }]}>
              <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: currentColors.text }]}>
                  Notificaciones Email
                </Text>
                <View style={styles.rowSpacer} />
                <Switch
                  onValueChange={emailNotifications => 
                    setForm({ ...form, emailNotifications })
                  }
                  value={form.emailNotifications}
                  trackColor={{ false: '#767577', true: '#81c784' }}
                  thumbColor={form.emailNotifications ? '#4caf50' : '#f4f3f4'}
                />
              </View>
            </View>

            {/* Notificaciones Push */}
            <View style={[styles.rowWrapper, { borderTopColor: currentColors.border }]}>
              <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: currentColors.text }]}>
                  Notificaciones Push
                </Text>
                <View style={styles.rowSpacer} />
                <Switch
                  onValueChange={pushNotifications => 
                    setForm({ ...form, pushNotifications })
                  }
                  value={form.pushNotifications}
                  trackColor={{ false: '#767577', true: '#81c784' }}
                  thumbColor={form.pushNotifications ? '#4caf50' : '#f4f3f4'}
                />
              </View>
            </View>

            {/* Tema Oscuro */}
            <View style={[styles.rowWrapper, styles.rowLast, { borderTopColor: currentColors.border }]}>
              <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: currentColors.text }]}>
                  Tema Oscuro
                </Text>
                <View style={styles.rowSpacer} />
                <Switch
                  onValueChange={(isDark) => {
                    setForm({ ...form, DarkTheme: isDark });
                    toggleTheme(isDark);
                  }}
                  value={form.DarkTheme}
                  trackColor={{ false: '#767577', true: '#81c784' }}
                  thumbColor={form.DarkTheme ? '#4caf50' : '#f4f3f4'}
                />
              </View>
            </View>
          </View>
        </View>

        {/* SECCIÓN LOGOUT */}
        <View style={styles.section}>
          <View style={[styles.sectionBody, { backgroundColor: currentColors.card }]}>
            <View style={[styles.rowWrapper, styles.rowFirst, styles.rowLast, { alignItems: 'center' }]}>
              <TouchableOpacity onPress={manejarLogout} style={styles.row}>
                <Text style={[styles.rowLabel, styles.rowLabelLogout]}>
                  Cerrar Sesión
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={[styles.contentFooter, { color: currentColors.border }]}>
          Ajustes
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    width: '100%', 
    paddingHorizontal: 16, 
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerAction: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 19, fontWeight: '600', flexGrow: 1, textAlign: 'center' },
  content: { paddingHorizontal: 16 },
  contentFooter: { marginTop: 24, fontSize: 13, fontWeight: '500', textAlign: 'center' },
  section: { paddingVertical: 12 },
  sectionTitle: { margin: 8, marginLeft: 12, fontSize: 13, fontWeight: '500', textTransform: 'uppercase' },
  sectionBody: { borderRadius: 12, overflow: 'hidden' },
  profile: { padding: 12, flexDirection: 'row', alignItems: 'center' },
  profileAvatar: { width: 60, height: 60, borderRadius: 9999, marginRight: 12 },
  profileBody: { marginRight: 'auto' },
  profileName: { fontSize: 18, fontWeight: '600' },
  profileHandle: { marginTop: 2, fontSize: 14 },
  row: { height: 50, width: '100%', flexDirection: 'row', alignItems: 'center', paddingRight: 12, paddingLeft: 12 },
  rowWrapper: { paddingLeft: 0, borderTopWidth: 1 },
  rowFirst: { borderTopWidth: 0 },
  rowLast: {},
  rowLabel: { fontSize: 16 },
  rowSpacer: { flex: 1 },
  rowValue: { fontSize: 16, marginRight: 4 },
  rowLabelLogout: { width: '100%', textAlign: 'center', fontWeight: '600', color: '#dc2626' },
});

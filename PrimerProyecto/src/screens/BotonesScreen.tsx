import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../app/ThemeContext';
import { colors } from '../app/colors';
import { Calendar } from 'lucide-react';

export default function BotonesScreen() {
  const { isDarkMode } = useTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      <TouchableOpacity
        style={[styles.botonCalendario, { backgroundColor: currentColors.primary }]}
        onPress={() => router.push('/calendario')}
      >
        <Calendar size={24} color="#fff" />
        <Text style={styles.textoBoton}>Ir al Calendario</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  botonCalendario: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  textoBoton: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
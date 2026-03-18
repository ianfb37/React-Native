import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../app/ThemeContext';
import { colors } from '../app/colors';

export default function BotonesScreen() {
  const { isDarkMode } = useTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      {/* Contenido vacío */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

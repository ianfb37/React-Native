import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../components/common/Button';
export default function Home() {
const [isLoading, setIsLoading] = useState(false);
const router =useRouter();
const handlePrimaryPress = async () => {
  setIsLoading(true);
  setTimeout(() => {
    Alert.alert('¡Éxito!', 'Botón primario presionado');

    setIsLoading(false);
  }, 100);
};
const handleAlumnosPress = ()=>{
  router.push('/alumnos');

}
const handleRecetasPress = ()=>{
  router.push('/recetas');

}
return (
  <ScrollView style={styles.scrollContainer}>
    <View style={styles.container}>
      <Text style={styles.title}>Gestion de Alumnado</Text>
      <Text style={styles.subtitle}>Con Expo Router</Text>
<Button
  title="Ver Alumnos"
  onPress={handleAlumnosPress}
  variant="primary"
/>
      <Button
        title="Botón Primario"
        onPress={handleRecetasPress}
        variant="primary"
        loading={isLoading}
      />

      <Button
        title="Botón Secundario"
        onPress={() => Alert.alert('Secundario')}
        variant="secondary"
      />

      
    </View>
  </ScrollView>
);
} 

const styles = StyleSheet.create({
scrollContainer: {
  flex: 1,
  backgroundColor: '#fffefe',
},
container: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 20,
  paddingVertical: 40,
},
title: {
  fontSize: 28,
  fontWeight: 'bold',
  marginBottom: 8,
  color: '#000000',
},
subtitle: {
  fontSize: 16,
  color: '#4b7a90',
  marginBottom: 30,
  
},

});
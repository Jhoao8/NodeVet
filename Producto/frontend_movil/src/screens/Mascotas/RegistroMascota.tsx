import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Alert, ScrollView, Image, ActivityIndicator, Platform 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '@/src/api/axiosInstance';
import { colors } from '@/src/theme/colors';
import { globalStyles } from '@/src/style/GlobalStyle';
import { Ionicons } from '@expo/vector-icons';

export default function RegistroMascota() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const [form, setForm] = useState({
    nomMascota: '',
    especie: '',
    raza: '',
    sexo: 1,
    fecNacEst: 0,
    peso: '',
  });

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  // --- FUNCIÓN DE SUBIDA A CLOUDINARY (ESPECÍFICA PARA MASCOTAS) ---
  const subirImagenCloudinary = async (uri: string) => {
    const data = new FormData();
    
    data.append('file', {
      uri: uri,
      type: 'image/jpeg',
      name: 'foto_mascota.jpg',
    } as any);
    
    // Usamos el preset que configuraste para la carpeta de mascotas
    data.append('upload_preset', 'mascotas_preset'); 

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/dkryb2g4m/image/upload', {
        method: 'POST',
        body: data,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
        },
      });
      const result = await response.json();
      
      if (result.secure_url) {
        return result.secure_url;
      } else {
        console.error("Respuesta de Cloudinary sin URL:", result);
        return null;
      }
    } catch (error) {
      console.error("Error de conexión con Cloudinary:", error);
      return null;
    }
  };

  const handleRegistrar = async () => {
    if (!form.nomMascota || !form.especie || !form.peso) {
      Alert.alert("Campos obligatorios", "Por favor completa el nombre, especie y peso.");
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;

      // 1. Solo subimos si el usuario eligió una imagen
      if (image) {
        imageUrl = await subirImagenCloudinary(image);
        if (!imageUrl) {
          Alert.alert("Error de imagen", "No se pudo subir la foto. ¿Quieres intentar registrar sin foto?");
          setLoading(false);
          return;
        }
      }

      const fechaFormateada = date.toISOString().split('T')[0];

      const payload = {
        nomMascota: form.nomMascota,
        especie: form.especie,
        raza: form.raza,
        sexo: form.sexo,
        fecNac: fechaFormateada,
        fecNacEst: form.fecNacEst,
        peso: parseFloat(form.peso),
        imagenMascota: imageUrl // Enviamos la URL o null si no hay foto
      };

      await api.post('/v1/mascotas/registrar', payload);
      
      Alert.alert("¡Éxito!", `${form.nomMascota} registrado correctamente.`);
      navigation.goBack();
    } catch (error) {
      console.error("Error en el registro:", error);
      Alert.alert("Error", "No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.previewImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="camera" size={40} color={colors.darkGreen} />
            <Text style={styles.imageText}>Subir foto (Opcional)</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.formCard}>
        <Text style={styles.label}>Nombre de la mascota</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej: Jhoao" 
          onChangeText={(v) => setForm({...form, nomMascota: v})} 
        />

        <Text style={styles.label}>Fecha de Nacimiento</Text>
        <TouchableOpacity style={styles.dateSelector} onPress={() => setShowPicker(true)}>
          <Ionicons name="calendar-outline" size={20} color={colors.darkDGreen} />
          <Text style={styles.dateText}>
            {date.toLocaleDateString('es-ES')}
          </Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={onChangeDate}
          />
        )}

        <TouchableOpacity 
          style={styles.checkboxContainer} 
          onPress={() => setForm({...form, fecNacEst: form.fecNacEst === 0 ? 1 : 0})}
        >
          <View style={[styles.checkbox, form.fecNacEst === 1 && styles.checkboxChecked]}>
            {form.fecNacEst === 1 && <Ionicons name="checkmark" size={16} color={colors.darkDGreen} />}
          </View>
          <Text style={styles.checkboxLabel}>¿La fecha es estimada?</Text>
        </TouchableOpacity>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.label}>Especie</Text>
            <TextInput style={styles.input} placeholder="Perro..." onChangeText={(v) => setForm({...form, especie: v})} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Raza</Text>
            <TextInput style={styles.input} placeholder="Mestizo..." onChangeText={(v) => setForm({...form, raza: v})} />
          </View>
        </View>

        <Text style={styles.label}>Sexo</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity 
            style={[styles.radioButton, form.sexo === 1 && styles.radioSelected]} 
            onPress={() => setForm({...form, sexo: 1})}
          >
            <Text style={[styles.radioText, form.sexo === 1 && styles.radioTextSelected]}>Macho</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.radioButton, form.sexo === 0 && styles.radioSelected]} 
            onPress={() => setForm({...form, sexo: 0})}
          >
            <Text style={[styles.radioText, form.sexo === 0 && styles.radioTextSelected]}>Hembra</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Peso (Kg)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="0.0" 
          keyboardType="numeric" 
          onChangeText={(v) => setForm({...form, peso: v})} 
        />

        <TouchableOpacity 
          style={[globalStyles.primaryButton, { marginTop: 30 }]} 
          onPress={handleRegistrar} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.darkDGreen} />
          ) : (
            <Text style={globalStyles.primaryButtonText}>Guardar Mascota</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.darkDGreen },
  imagePicker: { height: 160, backgroundColor: colors.lightYellow, margin: 20, borderRadius: 15, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { alignItems: 'center' },
  imageText: { color: colors.darkGreen, marginTop: 5 },
  formCard: { paddingHorizontal: 20 },
  label: { color: colors.lightYellow, fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 5 },
  input: { backgroundColor: colors.white, borderRadius: 10, padding: 12, color: colors.darkDGreen },
  dateSelector: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: 10, padding: 12, alignItems: 'center' },
  dateText: { marginLeft: 10, color: colors.darkDGreen, fontSize: 16 },
  row: { flexDirection: 'row' },
  radioGroup: { flexDirection: 'row', gap: 10 },
  radioButton: { flex: 1, borderWidth: 1, borderColor: colors.lightGreen, borderRadius: 10, padding: 12, alignItems: 'center' },
  radioSelected: { backgroundColor: colors.lightGreen },
  radioText: { color: colors.lightGreen, fontWeight: '600' },
  radioTextSelected: { color: colors.darkDGreen },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  checkbox: { width: 22, height: 22, borderWidth: 2, borderColor: colors.lightGreen, borderRadius: 6, marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: colors.lightGreen },
  checkboxLabel: { color: colors.lightYellow },
});
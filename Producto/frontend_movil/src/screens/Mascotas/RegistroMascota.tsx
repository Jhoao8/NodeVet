import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Alert, ScrollView, Image, ActivityIndicator, Platform,
  Modal, FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '@/src/api/axiosInstance';
import { colors } from '@/src/theme/colors';
import { globalStyles } from '@/src/style/GlobalStyle';
import { dashboardStyles } from '@/src/style/DashboardStyle';
import { Ionicons } from '@expo/vector-icons';

export default function RegistroMascota() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [showEspecieModal, setShowEspecieModal] = useState(false);

  const ESPECIES = ['Perro', 'Gato', 'Ave', 'Roedor', 'Reptil', 'Otro'];

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
    <ScrollView style={[globalStyles.scrollContainer, dashboardStyles.lightBackground]}>
      <TouchableOpacity style={globalStyles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={globalStyles.previewImage} />
        ) : (
          <View style={globalStyles.imagePlaceholder}>
            <Ionicons name="camera" size={40} color={colors.darkGreen} />
            <Text style={globalStyles.imageText}>Subir foto (Opcional)</Text>
          </View>
        )}
      </TouchableOpacity>

      <View>
        <Text style={globalStyles.darkLabel}>Nombre de la mascota</Text>
        <TextInput 
          style={globalStyles.lightInput} 
          placeholder="Ej: Jhoao" 
          onChangeText={(v) => setForm({...form, nomMascota: v})} 
        />

        <Text style={globalStyles.darkLabel}>Fecha de Nacimiento</Text>
        <TouchableOpacity style={globalStyles.dateSelector} onPress={() => setShowPicker(true)}>
          <Ionicons name="calendar-outline" size={20} color={colors.darkDGreen} />
          <Text style={globalStyles.dateText}>
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
          style={globalStyles.checkboxContainer} 
          onPress={() => setForm({...form, fecNacEst: form.fecNacEst === 0 ? 1 : 0})}
        >
          <View style={[globalStyles.checkbox, form.fecNacEst === 1 && globalStyles.checkboxChecked]}>
            {form.fecNacEst === 1 && <Ionicons name="checkmark" size={16} color={colors.darkDGreen} />}
          </View>
          <Text style={globalStyles.checkboxLabel}>¿Es fecha es estimada?</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={globalStyles.darkLabel}>Especie</Text>
            <TouchableOpacity 
              style={globalStyles.lightInput} 
              onPress={() => setShowEspecieModal(true)}
            >
              <Text style={{ color: form.especie ? colors.darkDGreen : '#A0A0A0' }}>
                {form.especie || 'Seleccionar...'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={globalStyles.darkLabel}>Raza</Text>
            <TextInput style={globalStyles.lightInput} placeholder="Mestizo..." onChangeText={(v) => setForm({...form, raza: v})} />
          </View>
        </View>

        <Text style={globalStyles.darkLabel}>Sexo</Text>
        <View style={globalStyles.radioGroup}>
          <TouchableOpacity 
            style={[globalStyles.radioButton, form.sexo === 1 && globalStyles.radioSelected]} 
            onPress={() => setForm({...form, sexo: 1})}
          >
            <Text style={[globalStyles.radioText, form.sexo === 1 && globalStyles.radioTextSelected]}>Macho</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[globalStyles.radioButton, form.sexo === 0 && globalStyles.radioSelected]} 
            onPress={() => setForm({...form, sexo: 0})}
          >
            <Text style={[globalStyles.radioText, form.sexo === 0 && globalStyles.radioTextSelected]}>Hembra</Text>
          </TouchableOpacity>
        </View>

        <Text style={globalStyles.darkLabel}>Peso (Kg)</Text>
        <TextInput 
          style={globalStyles.lightInput} 
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

      {/* Modal para Seleccionar Especie */}
      <Modal
        visible={showEspecieModal}
        transparent={true}
        animationType="fade"
      >
        <TouchableOpacity 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
          activeOpacity={1}
          onPress={() => setShowEspecieModal(false)}
        >
          <View style={{ width: '80%', backgroundColor: colors.white, borderRadius: 12, padding: 20 }}>
            <Text style={[globalStyles.darkLabel, { textAlign: 'center', fontSize: 18, marginBottom: 15 }]}>Selecciona la especie</Text>
            <FlatList
              data={ESPECIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={{ paddingVertical: 15, borderBottomWidth: 1, borderColor: colors.lightGreen }}
                  onPress={() => {
                    setForm({ ...form, especie: item });
                    setShowEspecieModal(false);
                  }}
                >
                  <Text style={{ color: colors.darkDGreen, textAlign: 'center', fontSize: 16 }}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

    </ScrollView>
  );
}
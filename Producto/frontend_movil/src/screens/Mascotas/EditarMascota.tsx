import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  Alert, ScrollView, Image, ActivityIndicator 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '@/src/api/axiosInstance';
import { colors } from '@/src/theme/colors';
import { globalStyles } from '@/src/style/GlobalStyle';
import { Ionicons } from '@expo/vector-icons';

export default function EditarMascota({ route, navigation }: any) {
  // Extraemos la mascota que nos pasó DetalleMascotaScreen
  const { mascota } = route.params;

  const [nomMascota, setNomMascota] = useState(mascota.nomMascota || '');
  const [peso, setPeso] = useState(mascota.peso?.toString() || '');
  const [image, setImage] = useState<string | null>(mascota.imagenMascota || null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const subirImagenCloudinary = async (uri: string) => {
    const data = new FormData();
    data.append('file', {
      uri: uri,
      type: 'image/jpeg',
      name: 'foto_mascota.jpg',
    } as any);
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
      return result.secure_url ? result.secure_url : null;
    } catch (error) {
      console.error("Error de conexión con Cloudinary:", error);
      return null;
    }
  };

  const handleEditar = async () => {
    if (!nomMascota) {
      Alert.alert("Campos obligatorios", "Por favor ingresa el nombre de la mascota.");
      return;
    }

    setLoading(true);
    try {
      let imageUrl = mascota.imagenMascota;

      // Si la imagen seleccionada es distinta a la que tenía, subimos la nueva
      if (image && image !== mascota.imagenMascota) {
        const nuevaUrl = await subirImagenCloudinary(image);
        if (nuevaUrl) {
          imageUrl = nuevaUrl;
        } else {
          Alert.alert("Error de imagen", "No se pudo subir la nueva foto.");
          setLoading(false);
          return;
        }
      }

      const payload = {
        ...mascota, // Enviamos los datos originales (el backend decidirá cuáles ignora)
        nomMascota: nomMascota,
        peso: parseFloat(peso),
        imagenMascota: imageUrl
      };

      // Se envía la petición PUT a la ruta confirmada en el backend
      await api.put(`/v1/mascotas/actualizar/${mascota.idMascota}`, payload);
      
      Alert.alert("¡Éxito!", `Datos actualizados correctamente.`);
      navigation.goBack(); // Regresamos a la pantalla de detalles
      
    } catch (error) {
      console.error("Error al actualizar:", error);
      Alert.alert("Error", "No se pudo actualizar la mascota.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[globalStyles.scrollContainer, { backgroundColor: colors.lightYellow }]}>
      
      <View style={{ alignItems: 'center'}}>
        <Text style={[globalStyles.darkLabel, { textAlign: 'center'}]}>Cambiar foto de la Mascota</Text>
        <TouchableOpacity style={globalStyles.imagePickerBig} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={globalStyles.previewImage} />
          ) : (
            <View style={globalStyles.imagePlaceholder}>
              <Ionicons name="camera-outline" size={40} color={colors.darkGreen} />
              <Text style={globalStyles.imageText}>Seleccionar foto</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Text style={globalStyles.darkLabel}>Nombre de la Mascota</Text>
      <TextInput
        style={globalStyles.lightInput}
        value={nomMascota}
        onChangeText={setNomMascota}
      />

      <Text style={globalStyles.darkLabel}>Peso Actual (Kg)</Text>
      <TextInput
        style={globalStyles.lightInput}
        keyboardType="numeric"
        value={peso}
        onChangeText={setPeso}
      />

      <View style={{ marginTop: 20, marginBottom: 40, padding: 15, backgroundColor: colors.white, borderRadius: 10, borderWidth: 1, borderColor: colors.lightGreen }}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Ionicons name="information-circle-outline" size={24} color={colors.darkGreen}/>
          <Text style={[globalStyles.darkLabel, {marginLeft: 10, marginBottom: 0}]}>Información Bloqueada</Text>
        </View>
        <Text style={{ color: colors.darkDGreen, marginTop: 10, fontSize: 13, lineHeight: 18 }}>
          Por seguridad, los datos médicos como especie, raza, sexo y fecha de nacimiento solo pueden ser modificados por un veterinario autorizado.
        </Text>
      </View>

      <TouchableOpacity 
        style={[globalStyles.primaryButton, { marginBottom: 40, opacity: loading ? 0.7 : 1 }]} 
        onPress={handleEditar}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <Text style={globalStyles.primaryButtonText}>Guardar Cambios</Text>
        )}
      </TouchableOpacity>

    </ScrollView>
  );
}

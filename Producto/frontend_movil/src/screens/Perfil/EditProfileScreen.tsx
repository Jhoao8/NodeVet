import React, { useState, useCallback } from 'react';
import { 
View, Text, StyleSheet, TouchableOpacity, ScrollView, 
ActivityIndicator, Image, TextInput, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';

import { globalStyles } from '../../style/GlobalStyle';
import { dashboardStyles } from '../../style/DashboardStyle';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import DashboardHeader from '../../components/DashboardHeader';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import axios from 'axios';
import { useCustomAlert } from '../../components/CustomAlert';

interface UserProfile {
idUsr?: number;
nombreUsr: string;
apellidoUsr: string;
correoUsr: string;
telefonoUsr: string;
fotoPerfil?: string;
}

export default function EditProfileScreen({ navigation }: any) {
const { userToken } = useAuth();
const [loading, setLoading] = useState(true);
const [uploading, setUploading] = useState(false);
const [saving, setSaving] = useState(false);

const [formData, setFormData] = useState<UserProfile>({
    nombreUsr: '',
    apellidoUsr: '',
    correoUsr: '',
    telefonoUsr: '',
    fotoPerfil: '',
});

const [selectedImage, setSelectedImage] = useState<string | null>(null);
const { showAlert, AlertComponent } = useCustomAlert();

// Obtener datos del perfil actual
const fetchUserProfile = async () => {
    if (!userToken) {
    setLoading(false);
    return;
    }

    try {
    setLoading(true);
    const response = await api.get('/v1/usuarios/perfil');
    setFormData(response.data);
    } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.log("Sesión terminada o token expirado.");
        return;
    }
    console.error("Error al obtener perfil:", error);
    showAlert('Error', 'No se pudo cargar los datos del perfil.');
    } finally {
    setLoading(false);
    }
};

useFocusEffect(
    useCallback(() => {
    fetchUserProfile();
    }, [userToken])
);

const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.5,
    });
    if (!result.canceled) {
    setSelectedImage(result.assets[0].uri);
    }
};

const subirImagenCloudinary = async (uri: string) => {
    const data = new FormData();
    data.append('file', {
    uri: uri,
    type: 'image/jpeg',
    name: 'foto_perfil.jpg',
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

const handleSaveChanges = async () => {
    // Validaciones
    if (!formData.nombreUsr.trim()) {
    showAlert('Campos obligatorios', 'Por favor ingresa el nombre.');
    return;
    }
    if (!formData.apellidoUsr.trim()) {
    showAlert('Campos obligatorios', 'Por favor ingresa el apellido.');
    return;
    }
    if (!formData.correoUsr.trim()) {
    showAlert('Campos obligatorios', 'Por favor ingresa el correo.');
    return;
    }

    try {
    setSaving(true);
    let updateData: any = {
        nombreUsr: formData.nombreUsr.trim(),
        apellidoUsr: formData.apellidoUsr.trim(),
        correoUsr: formData.correoUsr.trim(),
        telefonoUsr: formData.telefonoUsr.trim(),
    };

    // Si hay foto seleccionada, subirla primero
    if (selectedImage) {
        setUploading(true);
        const imageUrl = await subirImagenCloudinary(selectedImage);
        
        if (!imageUrl) {
        showAlert('Error', 'No se pudo subir la foto. Intenta de nuevo.');
        setSaving(false);
        setUploading(false);
        return;
        }
        
        updateData.fotoPerfil = imageUrl;
        setFormData(prev => ({ ...prev, fotoPerfil: imageUrl }));
        setSelectedImage(null);
        setUploading(false);
    }

    // Actualizar perfil en el backend
    await api.put('/v1/usuarios/actualizar', updateData);
    
    showAlert('¡Éxito!', 'Perfil actualizado correctamente.');
    setTimeout(() => {
        navigation.goBack();
    }, 500);
    } catch (error) {
    console.error('Error al guardar cambios:', error);
    showAlert('Error', 'No se pudo actualizar el perfil. Intenta de nuevo.');
    } finally {
    setSaving(false);
    setUploading(false);
    }
};

if (loading) {
    return (
    <View style={[globalStyles.container, dashboardStyles.lightBackground]}>
        <DashboardHeader />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.darkGreen} />
        </View>
    </View>
    );
}

const displayImage = selectedImage || formData.fotoPerfil;

return (
    <View style={[globalStyles.container, dashboardStyles.lightBackground]}>
    <DashboardHeader />

    <ScrollView 
        contentContainerStyle={globalStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
    >
        {/* ════════ TÍTULO ════════ */}
        <View style={dashboardStyles.greetingContainer}>
        <Text style={[dashboardStyles.greetingText, dashboardStyles.darkText]}>
            Editar perfil
        </Text>
        <View style={[dashboardStyles.greetingDivider, dashboardStyles.darkDivider]} />
        </View>

        {/* ════════ CAMPOS DE FORMULARIO ════════ */}
        <View style={styles.formContainer}>
        {/* Nombre */}
        <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre:</Text>
            <TextInput
            style={styles.input}
            placeholder={formData.nombreUsr || 'Nombre Actual'}
            placeholderTextColor={colors.darkGreen}
            value={formData.nombreUsr}
            onChangeText={(text) => setFormData({ ...formData, nombreUsr: text })}
            editable={!saving}
            />
        </View>

        {/* Apellido */}
        <View style={styles.inputGroup}>
            <Text style={styles.label}>Apellido:</Text>
            <TextInput
            style={styles.input}
            placeholder={formData.apellidoUsr || 'Apellido Actual'}
            placeholderTextColor={colors.darkGreen}
            value={formData.apellidoUsr}
            onChangeText={(text) => setFormData({ ...formData, apellidoUsr: text })}
            editable={!saving}
            />
        </View>

        {/* Correo */}
        <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo:</Text>
            <TextInput
            style={styles.input}
            placeholder={formData.correoUsr || 'Correo actual'}
            placeholderTextColor={colors.darkGreen}
            value={formData.correoUsr}
            onChangeText={(text) => setFormData({ ...formData, correoUsr: text })}
            editable={!saving}
            keyboardType="email-address"
            />
        </View>

        {/* Celular */}
        <View style={styles.inputGroup}>
            <Text style={styles.label}>Celular:</Text>
            <TextInput
            style={styles.input}
            placeholder={formData.telefonoUsr || 'Celular actual'}
            placeholderTextColor={colors.darkGreen}
            value={formData.telefonoUsr}
            onChangeText={(text) => setFormData({ ...formData, telefonoUsr: text })}
            editable={!saving}
            keyboardType="phone-pad"
            />
        </View>

        {/* Foto de Perfil */}
        <View style={styles.photoSection}>
            <Text style={styles.label}>Foto de perfil:</Text>
            <TouchableOpacity 
            style={styles.photoPlaceholder}
            onPress={pickImage}
            disabled={saving || uploading}
            >
            {displayImage ? (
                <>
                <Image 
                    source={{ uri: displayImage }} 
                    style={styles.photoImage}
                />
                {!uploading && (
                    <View style={styles.changePhotoIcon}>
                    <Ionicons name="close" size={24} color="white" />
                    </View>
                )}
                </>
            ) : (
                <View style={styles.photoPlaceholderContent}>
                <Ionicons name="image-outline" size={40} color={colors.darkGreen} />
                <Text style={styles.photoPlaceholderText}>Seleccionar foto</Text>
                </View>
            )}
            {uploading && (
                <View style={styles.changePhotoIcon}>
                <ActivityIndicator size="small" color="white" />
                </View>
            )}
            </TouchableOpacity>
        </View>
        </View>

        {/* ════════ BOTÓN GUARDAR ════════ */}
        <TouchableOpacity 
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSaveChanges}
        disabled={saving}
        >
        {saving ? (
            <ActivityIndicator size="small" color={colors.lightYellow} />
        ) : (
            <Text style={styles.saveButtonText}>Guardar cambios</Text>
        )}
        </TouchableOpacity>

    </ScrollView>
    <AlertComponent />
    </View>
);
}

// ════════ ESTILOS ════════
const styles = StyleSheet.create({
formContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
},
inputGroup: {
    marginBottom: spacing.lg,
},
label: {
    fontFamily: typography.family.main.semiBold,
    fontSize: typography.size.sm,
    color: colors.darkGreen,
    marginBottom: spacing.xs,
},
input: {
    borderWidth: 1.5,
    borderColor: colors.darkDGreen,
    borderRadius: 4,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontFamily: typography.family.main.regular,
    fontSize: typography.size.md,
    color: colors.darkDGreen,
    backgroundColor: 'white',
},
photoSection: {
    marginBottom: spacing.lg,
},
photoPlaceholder: {
    width: '100%',
    height: 200,
    borderWidth: 1.5,
    borderColor: colors.darkDGreen,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightYellow,
    overflow: 'hidden',
    position: 'relative',
},
photoImage: {
    width: '100%',
    height: '100%',
},
photoPlaceholderContent: {
    justifyContent: 'center',
    alignItems: 'center',
},
photoPlaceholderText: {
    marginTop: spacing.md,
    fontFamily: typography.family.main.medium,
    fontSize: typography.size.md,
    color: colors.darkGreen,
},
changePhotoIcon: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.darkGreen,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
},
saveButton: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.darkGreen,
    borderRadius: 8,
    alignItems: 'center',
},
saveButtonDisabled: {
    opacity: 0.6,
},
saveButtonText: {
    fontFamily: typography.family.main.bold,
    fontSize: typography.size.md,
    color: colors.lightYellow,
},
});

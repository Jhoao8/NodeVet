import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

// Importación de tu sistema de diseño completo
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
    nombreCompleto: string;
    correoUsr: string;
    telefonoUsr: string;
    fotoUsr?: string; 
}

export default function ProfileScreen({ navigation }: any) {
    const { userToken, signOut } = useAuth();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false); // Nuevo estado para la foto
    
    const { showAlert, AlertComponent } = useCustomAlert();

    const fetchUserProfile = async () => {
        if (!userToken) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await api.get('/v1/usuarios/perfil');
            setUser(response.data);
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                return;
            }
            console.error("Error al obtener perfil:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchUserProfile();
        }, [userToken])
    );

    // ════════ LÓGICA DE FOTO DE PERFIL ════════
    const subirImagenCloudinary = async (uri: string) => {
        const data = new FormData();
        data.append('file', {
            uri: uri,
            type: 'image/jpeg',
            name: 'foto_perfil.jpg',
        } as any);
        data.append('upload_preset', 'mascotas_preset'); // Sugerencia: Cambia a 'usuarios_preset' si lo creas luego

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

    const confirmarYSubirFoto = async (uri: string) => {
        setIsUploadingPhoto(true);
        try {
            const imageUrl = await subirImagenCloudinary(uri);
            if (!imageUrl) {
                showAlert('Error', 'No se pudo subir la imagen. Intenta nuevamente.');
                return;
            }

            // Aquí actualizamos solo la foto. 
            // Nota: Si tu backend requiere todos los datos en /actualizar, 
            // asegúrate de tener un endpoint dedicado como /actualizar-foto o mandar el payload completo.
            await api.put('/v1/usuarios/actualizar-foto', { fotoUsr: imageUrl });
            
            // Actualizamos la UI localmente al instante
            setUser(prev => prev ? { ...prev, fotoUsr: imageUrl } : null);
            showAlert('¡Éxito!', 'Tu foto de perfil ha sido actualizada.');

        } catch (error) {
            console.error("Error al actualizar la foto en backend:", error);
            showAlert('Error', 'No se pudo guardar la foto en tu perfil.');
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    const handlePhotoPress = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            const selectedUri = result.assets[0].uri;
            
            // Lanzamos el modal de confirmación antes de subir
            showAlert(
                'Actualizar foto',
                '¿Deseas establecer esta imagen como tu nueva foto de perfil?',
                [
                    {
                        text: 'Cancelar',
                        onPress: () => {},
                        style: 'cancel',
                    },
                    {
                        text: 'Sí, actualizar',
                        onPress: () => confirmarYSubirFoto(selectedUri),
                        style: 'default',
                    },
                ]
            );
        }
    };
    // ══════════════════════════════════════════

    const handleLogout = () => {
        showAlert(
            'Cerrar Sesión',
            '¿Estás seguro de que quieres cerrar sesión?',
            [
                { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
                {
                    text: 'Sí, cerrar sesión',
                    onPress: async () => {
                        try {
                            await signOut();
                        } catch (error) {
                            showAlert('Error', 'Error al cerrar sesión. Por favor intenta de nuevo.');
                        }
                    },
                    style: 'destructive',
                },
            ],
        );
    };

    return (
        <View style={[globalStyles.container, dashboardStyles.lightBackground]}>
            <DashboardHeader />

            <ScrollView contentContainerStyle={globalStyles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* ════════ TÍTULO DE SECCIÓN ════════ */}
                <View style={dashboardStyles.greetingContainer}>
                    <View style={styles.titleRow}>
                        <Text style={[dashboardStyles.greetingText, dashboardStyles.darkText]}>
                            Mi perfil
                        </Text>
                        <TouchableOpacity style={styles.editIcon} onPress={() => navigation.navigate('EditProfile')}>
                            <Ionicons name="pencil" size={20} color={colors.darkGreen} />
                        </TouchableOpacity>
                    </View>
                    <View style={[dashboardStyles.greetingDivider, dashboardStyles.darkDivider]} />
                </View>

                {/* ════════ TARJETA DE INFORMACIÓN ════════ */}
                {loading ? (
                    <View style={{ justifyContent: 'center', alignItems: 'center', marginVertical: spacing.xl }}>
                        <ActivityIndicator size="large" color={colors.darkGreen} />
                    </View>
                ) : (
                    <View style={styles.profileMainContainer}>
                        <View style={styles.topRowInfoContainer}>
                            
                            {/* FOTO DE PERFIL (Ahora es editable) */}
                            <TouchableOpacity 
                                style={styles.imagePlaceholder} 
                                activeOpacity={0.8}
                                onPress={handlePhotoPress}
                                disabled={isUploadingPhoto}
                            >
                                {isUploadingPhoto ? (
                                    <ActivityIndicator size="large" color={colors.darkGreen} />
                                ) : user?.fotoUsr ? (
                                    <>
                                        <Image source={{ uri: user.fotoUsr }} style={styles.profileImage} />
                                        {/* Pequeño icono flotante para indicar que es editable */}
                                        <View style={styles.editPhotoBadge}>
                                            <Ionicons name="camera" size={14} color="white" />
                                        </View>
                                    </>
                                ) : (
                                    <Ionicons name="camera-outline" size={50} color={colors.darkGreen} style={{ opacity: 0.6 }} />
                                )}
                            </TouchableOpacity>

                            {/* Datos Laterales */}
                            <View style={styles.sideInfoContainer}>
                                <View style={styles.infoBlock}>
                                    <Text style={styles.labelText}>Nombre:</Text>
                                    <View style={styles.valueBox}>
                                        <Text style={styles.valueText}>{user?.nombreCompleto || 'No registrado'}</Text>
                                    </View>
                                </View>
                                
                                <View style={styles.infoBlock}>
                                    <Text style={styles.labelText}>Teléfono:</Text>
                                    <View style={styles.valueBox}>
                                        <Text style={styles.valueText}>{user?.telefonoUsr || 'No registrado'}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* FILA INFERIOR: Email */}
                        <View style={styles.fullWidthInfoBlock}>
                            <Text style={styles.labelText}>Email:</Text>
                            <View style={styles.valueBox}>
                                <Text style={styles.valueText}>{user?.correoUsr || 'No registrado'}</Text>
                            </View>
                        </View>
                    </View>
                )}

                <View style={[dashboardStyles.greetingDivider, dashboardStyles.darkDivider, { marginVertical: spacing.lg }]} />

                {/* ════════ MENÚ DE OPCIONES ════════ */}
                <View style={styles.menuContainer}>
                    <TouchableOpacity style={styles.menuButton}>
                        <Text style={styles.menuButtonText}>Cambiar contraseña</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuButton}>
                        <Text style={styles.menuButtonText}>Configurar recordatorios</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuButton}>
                        <Text style={styles.menuButtonText}>Eliminar cuenta</Text>
                    </TouchableOpacity>
                </View>

                {/* ════════ BOTÓN CERRAR SESIÓN ════════ */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
                </TouchableOpacity>

            </ScrollView>
            <AlertComponent />
        </View>
    );
}

// ════════ ESTILOS LOCALES ════════
const styles = StyleSheet.create({
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
    editIcon: { padding: spacing.xs },
    
    profileMainContainer: { flexDirection: 'column', marginBottom: spacing.lg, paddingHorizontal: spacing.sm },
    topRowInfoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
    sideInfoContainer: { flex: 1, justifyContent: 'center' },
    fullWidthInfoBlock: { width: '100%' },

    valueBox: {
        backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lightGreen,
        borderRadius: 8, paddingHorizontal: spacing.sm, paddingVertical: 8,
    },
    imagePlaceholder: {
        width: 120, height: 120, borderWidth: 1.5, borderColor: colors.darkDGreen,
        justifyContent: 'center', alignItems: 'center', marginRight: spacing.lg,
        overflow: 'hidden', position: 'relative', borderRadius: 60, // Circular para que se vea como foto de perfil moderna (opcional, puedes quitar el borderRadius si la prefieres cuadrada)
    },
    profileImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    editPhotoBadge: {
        position: 'absolute', bottom: 5, right: 15, backgroundColor: colors.darkDGreen,
        padding: 6, borderRadius: 15, borderWidth: 2, borderColor: colors.white,
    },
    
    infoBlock: { marginBottom: spacing.sm },
    labelText: { fontFamily: typography.family.main.semiBold, fontSize: typography.size.xs, color: colors.darkGreen },
    valueText: { fontFamily: typography.family.main.bold, fontSize: typography.size.md, color: colors.darkDGreen },

    menuContainer: { gap: spacing.md },
    menuButton: {
        borderWidth: 1.5, borderColor: colors.darkDGreen, paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg, alignItems: 'center',
    },
    menuButtonText: { fontFamily: typography.family.main.medium, fontSize: typography.size.md, color: colors.darkDGreen },

    logoutButton: {
        borderWidth: 1.5, borderColor: colors.darkDGreen, paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg, borderRadius: 8, alignSelf: 'flex-start',
        marginTop: spacing.lg, marginBottom: spacing.xl,
    },
    logoutButtonText: { fontFamily: typography.family.main.bold, fontSize: typography.size.sm, color: colors.darkDGreen },
});
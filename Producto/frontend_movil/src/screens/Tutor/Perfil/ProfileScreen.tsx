import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ActivityIndicator, Image, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

// Importación de tu sistema de diseño completo
import { globalStyles } from '../../../style/GlobalStyle';
import { dashboardStyles } from '../../../style/DashboardStyle';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import DashboardHeader from '../../../components/DashboardHeader';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axiosInstance';
import axios from 'axios';
import { useCustomAlert } from '../../../components/CustomAlert';

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
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false); 
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordActual, setPasswordActual] = useState('');
    const [nuevaPassword, setNuevaPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    
    const { showAlert, AlertComponent } = useCustomAlert();

    const validacionesNuevaPassword = [
        {
            id: 'min',
            mensaje: 'Mínimo 6 caracteres',
            cumple: nuevaPassword.length >= 6,
        },
        {
            id: 'upper',
            mensaje: 'Al menos 1 mayúscula',
            cumple: /[A-Z]/.test(nuevaPassword),
        },
        {
            id: 'lower',
            mensaje: 'Al menos 1 minúscula',
            cumple: /[a-z]/.test(nuevaPassword),
        },
        {
            id: 'special',
            mensaje: 'Al menos 1 carácter especial (!@#$%...)',
            cumple: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(nuevaPassword),
        },
    ];

    const validacionesPendientesPassword = validacionesNuevaPassword.filter((v) => !v.cumple);

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

    const confirmarYSubirFoto = async (uri: string) => {
        setIsUploadingPhoto(true);
        try {
            const imageUrl = await subirImagenCloudinary(uri);
            if (!imageUrl) {
                showAlert('Error', 'No se pudo subir la imagen. Intenta nuevamente.');
                return;
            }

            // CORRECCIÓN: Ruta /v1/usuarios/perfil/foto
            await api.put('/v1/usuarios/perfil/foto', { fotoUsr: imageUrl });
            
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

    const ejecutarEliminacionCuenta = async () => {
        setIsDeletingAccount(true);
        try {
            await api.delete('/v1/usuarios/perfil');
            await signOut();
        } catch (error) {
            console.error('Error al desactivar cuenta:', error);
            showAlert('Error', 'No se pudo desactivar tu cuenta. Intenta nuevamente.');
        } finally {
            setIsDeletingAccount(false);
        }
    };

    const handleDeleteAccount = () => {
        showAlert(
            'Eliminar cuenta',
            '¿Estás seguro de que deseas desactivar tu cuenta? Esta acción cerrará tu sesión.',
            [
                { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
                {
                    text: 'Sí, eliminar',
                    onPress: ejecutarEliminacionCuenta,
                    style: 'destructive',
                },
            ],
        );
    };

    const abrirModalCambioPassword = () => {
        setPasswordActual('');
        setNuevaPassword('');
        setConfirmPassword('');
        setShowCurrentPass(false);
        setShowNewPass(false);
        setShowConfirmPass(false);
        setShowPasswordModal(true);
    };

    const cerrarModalCambioPassword = () => {
        if (!isChangingPassword) {
            setShowPasswordModal(false);
        }
    };

    const cambiarPassword = async () => {
        if (!passwordActual || !nuevaPassword || !confirmPassword) {
            showAlert('Campos incompletos', 'Debes ingresar contraseña actual, nueva y confirmación.');
            return;
        }

        if (validacionesPendientesPassword.length > 0) {
            showAlert('Contraseña inválida', 'La nueva contraseña no cumple todas las reglas requeridas.');
            return;
        }

        if (nuevaPassword !== confirmPassword) {
            showAlert('No coincide', 'La nueva contraseña y su confirmación no coinciden.');
            return;
        }

        setIsChangingPassword(true);
        try {
            await api.put('/v1/usuarios/perfil/password', {
                passwordActual,
                nuevaPassword,
            });

            setShowPasswordModal(false);
            showAlert('Éxito', 'Tu contraseña se cambió correctamente.');
        } catch (error: any) {
            const mensaje = error?.response?.data || 'No se pudo cambiar la contraseña.';
            showAlert('Error', typeof mensaje === 'string' ? mensaje : 'No se pudo cambiar la contraseña.');
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <View style={[globalStyles.container, dashboardStyles.lightBackground]}>
            <DashboardHeader />

            <ScrollView contentContainerStyle={globalStyles.scrollContainer} showsVerticalScrollIndicator={false}>
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

                {loading ? (
                    <View style={{ justifyContent: 'center', alignItems: 'center', marginVertical: spacing.xl }}>
                        <ActivityIndicator size="large" color={colors.darkGreen} />
                    </View>
                ) : (
                    <View style={styles.profileMainContainer}>
                        <View style={styles.topRowInfoContainer}>
                            
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
                                        <View style={styles.editPhotoBadge}>
                                            <Ionicons name="camera" size={14} color="white" />
                                        </View>
                                    </>
                                ) : (
                                    <Ionicons name="camera-outline" size={50} color={colors.darkGreen} style={{ opacity: 0.6 }} />
                                )}
                            </TouchableOpacity>

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

                        <View style={styles.fullWidthInfoBlock}>
                            <Text style={styles.labelText}>Email:</Text>
                            <View style={styles.valueBox}>
                                <Text style={styles.valueText}>{user?.correoUsr || 'No registrado'}</Text>
                            </View>
                        </View>
                    </View>
                )}

                <View style={[dashboardStyles.greetingDivider, dashboardStyles.darkDivider, { marginVertical: spacing.lg }]} />

                <View style={styles.menuContainer}>
                    <TouchableOpacity style={styles.menuButton} onPress={abrirModalCambioPassword}>
                        <Text style={styles.menuButtonText}>Cambiar contraseña</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.deleteAccountButton}
                        onPress={handleDeleteAccount}
                        disabled={isDeletingAccount}
                    >
                        <Text style={styles.menuButtonText}>
                            {isDeletingAccount ? 'Eliminando cuenta...' : 'Eliminar cuenta'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
                </TouchableOpacity>

            </ScrollView>

            <Modal
                visible={showPasswordModal}
                transparent={true}
                animationType="fade"
                onRequestClose={cerrarModalCambioPassword}
            >
                <View style={globalStyles.detailModalOverlay}>
                    <View style={globalStyles.detailModalContainer}>
                        <View style={globalStyles.detailModalHeader}>
                            <Text style={globalStyles.detailModalDate}>Cambiar contraseña</Text>
                            <TouchableOpacity onPress={cerrarModalCambioPassword} disabled={isChangingPassword}>
                                <Ionicons name="close" size={24} color={colors.lightYellow} />
                            </TouchableOpacity>
                        </View>

                        <View style={globalStyles.detailModalBody}>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.modalLabel}>Contraseña actual</Text>
                            <View style={styles.passwordInputContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Ingresa tu contraseña actual"
                                    placeholderTextColor={colors.darkGreen}
                                    secureTextEntry={!showCurrentPass}
                                    value={passwordActual}
                                    onChangeText={setPasswordActual}
                                    editable={!isChangingPassword}
                                />
                                <TouchableOpacity onPress={() => setShowCurrentPass(!showCurrentPass)}>
                                    <Ionicons name={showCurrentPass ? 'eye-off' : 'eye'} size={20} color={colors.darkGreen} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputWrapper}>
                            <Text style={styles.modalLabel}>Nueva contraseña</Text>
                            <View style={styles.passwordInputContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Mínimo 6 caracteres"
                                    placeholderTextColor={colors.darkGreen}
                                    secureTextEntry={!showNewPass}
                                    value={nuevaPassword}
                                    onChangeText={setNuevaPassword}
                                    editable={!isChangingPassword}
                                />
                                <TouchableOpacity onPress={() => setShowNewPass(!showNewPass)}>
                                    <Ionicons name={showNewPass ? 'eye-off' : 'eye'} size={20} color={colors.darkGreen} />
                                </TouchableOpacity>
                            </View>
                            {nuevaPassword.length > 0 && validacionesPendientesPassword.map((validacion) => (
                                <View key={validacion.id} style={styles.passwordValidationRow}>
                                    <Ionicons name="alert-circle-outline" size={14} color={colors.red || '#e74c3c'} />
                                    <Text style={styles.passwordValidationText}>{validacion.mensaje}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.inputWrapper}>
                            <Text style={styles.modalLabel}>Confirmar contraseña</Text>
                            <View
                                style={[
                                    styles.passwordInputContainer,
                                    confirmPassword.length > 0 && confirmPassword !== nuevaPassword && styles.passwordInputError,
                                ]}
                            >
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Repite la nueva contraseña"
                                    placeholderTextColor={colors.darkGreen}
                                    secureTextEntry={!showConfirmPass}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    editable={!isChangingPassword}
                                />
                                <TouchableOpacity onPress={() => setShowConfirmPass(!showConfirmPass)}>
                                    <Ionicons name={showConfirmPass ? 'eye-off' : 'eye'} size={20} color={colors.darkGreen} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.modalSaveButton, isChangingPassword && { opacity: 0.7 }]}
                            onPress={cambiarPassword}
                            disabled={isChangingPassword}
                        >
                            {isChangingPassword ? (
                                <ActivityIndicator color={colors.lightYellow} />
                            ) : (
                                <Text style={styles.modalSaveButtonText}>Guardar cambios</Text>
                            )}
                        </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <AlertComponent />
        </View>
    );
}

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
        overflow: 'hidden', position: 'relative', borderRadius: 60, 
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
        backgroundColor: colors.darkGreen,
        borderWidth: 1.5,
        borderColor: colors.darkGreen,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
        borderRadius: 8,
    },
    menuButtonText: { fontFamily: typography.family.main.medium, fontSize: typography.size.md, color: colors.lightYellow },
    deleteAccountButton: {
        backgroundColor: '#d84646',
        borderWidth: 1.5,
        borderColor: '#d84646',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
        borderRadius: 8,
    },

    logoutButton: {
        backgroundColor: colors.red || '#e74c3c',
        borderWidth: 1.5,
        borderColor: colors.red || '#e74c3c',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: 8,
        alignSelf: 'center',
        marginTop: spacing.xl, marginBottom: spacing.xl,
    },
    logoutButtonText: { fontFamily: typography.family.main.bold, fontSize: typography.size.sm, color: colors.lightYellow },
    inputWrapper: {
        marginBottom: spacing.md,
    },
    modalLabel: {
        fontFamily: typography.family.main.semiBold,
        fontSize: typography.size.sm,
        color: colors.darkGreen,
        marginBottom: spacing.xs,
    },
    passwordInputContainer: {
        borderWidth: 1.5,
        borderColor: colors.lightGreen,
        borderRadius: 8,
        paddingHorizontal: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
    },
    passwordInput: {
        flex: 1,
        color: colors.darkDGreen,
        paddingVertical: spacing.sm,
    },
    passwordInputError: {
        borderColor: colors.red || '#e74c3c',
    },
    modalSaveButton: {
        backgroundColor: colors.darkGreen,
        borderRadius: 8,
        alignItems: 'center',
        paddingVertical: spacing.md,
        marginTop: spacing.xs,
    },
    modalSaveButtonText: {
        fontFamily: typography.family.main.bold,
        color: colors.lightYellow,
        fontSize: typography.size.md,
    },
    passwordValidationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xs,
        gap: spacing.xs,
    },
    passwordValidationText: {
        fontFamily: typography.family.main.regular,
        fontSize: typography.size.xs,
        color: colors.red || '#e74c3c',
    },
});
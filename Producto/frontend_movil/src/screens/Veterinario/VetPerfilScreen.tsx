import React, { useState, useCallback } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, ScrollView, 
    ActivityIndicator, Image, Modal, TextInput 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

// Importación del sistema de diseño general
import { globalStyles } from '@/src/style/GlobalStyle';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import DashboardHeader from '@/src/components/DashboardHeader';
import { useAuth } from '@/src/context/AuthContext';
import api from '@/src/api/axiosInstance';

interface VetProfile {
    nombreCompleto: string;
    correoUsr: string;
    telefonoUsr: string | null;
    fotoUsr?: string;
}

export default function VetPerfilScreen({ navigation }: any) {
    const { userToken, signOut } = useAuth();
    const [user, setUser] = useState<VetProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

    // Estados de Modales Explícitos
    const [showActionConfirm, setShowActionConfirm] = useState({ visible: false, action: '', title: '', message: '' });
    const [feedbackModal, setFeedbackModal] = useState({ visible: false, title: '', message: '', isSuccess: false });
    const [selectedUri, setSelectedUri] = useState<string | null>(null);

    // Estados de Modificación de Contraseña
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordActual, setPasswordActual] = useState('');
    const [nuevaPassword, setNuevaPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const validacionesNuevaPassword = [
        { id: 'min', mensaje: 'Mínimo 6 caracteres', cumple: nuevaPassword.length >= 6 },
        { id: 'upper', mensaje: 'Al menos 1 mayúscula', cumple: /[A-Z]/.test(nuevaPassword) },
        { id: 'lower', mensaje: 'Al menos 1 minúscula', cumple: /[a-z]/.test(nuevaPassword) },
        { id: 'special', mensaje: 'Al menos 1 carácter especial', cumple: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(nuevaPassword) },
    ];
    const validacionesPendientesPassword = validacionesNuevaPassword.filter((v) => !v.cumple);

    const fetchVetProfile = async () => {
        if (!userToken) return;
        try {
            setLoading(true);
            const response = await api.get('/v1/usuarios/perfil');
            setUser(response.data);
        } catch (error) {
            console.error("Error al obtener perfil del veterinario:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchVetProfile();
        }, [userToken])
    );

    const showFeedback = (title: string, message: string, isSuccess: boolean) => {
        setFeedbackModal({ visible: true, title, message, isSuccess });
    };

    // ════ GESTIÓN DE IMAGEN ════
    const subirImagenCloudinary = async (uri: string) => {
        const data = new FormData();
        data.append('file', { uri: uri, type: 'image/jpeg', name: 'foto_perfil_vet.jpg' } as any);
        data.append('upload_preset', 'mascotas_preset'); 

        try {
            const response = await fetch('https://api.cloudinary.com/v1_1/dkryb2g4m/image/upload', {
                method: 'POST', body: data, headers: { 'Accept': 'application/json', 'Content-Type': 'multipart/form-data' },
            });
            const result = await response.json();
            return result.secure_url || null;
        } catch (error) {
            console.error("Error con Cloudinary:", error);
            return null;
        }
    };

    const confirmarYSubirFoto = async () => {
        if (!selectedUri) return;
        setShowActionConfirm({ ...showActionConfirm, visible: false });
        setIsUploadingPhoto(true);

        try {
            const imageUrl = await subirImagenCloudinary(selectedUri);
            if (!imageUrl) throw new Error("Fallo al subir a la nube");

            await api.put('/v1/usuarios/perfil/foto', { fotoUsr: imageUrl });
            setUser(prev => prev ? { ...prev, fotoUsr: imageUrl } : null);
            showFeedback('¡Éxito!', 'Tu foto de perfil profesional ha sido actualizada.', true);
        } catch (error) {
            showFeedback('Error', 'No se pudo guardar la foto de perfil.', false);
        } finally {
            setIsUploadingPhoto(false);
            setSelectedUri(null);
        }
    };

    const handlePhotoPress = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, aspect: [1, 1], quality: 0.5,
        });

        if (!result.canceled) {
            setSelectedUri(result.assets[0].uri);
            setShowActionConfirm({
                visible: true, action: 'UPLOAD_PHOTO', title: 'Actualizar foto',
                message: '¿Deseas establecer esta imagen como tu nueva foto de perfil?'
            });
        }
    };

    // ════ GESTIÓN DE SESIÓN ════
    const handleLogoutRequest = () => {
        setShowActionConfirm({
            visible: true, action: 'LOGOUT', title: 'Cerrar Sesión',
            message: '¿Estás seguro de que deseas salir de tu cuenta?'
        });
    };

    const executeLogout = async () => {
        setShowActionConfirm({ ...showActionConfirm, visible: false });
        try {
            await signOut();
        } catch (error) {
            showFeedback('Error', 'Problemas al cerrar sesión. Intenta de nuevo.', false);
        }
    };

    // ════ GESTIÓN DE CONTRASEÑA ════
    const abrirModalCambioPassword = () => {
        setPasswordActual(''); setNuevaPassword(''); setConfirmPassword('');
        setShowCurrentPass(false); setShowNewPass(false); setShowConfirmPass(false);
        setShowPasswordModal(true);
    };

    const cambiarPassword = async () => {
        if (!passwordActual || !nuevaPassword || !confirmPassword) {
            showFeedback('Campos incompletos', 'Debes ingresar tu contraseña actual, la nueva y la confirmación.', false);
            return;
        }
        if (validacionesPendientesPassword.length > 0) {
            showFeedback('Contraseña inválida', 'La nueva contraseña no cumple los requisitos mínimos de seguridad.', false);
            return;
        }
        if (nuevaPassword !== confirmPassword) {
            showFeedback('Error de coincidencia', 'La nueva contraseña y su confirmación no coinciden.', false);
            return;
        }

        setIsChangingPassword(true);
        try {
            await api.put('/v1/usuarios/perfil/password', { passwordActual, nuevaPassword });
            setShowPasswordModal(false);
            showFeedback('Seguridad Actualizada', 'Tu contraseña ha sido cambiada correctamente.', true);
        } catch (error: any) {
            showFeedback('Error', error?.response?.data || 'No se pudo cambiar la contraseña. Verifica tus credenciales.', false);
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <View style={[globalStyles.container, { backgroundColor: colors.darkDGreen }]}>
            <DashboardHeader />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                <View style={styles.headerWrapper}>
                    <Text style={[globalStyles.sectionTitle, { color: colors.lightYellow, marginBottom: 0 }]}>
                        Mi Perfil Profesional
                    </Text>
                </View>

                {loading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color={colors.lightYellow} />
                    </View>
                ) : (
                    <View style={styles.profileMainContainer}>
                        
                        {/* ════ FOTO Y NOMBRE ════ */}
                        <View style={styles.topRowInfoContainer}>
                            <TouchableOpacity 
                                style={styles.imagePlaceholder} 
                                activeOpacity={0.8}
                                onPress={handlePhotoPress}
                                disabled={isUploadingPhoto}
                            >
                                {isUploadingPhoto ? (
                                    <ActivityIndicator size="large" color={colors.darkDGreen} />
                                ) : user?.fotoUsr ? (
                                    <>
                                        <Image source={{ uri: user.fotoUsr }} style={styles.profileImage} />
                                        <View style={styles.editPhotoBadge}>
                                            <Ionicons name="camera" size={14} color={colors.white} />
                                        </View>
                                    </>
                                ) : (
                                    <Ionicons name="camera-outline" size={50} color={colors.darkDGreen} style={{ opacity: 0.6 }} />
                                )}
                            </TouchableOpacity>

                            <View style={styles.sideInfoContainer}>
                                <View style={styles.infoBlock}>
                                    <Text style={styles.labelText}>Nombre Completo</Text>
                                    <View style={styles.valueBox}>
                                        <Text style={styles.valueText}>{user?.nombreCompleto || 'No registrado'}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* ════ DATOS DE CONTACTO ════ */}
                        <View style={styles.fullWidthInfoBlock}>
                            <Text style={styles.labelText}>Correo Institucional</Text>
                            <View style={styles.valueBox}>
                                <Text style={styles.valueText}>{user?.correoUsr || 'No registrado'}</Text>
                            </View>
                        </View>

                        <View style={styles.fullWidthInfoBlock}>
                            <Text style={styles.labelText}>Teléfono de Contacto</Text>
                            <View style={styles.valueBox}>
                                <Text style={styles.valueText}>{user?.telefonoUsr || 'No registrado'}</Text>
                            </View>
                        </View>
                    </View>
                )}

                <View style={styles.divider} />

                {/* ════ BOTONES DE CONFIGURACIÓN ════ */}
                <View style={styles.menuContainer}>
                    <TouchableOpacity style={styles.menuButton} onPress={abrirModalCambioPassword}>
                        <Ionicons name="key-outline" size={20} color={colors.darkDGreen} style={{ marginRight: 8 }} />
                        <Text style={styles.menuButtonText}>Actualizar Contraseña</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutRequest}>
                        <Ionicons name="log-out-outline" size={20} color={colors.white} style={{ marginRight: 8 }} />
                        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            {/* ════ MODAL DE CAMBIO DE CONTRASEÑA ════ */}
            <Modal visible={showPasswordModal} transparent={true} animationType="fade" onRequestClose={() => !isChangingPassword && setShowPasswordModal(false)}>
                <View style={globalStyles.modalOverlay}>
                    <View style={globalStyles.modalContent}>
                        <Text style={globalStyles.modalTitle}>Seguridad de Cuenta</Text>
                        <Text style={styles.modalHelperText}>Asegúrate de utilizar una contraseña robusta.</Text>

                        <View style={styles.inputWrapper}>
                            <Text style={styles.modalLabel}>Contraseña actual</Text>
                            <View style={styles.passwordInputContainer}>
                                <TextInput style={styles.passwordInput} placeholderTextColor={colors.darkGreen} secureTextEntry={!showCurrentPass} value={passwordActual} onChangeText={setPasswordActual} editable={!isChangingPassword} />
                                <TouchableOpacity onPress={() => setShowCurrentPass(!showCurrentPass)}>
                                    <Ionicons name={showCurrentPass ? 'eye-off' : 'eye'} size={20} color={colors.darkGreen} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputWrapper}>
                            <Text style={styles.modalLabel}>Nueva contraseña</Text>
                            <View style={styles.passwordInputContainer}>
                                <TextInput style={styles.passwordInput} placeholder="Mínimo 6 caracteres" placeholderTextColor={colors.darkGreen} secureTextEntry={!showNewPass} value={nuevaPassword} onChangeText={setNuevaPassword} editable={!isChangingPassword} />
                                <TouchableOpacity onPress={() => setShowNewPass(!showNewPass)}>
                                    <Ionicons name={showNewPass ? 'eye-off' : 'eye'} size={20} color={colors.darkGreen} />
                                </TouchableOpacity>
                            </View>
                            {nuevaPassword.length > 0 && validacionesPendientesPassword.map((v) => (
                                <View key={v.id} style={styles.passwordValidationRow}>
                                    <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
                                    <Text style={styles.passwordValidationText}>{v.mensaje}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.inputWrapper}>
                            <Text style={styles.modalLabel}>Confirmar contraseña</Text>
                            <View style={[styles.passwordInputContainer, confirmPassword.length > 0 && confirmPassword !== nuevaPassword && { borderColor: colors.error }]}>
                                <TextInput style={styles.passwordInput} secureTextEntry={!showConfirmPass} value={confirmPassword} onChangeText={setConfirmPassword} editable={!isChangingPassword} />
                                <TouchableOpacity onPress={() => setShowConfirmPass(!showConfirmPass)}>
                                    <Ionicons name={showConfirmPass ? 'eye-off' : 'eye'} size={20} color={colors.darkGreen} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity style={[globalStyles.modalButton, isChangingPassword && { opacity: 0.7 }]} onPress={cambiarPassword} disabled={isChangingPassword}>
                            {isChangingPassword ? <ActivityIndicator color={colors.darkDGreen} /> : <Text style={globalStyles.primaryButtonText}>Confirmar</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity style={[globalStyles.modalButton, { backgroundColor: colors.error, marginTop: spacing.sm }]} onPress={() => setShowPasswordModal(false)} disabled={isChangingPassword}>
                            <Text style={[globalStyles.primaryButtonText, { color: colors.white }]}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ════ MODAL DE CONFIRMACIÓN DE ACCIONES ════ */}
            <Modal visible={showActionConfirm.visible} transparent animationType="fade">
                <View style={globalStyles.modalOverlay}>
                    <View style={globalStyles.modalContent}>
                        <Ionicons name="help-circle-outline" size={54} color={colors.lightGreen} />
                        <Text style={globalStyles.modalTitle}>{showActionConfirm.title}</Text>
                        <Text style={[globalStyles.modalMessage, { marginBottom: spacing.lg }]}>{showActionConfirm.message}</Text>
                        
                        <TouchableOpacity style={[globalStyles.modalButton, { marginBottom: spacing.sm }]} onPress={showActionConfirm.action === 'LOGOUT' ? executeLogout : confirmarYSubirFoto}>
                            <Text style={globalStyles.primaryButtonText}>Sí, confirmar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[globalStyles.modalButton, { backgroundColor: colors.error }]} onPress={() => setShowActionConfirm({ ...showActionConfirm, visible: false })}>
                            <Text style={[globalStyles.primaryButtonText, { color: colors.white }]}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ════ MODAL DE FEEDBACK ════ */}
            <Modal visible={feedbackModal.visible} transparent animationType="fade" onRequestClose={() => setFeedbackModal(prev => ({ ...prev, visible: false }))}>
                <View style={globalStyles.modalOverlay}>
                    <View style={globalStyles.modalContent}>
                        <Ionicons name={feedbackModal.isSuccess ? "checkmark-circle" : "close-circle"} size={54} color={feedbackModal.isSuccess ? colors.green : colors.error} />
                        <Text style={globalStyles.modalTitle}>{feedbackModal.title}</Text>
                        <Text style={globalStyles.modalMessage}>{feedbackModal.message}</Text>
                        <TouchableOpacity style={globalStyles.modalButton} onPress={() => setFeedbackModal(prev => ({ ...prev, visible: false }))}>
                            <Text style={globalStyles.primaryButtonText}>Entendido</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    scrollContent: { paddingHorizontal: spacing.xl, paddingBottom: 60, paddingTop: spacing.md },
    headerWrapper: { alignItems: 'center', marginBottom: spacing.lg },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: spacing.xxl },
    profileMainContainer: { marginBottom: spacing.lg },
    topRowInfoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
    sideInfoContainer: { flex: 1, justifyContent: 'center' },
    fullWidthInfoBlock: { width: '100%', marginBottom: spacing.md },
    valueBox: {
        backgroundColor: colors.lightYellow, borderWidth: 1, borderColor: colors.lightGreen,
        borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: 10, marginTop: 4,
    },
    imagePlaceholder: {
        width: 120, height: 120, borderWidth: 2, borderColor: colors.lightGreen, backgroundColor: colors.lightYellow,
        justifyContent: 'center', alignItems: 'center', marginRight: spacing.lg,
        overflow: 'hidden', borderRadius: 60, position: 'relative'
    },
    profileImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    editPhotoBadge: { position: 'absolute', bottom: 4, right: 15, backgroundColor: colors.darkDGreen, padding: 6, borderRadius: 15, borderWidth: 2, borderColor: colors.lightYellow },
    infoBlock: { marginBottom: spacing.sm },
    labelText: { fontFamily: 'Fredoka-Bold', fontSize: 13, color: colors.lightGreen, textTransform: 'uppercase', letterSpacing: 0.5 },
    valueText: { fontFamily: 'Fredoka-Medium', fontSize: 16, color: colors.darkDGreen },
    divider: { height: 1, backgroundColor: 'rgba(158, 181, 125, 0.3)', marginVertical: spacing.md },
    menuContainer: { gap: spacing.md, marginTop: spacing.sm },
    menuButton: {
        flexDirection: 'row', backgroundColor: colors.lightGreen, borderWidth: 1, borderColor: colors.darkGreen,
        paddingVertical: spacing.md, paddingHorizontal: spacing.lg, alignItems: 'center', justifyContent: 'center', borderRadius: 12,
    },
    menuButtonText: { fontFamily: 'Fredoka-Bold', fontSize: 16, color: colors.darkDGreen },
    logoutButton: {
        flexDirection: 'row', backgroundColor: colors.error, paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
        alignItems: 'center', justifyContent: 'center', borderRadius: 12, marginTop: spacing.lg,
    },
    logoutButtonText: { fontFamily: 'Fredoka-Bold', fontSize: 16, color: colors.white },
    modalHelperText: { fontFamily: 'Fredoka-Regular', fontSize: 13, color: colors.lightGreen, textAlign: 'center', marginBottom: spacing.lg },
    inputWrapper: { marginBottom: spacing.md, width: '100%' },
    modalLabel: { fontFamily: 'Fredoka-SemiBold', fontSize: 14, color: colors.lightYellow, marginBottom: spacing.xs },
    passwordInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.darkGreen, borderRadius: 8, paddingHorizontal: spacing.sm },
    passwordInput: { flex: 1, paddingVertical: spacing.sm, fontFamily: 'Fredoka-Medium', color: colors.darkDGreen, height: 44 },
    passwordValidationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
    passwordValidationText: { fontFamily: 'Fredoka-Regular', fontSize: 12, color: colors.error },
});
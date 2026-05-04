import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    ScrollView, 
    KeyboardAvoidingView, 
    Platform,
    Image,
    ActivityIndicator,
    Modal // <-- Importado
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; 
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import api from '@/src/api/axiosInstance';

export const ResetPassword = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>(); 
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    
    // 1. Atrapamos los parámetros que vienen de la pantalla anterior
    const { email, code } = route.params || { email: '', code: '' };

    // 2. Estados locales
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // --- ESTADOS PARA EL MODAL ---
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: '',
        message: '',
        type: 'success', // 'success' o 'error'
        onPress: () => { setModalVisible(false) } // Acción del botón aceptar
    });

    const showModal = (title: string, message: string, type: 'success' | 'error', onPressAction?: () => void) => {
        setModalConfig({ 
            title, 
            message, 
            type, 
            onPress: onPressAction || (() => setModalVisible(false)) 
        });
        setModalVisible(true);
    };

    // 3. Validaciones lógicas
    const isPasswordValid = password.length >= 6;
    const doPasswordsMatch = password === confirmPassword && isPasswordValid;

    // 4. Acción para guardar la nueva contraseña
    const handleResetPassword = async () => {
        if (!doPasswordsMatch) return;

        setLoading(true);
        try {
            // Usando tu axiosInstance (api)
            const response = await api.post('/auth/reset-password', {
                correo_usr: email,
                codigo: code,
                nueva_pass: password 
            });

            if (response.status === 200) {
                // Reemplazo de Alert.alert con navegación al cerrar el modal
                showModal(
                    "¡Éxito!",
                    "Tu contraseña ha sido actualizada correctamente.",
                    "success",
                    () => {
                        setModalVisible(false);
                        navigation.replace('Login');
                    }
                );
            }
        } catch (error: any) {
            console.error(error);
            const errorMsg = error.response?.data?.error || "Hubo un problema al actualizar la contraseña.";
            showModal("Error", errorMsg, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={styles.mainContainer} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>        
                
                {/* Cabecera */}
                <View style={styles.headerContainer}>
                    <TouchableOpacity 
                        style={styles.backButton} 
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={32} color={colors.lightYellow} />
                    </TouchableOpacity>
                    <View style={styles.headerRow}>
                        <View style={styles.logoPlaceholder}>
                            <Image 
                                source={require('../../../assets/images/Logo.png')} 
                                style={styles.logo}
                                resizeMode="contain" 
                            />
                        </View>
                        <Text style={styles.mainTitle}>NodeVet</Text>
                    </View>
                </View>

                <View style={styles.middleSection} />
                
                <Text style={styles.sectionTitle}>Nueva Contraseña</Text>
                
                {/* Mensaje de contexto para el usuario */}
                <Text style={styles.infoText}>
                    Estás restableciendo la contraseña para el correo:{'\n'}
                    <Text style={{ fontFamily: typography.family.main.bold }}>{email}</Text>
                </Text>

                {/* Input: Nueva Contraseña */}
                <View style={styles.inputGroup}>
                    <View style={styles.labelWithIcon}>
                        <Text style={styles.label}>Contraseña:</Text>
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons 
                            name={showPassword ? "eye-off" : "eye"} 
                            size={24} 
                            color={colors.lightYellow} 
                            />
                        </TouchableOpacity>
                    </View>
                    <TextInput 
                        style={[
                            styles.input, 
                            (password.length > 0 && !isPasswordValid) && { borderColor: 'red', borderWidth: 1 }
                        ]} 
                        placeholder="Mínimo 6 caracteres"
                        placeholderTextColor={colors.darkGreen}
                        secureTextEntry={!showPassword} 
                        autoCapitalize="none"
                        value={password}
                        onChangeText={setPassword}
                        editable={!loading}
                    />
                </View>

                {/* Input: Confirmar Contraseña */}
                <View style={styles.inputGroup}>
                    <View style={styles.labelWithIcon}>
                        <Text style={styles.label}>Confirmar Contraseña:</Text>
                        <TouchableOpacity onPress={() => setShowPassword2(!showPassword2)}>
                            <Ionicons 
                            name={showPassword2 ? "eye-off" : "eye"} 
                            size={24} 
                            color={colors.lightYellow} 
                            />
                        </TouchableOpacity>
                    </View>
                    <TextInput 
                        style={[
                            styles.input, 
                            (confirmPassword.length > 0 && doPasswordsMatch) && { borderColor: colors.lightGreen, borderWidth: 2 },
                            (confirmPassword.length > 0 && !doPasswordsMatch) && { borderColor: 'red', borderWidth: 1 }
                        ]} 
                        placeholder="Repite tu contraseña"
                        placeholderTextColor={colors.darkGreen}
                        secureTextEntry={!showPassword2} 
                        autoCapitalize="none"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        editable={!loading}
                    />
                </View>

                {/* Botón Guardar */}
                <View style={styles.bottomSection}>    
                    <TouchableOpacity 
                        style={[
                            styles.primaryButton, 
                            (!doPasswordsMatch || loading) && { backgroundColor: '#A0A0A0', elevation: 0 }
                        ]} 
                        onPress={handleResetPassword}
                        disabled={!doPasswordsMatch || loading} 
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.darkDGreen} />
                        ) : (
                            <Text style={styles.primaryButtonText}>Guardar</Text>
                        )}
                    </TouchableOpacity>
                </View>

            </ScrollView>

            {/* --- COMPONENTE MODAL --- */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => modalConfig.onPress()}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Ionicons 
                            name={modalConfig.type === 'error' ? 'alert-circle' : 'checkmark-circle'} 
                            size={60} 
                            color={modalConfig.type === 'error' ? '#FF6B6B' : colors.lightGreen} 
                        />
                        <Text style={styles.modalTitle}>{modalConfig.title}</Text>
                        <Text style={styles.modalMessage}>{modalConfig.message}</Text>
                        
                        <TouchableOpacity 
                            style={styles.modalButton} 
                            onPress={modalConfig.onPress}
                        >
                            <Text style={styles.primaryButtonText}>Aceptar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.darkDGreen,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: spacing.xl,
        paddingTop: spacing.lg,
        paddingBottom: spacing.xxl, 
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.xxl,
        marginTop: spacing.xl,
    },
    middleSection: {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.sm,
        marginTop: spacing.md
    },
    bottomSection: {
        marginTop: spacing.xl,
        alignItems: 'center',
    },
    backButton: {
        width: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
    },
    logoPlaceholder: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    labelWithIcon: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: spacing.xs,
    },
    mainTitle: {
        fontFamily: typography.family.main.bold,
        fontSize: 40,
        color: colors.lightYellow,
    },
    sectionTitle: {
        fontFamily: typography.family.main.semiBold,
        fontSize: 24,
        color: colors.lightYellow,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    infoText: {
        fontFamily: typography.family.main.regular,
        fontSize: typography.size.sm,
        color: colors.lightGreen,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    inputGroup: {
        marginBottom: spacing.lg, 
    },
    label: {
        fontFamily: typography.family.main.medium,
        fontSize: typography.size.md,
        color: colors.lightYellow,
        marginBottom: spacing.xs,
    },
    input: {
        backgroundColor: colors.lightYellow,
        borderWidth: 1,
        borderColor: colors.darkGreen,
        borderRadius: 8,
        paddingHorizontal: spacing.md,
        paddingVertical: 10,
        fontFamily: typography.family.main.regular,
        fontSize: typography.size.md,
        color: colors.darkDGreen,
    },
    primaryButton: {
        backgroundColor: colors.lightGreen, 
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xxl,
        borderRadius: 12,
        alignItems: 'center',
        width: '60%', 
        elevation: 2,
    },
    primaryButtonText: {
        fontFamily: typography.family.main.bold,
        color: colors.darkDGreen,
        fontSize: typography.size.lg, // Ajustado a lg
    },

    // --- ESTILOS DEL MODAL ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', 
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: colors.darkDGreen,
        borderRadius: 20,
        padding: spacing.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.lightGreen,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalTitle: {
        fontFamily: typography.family.main.bold,
        fontSize: typography.size.lg,
        color: colors.lightYellow,
        marginTop: spacing.md,
        textAlign: 'center',
    },
    modalMessage: {
        fontFamily: typography.family.main.regular,
        fontSize: typography.size.md,
        color: colors.lightYellow,
        marginTop: spacing.sm,
        marginBottom: spacing.xl,
        textAlign: 'center',
        opacity: 0.9,
    },
    modalButton: {
        backgroundColor: colors.lightGreen,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xl,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    }
});
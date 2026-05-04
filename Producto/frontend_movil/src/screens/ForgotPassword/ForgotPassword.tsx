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
    Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; 
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import api from '@/src/api/axiosInstance';

export const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState(''); 
    const [isCodeSent, setIsCodeSent] = useState(false); 
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<any>();

    // Estados para el Modal
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: '',
        message: '',
        type: 'success'
    });

    // Función para invocar el Modal
    const showModal = (title: string, message: string, type: 'success' | 'error' = 'success') => {
        setModalConfig({ title, message, type });
        setModalVisible(true);
    };

    // 1. Lógica de validación
    const validateEmail = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const isEmailValid = validateEmail(email);
    const isCodeValid = code.length === 6 && /^\d+$/.test(code);

    // 2. Acción: Enviar correo para solicitar código
    const handleSendEmail = async () => {
        if (!isEmailValid) return;

        setLoading(true);
        try {
            const response = await api.post('/auth/forgot-password', {
                correo_usr: email 
            });

            if (response.status === 200) {
                setIsCodeSent(true); 
                setCode('');
                showModal(
                    "Código Enviado",
                    "Revisa tu bandeja de entrada e ingresa el código de 6 dígitos.",
                    "success"
                );
            }
        } catch (error: any) {
            console.error(error);
            const errorMsg = error.response?.data?.error || "No se pudo conectar con el servidor o el correo no fue encontrado";
            showModal("Error", errorMsg, "error");
        } finally {
            setLoading(false);
        }
    };

    // 3. Acción: Verificar el código ingresado
    const handleVerifyCode = async () => {
        if (!isCodeValid) return;

        setLoading(true);
        try {
            const response = await api.post('/auth/verify-code', {
                correo_usr: email,
                codigo: code
            });

            if (response.status === 200) {
                navigation.navigate('ResetPassword', { email: email, code: code });
            }
        } catch (error: any) {
            console.error(error);
            const errorMsg = error.response?.data?.error || "El código es incorrecto o ha expirado.";
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

                {/* Separador */}
                <View style={styles.middleSection} />
                
                <Text style={styles.sectionTitle}>Recuperar Contraseña</Text>
    
                {/* PASO 1: Ingresar Email*/}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Correo :</Text>
                    <TextInput 
                        style={[
                            styles.input, 
                            isEmailValid && { borderColor: colors.lightGreen, borderWidth: 2 }
                        ]} 
                        placeholder="Ej. nombre@gmail.com"
                        placeholderTextColor={colors.darkGreen}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                        editable={!loading}
                    />
                </View>

                <View style={styles.bottomSection}>    
                    <TouchableOpacity 
                        style={[
                            styles.primaryButton, 
                            (!isEmailValid || loading) && { backgroundColor: '#A0A0A0', elevation: 0 }
                        ]} 
                        onPress={handleSendEmail}
                        disabled={!isEmailValid || loading} 
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.darkDGreen} />
                        ) : (
                            <Text style={styles.primaryButtonText}>Enviar Código</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* PASO 2: Ingresar Código OTP */}
                <View style={styles.dynamicSection}>
                    <View style={styles.divider} />
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Código de Verificación:</Text>
                        <Text style={styles.subLabel}>Ingresa el código enviado a su correo</Text>
                        <TextInput 
                            style={[
                                styles.input, 
                                styles.codeInput, 
                                isCodeValid && { borderColor: colors.lightGreen, borderWidth: 2 }
                            ]} 
                            placeholder="123456"
                            placeholderTextColor={colors.darkGreen}
                            keyboardType="number-pad"
                            maxLength={6}
                            value={code}
                            onChangeText={setCode}
                            editable={!loading}
                        />
                    </View>

                    <View style={styles.bottomSection}>    
                        <TouchableOpacity 
                            style={[
                                styles.primaryButton, 
                                (!isCodeValid || loading) && { backgroundColor: '#A0A0A0', elevation: 0 }
                            ]} 
                            onPress={handleVerifyCode}
                            disabled={!isCodeValid || loading} 
                        >
                            {loading && isCodeSent ? (
                                <ActivityIndicator color={colors.darkDGreen} />
                            ) : (
                                <Text style={styles.primaryButtonText}>Verificar</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>

            {/* MODAL AGREGADO */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
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
                            onPress={() => setModalVisible(false)}
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
        marginTop: spacing.sm,
        alignItems: 'center',
    },
    dynamicSection: {
        marginTop: spacing.xl,
    },
    divider: {
        height: 1,
        backgroundColor: colors.lightGreen,
        opacity: 0.3,
        marginBottom: spacing.xl,
        marginHorizontal: spacing.lg,
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
        marginBottom: spacing.lg,
    },
    inputGroup: {
        marginBottom: spacing.md, 
    },
    label: {
        fontFamily: typography.family.main.medium,
        fontSize: typography.size.md,
        color: colors.lightYellow,
        marginBottom: spacing.xs,
    },
    subLabel: {
        fontFamily: typography.family.main.regular,
        fontSize: typography.size.sm,
        color: colors.lightGreen,
        marginBottom: spacing.sm,
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
    codeInput: {
        textAlign: 'center',
        fontSize: typography.size.xl,
        letterSpacing: 8, 
        fontFamily: typography.family.main.bold,
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
        fontSize: typography.size.md,
    },

    // Estilos Modal
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
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
    Alert, // Importante para feedback al usuario
    ActivityIndicator // Para el estado de carga
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; 
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import axios from 'axios';

export const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<any>();

    // 1. Logica de validacion en tiempo real
    const validateEmail = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const isEmailValid = validateEmail(email);

    // 2. Acción para enviar JSON al endpoint
    const handleSendEmail = async () => {
        if (!isEmailValid) return;

        setLoading(true);
        try {
            // Usar tu IP si pruebas en dispositivo fisico
            const response = await axios.post('http://10.0.2.2:8080/api/auth/forgot-password', {
                correo_usr: email // Coincide con tu DTO de Java
            });

            if (response.status === 200) {
                Alert.alert(
                    "Enlace Enviado",
                    "Si el correo existe en nuestro sistema, recibirás instrucciones en breve.",
                    [{ text: "Entendido", onPress: () => navigation.goBack() }]
                );
            }
        } catch (error: any) {
            console.error(error);
            // Manejo de error 400 que configuramos en el backend
            const errorMsg = error.response?.data?.error || "No se pudo conectar con el servidor.";
            Alert.alert("Error", errorMsg);
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

                {/* Formulario */}
                <View style={styles.middleSection} />
                
                <Text style={styles.sectionTitle}>Recuperar Contraseña</Text>
    
                {/* Input Email */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email :</Text>
                    <TextInput 
                        style={[
                            styles.input, 
                            // Borde verde si es válido para dar feedback visual
                            isEmailValid && { borderColor: colors.lightGreen, borderWidth: 2 }
                        ]} 
                        placeholder="Ej. nombre@gmail.com"
                        placeholderTextColor={colors.darkGreen}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                        editable={!loading} // Bloquea el input mientras carga
                    />
                </View>

                <View style={styles.bottomSection}>    
                    {/* 3. Boton con activacion logica */}
                    <TouchableOpacity 
                        style={[
                            styles.primaryButton, 
                            (!isEmailValid || loading) && { backgroundColor: '#A0A0A0', elevation: 0 } // Estilo desactivado
                        ]} 
                        onPress={handleSendEmail}
                        disabled={!isEmailValid || loading} // Desactiva el boton fisicamente
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.darkDGreen} />
                        ) : (
                            <Text style={styles.primaryButtonText}>Enviar</Text>
                        )}
                    </TouchableOpacity>
                </View>

            </ScrollView>
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
    
    // --- Estilos de Secciones ---
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
        marginTop: spacing.xxl
    },
    bottomSection: {
        marginTop: spacing.sm,
        alignItems: 'center', // Centra los enlaces y el botón
    },

    // --- Estilos de Componentes ---
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
    rightSpacer: {
        width: 50,
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
        marginBottom: spacing.xl,
    },
    inputGroup: {
        marginBottom: spacing.lg, // Un poco más de margen aquí porque son menos inputs que en registro
    },
    labelWithIcon: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: spacing.xs,
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
    linksContainer: {
        alignItems: 'center',
        marginBottom: spacing.xl, // Espacio entre los enlaces y el botón de Acceder
        gap: spacing.sm, // Separa "He olvidado" de "Crear cuenta"
    },
    linkText: {
        fontFamily: typography.family.main.regular,
        fontSize: typography.size.sm,
        color: colors.lightGreen,
        textDecorationLine: 'underline',
    },
    linkTextBold: {
        fontFamily: typography.family.main.semiBold,
        fontSize: typography.size.md,
        color: colors.lightYellow,
        textDecorationLine: 'underline',
        marginTop: spacing.xs,
    },
    primaryButton: {
        backgroundColor: colors.lightGreen, // Usando el color verde de tu captura reciente
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
        fontSize: typography.size.lg,
        },
})
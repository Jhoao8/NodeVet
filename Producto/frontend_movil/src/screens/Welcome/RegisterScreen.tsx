import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; 
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { globalStyles } from '@/src/style/GlobalStyle';
import api from '../../api/axiosInstance'; // Importamos tu instancia de Axios

const RegisterScreen = () => {
    const navigation = useNavigation<any>();

    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [celular, setCelular] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Estados para errores de validación
    const [nombreError, setNombreError] = useState('');
    const [apellidoError, setApellidoError] = useState('');
    const [celularError, setCelularError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
    const [passwordMatchError, setPasswordMatchError] = useState('');

    // Validar nombre
    const validateNombre = (text: string) => {
        setNombre(text);
        if (!text) {
            setNombreError('');
        } else if (text.length < 3) {
            setNombreError('Mínimo 3 caracteres');
        } else {
            setNombreError('');
        }
    };

    // Validar apellido
    const validateApellido = (text: string) => {
        setApellido(text);
        if (!text) {
            setApellidoError('');
        } else if (text.length < 3) {
            setApellidoError('Mínimo 3 caracteres');
        } else {
            setApellidoError('');
        }
    };

    // Validar celular
    const validateCelular = (text: string) => {
        setCelular(text);
        if (!text) {
            setCelularError('');
        } else if (!text.startsWith('9')) {
            setCelularError('Debe empezar con 9');
        } else if (text.length !== 9) {
            setCelularError('Debe tener 9 dígitos (9 + 8 números)');
        } else {
            setCelularError('');
        }
    };

    // Validar email
    const validateEmail = (text: string) => {
        setEmail(text);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!text) {
            setEmailError('');
        } else if (!emailRegex.test(text)) {
            setEmailError('Email inválido (formato: ejemplo@dominio.com)');
        } else {
            setEmailError('');
        }
    };

    // Validar contraseña
    const validatePassword = (text: string) => {
        setPassword(text);
        const errors: string[] = [];

        if (text.length > 0) {
            if (text.length < 6) {
                errors.push('Mínimo 6 caracteres');
            }
            if (!/[A-Z]/.test(text)) {
                errors.push('Al menos 1 mayúscula');
            }
            if (!/[a-z]/.test(text)) {
                errors.push('Al menos 1 minúscula');
            }
            if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(text)) {
                errors.push('Al menos 1 carácter especial (!@#$%...)');
            }
        }

        setPasswordErrors(errors);

        // Validar coincidencia de contraseñas
        if (confirmPassword && text !== confirmPassword) {
            setPasswordMatchError('Las contraseñas no coinciden');
        } else {
            setPasswordMatchError('');
        }
    };

    // Validar confirmación de contraseña
    const validateConfirmPassword = (text: string) => {
        setConfirmPassword(text);
        if (password && text !== password) {
            setPasswordMatchError('Las contraseñas no coinciden');
        } else {
            setPasswordMatchError('');
        }
    };

    // Capitalizar primer carácter
    const capitalizeFirst = (text: string) => {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    };

    const handleRegister = async () => {
        // Validar todos los campos
        if (!nombre || !apellido || !celular || !email || !password || !confirmPassword) {
            Alert.alert('Campos incompletos', 'Por favor, llena todos los campos.');
            return;
        }

        // Validar que no haya errores
        if (nombreError || apellidoError || celularError || emailError || passwordErrors.length > 0 || passwordMatchError) {
            Alert.alert('Validación incompleta', 'Por favor, corrige los errores en los campos.');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                nombreUsr: capitalizeFirst(nombre),
                apellidoUsr: capitalizeFirst(apellido),
                correoUsr: email,
                passUsr: password,
                telefonoUsr: `+56${celular}`,
            };

            const response = await api.post('/v1/usuarios/registro', payload);

            if (response.status === 200 || response.status === 201) {
                Alert.alert(
                    '¡Éxito!', 
                    'Cuenta creada correctamente.',
                    [{ text: 'Ir a Login', onPress: () => navigation.navigate('Login') }]
                );
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Error al intentar registrar el usuario.';
            Alert.alert('No se pudo registrar', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={globalStyles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        >
            <ScrollView 
                contentContainerStyle={{
                    flexGrow: 1,
                    padding: spacing.xl,
                    paddingTop: spacing.lg,
                }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
            
            <View style={globalStyles.headerContainer}>
                <TouchableOpacity style={globalStyles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={32} color={colors.lightYellow} />
                </TouchableOpacity>
                
                <View style={globalStyles.headerRow}>
                    <View style={globalStyles.logoPlaceholder}>
                        <Image 
                            source={require('@/assets/images/Logo.png')} 
                            style={globalStyles.logo}
                            resizeMode="contain" 
                        />
                    </View>
                    <Text style={globalStyles.mainTitle}>NodeVet</Text>
                </View>
                
                <View style={globalStyles.rightSpacer} />
            </View>

            <Text style={globalStyles.sectionTitle}>Crear cuenta</Text>

            <View style={styles.formContainer}>
                <View style={globalStyles.row}>
                    <View style={globalStyles.halfColumn}>
                        <Text style={globalStyles.label}>Nombre:</Text>
                        <TextInput 
                            style={globalStyles.input} 
                            placeholder="Ej. Amelia"
                            placeholderTextColor={colors.darkGreen}
                            value={nombre}
                            onChangeText={validateNombre}
                        />
                        {nombreError && <Text style={styles.errorText}>{nombreError}</Text>}
                    </View>
                    <View style={globalStyles.halfColumn}>
                        <Text style={globalStyles.label}>Apellido:</Text>
                        <TextInput 
                            style={globalStyles.input} 
                            placeholder="Ej. Pérez"
                            placeholderTextColor={colors.darkGreen}
                            value={apellido}
                            onChangeText={validateApellido}
                        />
                        {apellidoError && <Text style={styles.errorText}>{apellidoError}</Text>}
                    </View>
                </View>

                <View style={globalStyles.inputGroup}>
                    <Text style={globalStyles.label}>Celular:</Text>
                    <View style={globalStyles.phoneInputContainer}>
                        <Text style={globalStyles.phonePrefix}>+56</Text>
                        <TextInput 
                            style={globalStyles.phoneInput} 
                            placeholder="9 5555 555"
                            placeholderTextColor={colors.darkGreen}
                            keyboardType="phone-pad"
                            maxLength={9}
                            value={celular}
                            onChangeText={validateCelular}
                        />
                    </View>
                    {celularError && <Text style={styles.errorText}>{celularError}</Text>}
                </View>

                <View style={globalStyles.inputGroup}>
                    <Text style={globalStyles.label}>Email :</Text>
                    <TextInput 
                        style={globalStyles.input} 
                        placeholder="Ej. nombre@gmail.com"
                        placeholderTextColor={colors.darkGreen}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={validateEmail}
                    />
                    {emailError && <Text style={styles.errorText}>{emailError}</Text>}
                </View>

                <View style={globalStyles.inputGroup}>
                    <View style={globalStyles.labelWithIcon}>
                        <Text style={globalStyles.label}>Contraseña:</Text>
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color={colors.lightYellow} />
                        </TouchableOpacity>
                    </View>
                    <TextInput 
                        style={globalStyles.input} 
                        placeholder="********"
                        placeholderTextColor={colors.darkGreen}
                        secureTextEntry={!showPassword} 
                        value={password}
                        onChangeText={validatePassword}
                    />
                    {passwordErrors.length > 0 && (
                        <View style={styles.errorContainer}>
                            {passwordErrors.map((error, index) => (
                                <Text key={index} style={styles.errorText}>• {error}</Text>
                            ))}
                        </View>
                    )}
                </View>

                <View style={globalStyles.inputGroup}>
                    <View style={globalStyles.labelWithIcon}>
                        <Text style={globalStyles.label}>Confirmar contraseña:</Text>
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                            <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={24} color={colors.lightYellow} />
                        </TouchableOpacity>
                    </View>
                    <TextInput 
                        style={globalStyles.input} 
                        placeholder="********"
                        placeholderTextColor={colors.darkGreen}
                        secureTextEntry={!showConfirmPassword} 
                        value={confirmPassword}
                        onChangeText={validateConfirmPassword}
                    />
                    {passwordMatchError && <Text style={styles.errorText}>{passwordMatchError}</Text>}
                </View>
            </View>

            <TouchableOpacity 
                style={[globalStyles.primaryButtonCentered, styles.localCreateButton, loading && { opacity: 0.7 }]} 
                onPress={handleRegister}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color={colors.darkDGreen} />
                ) : (
                    <Text style={globalStyles.primaryButtonText}>Crear</Text>
                )}
            </TouchableOpacity>

            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    formContainer: {
        marginBottom: 24, // spacing.xl
    },
    localCreateButton: {
        alignSelf: 'center', // Para complementar el primaryButtonCentered global
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: typography.size.sm,
        marginTop: spacing.xs,
        fontFamily: typography.family.main.medium,
    },
    errorContainer: {
        marginTop: spacing.xs,
    }
});

export default RegisterScreen;
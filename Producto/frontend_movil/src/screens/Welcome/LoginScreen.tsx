import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; // <-- Añadido para guardar el rol
import { Ionicons } from '@expo/vector-icons'; 
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { globalStyles } from '../../style/GlobalStyle';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { useCustomAlert } from '../../components/CustomAlert';

const LoginScreen = () => {
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<any>();
    const { showAlert, AlertComponent } = useCustomAlert();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const { signIn } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            showAlert('Campos incompletos', 'Por favor ingresa tu correo y contraseña.');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/login', { 
                correoUsr: email,
                passUsr: password,
                isMobile: true 
            });

            const { token, rol } = response.data; 

            if (token) {
                // 1. Guardamos el rol en la memoria del dispositivo
                if (token) {
                    console.log('Login exitoso. Rol detectado:', rol);
                    await signIn(token, rol); // Pasamos ambos datos al contexto de un solo golpe
                }
                
                console.log('Login exitoso. Rol detectado y guardado:', rol);
                
                // 2. Ejecutamos el inicio de sesión del contexto.
                // Esto destruye esta pantalla (Login) y carga el AppNavigator automáticamente.
                await signIn(token); 
            }

        } catch (error: any) {
            console.error("Error en login:", error);
            showAlert('Error', 'Credenciales incorrectas o problema de servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={globalStyles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={globalStyles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Cabecera */}
                <View style={globalStyles.headerContainer}>
                    <TouchableOpacity style={globalStyles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={32} color={colors.lightYellow} />
                    </TouchableOpacity>

                    <View style={globalStyles.headerRow}>
                        <View style={globalStyles.logoPlaceholder}>
                            <Image 
                                source={require('../../../assets/images/Logo.png')} 
                                style={globalStyles.logo}
                                resizeMode="contain" 
                            />
                        </View>
                        <Text style={globalStyles.mainTitle}>NodeVet</Text>
                        <View style={globalStyles.rightSpacer} />
                    </View>
                </View>

                {/* Formulario */}
                <View style={[globalStyles.middleSection, styles.localMiddleSection]}>
                    <Text style={globalStyles.sectionTitle}>Iniciar sesión</Text>
                    
                    {/* Input Email */}
                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.label}>Email :</Text>
                        <TextInput 
                            style={globalStyles.input} 
                            placeholder="Ej. nombre@gmail.com"
                            placeholderTextColor={colors.darkGreen}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>
                    
                    {/* Input Contraseña */}
                    <View style={globalStyles.inputGroup}>
                        <View style={globalStyles.labelWithIcon}>
                            <Text style={globalStyles.label}>Contraseña</Text>
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
                            onChangeText={setPassword}
                        />
                    </View>
                </View>

                {/* Enlances y botón */}
                <View style={globalStyles.bottomSection}> 
                    <TouchableOpacity 
                        style={globalStyles.primaryButtonCentered} 
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={globalStyles.primaryButtonText}>Acceder</Text>
                        )}
                    </TouchableOpacity>   
                    
                    <View style={globalStyles.linksContainer}>
                        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                            <Text style={globalStyles.linkText}>He olvidado mi contraseña</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={globalStyles.linkTextBold}>Crear Cuenta</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>
            <AlertComponent />
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    localMiddleSection: {
        marginTop: spacing.xxl, 
    }
});

export default LoginScreen;
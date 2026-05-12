import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; 
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { globalStyles } from '@/src/style/GlobalStyle';

const LoginScreen = () => {
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<any>();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    

    const { signIn } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Campos incompletos', 'Por favor ingresa tu correo y contraseña.');
            return;
        }
        if (!email || !password) {
            Alert.alert('Campos incompletos', 'Por favor ingresa tu correo y contraseña.');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/login', {
                correoUsr: email,
                passUsr: password
            });

            const token = response.data.token; 

            if (token) {
                // Ya no usas AsyncStorage directo aquí, usas signIn del contexto
                await signIn(token); 
                console.log('Login exitoso y estado global actualizado');
                // NO necesitas navigation.navigate, el AppNavigator cambiará solo
            }

        } catch (error: any) {
            Alert.alert('Error', 'Credenciales incorrectas o problema de servidor.');
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
                                source={require('@/assets/images/Logo.png')} 
                                style={globalStyles.logo}
                                resizeMode="contain" 
                            />
                        </View>
                        <Text style={globalStyles.mainTitle}>NodeVet</Text>
                    </View>
                    
                    <View style={globalStyles.rightSpacer} />
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
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    localMiddleSection: {
        marginTop: spacing.xxl, // Mantiene el margen específico de esta pantalla
    }
});

export default LoginScreen;
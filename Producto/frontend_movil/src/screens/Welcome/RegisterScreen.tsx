import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; 
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { globalStyles } from '@/src/style/GlobalStyle'
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

    const handleRegister = async () => {
        if (!nombre || !apellido || !celular || !email || !password) {
            Alert.alert('Campos incompletos', 'Por favor, llena todos los campos.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden.');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                nombreUsr: nombre,
                apellidoUsr: apellido,
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
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={globalStyles.scrollContainer} showsVerticalScrollIndicator={false}>
            
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
                            onChangeText={setNombre}
                        />
                    </View>
                    <View style={globalStyles.halfColumn}>
                        <Text style={globalStyles.label}>Apellido:</Text>
                        <TextInput 
                            style={globalStyles.input} 
                            placeholder="Ej. Pérez"
                            placeholderTextColor={colors.darkGreen}
                            value={apellido}
                            onChangeText={setApellido}
                        />
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
                            onChangeText={setCelular}
                        />
                    </View>
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
                        onChangeText={setEmail}
                    />
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
                        onChangeText={setPassword}
                    />
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
                        onChangeText={setConfirmPassword}
                    />
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
    }
});

export default RegisterScreen;
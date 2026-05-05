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
    Alert,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; 
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import api from '../api/axiosInstance'; // Importamos tu instancia de Axios

const RegisterScreen = () => {
    const navigation = useNavigation<any>();

    // Estados del formulario
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [celular, setCelular] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Estados para ocultar/mostrar contraseñas
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = async () => {
        // Validaciones en el frontend
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
            // Mapeo exacto al UsuarioRegistroDTO
            const payload = {
                nombreUsr: nombre,
                apellidoUsr: apellido,
                correoUsr: email,
                passUsr: password,
                telefonoUsr: `+56${celular}`, // Se añade el prefijo
            };

            console.log('Enviando payload:', payload);

            // IMPORTANTE: Cambia '/auth/register' por la ruta EXACTA que te muestra Swagger
            // Recuerda que tu AxiosInstance ya tiene el baseURL: 'http://IP:8080/api'
            const response = await api.post('/v1/usuarios/registro', payload);

            if (response.status === 200 || response.status === 201) {
                Alert.alert(
                    '¡Éxito!', 
                    'Cuenta creada correctamente.',
                    [{ text: 'Ir a Login', onPress: () => navigation.navigate('Login') }]
                );
            }
        } catch (error: any) {
            console.error('Error de registro:', error.response?.data || error.message);
            
            // Si sigue saliendo 401, el console.error de arriba te dirá exactamente qué llega del servidor
            const errorMsg = error.response?.data?.message || 'Error al intentar registrar el usuario.';
            Alert.alert('No se pudo registrar', errorMsg);
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
            
            {/* ENCABEZADO: Botón de atrás + Logo + Título */}
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
                            source={require('../../assets/images/Logo.png')} 
                            style={styles.logo}
                            resizeMode="contain" 
                        />
                    </View>
                    <Text style={styles.mainTitle}>NodeVet</Text>
                </View>
                
                <View style={styles.rightSpacer} />
            </View>

            {/* SUBTÍTULO */}
            <Text style={styles.sectionTitle}>Crear cuenta</Text>

            <View style={styles.formContainer}>

                {/* FILA 1: Nombre y Apellido */}
                <View style={styles.row}>
                    <View style={styles.halfColumn}>
                        <Text style={styles.label}>Nombre:</Text>
                        <TextInput 
                            style={styles.input} 
                            placeholder="Ej. Amelia"
                            placeholderTextColor={colors.darkGreen}
                            value={nombre}
                            onChangeText={setNombre}
                        />
                    </View>
                    <View style={styles.halfColumn}>
                        <Text style={styles.label}>Apellido:</Text>
                        <TextInput 
                            style={styles.input} 
                            placeholder="Ej. Pérez"
                            placeholderTextColor={colors.darkGreen}
                            value={apellido}
                            onChangeText={setApellido}
                        />
                    </View>
                </View>

                {/* FILA 2: Celulares */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Celular:</Text>
                    <View style={styles.phoneInputContainer}>
                        <Text style={styles.phonePrefix}>+56</Text>
                        <TextInput 
                            style={styles.phoneInput} 
                            placeholder="9 5555 555"
                            placeholderTextColor={colors.darkGreen}
                            keyboardType="phone-pad"
                            maxLength={9}
                            value={celular}
                            onChangeText={setCelular}
                        />
                    </View>
                </View>

                {/* FILA 3: Email */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email :</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="Ej. nombre@gmail.com"
                        placeholderTextColor={colors.darkGreen}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                {/* FILA 4: Contraseña con Ojito */}
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
                        style={styles.input} 
                        placeholder="********"
                        placeholderTextColor={colors.darkGreen}
                        secureTextEntry={!showPassword} 
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>

                {/* FILA 5: Confirmar Contraseña con Ojito */}
                <View style={styles.inputGroup}>
                    <View style={styles.labelWithIcon}>
                        <Text style={styles.label}>Confirmar contraseña:</Text>
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                            <Ionicons 
                                name={showConfirmPassword ? "eye-off" : "eye"} 
                                size={24} 
                                color={colors.lightYellow} 
                            />
                        </TouchableOpacity>
                    </View>
                    <TextInput 
                        style={styles.input} 
                        placeholder="********"
                        placeholderTextColor={colors.darkGreen}
                        secureTextEntry={!showConfirmPassword} 
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                </View>

            </View>

            {/* BOTÓN CREAR */}
            <TouchableOpacity 
                style={[styles.createButton, loading && { opacity: 0.7 }]} 
                onPress={handleRegister}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color={colors.darkDGreen} />
                ) : (
                    <Text style={styles.createButtonText}>Crear</Text>
                )}
            </TouchableOpacity>

            </ScrollView>
        </KeyboardAvoidingView>
    );
};

// Se mantienen todos tus estilos originales exactamente igual
const styles = StyleSheet.create({
    mainContainer: {
        flex: 1, 
        backgroundColor: colors.darkDGreen,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: spacing.xl,
        paddingTop: spacing.lg,
        paddingBottom: 60,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
        marginTop: spacing.xxl,
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
    rightSpacer: {
        width: 50,
    },
    logoPlaceholder: {
        width: 60,
        height: 60,
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
        color: colors.lightGreen,
    },
    sectionTitle: {
        fontFamily: typography.family.main.semiBold,
        fontSize: 24,
        color: colors.lightYellow,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    formContainer: {
        marginBottom: spacing.xl,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    halfColumn: {
        width: '48%',
    },
    inputGroup: {
        marginBottom: spacing.md,
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
    phoneInputContainer: {
        flexDirection: 'row',
        backgroundColor: colors.lightYellow,
        borderWidth: 1,
        borderColor: colors.darkGreen,
        borderRadius: 8,
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
    },
    phonePrefix: {
        fontFamily: typography.family.main.semiBold,
        fontSize: typography.size.sm,
        color: colors.darkDGreen,
        marginRight: spacing.xs,
    },
    phoneInput: {
        flex: 1,
        paddingVertical: 10,
        fontFamily: typography.family.main.regular,
        fontSize: typography.size.sm,
        color: colors.darkDGreen,
    },
    createButton: {
        backgroundColor: colors.lightGreen,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xxl,
        borderRadius: 12,
        alignSelf: 'center',
        elevation: 2,
    },
    createButtonText: {
        fontFamily: typography.family.main.bold,
        color: colors.darkDGreen,
        fontSize: typography.size.lg,
    },
});

export default RegisterScreen;
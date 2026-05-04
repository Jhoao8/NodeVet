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
    Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; 
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const LoginScreen = () => {
  const navigation = useNavigation<any>(); // Usamos <any> para que reconozca navigate('Register')

    // Estados del formulario
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = () => {
        console.log('Iniciando sesión con:', { email });
        // Aquí luego irá la lógica de autenticación
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
                            source={require('../../assets/images/Logo.png')} 
                            style={styles.logo}
                            resizeMode="contain" 
                        />
                    </View>
                    <Text style={styles.mainTitle}>NodeVet</Text>
                </View>
                
                <View style={styles.rightSpacer} />
            </View>

            {/* Formulario */}
            <View style={styles.middleSection}>
                <Text style={styles.sectionTitle}>Iniciar sesión</Text>
                {/* Input Email */}
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
                {/* Input Contraseña */}
                <View style={styles.inputGroup}>
                    <View style={styles.labelWithIcon}>
                        <Text style={styles.label}>Contraseña</Text>
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
            </View>
            {/* Enlances y botón */}
            <View style={styles.bottomSection}>    
                {/* Enlaces adicionales */}
                <View style={styles.linksContainer}>
                    <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                    <Text style={styles.linkText}>He olvidado mi contraseña</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.linkTextBold}>Crear Cuenta</Text>
                    </TouchableOpacity>
                </View>
                {/* Botón Principal */}
                <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
                    <Text style={styles.primaryButtonText}>Acceder</Text>
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
});

export default LoginScreen;
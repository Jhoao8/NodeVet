import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; 
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import api from '@/src/api/axiosInstance';
import { globalStyles } from '../../style/GlobalStyle'; // <-- Ajusta la ruta

export const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState(''); 
    const [isCodeSent, setIsCodeSent] = useState(false); 
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<any>();

    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: '',
        message: '',
        type: 'success'
    });

    const showModal = (title: string, message: string, type: 'success' | 'error' = 'success') => {
        setModalConfig({ title, message, type });
        setModalVisible(true);
    };

    const validateEmail = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const isEmailValid = validateEmail(email);
    const isCodeValid = code.length === 6 && /^\d+$/.test(code);

    const handleSendEmail = async () => {
        if (!isEmailValid) return;
        setLoading(true);
        try {
            const response = await api.post('/auth/forgot-password', { correo_usr: email });
            if (response.status === 200) {
                setIsCodeSent(true); 
                setCode('');
                showModal("Código Enviado", "Revisa tu bandeja de entrada e ingresa el código de 6 dígitos.", "success");
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || "No se pudo conectar con el servidor o el correo no fue encontrado";
            showModal("Error", errorMsg, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!isCodeValid) return;
        setLoading(true);
        try {
            const response = await api.post('/auth/verify-code', { correo_usr: email, codigo: code });
            if (response.status === 200) {
                navigation.navigate('ResetPassword', { email: email, code: code });
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || "El código es incorrecto o ha expirado.";
            showModal("Error", errorMsg, "error");
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
                                source={require('../../../assets/images/Logo.png')} 
                                style={globalStyles.logo}
                                resizeMode="contain" 
                            />
                        </View>
                        <Text style={globalStyles.mainTitle}>NodeVet</Text>
                    </View>
                    <View style={globalStyles.rightSpacer} />
                </View>

                <View style={[globalStyles.middleSection, styles.localMiddleSection]} />
                
                <Text style={globalStyles.sectionTitle}>Recuperar Contraseña</Text>
    
                <View style={globalStyles.inputGroup}>
                    <Text style={globalStyles.label}>Correo :</Text>
                    <TextInput 
                        style={[globalStyles.input, isEmailValid && { borderColor: colors.lightGreen, borderWidth: 2 }]} 
                        placeholder="Ej. nombre@gmail.com"
                        placeholderTextColor={colors.darkGreen}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                        editable={!loading}
                    />
                </View>

                <View style={globalStyles.bottomSection}>    
                    <TouchableOpacity 
                        style={[globalStyles.primaryButtonCentered, (!isEmailValid || loading) && globalStyles.primaryButtonDisabled]} 
                        onPress={handleSendEmail}
                        disabled={!isEmailValid || loading} 
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.darkDGreen} />
                        ) : (
                            <Text style={globalStyles.primaryButtonText}>Enviar Código</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.dynamicSection}>
                    <View style={globalStyles.divider} />
                    
                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.label}>Código de Verificación:</Text>
                        <Text style={styles.subLabel}>Ingresa el código enviado a su correo</Text>
                        <TextInput 
                            style={[globalStyles.input, styles.codeInput, isCodeValid && { borderColor: colors.lightGreen, borderWidth: 2 }]} 
                            placeholder="123456"
                            placeholderTextColor={colors.darkGreen}
                            keyboardType="number-pad"
                            maxLength={6}
                            value={code}
                            onChangeText={setCode}
                            editable={!loading}
                        />
                    </View>

                    <View style={globalStyles.bottomSection}>    
                        <TouchableOpacity 
                            style={[globalStyles.primaryButtonCentered, (!isCodeValid || loading) && globalStyles.primaryButtonDisabled]} 
                            onPress={handleVerifyCode}
                            disabled={!isCodeValid || loading} 
                        >
                            {loading && isCodeSent ? (
                                <ActivityIndicator color={colors.darkDGreen} />
                            ) : (
                                <Text style={globalStyles.primaryButtonText}>Verificar</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>

            <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={globalStyles.modalOverlay}>
                    <View style={globalStyles.modalContent}>
                        <Ionicons name={modalConfig.type === 'error' ? 'alert-circle' : 'checkmark-circle'} size={60} color={modalConfig.type === 'error' ? '#FF6B6B' : colors.lightGreen} />
                        <Text style={globalStyles.modalTitle}>{modalConfig.title}</Text>
                        <Text style={globalStyles.modalMessage}>{modalConfig.message}</Text>
                        <TouchableOpacity style={globalStyles.modalButton} onPress={() => setModalVisible(false)}>
                            <Text style={globalStyles.primaryButtonText}>Aceptar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    localMiddleSection: {
        marginTop: spacing.md, 
    },
    dynamicSection: {
        marginTop: spacing.xl,
    },
    subLabel: {
        fontFamily: typography.family.main.regular,
        fontSize: typography.size.sm,
        color: colors.lightGreen,
        marginBottom: spacing.sm,
    },
    codeInput: {
        textAlign: 'center',
        fontSize: typography.size.xl,
        letterSpacing: 8, 
        fontFamily: typography.family.main.bold,
    },
});
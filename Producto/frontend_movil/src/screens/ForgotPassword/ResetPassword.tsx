import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; 
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import api from '@/src/api/axiosInstance';
import { globalStyles } from '../../style/GlobalStyle';

export const ResetPassword = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>(); 
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    
    const { email, code } = route.params || { email: '', code: '' };

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: '',
        message: '',
        type: 'success', 
        onPress: () => { setModalVisible(false) } 
    });

    const showModal = (title: string, message: string, type: 'success' | 'error', onPressAction?: () => void) => {
        setModalConfig({ title, message, type, onPress: onPressAction || (() => setModalVisible(false)) });
        setModalVisible(true);
    };

    const isPasswordValid = password.length >= 6;
    const doPasswordsMatch = password === confirmPassword && isPasswordValid;

    const handleResetPassword = async () => {
        if (!doPasswordsMatch) return;
        setLoading(true);
        try {
            const response = await api.post('/auth/reset-password', {
                correo_usr: email,
                codigo: code,
                nueva_pass: password 
            });

            if (response.status === 200) {
                showModal("¡Éxito!", "Tu contraseña ha sido actualizada correctamente.", "success", () => {
                        setModalVisible(false);
                        navigation.replace('Login');
                });
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || "Hubo un problema al actualizar la contraseña.";
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
                
                <Text style={globalStyles.sectionTitle}>Nueva Contraseña</Text>
                
                <Text style={styles.infoText}>
                    Estás restableciendo la contraseña para el correo:{'\n'}
                    <Text style={{ fontFamily: typography.family.main.bold }}>{email}</Text>
                </Text>

                <View style={globalStyles.inputGroup}>
                    <View style={globalStyles.labelWithIcon}>
                        <Text style={globalStyles.label}>Contraseña:</Text>
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color={colors.lightYellow} />
                        </TouchableOpacity>
                    </View>
                    <TextInput 
                        style={[globalStyles.input, (password.length > 0 && !isPasswordValid) && { borderColor: 'red', borderWidth: 1 }]} 
                        placeholder="Mínimo 6 caracteres"
                        placeholderTextColor={colors.darkGreen}
                        secureTextEntry={!showPassword} 
                        autoCapitalize="none"
                        value={password}
                        onChangeText={setPassword}
                        editable={!loading}
                    />
                </View>

                <View style={globalStyles.inputGroup}>
                    <View style={globalStyles.labelWithIcon}>
                        <Text style={globalStyles.label}>Confirmar Contraseña:</Text>
                        <TouchableOpacity onPress={() => setShowPassword2(!showPassword2)}>
                            <Ionicons name={showPassword2 ? "eye-off" : "eye"} size={24} color={colors.lightYellow} />
                        </TouchableOpacity>
                    </View>
                    <TextInput 
                        style={[
                            globalStyles.input, 
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

                <View style={globalStyles.bottomSection}>    
                    <TouchableOpacity 
                        style={[globalStyles.primaryButtonCentered, (!doPasswordsMatch || loading) && globalStyles.primaryButtonDisabled]} 
                        onPress={handleResetPassword}
                        disabled={!doPasswordsMatch || loading} 
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.darkDGreen} />
                        ) : (
                            <Text style={globalStyles.primaryButtonText}>Guardar</Text>
                        )}
                    </TouchableOpacity>
                </View>

            </ScrollView>

            <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => modalConfig.onPress()}>
                <View style={globalStyles.modalOverlay}>
                    <View style={globalStyles.modalContent}>
                        <Ionicons name={modalConfig.type === 'error' ? 'alert-circle' : 'checkmark-circle'} size={60} color={modalConfig.type === 'error' ? '#FF6B6B' : colors.lightGreen} />
                        <Text style={globalStyles.modalTitle}>{modalConfig.title}</Text>
                        <Text style={globalStyles.modalMessage}>{modalConfig.message}</Text>
                        <TouchableOpacity style={globalStyles.modalButton} onPress={modalConfig.onPress}>
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
    infoText: {
        fontFamily: typography.family.main.regular,
        fontSize: typography.size.sm,
        color: colors.lightGreen,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
});
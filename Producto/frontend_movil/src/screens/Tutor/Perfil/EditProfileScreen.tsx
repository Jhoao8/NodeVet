import React, { useState, useCallback } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, ScrollView, 
    ActivityIndicator, TextInput, Platform 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { globalStyles } from '../../../style/GlobalStyle';
import { dashboardStyles } from '../../../style/DashboardStyle';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import DashboardHeader from '../../../components/DashboardHeader';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axiosInstance';
import axios from 'axios';
import { useCustomAlert } from '../../../components/CustomAlert';

interface UserProfile {
    idUsr?: number;
    nombreUsr: string;
    apellidoUsr: string;
    correoUsr: string;
    telefonoUsr: string;
}

export default function EditProfileScreen({ navigation }: any) {
    const { userToken } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState<UserProfile>({
        nombreUsr: '',
        apellidoUsr: '',
        correoUsr: '',
        telefonoUsr: '',
    });

    const { showAlert, AlertComponent } = useCustomAlert();

    const fetchUserProfile = async () => {
        if (!userToken) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await api.get('/v1/usuarios/perfil');
            const data = response.data;

            const partesNombre = data.nombreCompleto ? data.nombreCompleto.split(' ') : [];
            const nombreExtraido = partesNombre[0] || '';
            const apellidoExtraido = partesNombre.length > 1 ? partesNombre.slice(1).join(' ') : '';

            // Llenamos el formulario con las piezas ya separadas
            setFormData({
                nombreUsr: nombreExtraido,
                apellidoUsr: apellidoExtraido,
                correoUsr: data.correoUsr || '',
                telefonoUsr: data.telefonoUsr || '',
            });
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                console.log("Sesión terminada o token expirado.");
                return;
            }
            console.error("Error al obtener perfil:", error);
            showAlert('Error', 'No se pudo cargar los datos del perfil.');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchUserProfile();
        }, [userToken])
    );

    const handleSaveChanges = async () => {
        if (!formData.nombreUsr?.trim()) {
            showAlert('Campos obligatorios', 'Por favor ingresa el nombre.');
            return;
        }
        if (!formData.apellidoUsr?.trim()) {
            showAlert('Campos obligatorios', 'Por favor ingresa el apellido.');
            return;
        }
        if (!formData.correoUsr?.trim()) {
            showAlert('Campos obligatorios', 'Por favor ingresa el correo.');
            return;
        }

        try {
            setSaving(true);
            const updateData = {
                nombreUsr: formData.nombreUsr.trim(),
                apellidoUsr: formData.apellidoUsr.trim(),
                correoUsr: formData.correoUsr.trim(),
                telefonoUsr: formData.telefonoUsr?.trim() || '',
            };

            // CORRECCIÓN: Ruta /v1/usuarios/perfil
            await api.put('/v1/usuarios/perfil', updateData);
            
            showAlert('¡Éxito!', 'Perfil actualizado correctamente.');
            setTimeout(() => {
                navigation.goBack();
            }, 1000);
        } catch (error) {
            console.error('Error al guardar cambios:', error);
            showAlert('Error', 'No se pudo actualizar el perfil. Intenta de nuevo.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={[globalStyles.container, dashboardStyles.lightBackground]}>
                <DashboardHeader />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.darkGreen} />
                </View>
            </View>
        );
    }

    return (
        <View style={[globalStyles.container, dashboardStyles.lightBackground]}>
            <DashboardHeader />

            <ScrollView 
                contentContainerStyle={globalStyles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={dashboardStyles.greetingContainer}>
                    <Text style={[dashboardStyles.greetingText, dashboardStyles.darkText]}>
                        Editar perfil
                    </Text>
                    <View style={[dashboardStyles.greetingDivider, dashboardStyles.darkDivider]} />
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nombre:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre Actual"
                            placeholderTextColor={colors.darkGreen}
                            value={formData.nombreUsr}
                            onChangeText={(text) => setFormData({ ...formData, nombreUsr: text })}
                            editable={!saving}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Apellido:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Apellido Actual"
                            placeholderTextColor={colors.darkGreen}
                            value={formData.apellidoUsr}
                            onChangeText={(text) => setFormData({ ...formData, apellidoUsr: text })}
                            editable={!saving}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Correo:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Correo actual"
                            placeholderTextColor={colors.darkGreen}
                            value={formData.correoUsr}
                            onChangeText={(text) => setFormData({ ...formData, correoUsr: text })}
                            editable={!saving}
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Celular:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Celular actual"
                            placeholderTextColor={colors.darkGreen}
                            value={formData.telefonoUsr}
                            onChangeText={(text) => setFormData({ ...formData, telefonoUsr: text })}
                            editable={!saving}
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                <TouchableOpacity 
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={handleSaveChanges}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator size="small" color={colors.lightYellow} />
                    ) : (
                        <Text style={styles.saveButtonText}>Guardar cambios</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>
            <AlertComponent />
        </View>
    );
}

const styles = StyleSheet.create({
    formContainer: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
    },
    inputGroup: {
        marginBottom: spacing.lg,
    },
    label: {
        fontFamily: typography.family.main.semiBold,
        fontSize: typography.size.sm,
        color: colors.darkGreen,
        marginBottom: spacing.xs,
    },
    input: {
        borderWidth: 1.5,
        borderColor: colors.darkDGreen,
        borderRadius: 4,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        fontFamily: typography.family.main.regular,
        fontSize: typography.size.md,
        color: colors.darkDGreen,
        backgroundColor: 'white',
    },
    saveButton: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.xl,
        paddingVertical: spacing.lg,
        backgroundColor: colors.darkGreen,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        fontFamily: typography.family.main.bold,
        fontSize: typography.size.md,
        color: colors.lightYellow,
    },
});
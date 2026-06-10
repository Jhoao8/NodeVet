import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// Importación de tu sistema de diseño completo
import { globalStyles } from '../../style/GlobalStyle';
import { dashboardStyles } from '../../style/DashboardStyle';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import DashboardHeader from '../../components/DashboardHeader';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import axios from 'axios';
import { useCustomAlert } from '../../components/CustomAlert';

interface UserProfile {
    nombreUsr: string;
    apellidoUsr: string;
    correoUsr: string;
    telefonoUsr: string;
    fotoPerfil?: string;
}

export default function ProfileScreen({ navigation }: any) {
    const { userToken, signOut } = useAuth();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const { showAlert, AlertComponent } = useCustomAlert();

    const fetchUserProfile = async () => {
        if (!userToken) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await api.get('/v1/usuarios/perfil');
            // 👇 AGREGA ESTA LÍNEA PARA ESPIAR LOS DATOS 👇
            console.log("DATOS REALES DEL BACKEND:", response.data);
            setUser(response.data);
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                console.log("Sesión terminada o token expirado.");
                return;
            }
            console.error("Error al obtener perfil:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchUserProfile();
        }, [userToken])
    );

    const handleLogout = () => {
        showAlert(
            'Cerrar Sesión',
            '¿Estás seguro de que quieres cerrar sesión?',
            [
                {
                    text: 'Cancelar',
                    onPress: () => {},
                    style: 'cancel',
                },
                {
                    text: 'Sí, cerrar sesión',
                    onPress: async () => {
                        try {
                            await signOut();
                        } catch (error) {
                            console.error('Error al cerrar sesión:', error);
                            showAlert('Error', 'Error al cerrar sesión. Por favor intenta de nuevo.');
                        }
                    },
                    style: 'destructive',
                },
            ],
        );
    };

    return (
        <View style={[globalStyles.container, dashboardStyles.lightBackground]}>
            <DashboardHeader />

            <ScrollView 
                contentContainerStyle={globalStyles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* ════════ TÍTULO DE SECCIÓN ════════ */}
                <View style={dashboardStyles.greetingContainer}>
                    <View style={styles.titleRow}>
                        <Text style={[dashboardStyles.greetingText, dashboardStyles.darkText]}>
                            Mi perfil
                        </Text>
                        <TouchableOpacity 
                            style={styles.editIcon}
                            onPress={() => navigation.navigate('EditProfile')}
                        >
                            <Ionicons name="pencil" size={20} color={colors.darkGreen} />
                        </TouchableOpacity>
                    </View>
                    <View style={[dashboardStyles.greetingDivider, dashboardStyles.darkDivider]} />
                </View>

                {/* ════════ TARJETA DE INFORMACIÓN ════════ */}
                {loading ? (
                    <View style={{ justifyContent: 'center', alignItems: 'center', marginVertical: spacing.xl }}>
                        <ActivityIndicator size="large" color={colors.darkGreen} />
                    </View>
                ) : (
                    // Quitamos el ": user ?" para que la sección siempre se vea, sí o sí
                    <View style={styles.profileInfoContainer}>
                        
                        {/* Foto de perfil (Muestra la de Cloudinary si existe, sino un ícono) */}
                        <TouchableOpacity style={styles.imagePlaceholder} activeOpacity={0.8}>
                            {user?.fotoPerfil ? (
                                <Image 
                                    source={{ uri: user.fotoPerfil }}
                                />
                            ) : (
                                <Ionicons name="camera-outline" size={50} color={colors.darkGreen} style={{ opacity: 0.6 }} />
                            )}
                        </TouchableOpacity>

                        {/* Datos del usuario */}
                        <View style={styles.infoTextContainer}>
                            <View style={styles.infoBlock}>
                                <Text style={styles.labelText}>Nombre:</Text>
                                {/* Recuadro para el Nombre */}
                                <View style={styles.valueBox}>
                                    <Text style={styles.valueText}>
                                        {user?.nombreUsr || user?.apellidoUsr 
                                            ? `${user?.nombreUsr || ''} ${user?.apellidoUsr || ''}`.trim() 
                                            : 'No registrado'}
                                    </Text>
                                </View>
                            </View>
                            
                            <View style={styles.infoBlock}>
                                <Text style={styles.labelText}>Email:</Text>
                                {/* Recuadro para el Email */}
                                <View style={styles.valueBox}>
                                    <Text style={styles.valueText}>
                                        {user?.correoUsr || 'No registrado'}
                                    </Text>
                                </View>
                            </View>
                            
                            <View style={styles.infoBlock}>
                                <Text style={styles.labelText}>Teléfono:</Text>
                                {/* Recuadro para el Teléfono */}
                                <View style={styles.valueBox}>
                                    <Text style={styles.valueText}>
                                        {user?.telefonoUsr || 'No registrado'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                <View style={[dashboardStyles.greetingDivider, dashboardStyles.darkDivider, { marginVertical: spacing.lg }]} />

                {/* ════════ MENÚ DE OPCIONES ════════ */}
                <View style={styles.menuContainer}>
                    <TouchableOpacity style={styles.menuButton}>
                        <Text style={styles.menuButtonText}>Cambiar contraseña</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuButton}>
                        <Text style={styles.menuButtonText}>Configurar recordatorios</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuButton}>
                        <Text style={styles.menuButtonText}>Eliminar cuenta</Text>
                    </TouchableOpacity>
                </View>

                {/* ════════ BOTÓN CERRAR SESIÓN ════════ */}
                <TouchableOpacity 
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
                </TouchableOpacity>

            </ScrollView>
            <AlertComponent />
        </View>
    );
}

// ════════ ESTILOS LOCALES ════════
const styles = StyleSheet.create({
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    editIcon: {
        padding: spacing.xs,
    },
    valueBox: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.lightGreen,
        borderRadius: 8,
        paddingHorizontal: spacing.sm,
        paddingVertical: 8,
    },

    profileInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
        paddingHorizontal: spacing.sm,
    },
    imagePlaceholder: {
        width: 120,
        height: 120,
        borderWidth: 1.5,
        borderColor: colors.darkDGreen,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.lg,
        overflow: 'hidden', // <- Agrega esto para que la imagen no se salga del cuadro
    },
    // Agrega este nuevo estilo para la foto
    profileImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    infoTextContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    infoBlock: {
        marginBottom: spacing.sm,
    },
    labelText: {
        fontFamily: typography.family.main.semiBold,
        fontSize: typography.size.xs,
        color: colors.darkGreen,
    },
    valueText: {
        fontFamily: typography.family.main.bold,
        fontSize: typography.size.md,
        color: colors.darkDGreen,
    },

    menuContainer: {
        gap: spacing.md, 
    },
    menuButton: {
        borderWidth: 1.5,
        borderColor: colors.darkDGreen,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
    },
    menuButtonText: {
        fontFamily: typography.family.main.medium,
        fontSize: typography.size.md,
        color: colors.darkDGreen,
    },

    logoutButton: {
        borderWidth: 1.5,
        borderColor: colors.darkDGreen,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginTop: spacing.lg,
        marginBottom: spacing.xl,
    },
    logoutButtonText: {
        fontFamily: typography.family.main.bold,
        fontSize: typography.size.sm,
        color: colors.darkDGreen,
    },
});
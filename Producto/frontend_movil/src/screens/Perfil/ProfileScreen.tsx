import React, { useState, useCallback } from 'react';
import { 
    View, Text, ScrollView, TouchableOpacity, 
    StyleSheet, Alert, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// Importación de configuración y estilos
import api from '@/src/api/axiosInstance';
import { globalStyles } from '@/src/style/GlobalStyle';
import { dashboardStyles } from '@/src/style/DashboardStyle';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';

// Importamos tu contexto de autenticación
import { useAuth } from '@/src/context/AuthContext'; 

interface UserProfile {
    nombreUsr: string;
    apellidoUsr: string;
    correoUsr: string;
    telefonoUsr: string;
}

export default function ProfileScreen() {
    const navigation = useNavigation<any>();
    const { signOut } = useAuth(); // Usamos tu función signOut
    
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Función para obtener los datos desde el backend
    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const response = await api.get('/v1/usuarios/perfil');
            setUser(response.data);
        } catch (error: any) {
            // Ignoramos el error 401 en silencio si ocurre justo al cerrar sesión
            if (error.response && error.response.status === 401) {
                console.log("Sesión terminada o token expirado. Ignorando error 401.");
                return; 
            }
            console.error("Error al obtener perfil:", error);
            Alert.alert("Error", "No se pudo cargar la información del perfil.");
        } finally {
            setLoading(false);
        }
    };

    // Refrescar cada vez que la pantalla gana el foco
    useFocusEffect(
        useCallback(() => {
            fetchUserProfile();
        }, [])
    );

    const handleLogout = () => {
        Alert.alert(
            "Cerrar Sesión",
            "¿Estás seguro que deseas salir?",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Salir", 
                    style: "destructive",
                    onPress: async () => {
                        await signOut(); // Esto destruye el token y te manda al Login
                    } 
                }
            ]
        );
    };

    // Sub-componente para los ítems del menú
    const MenuItem = ({ icon, title, subtitle, onPress, isLast = false }: any) => (
        <TouchableOpacity 
            style={[styles.menuItem, !isLast && styles.menuItemBorder]} 
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.menuItemLeft}>
                <View style={styles.iconWrapper}>
                    <Ionicons name={icon} size={20} color={colors.darkGreen} />
                </View>
                <View>
                    <Text style={styles.menuItemTitle}>{title}</Text>
                    {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
                </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.lightGreen} />
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={[globalStyles.container, styles.centered]}>
                <ActivityIndicator size="large" color={colors.darkGreen} />
            </View>
        );
    }

    return (
        <View style={[globalStyles.container, dashboardStyles.lightBackground]}>
            {/* Cabecera con botón volver */}
            <View style={styles.customHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={26} color={colors.darkDGreen} />
                </TouchableOpacity>
                <Text style={styles.headerTitleText}>Mi Perfil</Text>
                <View style={{ width: 26 }} />
            </View>

            <ScrollView contentContainerStyle={globalStyles.scrollContainer}>
                
                {/* TARJETA DE PERFIL DINÁMICA */}
                <View style={[dashboardStyles.flatCard, styles.profileCard]}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>
                            {user?.nombreUsr?.charAt(0) || ''}{user?.apellidoUsr?.charAt(0) || ''}
                        </Text>
                    </View>
                    <Text style={styles.fullUserName}>{user?.nombreUsr} {user?.apellidoUsr}</Text>
                    <Text style={styles.userEmailText}>{user?.correoUsr}</Text>
                </View>

                {/* SECCIÓN DE INFORMACIÓN */}
                <View style={globalStyles.sectionHeaderRow}>
                    <Text style={styles.sectionLabel}>Información de contacto</Text>
                </View>
                <View style={[dashboardStyles.flatCard, { padding: 0 }]}>
                    <MenuItem 
                        icon="call-outline" 
                        title="Teléfono" 
                        subtitle={user?.telefonoUsr || 'No registrado'}
                        onPress={() => {}} 
                    />
                    <MenuItem 
                        icon="mail-outline" 
                        title="Correo electrónico" 
                        subtitle={user?.correoUsr}
                        isLast={true}
                        onPress={() => {}} 
                    />
                </View>

                {/* SECCIÓN DE SEGURIDAD Y CUENTA */}
                <View style={globalStyles.sectionHeaderRow}>
                    <Text style={styles.sectionLabel}>Ajustes de cuenta</Text>
                </View>
                <View style={[dashboardStyles.flatCard, { padding: 0 }]}>
                    <MenuItem 
                        icon="lock-closed-outline" 
                        title="Seguridad" 
                        subtitle="Cambiar contraseña"
                        onPress={() => {}} 
                    />
                    <MenuItem 
                        icon="help-circle-outline" 
                        title="Soporte técnico" 
                        isLast={true}
                        onPress={() => {}} 
                    />
                </View>

                {/* BOTÓN CERRAR SESIÓN */}
                <TouchableOpacity 
                    style={[globalStyles.primaryButton, styles.logoutBtn]} 
                    onPress={handleLogout}
                >
                    <Ionicons name="log-out-outline" size={20} color={colors.white} style={{ marginRight: 8 }} />
                    <Text style={globalStyles.primaryButtonText}>Cerrar Sesión</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    centered: { justifyContent: 'center', alignItems: 'center' },
    customHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: colors.lightYellow,
    },
    headerTitleText: {
        fontFamily: typography?.family?.main?.bold || 'System',
        fontSize: 18,
        color: colors.darkDGreen,
    },
    profileCard: {
        alignItems: 'center',
        paddingVertical: 25,
        marginBottom: 10,
    },
    avatarCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: colors.darkGreen,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    avatarText: {
        color: colors.white,
        fontSize: 24,
        fontFamily: typography?.family?.main?.bold || 'System',
    },
    fullUserName: {
        fontFamily: typography?.family?.main?.bold || 'System',
        fontSize: 20,
        color: colors.darkDGreen,
    },
    userEmailText: {
        fontFamily: typography?.family?.main?.regular || 'System',
        fontSize: 14,
        color: colors.darkGreen,
        marginTop: 4,
    },
    sectionLabel: {
        fontFamily: typography?.family?.main?.semiBold || 'System',
        fontSize: 14,
        color: colors.darkGreen,
        marginLeft: 5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGreen,
    },
    menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
    iconWrapper: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: colors.lightYellow,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuItemTitle: {
        fontFamily: typography?.family?.main?.semiBold || 'System',
        fontSize: 15,
        color: colors.darkDGreen,
    },
    menuItemSubtitle: {
        fontFamily: typography?.family?.main?.regular || 'System',
        fontSize: 13,
        color: colors.darkGreen,
    },
    logoutBtn: {
        marginTop: 25,
        marginBottom: 50,
        backgroundColor: '#D9534F',
        borderColor: '#D9534F',
        flexDirection: 'row',
    }
});
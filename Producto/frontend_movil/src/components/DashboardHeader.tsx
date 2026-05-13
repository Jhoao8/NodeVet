import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { dashboardStyles } from '../style/DashboardStyle';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

const DashboardHeader = () => {
    const { signOut } = useAuth();
    const navigation = useNavigation<any>();

    const handleLogout = () => {
        Alert.alert(
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
                            // PRIMERO: Navega a Welcome
                            navigation.navigate('Welcome');
                            
                            // DESPUÉS: Borra el token
                            setTimeout(async () => {
                                await signOut();
                            }, 500);
                        } catch (error) {
                            console.error('Error al cerrar sesión:', error);
                            Alert.alert('Error', 'Error al cerrar sesión. Por favor intenta de nuevo.');
                        }
                    },
                    style: 'destructive',
                },
            ],
        );
    };

    return (
        <View style={dashboardStyles.header}>
            <View style={dashboardStyles.headerLogoContainer}>
                <Image 
                    source={require('@/assets/images/Logo.png')} 
                    style={dashboardStyles.headerLogo}
                    resizeMode="contain" 
                />
                <Text style={dashboardStyles.headerTitle}>NodeVet</Text>
            </View>
            
            <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
                <TouchableOpacity 
                    style={dashboardStyles.bellIcon}
                    onPress={() => console.log("Notificaciones presionadas")}
                >
                    <Ionicons name="notifications-outline" size={28} color={colors.lightYellow} />
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={handleLogout}
                    style={{ padding: 8 }}
                >
                    <Ionicons name="log-out-outline" size={28} color={colors.lightYellow} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default DashboardHeader;
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { dashboardStyles } from '../style/DashboardStyle'; // Ajusta la ruta según tu carpeta
import { colors } from '../theme/colors';

const DashboardHeader = () => {
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
            
            <TouchableOpacity 
                style={dashboardStyles.bellIcon}
                onPress={() => console.log("Notificaciones presionadas")}
            >
                <Ionicons name="notifications-outline" size={28} color={colors.lightYellow} />
            </TouchableOpacity>
        </View>
    );
};

export default DashboardHeader;
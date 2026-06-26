import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { dashboardStyles } from '../style/DashboardStyle';
import { colors } from '../theme/colors';

interface DashboardHeaderProps {
    showBackButton?: boolean;
    onBackPress?: () => void;
}

const DashboardHeader = ({ showBackButton = false, onBackPress }: DashboardHeaderProps) => {

    return (
        <View style={dashboardStyles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                {showBackButton && (
                    <TouchableOpacity
                        style={dashboardStyles.bellIcon}
                        onPress={onBackPress}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.lightYellow} />
                    </TouchableOpacity>
                )}

                <View style={dashboardStyles.headerLogoContainer}>
                    <Image 
                        source={require('../../assets/images/Logo.png')} 
                        style={dashboardStyles.headerLogo}
                        resizeMode="contain" 
                    />
                    <Text style={dashboardStyles.headerTitle}>NodeVet</Text>
                </View>
            </View>
            
            <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
                <TouchableOpacity 
                    style={dashboardStyles.bellIcon}
                    onPress={() => console.log("Notificaciones presionadas")}
                >
                    <Ionicons name="notifications-outline" size={28} color={colors.lightYellow} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default DashboardHeader;
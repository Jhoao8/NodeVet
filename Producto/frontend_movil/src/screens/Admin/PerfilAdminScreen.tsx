import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { globalStyles } from '@/src/style/GlobalStyle';
import { useAuth } from '@/src/context/AuthContext';

export default function PerfilAdminScreen() {
    const { signOut } = useAuth();
    
    return (
        <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={globalStyles.mainTitle}>Mi Perfil</Text>
            
            <TouchableOpacity style={[globalStyles.primaryButtonCentered, { marginTop: 40 }]} onPress={signOut}>
                <Text style={globalStyles.primaryButtonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
        </View>
    );
}
import React from 'react';
import { View, Text } from 'react-native';
import { globalStyles } from '@/src/style/GlobalStyle';
import { colors } from '@/src/theme/colors';

export default function GestionUsrScreen() {
    return (
        <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={globalStyles.mainTitle}>Usuarios</Text>
            <Text style={{ color: colors.darkGreen }}>Gestión de tutores del sistema</Text>
        </View>
    );
}
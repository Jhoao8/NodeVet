import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Asumiendo que usas iconos
import { globalStyles } from '../theme/globalStyles'; // Tu archivo de estilos globales

interface HeaderProps {
    onBackPress?: () => void;
    showBack?: boolean;
}

export const Header = ({ onBackPress, showBack = true }: HeaderProps) => {
    return (
        <View style={globalStyles.headerContainer}>
            {/* Botón de retroceso */}
            {showBack ? (
                <TouchableOpacity onPress={onBackPress} style={globalStyles.iconButton}>
                <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
            ) : (
                <View style={globalStyles.iconButton} />
            )}

            {/* Centro: Logo */}
            <View style={globalStyles.headerRow}>
                <View style={globalStyles.logoPlaceholder}>
                    {/* Aquí va tu componente <Image /> */}
                </View>
            </View>

            {/* Espaciador derecho para mantener el logo en el centro exacto */}
            <View style={globalStyles.rightSpacer} />
        </View>
    );
};
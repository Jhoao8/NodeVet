import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

// Importación de las pantallas base
import VetHomeScreen from '../screens/Veterinario/VetHomeScreen';
import DetalleCitaVetScreen from '../screens/Veterinario/DetalleCitaVetScreen';
import VetHistorialScreen from '../screens/Veterinario/VetHistorialScreen';
import PerfilVetScreen from '../screens/Veterinario/VetPerfilScreen';

const Tab = createBottomTabNavigator();

export default function VetBottomTabNavigator() {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: true,
                tabBarActiveTintColor: colors.lightYellow,
                tabBarInactiveTintColor: colors.lightGreen,
                tabBarStyle: {
                    backgroundColor: colors.darkDGreen,
                    borderTopWidth: 1,
                    borderTopColor: 'rgba(158, 181, 125, 0.2)',
                    height: 60 + insets.bottom,
                    paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontFamily: 'Fredoka-Medium',
                    fontSize: 12,
                },
                tabBarIcon: ({ color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'calendar';

                    if (route.name === 'Inicio') {
                        iconName = 'calendar';
                    } else if (route.name === 'Atención') {
                        iconName = 'medical-outline';
                    } else if (route.name === 'Historial') {
                        iconName = 'clipboard-outline';
                    } else if (route.name === 'Perfil') {
                        iconName = 'person-circle-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Inicio" component={VetHomeScreen} />
            <Tab.Screen name="Atención" component={DetalleCitaVetScreen} />
            <Tab.Screen name="Historial" component={VetHistorialScreen} />
            <Tab.Screen name="Perfil" component={PerfilVetScreen} />
        </Tab.Navigator>
    );
}
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Importamos las pantallas del Admin con los nombres exactos de tus archivos
import AdminHomeScreen from '../screens/Admin/AdminHomeScreen';
import GestionVetScreen from '../screens/Admin/ConfigVet/GestionVetScreen';
import GestionUsrScreen from '../screens/Admin/GestionUsrScreen';
import PerfilAdminScreen from '../screens/Admin/PerfilAdminScreen';

import { colors } from '@/src/theme/colors';

const Tab = createBottomTabNavigator();

export default function AdminBottomTabNavigator() {
const insets = useSafeAreaInsets(); 

return (
    <Tab.Navigator
    initialRouteName="InicioAdmin" 
    screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // Mantiene la estética limpia sin textos, igual que el Tutor
        tabBarActiveTintColor: colors.lightYellow, // Color de selección oficial
        tabBarInactiveTintColor: colors.lightGreen,  // Color inactivo oficial
        tabBarStyle: {
        backgroundColor: colors.darkDGreen, // Mismo fondo institucional de la app
        borderTopWidth: 0,
        paddingTop: 10,
        // Adapta dinámicamente la altura según los botones virtuales o barra del dispositivo
        height: 60 + insets.bottom,
        paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
        },
    }}
    >
    {/* Posición 1: Inicio / Dashboard */}
    <Tab.Screen
        name="InicioAdmin"
        component={AdminHomeScreen}
        options={{
        tabBarIcon: ({ color }) => (
            <Ionicons 
            name={color === colors.lightYellow ? "home" : "home-outline"} 
            color={color} 
            size={28} 
            />
        ),
        }}
    />

    {/* Posición 2: Gestión de Veterinarios */}
    <Tab.Screen
        name="Veterinarios"
        component={GestionVetScreen}
        options={{
        tabBarIcon: ({ color }) => (
            <Ionicons 
            name={color === colors.lightYellow ? "medkit" : "medkit-outline"} 
            color={color} 
            size={28} 
            />
        ),
        }}
    />

    {/* Posición 3: Gestión de Usuarios (Tutores) */}
    <Tab.Screen
        name="Usuarios"
        component={GestionUsrScreen}
        options={{
        tabBarIcon: ({ color }) => (
            <Ionicons 
            name={color === colors.lightYellow ? "people" : "people-outline"} 
            color={color} 
            size={28} 
            />
        ),
        }}
    />

    {/* Posición 4: Perfil del Administrador */}
    <Tab.Screen
        name="PerfilAdmin"
        component={PerfilAdminScreen}
        options={{
        tabBarIcon: ({ color }) => (
            <Ionicons 
            name={color === colors.lightYellow ? "person" : "person-outline"} 
            color={color} 
            size={28} 
            />
        ),
        }}
    />
    </Tab.Navigator>
);
}
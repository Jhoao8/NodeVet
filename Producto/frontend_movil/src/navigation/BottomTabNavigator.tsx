import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Importación de pantallas
import MascotasScreen from '../screens/Mascotas/MascotasScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '@/src/screens/Perfil/ProfileScreen'; //<-- 1. Importamos la nueva pantalla

import { colors } from '@/src/theme/colors';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const insets = useSafeAreaInsets(); 

  return (
    <Tab.Navigator
      initialRouteName="Home" 
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.lightYellow,
        tabBarInactiveTintColor: colors.lightGreen,
        tabBarStyle: {
          backgroundColor: colors.darkDGreen,
          borderTopWidth: 0,
          paddingTop: 10,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
        },
      }}
    >
      {/* Posición 1: Mascotas */}
      <Tab.Screen
        name="Mascotas"
        component={MascotasScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="paw" color={color} size={30} />
          ),
        }}
      />

      {/* Posición 2: Ordenes */}
      <Tab.Screen
        name="Ordenes"
        component={HomeScreen} // Placeholder
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="document-text-outline" color={color} size={28} />
          ),
        }}
      />

      {/* Posición 3: HOME (Centro) */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name={color === colors.lightYellow ? "home" : "home-outline"} color={color} size={28} />
          ),
        }}
      />

      {/* Posición 4: Agenda */}
      <Tab.Screen
        name="Agenda"
        component={HomeScreen} // Placeholder
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="calendar-plus" color={color} size={28} />
          ),
        }}
      />

      {/* Posición 5: Perfil */}
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen} // <-- 2. Asignamos la pantalla aquí
        options={{
          tabBarIcon: ({ color }) => (
            // Agregamos la lógica para que el ícono se rellene cuando está activo
            <Ionicons name={color === colors.lightYellow ? "person" : "person-outline"} color={color} size={28} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
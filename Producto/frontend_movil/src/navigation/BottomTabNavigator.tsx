import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // <-- 1. Importamos esto
import MascotasScreen from '../screens/Mascotas/MascotasScreen';
import HomeScreen from '../screens/HomeScreen';
import { colors } from '@/src/theme/colors';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  // 2. Obtenemos las medidas dinámicas del celular donde corre la app
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
          // 3. Altura base (ej. 60) + el espacio exacto que ocupa la barra del sistema
          height: 60 + insets.bottom,
          // 4. Agregamos el paddingBottom dinámico. Si no hay barra nativa grande, dejamos 10px de gracia
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
        component={HomeScreen}
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
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="calendar-plus" color={color} size={28} />
          ),
        }}
      />

      {/* Posición 5: Perfil */}
      <Tab.Screen
        name="Perfil"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" color={color} size={28} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
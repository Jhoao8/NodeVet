import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthStack from './AuthStack';
import BottomTabNavigator from './BottomTabNavigator';
import RegistroMascotaScreen from '@/src/screens/Tutor/Mascotas/RegistroMascota';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import DetalleMascotaScreen from '../screens/Tutor/Mascotas/DetalleMascotaScreen';
import EditarMascota from '../screens/Tutor/Mascotas/EditarMascota';
import HistorialMedicoScreen from '../screens/Tutor/Mascotas/Historial/HistorialMedico';

import VacunaScreen from '../screens/Tutor/Mascotas/Historial/VacunasScreen';
import ConsultasScreen from '../screens/Tutor/Mascotas/Historial/ConsultaScreen';
import ExamenScreen from '../screens/Tutor/Mascotas/Historial/ExamenScreen';
import CirugiaScreen from '../screens/Tutor/Mascotas/Historial/CirugiaScreen';

// ════════ IMPORTACIÓN DEL NUEVO TAB NAVIGATOR DEL ADMIN ════════
import AdminBottomTabNavigator from './AdminBottomTabNavigator'; 

const Stack = createStackNavigator();

const AppNavigator = () => {
    // ════════ EXTRAEMOS EL ROL DEL CONTEXTO ════════
    const { userToken, userRole, isLoading } = useAuth(); 

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.darkDGreen }}>
                <ActivityIndicator size="large" color={colors.lightYellow} />
            </View>
        );
    }

    // ════════ LÓGICA DE ENRUTAMIENTO (RBAC) ════════
    const getInitialRoute = () => {
        if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
            return 'AdminMain'; // <-- Ahora apunta al Tab Navigator
        }
        return 'Main'; // Por defecto, va al BottomTabNavigator de los tutores
    };

    return (
        <NavigationContainer key={userToken ? 'auth' : 'noauth'}>
            {userToken ? (
                // Asignamos la ruta inicial dinámicamente
                <Stack.Navigator initialRouteName={getInitialRoute()} screenOptions={{ headerShown: false }}>
                    
                    {/* ════════ Registramos el Tab Navigator del Administrador ════════ */}
                    <Stack.Screen name="AdminMain" component={AdminBottomTabNavigator} />
                    
                    {/* El BottomTabNavigator de siempre para clientes */}
                    <Stack.Screen name="Main" component={BottomTabNavigator} />
                    
                    <Stack.Screen 
                        name="RegistroMascota" 
                        component={RegistroMascotaScreen} 
                        options={{ 
                            headerShown: true, 
                            title: 'Nueva Mascota',
                            headerStyle: { backgroundColor: colors.darkDGreen },
                            headerTintColor: colors.lightYellow,
                            headerTitleStyle: { fontFamily: 'Fredoka-Bold' }
                        }} 
                    />
                    
                    <Stack.Screen 
                        name="DetalleMascota" 
                        component={DetalleMascotaScreen} 
                        options={{ 
                            headerShown: true, 
                            title: 'Detalle Mascota',
                            headerStyle: { backgroundColor: colors.darkDGreen },
                            headerTintColor: colors.lightYellow 
                        }} 
                    />
                    
                    <Stack.Screen 
                        name="EditarMascota"
                        component={EditarMascota}
                        options={{
                            headerShown: true,
                            title: 'Editar Mascota',
                            headerStyle: { backgroundColor: colors.darkDGreen },
                            headerTintColor: colors.lightYellow
                        }}
                    />
                    
                    <Stack.Screen name="HistorialMedico" component={HistorialMedicoScreen} />
                    <Stack.Screen name="Vacunas" component={VacunaScreen} />
                    <Stack.Screen name="Consultas" component={ConsultasScreen} />
                    <Stack.Screen name="Examenes" component={ExamenScreen} />
                    <Stack.Screen name="Cirugias" component={CirugiaScreen} />

                </Stack.Navigator>
                
            ) : (
                <AuthStack />
            )}
        </NavigationContainer>
    );
};

export default AppNavigator;
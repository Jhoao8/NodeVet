import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthStack from './AuthStack';
import BottomTabNavigator from './BottomTabNavigator';
import RegistroMascotaScreen from '@/src/screens/Mascotas/RegistroMascota';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import DetalleMascotaScreen from '../screens/Mascotas/DetalleMascotaScreen';
import EditarMascota from '../screens/Mascotas/EditarMascota';
import HistorialMedicoScreen from '../screens/Mascotas/Historial/HistorialMedico';

// ════════ IMPORTACIONES DE LAS NUEVAS PANTALLAS ════════
import VacunaScreen from '../screens/Mascotas/Historial/VacunasScreen';
import ConsultasScreen from '../screens/Mascotas/Historial/ConsultaScreen';
import ExamenScreen from '../screens/Mascotas/Historial/ExamenScreen';
import CirugiaScreen from '../screens/Mascotas/Historial/CirugiaScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
    const { userToken, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.darkDGreen }}>
                <ActivityIndicator size="large" color={colors.lightYellow} />
            </View>
        );
    }

    return (
        <NavigationContainer key={userToken ? 'auth' : 'noauth'}>
            {userToken ? (
                <Stack.Navigator screenOptions={{ headerShown: false }}>
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
                    
                    <Stack.Screen 
                        name="HistorialMedico"
                        component={HistorialMedicoScreen}
                        options={{ headerShown: false }}
                    />

                    {/* ════════ RUTAS PARA LOS HISTORIALES ESPECÍFICOS ════════ */}
                    <Stack.Screen 
                        name="Vacunas"
                        component={VacunaScreen}
                        options={{ headerShown: false }}
                    />
                    
                    <Stack.Screen 
                        name="Consultas"
                        component={ConsultasScreen}
                        options={{ headerShown: false }}
                    />
                    
                    <Stack.Screen 
                        name="Examenes"
                        component={ExamenScreen}
                        options={{ headerShown: false }}
                    />
                    
                    <Stack.Screen 
                        name="Cirugias"
                        component={CirugiaScreen}
                        options={{ headerShown: false }}
                    />

                </Stack.Navigator>
                
            ) : (
                <AuthStack />
            )}
        </NavigationContainer>
    );
};

export default AppNavigator;
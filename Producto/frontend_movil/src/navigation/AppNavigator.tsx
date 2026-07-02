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
import AdminBottomTabNavigator from './AdminBottomTabNavigator';

// ════ PANTALLAS DE ADMIN ════
import CrearVetScreen from '../screens/Admin/ConfigVet/CrearVetScreen';
import DetalleVetScreen from '../screens/Admin/ConfigVet/DetalleVetScreen';
import CrearJornadaScreen from '../screens/Admin/ConfigVet/CrearJornadaScreen'; 
import GenerarBloquesScreen from '../screens/Admin/ConfigVet/ModalBloquesScreen';
import VerJornadasScreen from '../screens/Admin/ConfigVet/VerJornadaScreen'; 

// ════ PANTALLAS DE VETERINARIO ════
import VetBottomTabNavigator from './VetBottomTabNavigator';
import DetalleCitaVetScreen from '../screens/Veterinario/DetalleCitaVetScreen';
import RegistrarConsultaScreen from '../screens/Veterinario/RegistrarConsultaScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
    const { userToken, userRole, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.darkDGreen }}>
                <ActivityIndicator size="large" color={colors.lightYellow} />
            </View>
        );
    }

    const getInitialRoute = () => {
        const normalizedRole = String(userRole || '').toUpperCase();

        if (normalizedRole === 'ADMIN' || normalizedRole === 'SUPER_ADMIN') return 'AdminMain';
        if (normalizedRole === 'VET' || normalizedRole === 'ROLE_VET' || normalizedRole === 'VETERINARIO') return 'VetMain';
        return 'Main';
    };

    return (
        <NavigationContainer key={userToken ? 'auth' : 'noauth'}>
            {userToken ? (
                <Stack.Navigator initialRouteName={getInitialRoute()} screenOptions={{ headerShown: false }}>

                    {/* ════ RUTAS PRINCIPALES (TABS) ════ */}
                    <Stack.Screen name="AdminMain" component={AdminBottomTabNavigator} />
                    <Stack.Screen name="VetMain" component={VetBottomTabNavigator} />
                    <Stack.Screen name="Main" component={BottomTabNavigator} />

                    {/* ════ PANTALLAS DE FLUJO ADMIN ════ */}
                    <Stack.Screen name="CrearVet" component={CrearVetScreen} />
                    <Stack.Screen name="DetalleVet" component={DetalleVetScreen} />
                    <Stack.Screen name="CrearJornada" component={CrearJornadaScreen} />
                    <Stack.Screen name="ModalBloque" component={GenerarBloquesScreen} />
                    <Stack.Screen name="VerJornadas" component={VerJornadasScreen} />

                    {/* ════ PANTALLAS DE FLUJO VETERINARIO ════ */}
                    <Stack.Screen name="DetalleCitaVet" component={DetalleCitaVetScreen} />
                    <Stack.Screen name="RegistrarConsulta" component={RegistrarConsultaScreen} />

                    {/* ════ PANTALLAS DE FLUJO TUTOR ════ */}
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
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack'; // ¡Ahora sí lo encontrará!
import AuthStack from './AuthStack';
import BottomTabNavigator from './BottomTabNavigator';
import RegistroMascotaScreen from '@/src/screens/Mascotas/RegistroMascota';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import DetalleMascotaScreen from '../screens/Mascotas/DetalleMascotaScreen';

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
        <NavigationContainer>
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
                            title: 'Ficha Clínica',
                            headerStyle: { backgroundColor: colors.darkDGreen },
                            headerTintColor: colors.lightYellow 
                        }} 
                    />
                </Stack.Navigator>
                
            ) : (
                <AuthStack />
            )}
        </NavigationContainer>
    );
};

export default AppNavigator;
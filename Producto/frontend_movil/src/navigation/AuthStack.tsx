import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from '../screens/Welcome/WelcomeScreen';
import RegisterScreen from '../screens/Welcome/RegisterScreen';
import LoginScreen from '../screens/Welcome/LoginScreen';
import { ForgotPassword } from '../screens/ForgotPassword/ForgotPassword';
import { ResetPassword } from '../screens/ForgotPassword/ResetPassword';
import BottomTabNavigator from './BottomTabNavigator';
import RegistroMascotaScreen from '../screens/Mascotas/RegistroMascota';
import EditarMascota from '../screens/Mascotas/EditarMascota';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
      <Stack.Screen name="Main" component={BottomTabNavigator} />
      <Stack.Screen name="RegistroMascota" component={RegistroMascotaScreen} />
      <Stack.Screen name="EditarMascota" component={EditarMascota} />
    </Stack.Navigator>
  );
};

export default AuthStack;
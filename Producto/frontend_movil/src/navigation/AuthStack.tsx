import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from '../screens/WelcomeScreen';
import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';
import { ForgotPassword } from '../screens/ForgotPassword/ForgotPassword';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
    return (
    <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name='ForgotPassword' component={ForgotPassword} />
    </Stack.Navigator>
    );
};

export default AuthStack;
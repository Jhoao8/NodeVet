import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from '../screens/WelcomeScreen';
import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';
import { ForgotPassword } from '../screens/ForgotPassword/ForgotPassword';
import { ResetPassword } from '../screens/ForgotPassword/ResetPassword';
import HomeScreen from '../screens/HomeScreen';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
    return (
    <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name='ForgotPassword' component={ForgotPassword} />
        <Stack.Screen name='ResetPassword' component={ResetPassword} />
        <Stack.Screen name='HomeScreen' component={HomeScreen}/>
    </Stack.Navigator>
    );
};

export default AuthStack;
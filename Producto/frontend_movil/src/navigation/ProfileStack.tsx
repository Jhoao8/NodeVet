import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '@/src/screens/Tutor/Perfil/ProfileScreen';
import EditProfileScreen from '@/src/screens/Tutor/Perfil/EditProfileScreen';

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{
          animationEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}

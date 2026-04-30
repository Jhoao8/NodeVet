// App.tsx
import { useCallback } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import AppNavigator from './src/navigation/AppNavigator';

// Mantiene la pantalla de carga visible mientras cargamos fuentes
SplashScreen.preventAutoHideAsync();

export default function App() {
    const [fontsLoaded, fontError] = useFonts({
    'Fredoka-Regular': require('./assets/fonts/Fredoka-Regular.ttf'),
    'Fredoka-Medium': require('./assets/fonts/Fredoka-Medium.ttf'),
    'Fredoka-SemiBold': require('./assets/fonts/Fredoka-SemiBold.ttf'),
    'Fredoka-Bold': require('./assets/fonts/Fredoka-Bold.ttf'),
    });

    const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
        await SplashScreen.hideAsync();
    }
    }, [fontsLoaded, fontError]);

    if (!fontsLoaded && !fontError) {
    return null;
    }

    return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <AppNavigator />
    </View>
    );   
}



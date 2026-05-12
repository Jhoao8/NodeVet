import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/src/theme/colors';
import { globalStyles } from '@/src/style/GlobalStyle';
import api from '@/src/api/axiosInstance';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import DashboardHeader from '@/src/components/DashboardHeader';
import { dashboardStyles } from '@/src/style/DashboardStyle';
import { PetCard } from '@/src/components/PetCard';

export default function MascotasScreen() {
    // Definimos la navegación para que el botón funcione
    const navigation = useNavigation<any>();

    const [mascotas, setMascotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMascotas = async () => {
        try {
            const response = await api.get('/v1/mascotas/listar');
            setMascotas(response.data);
        } catch (error) {
            console.error("Error al obtener mascotas:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // useFocusEffect hace que la lista se refresque cada vez que entras a la pantalla
    // útil para ver la mascota nueva apenas regresas del formulario
    useFocusEffect(
        useCallback(() => {
            fetchMascotas();
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchMascotas();
    }, []);

    return (
        <View style={[globalStyles.container, dashboardStyles.lightBackground]}>
            <DashboardHeader />
            <View style={dashboardStyles.greetingContainer}>
                <Text style={[dashboardStyles.greetingText, dashboardStyles.darkText]}>Mis Mascotas</Text>
                <View style={[dashboardStyles.greetingDivider, dashboardStyles.darkDivider]} />
            </View>
            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color={colors.darkGreen} style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        data={mascotas}
                        keyExtractor={(item: any) => item.idMascota.toString()}
                        numColumns={2}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl 
                                refreshing={refreshing} 
                                onRefresh={onRefresh} 
                                tintColor={colors.darkGreen} 
                            />
                        }
                        renderItem={({ item }: { item: any }) => (
                            <PetCard 
                                id={item.idMascota}
                                nombreMasc={item.nomMascota} 
                                fotoUrl={item.imagenMascota}
                                sexo={item.sexo}
                                especie={item.especie} 
                                onPress={() => navigation.navigate('DetalleMascota', { mascota: item })}
                            />
                        )}
                        // Espaciado interno para que no quede pegado a los bordes
                        contentContainerStyle={{ paddingBottom: 20 }}
                        columnWrapperStyle={{ justifyContent: 'space-between' }}
                    />
                )}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={globalStyles.primaryButton}
                        onPress={() => navigation.navigate('RegistroMascota')}
                    >
                        <Text style={globalStyles.primaryButtonText}>Nueva Mascota</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
        
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.lightYellow,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        color: colors.lightYellow,
        fontWeight: 'bold',
        marginTop: 10,
        marginLeft: 10
    },
    itemContainer: {
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.darkGreen,
        // Sombra leve para que se vea mejor
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    petName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.darkDGreen,
    },
    petInfo: {
        fontSize: 14,
        color: colors.darkGreen,
    },
    emptyText: {
        textAlign: 'center', 
        marginTop: 20, 
        color: colors.darkGreen,
        fontSize: 16
    },
    buttonContainer: {
        marginBottom: 20,
        paddingTop: 10
    }
});
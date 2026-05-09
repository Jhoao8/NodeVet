import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/src/theme/colors';
import { globalStyles } from '@/src/style/GlobalStyle';
import api from '@/src/api/axiosInstance';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

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
        <SafeAreaView style={styles.safeArea}>
            <View style={globalStyles.headerSection}>
                <Text style={styles.title}>Mis Mascotas</Text>
            </View>
            <View style={styles.content}>
                <ScrollView 
                    refreshControl={
                        <RefreshControl 
                            refreshing={refreshing} 
                            onRefresh={onRefresh} 
                            tintColor={colors.darkGreen} 
                        />
                    }
                >
                    {loading ? (
                        <ActivityIndicator size="large" color={colors.darkGreen} style={{ marginTop: 20 }} />
                    ) : (
                        <View>
                            {mascotas.map((mascota: any) => (
                                <TouchableOpacity 
                                    key={mascota.idMascota} 
                                    style={styles.itemContainer}
                                    onPress={() => navigation.navigate('DetalleMascota', { mascota })}
                                >
                                    <Text style={styles.petName}>{mascota.nomMascota}</Text>
                                    <Text style={styles.petInfo}>{mascota.especie}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </ScrollView>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={globalStyles.primaryButton}
                        onPress={() => navigation.navigate('RegistroMascota')}
                    >
                        <Text style={globalStyles.primaryButtonText}>Nueva Mascota</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
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
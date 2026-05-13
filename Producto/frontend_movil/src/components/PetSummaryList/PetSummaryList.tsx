import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import PetSummaryCard from '../PetSummaryCard/PetSummaryCard'; 
import { styles } from './PetSummaryList.styles';
import { dashboardStyles } from '../../style/DashboardStyle';
import { colors } from '../../theme/colors';
import api from '../../api/axiosInstance';

const PetSummaryList = () => {
    const [mascotas, setMascotas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const loadMascotas = async () => {
                setLoading(true);
                try {
                    const response = await api.get('/v1/mascotas/listar');
                    setMascotas(response.data);
                } catch (error) {
                    console.error("Error al cargar mascotas:", error);
                } finally {
                    setLoading(false);
                }
            };
            
            loadMascotas();
        }, [])
    );

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="small" color={colors.darkGreen} />
            </View>
        );
    }

    if (mascotas.length === 0) {
        return (
            <View style={dashboardStyles.emptyCardContent}>
                <Ionicons name="paw" size={48} color={colors.lightGreen} />
                <Text style={dashboardStyles.darkSubText}>No tienes mascotas registradas aún</Text>
            </View>
        );
    }

    return (
        <ScrollView 
            style={styles.container}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
        >
            {mascotas.map((item, index) => (
                <PetSummaryCard
                    key={item.idMascota || index}
                    id={item.idMascota}
                    nombreMasc={item.nomMascota}
                    
                    // ¡AQUÍ ESTÁ LA MAGIA! Igual que en tu MascotasScreen
                    fotoUrl={item.imagenMascota} 
                    
                    sexo={item.sexo}
                    ultChequeo={item.ultChequeo}
                    isLast={index === mascotas.length - 1}
                    onPress={() => console.log(`Clic en ${item.nomMascota}`)} 
                />
            ))}
        </ScrollView>
    );
};

export default PetSummaryList;
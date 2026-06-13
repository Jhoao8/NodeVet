import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { globalStyles } from '@/src/style/GlobalStyle';
import { dashboardStyles } from '@/src/style/DashboardStyle';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance'; // 👇 Importamos la API para traer el nombre

import DashboardHeader from '../components/DashboardHeader';
import PetSummaryList from '../components/PetSummaryList/PetSummaryList';

const HomeScreen = () => {
    const navigation = useNavigation<any>();
    const { userToken } = useAuth(); // Usamos el token para verificar la sesión
    const [primerNombre, setPrimerNombre] = useState('Usuario');
    const [loadingName, setLoadingName] = useState(true);

    //Función para extraer solo el nombre del usuario
    const obtenerNombreUsuario = async () => {
        if (!userToken) {
            setLoadingName(false);
            return;
        }
        try {
            const response = await api.get('/v1/usuarios/perfil');
            const nombreCompleto = response.data.nombreCompleto;
            
            if (nombreCompleto) {
                // Cortamos por el espacio y tomamos la primera palabra
                setPrimerNombre(nombreCompleto.split(' ')[0]);
            }
        } catch (error) {
            console.error("Error al obtener el nombre en el Home:", error);
            setPrimerNombre('Usuario'); // Fallback en caso de error
        } finally {
            setLoadingName(false);
        }
    };

    // Se ejecuta cada vez que el usuario vuelve a ver la pantalla de Home
    useFocusEffect(
        useCallback(() => {
            obtenerNombreUsuario();
        }, [userToken])
    );

    return (
        <View style={[globalStyles.container, dashboardStyles.lightBackground]}>
            
            <DashboardHeader />

            <ScrollView 
                contentContainerStyle={globalStyles.scrollContainer} 
                showsVerticalScrollIndicator={false}
            >
                {/* Saludo */}
                <View style={dashboardStyles.greetingContainer}>
                    <Text style={[dashboardStyles.greetingText, dashboardStyles.darkText]}>
                        {loadingName ? (
                            <ActivityIndicator size="small" color={colors.darkGreen} />
                        ) : (
                            `Bienvenid@, ${primerNombre}`
                        )}
                    </Text>
                    <View style={[dashboardStyles.greetingDivider, dashboardStyles.darkDivider]} />
                </View>

                {/* 1. SECCIÓN: Próximas citas */}
                <View style={globalStyles.sectionHeaderRow}>
                    <View style={globalStyles.sectionTitleLeft}>
                        <Ionicons name="calendar" size={24} color={colors.darkGreen} />
                        <Text style={[globalStyles.sectionTitle, dashboardStyles.darkText]}>Próximas citas:</Text>
                    </View>
                </View>
                
                <View style={dashboardStyles.flatCard}>
                    <Text style={[globalStyles.cardEmptyText, dashboardStyles.darkSubText]}>Sin citas registradas</Text>
                </View>
                
                <View style={globalStyles.actionButtonsRow}>
                    <TouchableOpacity style={dashboardStyles.flatFilledButtonSm}>
                        <Text style={dashboardStyles.filledButtonTextSm}>Agendar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={dashboardStyles.flatFilledButtonSm}>
                        <Text style={dashboardStyles.filledButtonTextSm}>Ver Citas</Text>
                    </TouchableOpacity>
                </View>

                {/* 2. SECCIÓN: Mis mascotas */}
                <View style={globalStyles.sectionHeaderRow}>
                    <View style={globalStyles.sectionTitleLeft}>
                        <Ionicons name="paw" size={24} color={colors.darkGreen} />
                        <Text style={[globalStyles.sectionTitle, dashboardStyles.darkText]}>Mis mascotas</Text>
                    </View>
                    <Text style={[globalStyles.sectionSubtitle, dashboardStyles.darkSubText]}>Últ. chequeo</Text>
                </View>

                <View style={[dashboardStyles.flatCard, { padding: 0 }]}>
                    <PetSummaryList />
                </View>

                <View style={globalStyles.actionButtonsRow}>
                    <TouchableOpacity 
                        style={dashboardStyles.flatFilledButtonSm}
                        onPress={() => navigation.navigate('Mascotas')}
                    >
                        <Text style={dashboardStyles.filledButtonTextSm}>Ver todos</Text>
                    </TouchableOpacity>
                </View>

                {/* 3. SECCIÓN: Órdenes Médicas */}
                <View style={globalStyles.sectionHeaderRow}>
                    <View style={globalStyles.sectionTitleLeft}>
                        <Ionicons name="document-text" size={24} color={colors.darkGreen} />
                        <Text style={[globalStyles.sectionTitle, dashboardStyles.darkText]}>Ordenes Médicas</Text>
                    </View>
                </View>

                <View style={dashboardStyles.flatCard}>
                    <View style={dashboardStyles.emptyCardContent}>
                        <Ionicons name="medical" size={48} color={colors.lightGreen} />
                        <Text style={[globalStyles.cardEmptyText, dashboardStyles.darkSubText]}>Sin órdenes médicas recientes</Text>
                    </View>
                </View>

                <View style={globalStyles.actionButtonsRow}>
                    <TouchableOpacity style={dashboardStyles.flatFilledButtonSm}>
                        <Text style={dashboardStyles.filledButtonTextSm}>Ver todo</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
};

export default HomeScreen;
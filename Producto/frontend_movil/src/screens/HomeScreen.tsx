import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { globalStyles } from '@/src/style/GlobalStyle';
import { dashboardStyles } from '@/src/style/DashboardStyle';
import { colors } from '../theme/colors';

import DashboardHeader from '../components/DashboardHeader';
import PetSummaryList from '../components/PetSummaryList/PetSummaryList';

const HomeScreen = () => {
    const navigation = useNavigation<any>();

    return (
        <View style={[globalStyles.container, dashboardStyles.lightBackground]}>
            
            <DashboardHeader />

            <ScrollView 
                contentContainerStyle={globalStyles.scrollContainer} 
                showsVerticalScrollIndicator={false}
            >
                {/* Saludo */}
                <View style={dashboardStyles.greetingContainer}>
                    <Text style={[dashboardStyles.greetingText, dashboardStyles.darkText]}>Bienvenido</Text>
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

                {/* El componente PetSummaryList hace todo el trabajo aquí adentro */}
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
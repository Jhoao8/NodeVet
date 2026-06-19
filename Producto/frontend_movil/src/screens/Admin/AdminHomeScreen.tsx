import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Estilos
import { globalStyles } from '@/src/style/GlobalStyle';
import { dashboardStyles } from '@/src/style/DashboardStyle';
import { adminStyles } from '@/src/style/AdminStyle';
import { colors } from '@/src/theme/colors';

// Componentes
import DashboardHeader from '@/src/components/DashboardHeader';

// ════ DATOS SIMULADOS (MOCKS) ════
const mockMetrics = {
    citasHoy: 12,
    vetActivos: 5,
    usrTotales: 148,
    pagosActivos: true
};

const mockVets = [
    { id: 1, nombre: 'Dr. Carlos Pérez', especialidad: 'Veterinario General', activo: true },
    { id: 2, nombre: 'Dra. Ana Silva', especialidad: 'Cardiología', activo: true },
    { id: 3, nombre: 'Dr. Luis Gómez', especialidad: 'Cirugía', activo: false },
];

const mockUsers = [
    { id: 1, nombre: 'Catalina Tutor', fecha: 'Hoy, 10:30 hrs' },
    { id: 2, nombre: 'Roberto Castro', fecha: 'Ayer, 18:15 hrs' },
    { id: 3, nombre: 'María Fernanda', fecha: 'Ayer, 09:20 hrs' },
];

const mockAlerts = [
    { id: 1, mensaje: 'Cambio crítico en expediente de "Max"', tiempo: 'Hace 2 hrs', icono: 'document-text-outline' },
    { id: 2, mensaje: 'Intento de acceso fallido x5 - Usuario Bloqueado', tiempo: 'Hace 5 hrs', icono: 'warning-outline' },
];

export default function AdminHomeScreen() {
    const navigation = useNavigation<any>();
    const [primerNombre, setPrimerNombre] = useState('Administrador');

    return (
        <View style={[globalStyles.container, dashboardStyles.lightBackground]}>
            <DashboardHeader />

            <ScrollView 
                contentContainerStyle={globalStyles.scrollContainer} 
                showsVerticalScrollIndicator={false}
            >
                {/* ════ SALUDO ════ */}
                <View style={dashboardStyles.greetingContainer}>
                    <Text style={[dashboardStyles.greetingText, dashboardStyles.darkText]}>
                        Panel de Control
                    </Text>
                    <View style={[dashboardStyles.greetingDivider, dashboardStyles.darkDivider, { width: 40 }]} />
                </View>

                {/* ════ SECCIÓN 1: RESUMEN DEL DÍA (GRID) ════ */}
                <View style={adminStyles.metricsGrid}>
                    <View style={adminStyles.metricCard}>
                        <View style={adminStyles.metricHeader}>
                            <Ionicons name="calendar" size={20} color={colors.darkGreen} />
                        </View>
                        <Text style={adminStyles.metricValue}>{mockMetrics.citasHoy}</Text>
                        <Text style={adminStyles.metricLabel}>Citas Hoy</Text>
                    </View>

                    <View style={adminStyles.metricCard}>
                        <View style={adminStyles.metricHeader}>
                            <FontAwesome5 name="user-md" size={18} color={colors.darkGreen} />
                        </View>
                        <Text style={adminStyles.metricValue}>{mockMetrics.vetActivos}</Text>
                        <Text style={adminStyles.metricLabel}>Vets Activos</Text>
                    </View>

                    <View style={adminStyles.metricCard}>
                        <View style={adminStyles.metricHeader}>
                            <Ionicons name="people" size={20} color={colors.darkGreen} />
                        </View>
                        <Text style={adminStyles.metricValue}>{mockMetrics.usrTotales}</Text>
                        <Text style={adminStyles.metricLabel}>Usuarios Totales</Text>
                    </View>

                    <View style={adminStyles.metricCard}>
                        <View style={adminStyles.metricHeader}>
                            <Ionicons name="card" size={20} color={colors.darkGreen} />
                            {/* Mini Badge interno para pagos */}
                            <View style={[adminStyles.badgeContainer, mockMetrics.pagosActivos ? adminStyles.badgeActive : adminStyles.badgeInactive, { paddingHorizontal: 6, paddingVertical: 2 }]}>
                                <Text style={mockMetrics.pagosActivos ? adminStyles.badgeTextActive : adminStyles.badgeTextInactive}>
                                    {mockMetrics.pagosActivos ? 'ON' : 'OFF'}
                                </Text>
                            </View>
                        </View>
                        <Text style={adminStyles.metricValue}>Flow</Text>
                        <Text style={adminStyles.metricLabel}>Módulo Pagos</Text>
                    </View>
                </View>

                {/* ════ SECCIÓN 2: VETERINARIOS ════ */}
                <View style={globalStyles.sectionHeaderRow}>
                    <View style={globalStyles.sectionTitleLeft}>
                        <FontAwesome5 name="user-md" size={18} color={colors.darkGreen} />
                        <Text style={[globalStyles.sectionTitle, dashboardStyles.darkText]}>Equipo Médico</Text>
                    </View>
                </View>

                <View style={adminStyles.adminListCard}>
                    {mockVets.map((vet, index) => (
                        <View key={vet.id} style={[adminStyles.adminListItem, index === mockVets.length - 1 && adminStyles.adminListItemNoBorder]}>
                            <View style={adminStyles.adminItemAvatar}>
                                <Text style={{ color: colors.darkDGreen, fontWeight: 'bold' }}>{vet.nombre.charAt(0)}</Text>
                            </View>
                            <View style={adminStyles.adminItemInfo}>
                                <Text style={adminStyles.adminItemTitle}>{vet.nombre}</Text>
                                <Text style={adminStyles.adminItemSub}>{vet.especialidad}</Text>
                            </View>
                            <View style={[adminStyles.badgeContainer, vet.activo ? adminStyles.badgeActive : adminStyles.badgeInactive]}>
                                <Text style={vet.activo ? adminStyles.badgeTextActive : adminStyles.badgeTextInactive}>
                                    {vet.activo ? 'Activo' : 'Inactivo'}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={[globalStyles.actionButtonsRow, { marginBottom: 24 }]}>
                    <TouchableOpacity style={[dashboardStyles.flatFilledButtonSm, { backgroundColor: colors.darkGreen, flex: 2, marginRight: 8 }]}>
                        <Text style={[dashboardStyles.filledButtonTextSm, { color: colors.lightYellow }]}>+ Agregar Veterinario</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[dashboardStyles.flatFilledButtonSm, { flex: 1 }]}>
                        <Text style={dashboardStyles.filledButtonTextSm}>Ver todos</Text>
                    </TouchableOpacity>
                </View>

                {/* ════ SECCIÓN 3: USUARIOS RECIENTES ════ */}
                <View style={globalStyles.sectionHeaderRow}>
                    <View style={globalStyles.sectionTitleLeft}>
                        <Ionicons name="people" size={20} color={colors.darkGreen} />
                        <Text style={[globalStyles.sectionTitle, dashboardStyles.darkText]}>Últimos Tutores</Text>
                    </View>
                </View>

                <View style={adminStyles.adminListCard}>
                    {mockUsers.map((usr, index) => (
                        <View key={usr.id} style={[adminStyles.adminListItem, index === mockUsers.length - 1 && adminStyles.adminListItemNoBorder]}>
                            <View style={[adminStyles.adminItemAvatar, { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.lightGreen }]}>
                                <Ionicons name="person" size={16} color={colors.darkGreen} />
                            </View>
                            <View style={adminStyles.adminItemInfo}>
                                <Text style={adminStyles.adminItemTitle}>{usr.nombre}</Text>
                                <Text style={adminStyles.adminItemSub}>Registro: {usr.fecha}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={globalStyles.actionButtonsRow}>
                    <TouchableOpacity style={dashboardStyles.flatFilledButtonSm}>
                        <Text style={dashboardStyles.filledButtonTextSm}>Ver todos los usuarios</Text>
                    </TouchableOpacity>
                </View>

                {/* ════ SECCIÓN 4: ALERTAS DEL SISTEMA ════ */}
                <View style={[globalStyles.sectionHeaderRow, { marginTop: 16 }]}>
                    <View style={globalStyles.sectionTitleLeft}>
                        <Ionicons name="shield-checkmark" size={20} color={colors.darkGreen} />
                        <Text style={[globalStyles.sectionTitle, dashboardStyles.darkText]}>Auditoría y Alertas</Text>
                    </View>
                </View>

                <View style={{ marginBottom: 30 }}>
                    {mockAlerts.map(alerta => (
                        <View key={alerta.id} style={adminStyles.alertItem}>
                            <Ionicons name={alerta.icono as any} size={20} color="#E67E22" />
                            <View style={adminStyles.alertTextContainer}>
                                <Text style={adminStyles.alertMessage}>{alerta.mensaje}</Text>
                                <Text style={adminStyles.alertTime}>{alerta.tiempo}</Text>
                            </View>
                        </View>
                    ))}
                </View>

            </ScrollView>
        </View>
    );
}
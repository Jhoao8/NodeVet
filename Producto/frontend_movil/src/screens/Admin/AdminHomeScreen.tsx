import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// Estilos
import { globalStyles } from '@/src/style/GlobalStyle';
import { dashboardStyles } from '@/src/style/DashboardStyle';
import { adminStyles } from '@/src/style/AdminStyle';
import { colors } from '@/src/theme/colors';
import api from '@/src/api/axiosInstance';

// Componentes
import DashboardHeader from '@/src/components/DashboardHeader';

interface UsuarioDTO {
    idUsuario: number;
    nombreCompleto: string;
    correoUsr: string;
    estadoUsr: number;
    rol?: string;
    nivelAcceso?: string;
    nivel_acceso?: string;
}

interface VeterinarioDTO {
    idVeterinario: number;
    idUsuario: number;
    nombreCompleto: string;
    especialidades?: Array<{ id: number; nombre: string }>;
    estadoUsr: number;
}

interface AdminRefDTO {
    idUsuario: number;
    nivelAcceso?: string;
    nivel_acceso?: string;
}

export default function AdminHomeScreen() {
    const navigation = useNavigation<any>();
    const [loading, setLoading] = useState(true);
    const [savingPagoConfig, setSavingPagoConfig] = useState(false);
    const [pagoObligatorio, setPagoObligatorio] = useState<boolean>(true);
    const [usuarios, setUsuarios] = useState<UsuarioDTO[]>([]);
    const [veterinarios, setVeterinarios] = useState<VeterinarioDTO[]>([]);
    const [admins, setAdmins] = useState<AdminRefDTO[]>([]);

    const cargarResumen = async () => {
        try {
            setLoading(true);
            const [usuariosResponse, veterinariosResponse, adminsResponse] = await Promise.all([
                api.get('/v1/usuarios?incluirInactivos=true'),
                api.get('/v1/veterinarios'),
                api.get('/v1/admins').catch(() => ({ data: [] })),
            ]);

            try {
                const pagoConfigResponse = await api.get('/v1/pagos/config/obligatorio');
                setPagoObligatorio(Boolean(pagoConfigResponse.data?.pagoObligatorio));
            } catch {
                // Si falla esta consulta, no bloqueamos el dashboard.
            }

            setUsuarios(Array.isArray(usuariosResponse.data) ? usuariosResponse.data : []);
            setVeterinarios(Array.isArray(veterinariosResponse.data) ? veterinariosResponse.data : []);
            setAdmins(Array.isArray(adminsResponse.data) ? adminsResponse.data : []);
        } catch (error) {
            console.error('Error cargando resumen admin:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            cargarResumen();
        }, [])
    );

    const togglePagoObligatorio = async () => {
        try {
            setSavingPagoConfig(true);
            const nuevoValor = !pagoObligatorio;
            const response = await api.put('/v1/pagos/config/obligatorio', { pagoObligatorio: nuevoValor });
            setPagoObligatorio(Boolean(response.data?.pagoObligatorio));
        } catch (error) {
            console.error('Error actualizando configuración de pago:', error);
        } finally {
            setSavingPagoConfig(false);
        }
    };

    const metricas = useMemo(() => {
        const vetIds = new Set<number>(
            veterinarios
                .map(v => Number(v.idUsuario))
                .filter(id => Number.isFinite(id))
        );

        const adminIds = new Set<number>(
            admins
                .map(a => Number(a.idUsuario))
                .filter(id => Number.isFinite(id))
        );

        const superAdminIds = new Set<number>(
            admins
                .filter(a => {
                    const nivel = String(a.nivelAcceso || a.nivel_acceso || '').toUpperCase();
                    return nivel === 'SUPER_ADMIN' || nivel === 'SUPERADMIN';
                })
                .map(a => Number(a.idUsuario))
                .filter(id => Number.isFinite(id))
        );

        const tutores = usuarios.filter(u => {
            const id = Number(u.idUsuario);
            const rol = String(u.rol || '').toUpperCase();
            const nivel = String(u.nivelAcceso || u.nivel_acceso || '').toUpperCase();
            const esAdmin = rol === 'ADMIN' || rol === 'SUPER_ADMIN' || rol === 'SUPERADMIN';
            const esVet = rol === 'VET' || rol === 'VETERINARIO';
            const esSuperAdmin = nivel === 'SUPER_ADMIN' || nivel === 'SUPERADMIN';

            return !vetIds.has(id) && !adminIds.has(id) && !superAdminIds.has(id) && !esAdmin && !esVet && !esSuperAdmin;
        });

        const tutoresActivos = tutores.filter(t => t.estadoUsr === 1).length;
        const vetActivos = veterinarios.filter(v => v.estadoUsr === 1).length;
        const cuentasInactivas = usuarios.filter(u => u.estadoUsr === 0).length;

        return {
            usuariosTotales: usuarios.length,
            tutoresActivos,
            vetActivos,
            cuentasInactivas,
            tutoresPreview: [...tutores].sort((a, b) => b.idUsuario - a.idUsuario).slice(0, 3),
            vetsPreview: [...veterinarios].slice(0, 3),
        };
    }, [usuarios, veterinarios, admins]);

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

                <View style={globalStyles.sectionHeaderRow}>
                    <View style={globalStyles.sectionTitleLeft}>
                        <Ionicons name="card-outline" size={20} color={colors.darkGreen} />
                        <Text style={[globalStyles.sectionTitle, dashboardStyles.darkText]}>Pago obligatorio</Text>
                    </View>
                </View>

                <View style={[adminStyles.alertItem, { borderLeftColor: pagoObligatorio ? colors.darkGreen : '#E67E22', marginBottom: 18 }]}>
                    <Ionicons name="card-outline" size={20} color={pagoObligatorio ? colors.darkGreen : '#E67E22'} />
                    <View style={adminStyles.alertTextContainer}>
                        <Text style={adminStyles.alertMessage}>
                            Pago obligatorio: {pagoObligatorio ? 'ACTIVADO' : 'DESACTIVADO'}
                        </Text>
                        <Text style={adminStyles.alertTime}>
                            {savingPagoConfig ? 'Guardando configuración...' : 'Control administrativo'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[dashboardStyles.flatFilledButtonSm, { opacity: savingPagoConfig ? 0.7 : 1 }]}
                        onPress={togglePagoObligatorio}
                        disabled={savingPagoConfig}
                    >
                        {savingPagoConfig ? (
                            <ActivityIndicator size="small" color={colors.darkDGreen} />
                        ) : (
                            <Text style={dashboardStyles.filledButtonTextSm}>
                                {pagoObligatorio ? 'Desactivar' : 'Activar'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* ════ SECCIÓN 1: RESUMEN DEL DÍA (GRID) ════ */}
                <View style={adminStyles.metricsGrid}>
                    <View style={adminStyles.metricCard}>
                        <View style={adminStyles.metricHeader}>
                            <Ionicons name="people" size={20} color={colors.darkGreen} />
                        </View>
                        <Text style={adminStyles.metricValue}>{loading ? '-' : metricas.usuariosTotales}</Text>
                        <Text style={adminStyles.metricLabel}>Usuarios Totales</Text>
                    </View>

                    <View style={adminStyles.metricCard}>
                        <View style={adminStyles.metricHeader}>
                            <FontAwesome5 name="user-md" size={18} color={colors.darkGreen} />
                        </View>
                        <Text style={adminStyles.metricValue}>{loading ? '-' : metricas.vetActivos}</Text>
                        <Text style={adminStyles.metricLabel}>Vets Activos</Text>
                    </View>

                    <View style={adminStyles.metricCard}>
                        <View style={adminStyles.metricHeader}>
                            <Ionicons name="people" size={20} color={colors.darkGreen} />
                        </View>
                        <Text style={adminStyles.metricValue}>{loading ? '-' : metricas.tutoresActivos}</Text>
                        <Text style={adminStyles.metricLabel}>Tutores Activos</Text>
                    </View>

                    <View style={adminStyles.metricCard}>
                        <View style={adminStyles.metricHeader}>
                            <Ionicons name="warning-outline" size={20} color={colors.darkGreen} />
                            <View style={[adminStyles.badgeContainer, metricas.cuentasInactivas > 0 ? adminStyles.badgeInactive : adminStyles.badgeActive, { paddingHorizontal: 6, paddingVertical: 2 }]}>
                                <Text style={metricas.cuentasInactivas > 0 ? adminStyles.badgeTextInactive : adminStyles.badgeTextActive}>
                                    {metricas.cuentasInactivas > 0 ? 'ALERTA' : 'OK'}
                                </Text>
                            </View>
                        </View>
                        <Text style={adminStyles.metricValue}>{loading ? '-' : metricas.cuentasInactivas}</Text>
                        <Text style={adminStyles.metricLabel}>Cuentas Inactivas</Text>
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
                    {loading ? (
                        <View style={{ paddingVertical: 20 }}>
                            <ActivityIndicator size="small" color={colors.darkGreen} />
                        </View>
                    ) : metricas.vetsPreview.length === 0 ? (
                        <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                            <Text style={adminStyles.adminItemSub}>Sin veterinarios registrados</Text>
                        </View>
                    ) : metricas.vetsPreview.map((vet, index) => (
                        <View key={vet.idUsuario} style={[adminStyles.adminListItem, index === metricas.vetsPreview.length - 1 && adminStyles.adminListItemNoBorder]}>
                            <View style={adminStyles.adminItemAvatar}>
                                <Text style={{ color: colors.darkDGreen, fontWeight: 'bold' }}>{vet.nombreCompleto?.charAt(0) || '?'}</Text>
                            </View>
                            <View style={adminStyles.adminItemInfo}>
                                <Text style={adminStyles.adminItemTitle}>{vet.nombreCompleto}</Text>
                                <Text style={adminStyles.adminItemSub}>
                                    {vet.especialidades && vet.especialidades.length > 0
                                        ? vet.especialidades.map(e => e.nombre).join(', ')
                                        : 'Sin especialidad'}
                                </Text>
                            </View>
                            <View style={[adminStyles.badgeContainer, vet.estadoUsr === 1 ? adminStyles.badgeActive : adminStyles.badgeInactive]}>
                                <Text style={vet.estadoUsr === 1 ? adminStyles.badgeTextActive : adminStyles.badgeTextInactive}>
                                    {vet.estadoUsr === 1 ? 'Activo' : 'Inactivo'}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={[globalStyles.actionButtonsRow, { marginBottom: 24 }]}>
                    <TouchableOpacity
                        style={[dashboardStyles.flatFilledButtonSm, { backgroundColor: colors.darkGreen, flex: 2, marginRight: 8 }]}
                        onPress={() => navigation.getParent()?.navigate('CrearVet')}
                    >
                        <Text style={[dashboardStyles.filledButtonTextSm, { color: colors.lightYellow }]}>+ Agregar Veterinario</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[dashboardStyles.flatFilledButtonSm, { flex: 1 }]} onPress={() => navigation.navigate('Veterinarios')}>
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
                    {loading ? (
                        <View style={{ paddingVertical: 20 }}>
                            <ActivityIndicator size="small" color={colors.darkGreen} />
                        </View>
                    ) : metricas.tutoresPreview.length === 0 ? (
                        <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                            <Text style={adminStyles.adminItemSub}>Sin tutores registrados</Text>
                        </View>
                    ) : metricas.tutoresPreview.map((usr, index) => (
                        <View key={usr.idUsuario} style={[adminStyles.adminListItem, index === metricas.tutoresPreview.length - 1 && adminStyles.adminListItemNoBorder]}>
                            <View style={[adminStyles.adminItemAvatar, { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.lightGreen }]}>
                                <Ionicons name="person" size={16} color={colors.darkGreen} />
                            </View>
                            <View style={adminStyles.adminItemInfo}>
                                <Text style={adminStyles.adminItemTitle}>{usr.nombreCompleto}</Text>
                                <Text style={adminStyles.adminItemSub}>{usr.correoUsr}</Text>
                            </View>
                            <View style={[adminStyles.badgeContainer, usr.estadoUsr === 1 ? adminStyles.badgeActive : adminStyles.badgeInactive]}>
                                <Text style={usr.estadoUsr === 1 ? adminStyles.badgeTextActive : adminStyles.badgeTextInactive}>
                                    {usr.estadoUsr === 1 ? 'Activo' : 'Inactivo'}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={globalStyles.actionButtonsRow}>
                    <TouchableOpacity style={dashboardStyles.flatFilledButtonSm} onPress={() => navigation.navigate('Usuarios')}>
                        <Text style={dashboardStyles.filledButtonTextSm}>Ver todos los usuarios</Text>
                    </TouchableOpacity>
                </View>

                {/* ════ SECCIÓN 4: ESTADO DEL SISTEMA ════ */}
                <View style={[globalStyles.sectionHeaderRow, { marginTop: 16 }]}>
                    <View style={globalStyles.sectionTitleLeft}>
                        <Ionicons name="shield-checkmark" size={20} color={colors.darkGreen} />
                        <Text style={[globalStyles.sectionTitle, dashboardStyles.darkText]}>Estado del Sistema</Text>
                    </View>
                </View>

                <View style={{ marginBottom: 30 }}>
                    {[{
                        id: 1,
                        mensaje: `Cuentas inactivas detectadas: ${metricas.cuentasInactivas}`,
                        tiempo: loading ? 'Actualizando...' : 'Estado actual',
                        icono: metricas.cuentasInactivas > 0 ? 'warning-outline' : 'checkmark-circle-outline',
                        color: metricas.cuentasInactivas > 0 ? '#E67E22' : colors.darkGreen,
                    }, {
                        id: 2,
                        mensaje: `Tutores activos: ${metricas.tutoresActivos} · Vets activos: ${metricas.vetActivos}`,
                        tiempo: loading ? 'Actualizando...' : 'Estado actual',
                        icono: 'analytics-outline',
                        color: colors.darkGreen,
                    }].map(alerta => (
                        <View key={alerta.id} style={adminStyles.alertItem}>
                            <Ionicons name={alerta.icono as any} size={20} color={alerta.color} />
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
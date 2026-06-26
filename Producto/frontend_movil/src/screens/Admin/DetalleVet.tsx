import React, { useState } from 'react';
import { 
    View, Text, TouchableOpacity, StyleSheet, 
    ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '@/src/api/axiosInstance';
import { globalStyles } from '@/src/style/GlobalStyle';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import DashboardHeader from '@/src/components/DashboardHeader';

export default function DetalleVetScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    
    // Recibimos el objeto 'vet' pasado desde GestionVetScreen
    const { vet } = route.params;

    // Estado local para reflejar cambios inmediatos en la UI
    const [vetData, setVetData] = useState(vet);
    const [loadingStatus, setLoadingStatus] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);

    // ════ 1. LÓGICA DE HABILITAR / DESHABILITAR ════
    const handleToggleEstado = async () => {
        setLoadingStatus(true);
        const nuevoEstado = vetData.estadoUsr === 1 ? 0 : 1;
        
        try {
            // AJUSTA ESTA RUTA SEGÚN TU BACKEND (Ej: /v1/veterinarios/1/estado)
            await api.put(`/v1/veterinarios/${vetData.idUsuario}/estado`, { 
                estadoUsr: nuevoEstado 
            });
            
            setVetData({ ...vetData, estadoUsr: nuevoEstado });
            Alert.alert(
                'Estado actualizado', 
                `La cuenta ha sido ${nuevoEstado === 1 ? 'habilitada' : 'deshabilitada'} exitosamente.`
            );
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudo cambiar el estado de la cuenta.');
        } finally {
            setLoadingStatus(false);
        }
    };

    // ════ 2. LÓGICA DE ELIMINACIÓN (SOFT DELETE) ════
    const confirmDelete = () => {
        Alert.alert(
            'Eliminar Veterinario',
            `¿Estás seguro de que deseas eliminar a ${vetData.nombreCompleto}? Esta acción lo ocultará del sistema.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Eliminar', 
                    style: 'destructive',
                    onPress: executeDelete 
                }
            ]
        );
    };

    const executeDelete = async () => {
        setLoadingDelete(true);
        try {
            // AJUSTA ESTA RUTA SEGÚN TU BACKEND PARA SOFT DELETE
            await api.delete(`/v1/veterinarios/${vetData.idUsuario}`);
            Alert.alert(
                'Veterinario Eliminado', 
                'La cuenta ha sido eliminada exitosamente.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudo eliminar al veterinario.');
        } finally {
            setLoadingDelete(false);
        }
    };

    // Formateador de especialidades
    const formatEspecialidades = (especialidades: any[]) => {
        if (!especialidades || especialidades.length === 0) return 'Sin especialidad registrada';
        return especialidades.map(e => e.nombre).join(' • ');
    };

    return (
        <View style={[globalStyles.container, { backgroundColor: colors.darkDGreen }]}>
            <DashboardHeader showBackButton onBackPress={() => navigation.goBack()} />

            <View style={styles.contentWrapper}>
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[globalStyles.sectionHeaderRow, { marginTop: spacing.md }]}> 
                        <View style={globalStyles.sectionTitleLeft}>
                            <FontAwesome5 name="user-md" size={18} color={colors.lightGreen} />
                            <Text style={styles.pageTitle}>Detalle del Veterinario</Text>
                        </View>
                    </View>

                    <View style={styles.cardInfo}>
                        <View style={styles.cardHeader}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {vetData.nombreCompleto.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <View style={styles.headerTextContainer}>
                                <Text style={styles.vetName}>{vetData.nombreCompleto}</Text>
                                <View style={[styles.badge, vetData.estadoUsr === 1 ? styles.badgeActive : styles.badgeInactive]}>
                                    <Text style={[styles.badgeText, vetData.estadoUsr === 1 ? styles.badgeTextActive : styles.badgeTextInactive]}>
                                        {vetData.estadoUsr === 1 ? 'Activo' : 'Inactivo'}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Ionicons name="mail" size={20} color={colors.lightGreen} style={styles.infoIcon} />
                            <View>
                                <Text style={styles.infoLabel}>Correo Institucional</Text>
                                <Text style={styles.infoValue}>{vetData.correoUsr}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <Ionicons name="call" size={20} color={colors.lightGreen} style={styles.infoIcon} />
                            <View>
                                <Text style={styles.infoLabel}>Teléfono</Text>
                                <Text style={styles.infoValue}>{vetData.telefonoUsr || 'No registrado'}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <Ionicons name="id-card" size={20} color={colors.lightGreen} style={styles.infoIcon} />
                            <View>
                                <Text style={styles.infoLabel}>RUT / RUN</Text>
                                <Text style={styles.infoValue}>{vetData.runVet}-{vetData.dvVet}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <FontAwesome5 name="stethoscope" size={18} color={colors.lightGreen} style={[styles.infoIcon, { marginLeft: 2 }]} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.infoLabel}>Especialidades</Text>
                                <Text style={styles.infoValue}>{formatEspecialidades(vetData.especialidades)}</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.sectionLabel}>Gestión Horaria</Text>
                    
                    <TouchableOpacity 
                        style={styles.actionButtonPrimary}
                        onPress={() => navigation.navigate('CrearJornada', { vetId: vetData.idUsuario })}
                    >
                        <Ionicons name="calendar" size={22} color={colors.darkDGreen} style={{ marginRight: 8 }} />
                        <Text style={styles.actionButtonTextPrimary}>Crear / Ver Jornadas</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButtonPrimary}
                        onPress={() => navigation.navigate('CrearJornada', { vetId: vetData.idUsuario, tipo: 'BLOQUE_HORARIO' })}
                    >
                        <Ionicons name="time" size={22} color={colors.darkDGreen} style={{ marginRight: 8 }} />
                        <Text style={styles.actionButtonTextPrimary}>Generar Bloque Horario</Text>
                    </TouchableOpacity>

                    <Text style={styles.sectionLabel}>Administración de Cuenta</Text>

                    {/* Botón Eliminar (Soft Delete) */}
                    <TouchableOpacity 
                        style={[styles.actionButtonSecondary, styles.btnError]}
                        onPress={confirmDelete}
                        disabled={loadingDelete}
                    >
                        {loadingDelete ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <>
                                <Ionicons name="trash" size={22} color={colors.white} style={{ marginRight: 8 }} />
                                <Text style={styles.actionButtonTextSecondary}>Eliminar Veterinario</Text>
                            </>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    contentWrapper: {
        flex: 1,
        paddingHorizontal: spacing.xl,
    },
    scrollContent: {
        paddingTop: spacing.sm,
        paddingBottom: 100, 
    },
    pageTitle: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 24,
        color: colors.lightYellow,
        marginBottom: 0,
    },
    cardInfo: {
        backgroundColor: colors.lightYellow,
        borderRadius: 12,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.lightGreen,
        marginTop: spacing.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.lightGreen,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.darkGreen,
    },
    avatarText: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 22,
        color: colors.darkDGreen,
    },
    headerTextContainer: {
        marginLeft: spacing.md,
        flex: 1,
    },
    vetName: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 18,
        color: colors.darkDGreen,
        marginBottom: 4,
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeActive: {
        backgroundColor: colors.lightGreen,
    },
    badgeInactive: {
        backgroundColor: colors.lightBrown,
    },
    badgeText: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 11,
        textTransform: 'uppercase',
    },
    badgeTextActive: {
        color: colors.darkGreen,
    },
    badgeTextInactive: {
        color: colors.error,
    },
    divider: {
        height: 1,
        backgroundColor: colors.lightGreen,
        opacity: 0.5,
        marginBottom: spacing.md,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    infoIcon: {
        width: 30,
        textAlign: 'center',
        marginRight: spacing.sm,
    },
    infoLabel: {
        fontFamily: 'Fredoka-Regular',
        fontSize: 12,
        color: colors.darkGreen,
    },
    infoValue: {
        fontFamily: 'Fredoka-Medium',
        fontSize: 15,
        color: colors.darkDGreen,
        marginTop: 2,
    },
    sectionLabel: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 18,
        color: colors.lightYellow,
        marginTop: spacing.lg,
        marginBottom: spacing.xs,
    },
    actionButtonPrimary: {
        flexDirection: 'row',
        backgroundColor: colors.lightGreen,
        borderRadius: 12,
        paddingVertical: spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    actionButtonTextPrimary: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 16,
        color: colors.darkDGreen,
    },
    actionButtonSecondary: {
        flexDirection: 'row',
        borderRadius: 12,
        paddingVertical: spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    btnWarning: {
        backgroundColor: '#D97706', // Naranja apagado para "Deshabilitar"
    },
    btnSuccess: {
        backgroundColor: colors.darkGreen, // Verde para "Habilitar"
    },
    btnError: {
        backgroundColor: colors.error, // Rojo para "Eliminar"
    },
    actionButtonTextSecondary: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 16,
        color: colors.white,
    },
});
import React, { useCallback, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '@/src/api/axiosInstance';
import { globalStyles } from '@/src/style/GlobalStyle';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import DashboardHeader from '@/src/components/DashboardHeader';

interface ConsultaHistorialDTO {
    idConsulta: number;
    idReserva: number;
    fecha?: string;
    profesional?: string;
    diagnostico?: string;
    notas?: string;
    indicacionReceta?: string;
}

export default function VetHistorialScreen() {
    const [historial, setHistorial] = useState<ConsultaHistorialDTO[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHistorial = async () => {
        try {
            setLoading(true);
            const response = await api.get('/v1/consultas/veterinario/historial');
            setHistorial(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error cargando historial del veterinario:', error);
            setHistorial([]);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchHistorial();
        }, [])
    );

    const renderConsulta = ({ item }: { item: ConsultaHistorialDTO }) => (
        <View style={styles.card}>
            <View style={styles.rowBetween}>
                <Text style={styles.fecha}>{item.fecha || 'Sin fecha'}</Text>
                <Text style={styles.reserva}>Reserva #{item.idReserva}</Text>
            </View>

            <Text style={styles.label}>Diagnóstico</Text>
            <Text style={styles.value}>{item.diagnostico || 'Sin diagnóstico registrado'}</Text>

            <Text style={styles.label}>Indicación de receta</Text>
            <Text style={styles.value}>{item.indicacionReceta || 'Sin indicación registrada'}</Text>

            {item.notas ? (
                <>
                    <Text style={styles.label}>Notas</Text>
                    <Text style={styles.value}>{item.notas}</Text>
                </>
            ) : null}
        </View>
    );

    return (
        <View style={[globalStyles.container, { backgroundColor: colors.darkDGreen }]}>
            <DashboardHeader />

            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Historial Clínico de Consultas</Text>
                    <Text style={styles.subtitle}>Solo se muestran atenciones médicas completadas con éxito.</Text>
                </View>

                {loading ? (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color={colors.lightYellow} />
                    </View>
                ) : (
                    <FlatList
                        data={historial}
                        keyExtractor={(item) => item.idConsulta.toString()}
                        renderItem={renderConsulta}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Ionicons name="clipboard-outline" size={56} color={colors.lightGreen} style={{ opacity: 0.45 }} />
                                <Text style={styles.emptyTitle}>Sin consultas completadas</Text>
                                <Text style={styles.emptyText}>Las ausencias y reservas no atendidas no aparecen en este historial.</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: spacing.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 22,
        color: colors.lightYellow,
        textAlign: 'center',
    },
    subtitle: {
        fontFamily: 'Fredoka-Regular',
        fontSize: 13,
        color: colors.lightGreen,
        textAlign: 'center',
        marginTop: spacing.xs,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: spacing.xl * 2,
    },
    card: {
        backgroundColor: colors.lightYellow,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.lightGreen,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    fecha: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 15,
        color: colors.darkDGreen,
    },
    reserva: {
        fontFamily: 'Fredoka-Medium',
        fontSize: 13,
        color: colors.darkGreen,
    },
    label: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 12,
        color: colors.darkGreen,
        textTransform: 'uppercase',
        marginTop: spacing.xs,
        marginBottom: 2,
    },
    value: {
        fontFamily: 'Fredoka-Regular',
        fontSize: 14,
        color: colors.darkDGreen,
    },
    emptyState: {
        marginTop: spacing.xl * 2,
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
    },
    emptyTitle: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 18,
        color: colors.lightYellow,
        marginTop: spacing.md,
    },
    emptyText: {
        fontFamily: 'Fredoka-Regular',
        fontSize: 14,
        color: colors.lightGreen,
        textAlign: 'center',
        marginTop: spacing.xs,
    },
});
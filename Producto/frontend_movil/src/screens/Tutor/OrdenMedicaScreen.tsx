import React, { useCallback, useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ActivityIndicator, 
    Modal,
    FlatList 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import api from '@/src/api/axiosInstance';

import { globalStyles } from '@/src/style/GlobalStyle';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import DashboardHeader from '@/src/components/DashboardHeader';

interface MascotaDTO {
    idMascota: number;
    nomMascota: string;
}

interface ConsultaResponseDTO {
    idConsulta: number;
    fecha?: string;
    profesional?: string;
    diagnostico?: string;
    notas?: string;
    indicacionReceta?: string;
}

interface OrdenMedicaItem {
    idConsulta: number;
    idMascota: number;
    nombreMascota: string;
    fecha: string;
    profesional: string;
    diagnostico: string;
    notas: string;
    indicacionReceta: string;
}

export default function OrdenMedicaScreen() {
    const navigation = useNavigation<any>();
    const [mascotas, setMascotas] = useState<MascotaDTO[]>([]);
    const [ordenes, setOrdenes] = useState<OrdenMedicaItem[]>([]);
    const [mascotaSeleccionada, setMascotaSeleccionada] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [showMascotaModal, setShowMascotaModal] = useState(false);
    const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenMedicaItem | null>(null);

    const cargarOrdenes = async () => {
        try {
            setLoading(true);
            const mascotasResponse = await api.get('/v1/mascotas');
            const mascotasData: MascotaDTO[] = Array.isArray(mascotasResponse.data) ? mascotasResponse.data : [];
            setMascotas(mascotasData);

            const historialPorMascota = await Promise.all(
                mascotasData.map(async (mascota) => {
                    try {
                        const response = await api.get(`/v1/consultas/mascota/${mascota.idMascota}`);
                        const historial: ConsultaResponseDTO[] = Array.isArray(response.data) ? response.data : [];

                        return historial
                            .filter((consulta) => String(consulta.indicacionReceta || '').trim().length > 0)
                            .map((consulta) => ({
                                idConsulta: consulta.idConsulta,
                                idMascota: mascota.idMascota,
                                nombreMascota: mascota.nomMascota,
                                fecha: consulta.fecha || 'Sin fecha',
                                profesional: consulta.profesional || 'Profesional no informado',
                                diagnostico: consulta.diagnostico || 'Sin diagnóstico registrado',
                                notas: consulta.notas || '',
                                indicacionReceta: consulta.indicacionReceta || '',
                            }));
                    } catch (error: any) {
                        if (error.response?.status !== 404) {
                            console.error(`Error cargando consultas de mascota ${mascota.idMascota}:`, error);
                        }
                        return [];
                    }
                })
            );

            const ordenesData = historialPorMascota
                .flat()
                .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));

            setOrdenes(ordenesData);
        } catch (error) {
            console.error('Error cargando órdenes médicas:', error);
            setMascotas([]);
            setOrdenes([]);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            cargarOrdenes();
        }, [])
    );

    const ordenesFiltradas = mascotaSeleccionada == null
        ? ordenes
        : ordenes.filter((orden) => orden.idMascota === mascotaSeleccionada);

    const nombreMascotaSeleccionada = mascotaSeleccionada == null
        ? 'Todas las mascotas'
        : mascotas.find((mascota) => mascota.idMascota === mascotaSeleccionada)?.nomMascota || 'Todas las mascotas';

    const renderOrden = ({ item }: { item: OrdenMedicaItem }) => (
        <TouchableOpacity style={styles.ordenCard} activeOpacity={0.85} onPress={() => setOrdenSeleccionada(item)}>
            <View style={styles.ordenHeader}>
                <Text style={styles.ordenMascota}>{item.nombreMascota}</Text>
                <Text style={styles.ordenFecha}>{item.fecha}</Text>
            </View>

            <Text style={styles.ordenLabel}>Veterinario</Text>
            <Text style={styles.ordenTexto}>{item.profesional}</Text>

            <Text style={styles.ordenLabel}>Indicación receta</Text>
            <Text style={styles.ordenTexto}>{item.indicacionReceta}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={[globalStyles.container, { backgroundColor: colors.darkDGreen }]}>
            <DashboardHeader showBackButton onBackPress={() => navigation.goBack()} />

            <View style={styles.container}>
                <View style={styles.headerWrapper}>
                    <Text style={[globalStyles.sectionTitle, { color: colors.lightYellow, marginBottom: 0 }]}> 
                        Ordenes Médicas
                    </Text>
                </View>

                <TouchableOpacity style={styles.selectorButton} onPress={() => setShowMascotaModal(true)}>
                    <Text style={styles.selectorButtonText}>{nombreMascotaSeleccionada}</Text>
                    <Ionicons name="chevron-down" size={18} color={colors.darkGreen} />
                </TouchableOpacity>

                {loading ? (
                    <View style={styles.centeredState}>
                        <ActivityIndicator size="large" color={colors.lightYellow} />
                    </View>
                ) : (
                    <FlatList
                        data={ordenesFiltradas}
                        keyExtractor={(item) => item.idConsulta.toString()}
                        renderItem={renderOrden}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Ionicons name="document-text-outline" size={56} color={colors.lightGreen} style={{ opacity: 0.45 }} />
                                <Text style={styles.emptyTitle}>Sin órdenes médicas</Text>
                                <Text style={styles.emptyText}>Aquí verás las indicaciones de receta emitidas para tus mascotas.</Text>
                            </View>
                        }
                    />
                )}
            </View>

            <Modal visible={showMascotaModal} animationType="slide" transparent={true} onRequestClose={() => setShowMascotaModal(false)}>
                <View style={globalStyles.modalOverlay}>
                    <View style={[globalStyles.modalContent, { width: '85%', maxHeight: '65%' }]}>
                        <Text style={globalStyles.modalTitle}>Filtrar por mascota</Text>

                        <FlatList
                            data={[{ idMascota: -1, nomMascota: 'Todas las mascotas' }, ...mascotas]}
                            keyExtractor={(item) => item.idMascota.toString()}
                            style={{ width: '100%', marginTop: spacing.md, marginBottom: spacing.md }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalOption}
                                    onPress={() => {
                                        setMascotaSeleccionada(item.idMascota === -1 ? null : item.idMascota);
                                        setShowMascotaModal(false);
                                    }}
                                >
                                    <Text style={styles.modalOptionText}>{item.nomMascota}</Text>
                                </TouchableOpacity>
                            )}
                        />

                        <TouchableOpacity style={globalStyles.modalButton} onPress={() => setShowMascotaModal(false)}>
                            <Text style={globalStyles.primaryButtonText}>Entendido</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal visible={ordenSeleccionada !== null} animationType="fade" transparent={true} onRequestClose={() => setOrdenSeleccionada(null)}>
                <View style={globalStyles.modalOverlay}>
                    <View style={[globalStyles.modalContent, { width: '88%' }]}>
                        <Text style={globalStyles.modalTitle}>Detalle de Orden Médica</Text>

                        {ordenSeleccionada && (
                            <View style={styles.detalleWrapper}>
                                <Text style={styles.detalleLabel}>Mascota</Text>
                                <Text style={styles.detalleValue}>{ordenSeleccionada.nombreMascota}</Text>

                                <Text style={styles.detalleLabel}>Fecha de emisión</Text>
                                <Text style={styles.detalleValue}>{ordenSeleccionada.fecha}</Text>

                                <Text style={styles.detalleLabel}>Veterinario</Text>
                                <Text style={styles.detalleValue}>{ordenSeleccionada.profesional}</Text>

                                <Text style={styles.detalleLabel}>Diagnóstico</Text>
                                <Text style={styles.detalleValue}>{ordenSeleccionada.diagnostico}</Text>

                                <Text style={styles.detalleLabel}>Indicación receta</Text>
                                <Text style={styles.detalleValue}>{ordenSeleccionada.indicacionReceta}</Text>

                                {ordenSeleccionada.notas ? (
                                    <>
                                        <Text style={styles.detalleLabel}>Notas</Text>
                                        <Text style={styles.detalleValue}>{ordenSeleccionada.notas}</Text>
                                    </>
                                ) : null}
                            </View>
                        )}

                        <TouchableOpacity style={globalStyles.modalButton} onPress={() => setOrdenSeleccionada(null)}>
                            <Text style={globalStyles.primaryButtonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.sm,
    },
    headerWrapper: {
        marginBottom: spacing.lg,
        alignItems: 'center',
    },
    selectorButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.lightYellow,
        borderWidth: 1,
        borderColor: colors.lightGreen,
        borderRadius: 12,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        marginBottom: spacing.md,
    },
    selectorButtonText: {
        fontFamily: 'Fredoka-Medium',
        fontSize: 14,
        color: colors.darkGreen,
    },
    centeredState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: spacing.xl * 2,
    },
    ordenCard: {
        backgroundColor: colors.lightYellow,
        borderRadius: 16,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.lightGreen,
        marginBottom: spacing.md,
    },
    ordenHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.sm,
        marginBottom: spacing.xs,
    },
    ordenMascota: {
        flex: 1,
        fontFamily: 'Fredoka-Bold',
        fontSize: 15,
        color: colors.darkDGreen,
    },
    ordenFecha: {
        fontFamily: 'Fredoka-Medium',
        fontSize: 12,
        color: colors.darkGreen,
    },
    ordenLabel: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 12,
        color: colors.darkGreen,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    ordenTexto: {
        fontFamily: 'Fredoka-Regular',
        fontSize: 14,
        color: colors.darkGreen,
    },
    detalleWrapper: {
        width: '100%',
        marginBottom: spacing.md,
    },
    detalleLabel: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 12,
        color: colors.lightGreen,
        textTransform: 'uppercase',
        marginBottom: 4,
        marginTop: spacing.sm,
    },
    detalleValue: {
        fontFamily: 'Fredoka-Regular',
        fontSize: 14,
        color: colors.lightYellow,
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
    modalOption: {
        width: '100%',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGreen,
    },
    modalOptionText: {
        fontFamily: 'Fredoka-Medium',
        fontSize: 15,
        color: colors.lightYellow,
        textAlign: 'center',
    }
});
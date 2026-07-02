import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import api from '@/src/api/axiosInstance';
import { globalStyles } from '@/src/style/GlobalStyle';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import DashboardHeader from '@/src/components/DashboardHeader';

interface ReservaVetDiaDTO {
    idReserva: number;
    hora: string;
    tutor: string;
    mascota: string;
}

export default function DetalleCitaVetScreen() {
    const navigation = useNavigation<any>();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());
    const [reservasDia, setReservasDia] = useState<ReservaVetDiaDTO[]>([]);
    const [loadingAgenda, setLoadingAgenda] = useState(true);
    const [reservaSeleccionada, setReservaSeleccionada] = useState<ReservaVetDiaDTO | null>(null);

    const [showAsistenciaModal, setShowAsistenciaModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [feedbackModal, setFeedbackModal] = useState({ visible: false, title: '', message: '', isSuccess: false });

    useEffect(() => {
        fetchAgendaDia();
    }, [fechaSeleccionada]);

    useFocusEffect(
        useCallback(() => {
            fetchAgendaDia();
        }, [fechaSeleccionada])
    );

    const toApiDate = (date: Date): string => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const toDisplayDate = (date: Date): string => {
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = String(date.getFullYear()).slice(-2);
        return `${d}/${m}/${y}`;
    };

    const cambiarDia = (offset: number) => {
        setFechaSeleccionada(prev => {
            const next = new Date(prev);
            next.setDate(prev.getDate() + offset);
            next.setHours(0, 0, 0, 0);

            if (next < hoy) {
                return prev;
            }

            return next;
        });
    };

    const fechaSeleccionadaNormalizada = new Date(fechaSeleccionada);
    fechaSeleccionadaNormalizada.setHours(0, 0, 0, 0);
    const puedeRetroceder = fechaSeleccionadaNormalizada > hoy;

    const fetchAgendaDia = async () => {
        try {
            setLoadingAgenda(true);
            const response = await api.get('/v1/reservas/veterinario/agenda', {
                params: { fecha: toApiDate(fechaSeleccionada) }
            });
            setReservasDia(Array.isArray(response.data) ? response.data : []);
        } catch (error: unknown) {
            console.error('Error cargando agenda del veterinario:', error);

            if (axios.isAxiosError(error)) {
                const status = error.response?.status;

                if (status === 404) {
                    setReservasDia([]);
                    return;
                }
            }

            setReservasDia([]);
            showFeedback('Error de Carga', 'No se pudo cargar la agenda diaria del veterinario.', false);
        } finally {
            setLoadingAgenda(false);
        }
    };

    // Caso No asistió: Cierra el modal y manda el payload directo en un POST plano al backend sin navegar
    const handleNoAsistio = async () => {
        if (!reservaSeleccionada) return;
        setShowAsistenciaModal(false);
        try {
            setSubmitting(true);
            await api.post('/v1/consultas', {
                idReserva: reservaSeleccionada.idReserva,
                asistio: false,
                diagnostico: null,
                indicacionReceta: null,
                notas: null
            });
            showFeedback('Inasistencia Registrada', 'Se ha guardado el estado de ausencia y liberado el bloque clínico.', true);
            fetchAgendaDia();
        } catch (error) {
            console.error(error);
            showFeedback('Error', 'No se pudo guardar el registro de inasistencia.', false);
        } finally {
            setSubmitting(false);
        }
    };

    // Caso Sí asistió: Navega al formulario extendido pasando el idReserva
    const handleSiAsistio = () => {
        if (!reservaSeleccionada) return;
        setShowAsistenciaModal(false);
        navigation.navigate('RegistrarConsulta', { idReserva: reservaSeleccionada.idReserva, asistio: true });
    };

    const abrirControlIngreso = (reserva: ReservaVetDiaDTO) => {
        setReservaSeleccionada(reserva);
        setShowAsistenciaModal(true);
    };

    const renderReservaCard = ({ item }: { item: ReservaVetDiaDTO }) => (
        <TouchableOpacity style={styles.reservaCard} onPress={() => abrirControlIngreso(item)} activeOpacity={0.8}>
            <View style={styles.reservaRow}>
                <Text style={styles.reservaLabel}>Hora</Text>
                <Text style={styles.reservaValue}>{item.hora}</Text>
            </View>
            <View style={styles.reservaRow}>
                <Text style={styles.reservaLabel}>Tutor</Text>
                <Text style={styles.reservaValue}>{item.tutor}</Text>
            </View>
            <View style={styles.reservaRow}>
                <Text style={styles.reservaLabel}>Mascota</Text>
                <Text style={styles.reservaValue}>{item.mascota}</Text>
            </View>
        </TouchableOpacity>
    );

    const showFeedback = (title: string, message: string, isSuccess: boolean) => {
        setFeedbackModal({ visible: true, title, message, isSuccess });
    };

    return (
        <View style={[globalStyles.container, { backgroundColor: colors.darkDGreen }]}>
            <DashboardHeader showBackButton onBackPress={() => navigation.goBack()} />

            <View style={styles.mainWrapper}>
                <View style={styles.titleWrapper}>
                    <Text style={[globalStyles.sectionTitle, { color: colors.lightYellow, marginBottom: 0 }]}>
                        Agenda del Día
                    </Text>
                </View>

                <View style={styles.calendarRow}>
                    <TouchableOpacity style={[styles.dateArrowButton, !puedeRetroceder && styles.dateArrowButtonDisabled]} onPress={() => cambiarDia(-1)} disabled={!puedeRetroceder}>
                        <Ionicons name="chevron-back" size={24} color={colors.lightYellow} />
                    </TouchableOpacity>

                    <Text style={styles.dateText}>{toDisplayDate(fechaSeleccionada)}</Text>

                    <TouchableOpacity style={styles.dateArrowButton} onPress={() => cambiarDia(1)}>
                        <Ionicons name="chevron-forward" size={24} color={colors.lightYellow} />
                    </TouchableOpacity>
                </View>

                {loadingAgenda ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.lightYellow} />
                    </View>
                ) : (
                    <FlatList
                        data={reservasDia}
                        keyExtractor={(item) => item.idReserva.toString()}
                        renderItem={renderReservaCard}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Ionicons name="calendar-clear-outline" size={56} color={colors.lightGreen} style={{ opacity: 0.4 }} />
                                <Text style={styles.emptyMainText}>Sin reservas para este día</Text>
                                <Text style={styles.emptySubText}>Avanza o retrocede con las flechas para revisar otras fechas.</Text>
                            </View>
                        }
                    />
                )}
            </View>

            {/* ════ MODAL NATIVO EXPLÍCITO: SÍ / NO ASISTENCIA ════ */}
            <Modal visible={showAsistenciaModal} animationType="fade" transparent={true}>
                <View style={globalStyles.modalOverlay}>
                    <View style={[globalStyles.modalContent, { width: '85%' }]}>
                        <TouchableOpacity style={styles.closeModalButton} onPress={() => setShowAsistenciaModal(false)}>
                            <Ionicons name="close" size={22} color={colors.lightYellow} />
                        </TouchableOpacity>

                        <Ionicons name="help-circle-outline" size={48} color={colors.lightGreen} style={{ marginBottom: spacing.xs }} />
                        <Text style={globalStyles.modalTitle}>Control de Ingreso</Text>
                        {reservaSeleccionada && (
                            <Text style={styles.modalCitaResumen}>
                                {reservaSeleccionada.hora} | {reservaSeleccionada.tutor} | {reservaSeleccionada.mascota}
                            </Text>
                        )}
                        <Text style={styles.modalHelperText}>¿El paciente se presentó a la hora del bloque médico?</Text>

                        <TouchableOpacity style={[globalStyles.modalButton, { backgroundColor: colors.lightGreen, marginBottom: spacing.sm }]} onPress={handleSiAsistio}>
                            <Text style={styles.primaryButtonText}>Sí, se presentó</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[globalStyles.modalButton, { backgroundColor: colors.error }]} onPress={handleNoAsistio}>
                            <Text style={[globalStyles.primaryButtonText, { color: colors.white }]}>No se presentó (Ausente)</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ════ MODAL NATIVO EXPLÍCITO: FEEDBACK ════ */}
            <Modal visible={feedbackModal.visible} transparent animationType="fade" onRequestClose={() => setFeedbackModal(prev => ({ ...prev, visible: false }))}>
                <View style={globalStyles.modalOverlay}>
                    <View style={globalStyles.modalContent}>
                        <Ionicons name={feedbackModal.isSuccess ? "checkmark-circle" : "close-circle"} size={54} color={feedbackModal.isSuccess ? colors.green : colors.error} />
                        <Text style={globalStyles.modalTitle}>{feedbackModal.title}</Text>
                        <Text style={globalStyles.modalMessage}>{feedbackModal.message}</Text>
                        <TouchableOpacity style={globalStyles.modalButton} onPress={() => { setFeedbackModal(prev => ({ ...prev, visible: false })); if(feedbackModal.isSuccess) navigation.goBack(); }}>
                            <Text style={globalStyles.primaryButtonText}>Entendido</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    mainWrapper: { flex: 1, paddingHorizontal: spacing.xl },
    titleWrapper: { justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
    calendarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
        backgroundColor: 'rgba(251, 239, 186, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(158, 181, 125, 0.35)',
        borderRadius: 12,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    dateArrowButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(158, 181, 125, 0.2)',
    },
    dateArrowButtonDisabled: {
        opacity: 0.35,
    },
    dateText: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 22,
        color: colors.lightYellow,
        letterSpacing: 0.5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: 110,
    },
    reservaCard: {
        backgroundColor: colors.lightYellow,
        borderRadius: 12,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.lightGreen,
        marginBottom: spacing.sm + 2,
    },
    reservaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
        gap: spacing.md,
    },
    reservaLabel: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 13,
        color: colors.darkGreen,
    },
    reservaValue: {
        flexShrink: 1,
        textAlign: 'right',
        fontFamily: 'Fredoka-Medium',
        fontSize: 14,
        color: colors.darkDGreen,
    },
    emptyState: {
        marginTop: spacing.xl * 2,
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
    },
    emptyMainText: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 18,
        color: colors.lightYellow,
        marginTop: spacing.md,
    },
    emptySubText: {
        fontFamily: 'Fredoka-Regular',
        fontSize: 14,
        color: colors.lightGreen,
        textAlign: 'center',
        marginTop: spacing.xs,
    },
    closeModalButton: {
        position: 'absolute',
        top: spacing.sm,
        right: spacing.sm,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
    },
    modalCitaResumen: {
        fontFamily: 'Fredoka-Medium',
        fontSize: 13,
        color: colors.lightGreen,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    modalHelperText: { fontFamily: 'Fredoka-Regular', fontSize: 14, color: colors.lightYellow, textAlign: 'center', marginBottom: spacing.xl, paddingHorizontal: spacing.sm },
    primaryButtonText: { fontFamily: 'Fredoka-Bold', fontSize: 16, color: colors.darkDGreen, textAlign: 'center' }
});
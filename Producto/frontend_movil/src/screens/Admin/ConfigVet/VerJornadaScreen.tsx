import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Modal,
    TextInput
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import api from '@/src/api/axiosInstance';

import { globalStyles } from '@/src/style/GlobalStyle';
import { adminStyles } from '@/src/style/AdminStyle';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import DashboardHeader from '@/src/components/DashboardHeader';

interface EspecialidadDTO {
    id: number;
    nombre: string;
}

interface VeterinarioDTO {
    idVeterinario: number;
    idUsuario: number;
    nombreCompleto: string;
    correoUsr: string;
    telefonoUsr: string;
    especialidades: EspecialidadDTO[];
    estadoUsr: number;
}

interface JornadaDTO {
    idJornada: number;
    idVet: number;
    diaSemana: number;
    horaInicio: string; 
    horaFin: string;
    estJornada: number;
}

const DIAS_SEMANA_MAP: Record<number, string> = {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado',
    7: 'Domingo',
};

export default function VerJornadasScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    
    const { vet }: { vet: VeterinarioDTO } = route.params;

    const [jornadas, setJornadas] = useState<JornadaDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [feedbackModal, setFeedbackModal] = useState({ visible: false, title: '', message: '', isSuccess: false });
    const [jornadaSeleccionada, setJornadaSeleccionada] = useState<JornadaDTO | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editHoraInicio, setEditHoraInicio] = useState('');
    const [editHoraFin, setEditHoraFin] = useState('');

    useFocusEffect(
        useCallback(() => {
            fetchJornadasMedicas();
        }, [vet.idVeterinario])
    );

    const fetchJornadasMedicas = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/v1/jornadas/veterinario/${vet.idVeterinario}`);
            const ordenadas = response.data.sort((a: JornadaDTO, b: JornadaDTO) => a.diaSemana - b.diaSemana);
            setJornadas(ordenadas);
        } catch (error) {
            console.error("Error al obtener jornadas de la API:", error);
            showFeedback('Error de Carga', 'No se pudieron recuperar las reglas horarias de este veterinario.', false);
        } finally {
            setLoading(false);
        }
    };

    const showFeedback = (title: string, message: string, isSuccess: boolean) => {
        setFeedbackModal({ visible: true, title, message, isSuccess });
    };

    const handleCloseFeedback = () => {
        setFeedbackModal(prev => ({ ...prev, visible: false }));
    };

    const seleccionarJornada = (jornada: JornadaDTO) => {
        setJornadaSeleccionada(jornada);
        setShowEditModal(true);
    };

    const handleEditarJornada = () => {
        setShowEditModal(false);
        setEditHoraInicio(limpiarFormatoHora(jornadaSeleccionada!.horaInicio));
        setEditHoraFin(limpiarFormatoHora(jornadaSeleccionada!.horaFin));
        setShowFormModal(true);
    };

    const handleCancelarEdicion = () => {
        setShowEditModal(false);
        setJornadaSeleccionada(null);
    };

    const handleCancelarFormulario = () => {
        setShowFormModal(false);
        setJornadaSeleccionada(null);
        setEditHoraInicio('');
        setEditHoraFin('');
    };

    const formatTimeInput = (input: string): string => {
        const cleaned = input.replace(/\D/g, '');
        if (cleaned.length === 0) return '';
        if (cleaned.length <= 2) return cleaned;
        return cleaned.slice(0, 2) + ':' + cleaned.slice(2, 4);
    };

    const isValidTime = (timeString: string): boolean => {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(timeString);
    };

    const ejecutarActualizacionJornada = async () => {
        if (!jornadaSeleccionada) return;

        if (!isValidTime(editHoraInicio)) {
            showFeedback('Hora Inválida', 'La hora de inicio no tiene un formato válido (HH:MM).', false);
            return;
        }
        if (!isValidTime(editHoraFin)) {
            showFeedback('Hora Inválida', 'La hora de fin no tiene un formato válido (HH:MM).', false);
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                idVet: jornadaSeleccionada.idVet,
                diaSemana: jornadaSeleccionada.diaSemana,
                horaInicio: editHoraInicio,
                horaFin: editHoraFin,
            };
            const response = await api.put(`/v1/jornadas/${jornadaSeleccionada.idJornada}`, payload);
            const jornadaActualizada: JornadaDTO = response.data;

            setJornadas(prev =>
                prev.map(j => j.idJornada === jornadaActualizada.idJornada ? jornadaActualizada : j)
            );

            setShowFormModal(false);
            setJornadaSeleccionada(null);
            setEditHoraInicio('');
            setEditHoraFin('');

            showFeedback(
                'Jornada Actualizada',
                `El horario del ${DIAS_SEMANA_MAP[jornadaActualizada.diaSemana]} fue modificado exitosamente.`,
                true
            );
        } catch (error: any) {
            console.error('Error al actualizar jornada:', error);
            const backendError = typeof error.response?.data === 'string'
                ? error.response.data
                : error.response?.data?.message;
            showFeedback('Error al Actualizar', backendError || 'No se pudo guardar el nuevo horario.', false);
        } finally {
            setSubmitting(false);
        }
    };

    const limpiarFormatoHora = (hora: string): string => {
        if (!hora) return '00:00';
        const partes = hora.split(':');
        if (partes.length >= 2) {
            return `${partes[0]}:${partes[1]}`;
        }
        return hora;
    };

    const renderJornadaCard = ({ item }: { item: JornadaDTO }) => (
        <TouchableOpacity 
            style={styles.jornadaCardItem}
            onPress={() => seleccionarJornada(item)}
            activeOpacity={0.7}
        >
            <View style={styles.cardMainDetails}>
                <View style={styles.dayHeaderRow}>
                    <Ionicons name="calendar-sharp" size={22} color={colors.darkGreen} />
                    <Text style={styles.dayTitleText}>{DIAS_SEMANA_MAP[item.diaSemana]}</Text>
                </View>
                <View style={styles.timeRangeRow}>
                    <Ionicons name="time-outline" size={18} color={colors.darkGreen} />
                    <Text style={styles.timeValueText}>
                        {limpiarFormatoHora(item.horaInicio)} hrs a {limpiarFormatoHora(item.horaFin)} hrs
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[globalStyles.container, { backgroundColor: colors.darkDGreen }]}>
            <DashboardHeader showBackButton onBackPress={() => navigation.goBack()} />

            <View style={styles.mainContainer}>
                
                <View style={styles.sectionHeaderWrapper}>
                    <Text style={[globalStyles.sectionTitle, { color: colors.lightYellow, marginBottom: 0 }]}>
                        Jornadas Base Asignadas
                    </Text>
                </View>

                <View style={[adminStyles.adminListCard, styles.professionalCardHeader]}>
                    <View style={adminStyles.adminItemAvatar}>
                        <FontAwesome5 name="user-md" size={16} color={colors.darkDGreen} />
                    </View>
                    <View style={adminStyles.adminItemInfo}>
                        <Text style={styles.professionalNameText}>{vet.nombreCompleto}</Text>
                        <Text style={[adminStyles.adminItemSub, { color: colors.darkGreen }]}>
                            {vet.especialidades?.map(e => e.nombre).join(' • ') || 'Médico General'}
                        </Text>
                    </View>
                </View>

                {loading ? (
                    <View style={styles.loadingCentered}>
                        <ActivityIndicator size="large" color={colors.lightYellow} />
                    </View>
                ) : (
                    <FlatList
                        data={jornadas}
                        keyExtractor={(item) => item.idJornada.toString()}
                        renderItem={renderJornadaCard}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContainerScroll}
                        ListEmptyComponent={
                            <View style={styles.emptyContainerState}>
                                <Ionicons name="calendar-outline" size={60} color={colors.lightGreen} style={{ opacity: 0.4 }} />
                                <Text style={styles.emptyMainText}>Sin reglas asignadas</Text>
                                <Text style={styles.emptySubText}>
                                    Este profesional no registra un molde horario base en el sistema. Puedes configurarle uno en la pantalla anterior.
                                </Text>
                            </View>
                        }
                    />
                )}
            </View>

            {/* ════ MODAL NATIVO EXPLÍCITO: NOTIFICACIONES (FEEDBACK) ════ */}
            <Modal visible={feedbackModal.visible} transparent animationType="fade" onRequestClose={handleCloseFeedback}>
                <View style={globalStyles.modalOverlay}>
                    <View style={globalStyles.modalContent}>
                        <Ionicons 
                            name={feedbackModal.isSuccess ? "checkmark-circle" : "close-circle"} 
                            size={54} 
                            color={feedbackModal.isSuccess ? colors.green : colors.error} 
                        />
                        <Text style={globalStyles.modalTitle}>{feedbackModal.title}</Text>
                        <Text style={globalStyles.modalMessage}>{feedbackModal.message}</Text>
                        <TouchableOpacity style={globalStyles.modalButton} onPress={handleCloseFeedback}>
                            <Text style={globalStyles.primaryButtonText}>Entendido</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ════ MODAL NATIVO EXPLÍCITO: EDITAR JORNADA ════ */}
            <Modal visible={showEditModal} animationType="fade" transparent={true} onRequestClose={handleCancelarEdicion}>
                <View style={globalStyles.modalOverlay}>
                    <View style={[globalStyles.modalContent, { width: '85%' }]}>
                        <Ionicons name="pencil-outline" size={44} color={colors.darkGreen} style={{ marginBottom: spacing.xs }} />
                        <Text style={globalStyles.modalTitle}>¿Desea editar esta jornada?</Text>
                        
                        {jornadaSeleccionada && (
                            <View style={styles.editModalSummary}>
                                <Text style={styles.editModalLabel}>Día</Text>
                                <Text style={styles.editModalValue}>{DIAS_SEMANA_MAP[jornadaSeleccionada.diaSemana]}</Text>

                                <Text style={styles.editModalLabel}>Horario</Text>
                                <Text style={styles.editModalValue}>
                                    {limpiarFormatoHora(jornadaSeleccionada.horaInicio)} a {limpiarFormatoHora(jornadaSeleccionada.horaFin)} hrs
                                </Text>
                            </View>
                        )}

                        <TouchableOpacity 
                            style={[globalStyles.modalButton, { backgroundColor: colors.darkGreen, marginBottom: spacing.sm }]} 
                            onPress={handleEditarJornada}
                        >
                            <Text style={[globalStyles.primaryButtonText, { color: colors.white }]}>Si</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={globalStyles.modalButton} onPress={handleCancelarEdicion}>
                            <Text style={globalStyles.primaryButtonText}>No</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ════ MODAL FORMULARIO: NUEVO HORARIO ════ */}
            <Modal visible={showFormModal} animationType="slide" transparent={true} onRequestClose={handleCancelarFormulario}>
                <View style={globalStyles.modalOverlay}>
                    <View style={[globalStyles.modalContent, { width: '90%' }]}>
                        <Ionicons name="time-outline" size={44} color={colors.darkGreen} style={{ marginBottom: spacing.xs }} />
                        <Text style={globalStyles.modalTitle}>Editar Jornada</Text>

                        {jornadaSeleccionada && (
                            <Text style={styles.formModalDayTitle}>
                                {DIAS_SEMANA_MAP[jornadaSeleccionada.diaSemana]}
                            </Text>
                        )}

                        <View style={styles.formRow}>
                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Hora Inicio</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={editHoraInicio}
                                    onChangeText={text => setEditHoraInicio(formatTimeInput(text))}
                                    placeholder="09:00"
                                    placeholderTextColor={colors.lightGreen}
                                    keyboardType="number-pad"
                                    maxLength={5}
                                />
                            </View>
                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Hora Fin</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={editHoraFin}
                                    onChangeText={text => setEditHoraFin(formatTimeInput(text))}
                                    placeholder="14:00"
                                    placeholderTextColor={colors.lightGreen}
                                    keyboardType="number-pad"
                                    maxLength={5}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[globalStyles.modalButton, { backgroundColor: colors.darkGreen, marginBottom: spacing.sm, opacity: submitting ? 0.6 : 1 }]}
                            onPress={ejecutarActualizacionJornada}
                            disabled={submitting}
                        >
                            {submitting
                                ? <ActivityIndicator color={colors.white} />
                                : <Text style={[globalStyles.primaryButtonText, { color: colors.white }]}>Guardar Cambios</Text>
                            }
                        </TouchableOpacity>

                        <TouchableOpacity style={globalStyles.modalButton} onPress={handleCancelarFormulario} disabled={submitting}>
                            <Text style={globalStyles.primaryButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        paddingHorizontal: spacing.xl,
    },
    sectionHeaderWrapper: {
        justifyContent: 'center', 
        alignItems: 'center',
        marginBottom: spacing.lg + 4,
    },
    professionalCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: colors.lightYellow,
        marginBottom: spacing.xl, 
        marginTop: 2,
    },
    professionalNameText: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 18,
        color: colors.darkDGreen,
        marginBottom: 2,
    },
    loadingCentered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    listContainerScroll: {
        paddingBottom: 120,
    },
    jornadaCardItem: {
        flexDirection: 'row',
        backgroundColor: colors.lightYellow,
        borderRadius: 12,
        padding: spacing.lg,
        marginBottom: spacing.md, 
        borderWidth: 1,
        borderColor: colors.darkGreen,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardMainDetails: {
        flex: 1,
    },
    dayHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm, 
    },
    dayTitleText: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 20, 
        color: colors.darkDGreen,
        marginLeft: spacing.sm,
    },
    timeRangeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 2,
    },
    timeValueText: {
        fontFamily: 'Fredoka-Medium',
        fontSize: 16, 
        color: colors.darkGreen,
        marginLeft: spacing.xs + 2,
    },
    emptyContainerState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyMainText: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 19,
        color: colors.lightYellow,
        marginTop: spacing.md,
    },
    emptySubText: {
        fontFamily: 'Fredoka-Regular',
        fontSize: 14,
        color: colors.lightGreen,
        textAlign: 'center',
        marginTop: spacing.sm,
        paddingHorizontal: spacing.lg,
        lineHeight: 20,
    },
    editModalSummary: {
        width: '100%',
        backgroundColor: 'rgba(251, 239, 186, 0.08)',
        borderRadius: 12,
        padding: spacing.lg,
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: 'rgba(158, 181, 125, 0.3)',
    },
    editModalLabel: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 11,
        color: colors.lightGreen,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    editModalValue: {
        fontFamily: 'Fredoka-Medium',
        fontSize: 16,
        color: colors.white,
        marginBottom: spacing.md,
    },
    formModalDayTitle: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 22,
        color: colors.lightYellow,
        marginBottom: spacing.lg,
    },
    formRow: {
        flexDirection: 'row',
        gap: spacing.md,
        width: '100%',
        marginBottom: spacing.xl,
    },
    formField: {
        flex: 1,
    },
    formLabel: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 13,
        color: colors.lightGreen,
        marginBottom: spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    formInput: {
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.darkGreen,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm + 2,
        fontFamily: 'Fredoka-Medium',
        fontSize: 20,
        color: colors.white,
        textAlign: 'center',
    },
});
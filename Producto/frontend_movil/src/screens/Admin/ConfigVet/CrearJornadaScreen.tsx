import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Modal,
    FlatList
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
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

const DIAS_SEMANA = [
    { id: 1, nombre: 'Lunes' },
    { id: 2, nombre: 'Martes' },
    { id: 3, nombre: 'Miércoles' },
    { id: 4, fontNombre: 'Jueves', nombre: 'Jueves' },
    { id: 5, nombre: 'Viernes' },
    { id: 6, nombre: 'Sábado' },
    { id: 7, nombre: 'Domingo' },
];

export default function CrearJornadaScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    // Estados del Formulario (Alineados con JornadaRequestDTO.java)
    const [selectedVet, setSelectedVet] = useState<VeterinarioDTO | null>(null);
    const [diaSemanaSeleccionados, setDiaSemanaSeleccionados] = useState<number[]>([]); 
    const [horaInicio, setHoraInicio] = useState(''); 
    const [horaFin, setHoraFin] = useState('');    

    // Estados de UI y Modales
    const [loadingVets, setLoadingVets] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [vetsList, setVetsList] = useState<VeterinarioDTO[]>([]);
    const [showVetModal, setShowVetModal] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false); 
    
    // Feedback Modal
    const [feedbackModal, setFeedbackModal] = useState({ visible: false, title: '', message: '', isSuccess: false });

    useEffect(() => {
        if (route.params?.vet) {
            setSelectedVet(route.params.vet);
        } else {
            fetchVeterinarios();
        }
    }, [route.params?.vet]);

    const fetchVeterinarios = async () => {
        try {
            setLoadingVets(true);
            const response = await api.get('/v1/veterinarios');
            const activos = response.data.filter((v: any) => v.estadoUsr === 1);
            setVetsList(activos);
        } catch (error) {
            console.error("Error al cargar veterinarios para jornadas:", error);
        } finally {
            setLoadingVets(false);
        }
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

    const handleHoraInicioChange = (text: string) => {
        const formatted = formatTimeInput(text);
        setHoraInicio(formatted);
    };

    const handleHoraFinChange = (text: string) => {
        const formatted = formatTimeInput(text);
        setHoraFin(formatted);
    };

    const handleDiaToggle = (dia: number) => {
        setDiaSemanaSeleccionados(prevDias => {
            if (prevDias.includes(dia)) {
                return prevDias.filter(d => d !== dia);
            } else {
                return [...prevDias, dia].sort((a, b) => a - b);
            }
        });
    };

    const validarYMostrarResumen = () => {
        if (!selectedVet) {
            showFeedback('Falta Información', 'Por favor, selecciona un veterinario.', false);
            return;
        }
        if (diaSemanaSeleccionados.length === 0) {
            showFeedback('Falta Información', 'Por favor, selecciona al menos un día de la semana.', false);
            return;
        }
        if (!horaInicio || !horaFin) {
            showFeedback('Campos Vacíos', 'Las horas de inicio y término son obligatorias.', false);
            return;
        }
        if (!isValidTime(horaInicio)) {
            showFeedback('Hora de Apertura Inválida', 'Por favor, ingresa una hora válida (00:00 - 23:59).', false);
            return;
        }
        if (!isValidTime(horaFin)) {
            showFeedback('Hora de Cierre Inválida', 'Por favor, ingresa una hora válida (00:00 - 23:59).', false);
            return;
        }

        setShowSummaryModal(true);
    };

    const registrarJornada = async () => {
        setShowSummaryModal(false);

        try {
            setSubmitting(true);

            const promesas = diaSemanaSeleccionados.map(dia => {
                const payload = {
                    idVet: selectedVet!.idVeterinario,
                    diaSemana: dia,
                    horaInicio: horaInicio,
                    horaFin: horaFin
                };
                return api.post('/v1/jornadas', payload);
            });

            await Promise.all(promesas);

            showFeedback(
                'Jornada creada con éxito',
                `Para editar alguna jornada, vaya a "Ver Jornadas" en el detalle del veterinario`,
                true
            );
        } catch (error: any) {
            console.error("Error al guardar jornadas en backend:", error);
            const backendError = typeof error.response?.data === 'string' ? error.response.data : error.response?.data?.message;
            showFeedback('Error de Solicitud', backendError || 'El rango horario entra en conflicto o el formato no es soportado.', false);
        } finally {
            setSubmitting(false);
        }
    };

    const showFeedback = (title: string, message: string, isSuccess: boolean) => {
        setFeedbackModal({ visible: true, title, message, isSuccess });
    };

    const handleCloseFeedback = () => {
        setFeedbackModal(prev => ({ ...prev, visible: false }));
        if (feedbackModal.isSuccess) {
            navigation.goBack();
        }
    };

    const formatEspecialidades = (especialidades: EspecialidadDTO[]): string => {
        if (!especialidades || especialidades.length === 0) return 'Sin especialidad';
        return especialidades.map(e => e.nombre).join(', ');
    };

    const getDiasSeleccionadosTexto = (): string => {
        return diaSemanaSeleccionados
            .map(id => DIAS_SEMANA.find(d => d.id === id)?.nombre)
            .join(', ');
    };

    return (
        <View style={[globalStyles.container, { backgroundColor: colors.darkDGreen }]}>
            <DashboardHeader showBackButton onBackPress={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={globalStyles.scrollContainer} showsVerticalScrollIndicator={false}>
                
                <View style={[globalStyles.sectionHeaderRow, { justifyContent: 'center', marginBottom: spacing.lg }]}>
                    <Text style={[globalStyles.sectionTitle, { color: colors.lightYellow, textAlign: 'center', marginBottom: 0 }]}>
                        Definir Regla de Jornada
                    </Text>
                </View>

                {/* SECCIÓN 1: Selección de Veterinario */}
                <View style={globalStyles.inputGroup}>
                    <Text style={[globalStyles.label, styles.increasedLabelSpacing]}>Veterinario Asignado *</Text>
                    {selectedVet ? (
                        <View style={[adminStyles.adminListCard, styles.vetSelectedContainer]}>
                            <View style={adminStyles.adminItemAvatar}>
                                <FontAwesome5 name="user-md" size={16} color={colors.darkDGreen} />
                            </View>
                            <View style={adminStyles.adminItemInfo}>
                                <Text style={adminStyles.adminItemTitle}>{selectedVet.nombreCompleto}</Text>
                                <Text style={adminStyles.adminItemSub}>{formatEspecialidades(selectedVet.especialidades)}</Text>
                            </View>
                            {!route.params?.vet && (
                                <TouchableOpacity onPress={() => setShowVetModal(true)} style={styles.swapButton}>
                                    <Ionicons name="swap-horizontal" size={20} color={colors.darkGreen} />
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.dropdownSelector} onPress={() => setShowVetModal(true)}>
                            <Text style={styles.placeholderText}>Seleccionar profesional...</Text>
                            {loadingVets ? <ActivityIndicator size="small" color={colors.darkGreen} /> : <Ionicons name="chevron-down" size={20} color={colors.darkGreen} />}
                        </TouchableOpacity>
                    )}
                </View>

                {/* SECCIÓN 2: Selector del Día de la Semana */}
                <View style={globalStyles.inputGroup}>
                    <Text style={[globalStyles.label, { marginBottom: spacing.xs }]}>Día de la Semana *</Text>
                    <Text style={styles.descriptionHelper}>Selecciona el día sobre el cual se aplicará este patrón de horario.</Text>
                    
                    <View style={styles.daysGrid}>
                        {DIAS_SEMANA.map((dia) => {
                            const isSelected = diaSemanaSeleccionados.includes(dia.id);
                            return (
                                <TouchableOpacity
                                    key={dia.id}
                                    style={[
                                        styles.dayChip,
                                        isSelected && styles.dayChipSelected
                                    ]}
                                    onPress={() => handleDiaToggle(dia.id)}
                                >
                                    <Text style={[
                                        styles.dayChipText,
                                        isSelected && styles.dayChipTextSelected
                                    ]}>
                                        {dia.nombre}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* SECCIÓN 3: Rango de Horas */}
                <View style={globalStyles.row}>
                    <View style={globalStyles.halfColumn}>
                        <View style={globalStyles.inputGroup}>
                            <Text style={[globalStyles.label, styles.increasedLabelSpacing]}>Hora Apertura *</Text>
                            <TextInput
                                style={globalStyles.input}
                                placeholder="09:00"
                                placeholderTextColor={colors.disabled}
                                value={horaInicio}
                                onChangeText={handleHoraInicioChange}
                                keyboardType="number-pad"
                                maxLength={5}
                                autoCapitalize="none"
                            />
                        </View>
                    </View>
                    
                    <View style={globalStyles.halfColumn}>
                        <View style={globalStyles.inputGroup}>
                            <Text style={[globalStyles.label, styles.increasedLabelSpacing]}>Hora Cierre *</Text>
                            <TextInput
                                style={globalStyles.input}
                                placeholder="14:00"
                                placeholderTextColor={colors.disabled}
                                value={horaFin}
                                onChangeText={handleHoraFinChange}
                                keyboardType="number-pad"
                                maxLength={5}
                                autoCapitalize="none"
                            />
                        </View>
                    </View>
                </View>

                <View style={[globalStyles.divider, { marginTop: spacing.md, marginBottom: spacing.lg }]} />

                {/* SECCIÓN 4: Botón de Envío */}
                <View style={globalStyles.bottomSection}>
                    <TouchableOpacity
                        style={[
                            globalStyles.primaryButton,
                            { width: '100%', flexDirection: 'row', justifyContent: 'center' },
                            submitting && globalStyles.primaryButtonDisabled
                        ]}
                        onPress={validarYMostrarResumen}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color={colors.darkDGreen} style={{ marginRight: spacing.sm }} />
                        ) : (
                            <Ionicons name="calendar-outline" size={20} color={colors.darkDGreen} style={{ marginRight: spacing.sm }} />
                        )}
                        <Text style={globalStyles.primaryButtonText}>
                            {submitting ? 'Guardando en Servidor...' : 'Registrar Regla de Horario'}
                        </Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            {/* ════ MODAL RESUMEN DE LA JORNADA (INFORMACIÓN MÁS GRANDE) ════ */}
            <Modal visible={showSummaryModal} animationType="fade" transparent={true} onRequestClose={() => setShowSummaryModal(false)}>
                <View style={globalStyles.modalOverlay}>
                    <View style={[globalStyles.modalContent, { width: '85%' }]}>
                        <Ionicons name="document-text-outline" size={44} color={colors.lightGreen} style={{ marginBottom: spacing.xs }} />
                        <Text style={globalStyles.modalTitle}>Resumen de Jornada</Text>
                        <Text style={[styles.descriptionHelper, { textAlign: 'center', marginBottom: spacing.lg }]}>
                            Confirma los detalles antes de crear los bloques horarios en el sistema.
                        </Text>

                        {/* Caja informativa con tamaños ampliados de fuente */}
                        <View style={styles.summaryBox}>
                            <Text style={styles.summaryLabel}>Veterinario</Text>
                            <Text style={styles.summaryValueLarge}>{selectedVet?.nombreCompleto}</Text>

                            <Text style={styles.summaryLabel}>Días Asignados</Text>
                            <Text style={styles.summaryValueLarge}>{getDiasSeleccionadosTexto()}</Text>

                            <Text style={styles.summaryLabel}>Jornada Laboral</Text>
                            <Text style={styles.summaryValueLarge}>{horaInicio} hrs a {horaFin} hrs</Text>
                        </View>

                        <TouchableOpacity style={[globalStyles.modalButton, { marginBottom: spacing.sm }]} onPress={registrarJornada}>
                            <Text style={globalStyles.primaryButtonText}>Confirmar y Guardar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[globalStyles.modalButton, { backgroundColor: colors.error }]} onPress={() => setShowSummaryModal(false)}>
                            <Text style={[globalStyles.primaryButtonText, { color: colors.white }]}>Modificar Datos</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ════ MODAL: LISTADO COMPLETO DE VETERINARIOS ACTIVOS ════ */}
            <Modal visible={showVetModal} animationType="slide" transparent={true} onRequestClose={() => setShowVetModal(false)}>
                <View style={globalStyles.modalOverlay}>
                    <View style={[globalStyles.modalContent, { width: '90%', maxHeight: '70%' }]}>
                        <Text style={globalStyles.modalTitle}>Asignar Profesional</Text>
                        
                        <FlatList
                            data={vetsList}
                            keyExtractor={(item) => item.idVeterinario.toString()}
                            style={{ width: '100%', marginTop: spacing.md, marginBottom: spacing.md }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[adminStyles.adminListItem, styles.modalSelectionRow]}
                                    onPress={() => {
                                        setSelectedVet(item);
                                        setShowVetModal(false);
                                    }}
                                >
                                    <View style={adminStyles.adminItemAvatar}>
                                        <Text style={{ color: colors.darkDGreen, fontWeight: 'bold' }}>
                                            {item.nombreCompleto.substring(0, 2).toUpperCase()}
                                        </Text>
                                    </View>
                                    <View style={adminStyles.adminItemInfo}>
                                        <Text style={[adminStyles.adminItemTitle, { color: colors.lightYellow }]}>{item.nombreCompleto}</Text>
                                        <Text style={[adminStyles.adminItemSub, { color: colors.lightGreen }]}>{formatEspecialidades(item.especialidades)}</Text>
                                    </View>
                                    <Ionicons name="add-circle-outline" size={22} color={colors.lightGreen} />
                                </TouchableOpacity>
                            )}
                        />

                        <TouchableOpacity style={[globalStyles.modalButton, { backgroundColor: colors.error }]} onPress={() => setShowVetModal(false)}>
                            <Text style={[globalStyles.primaryButtonText, { color: colors.white, fontSize: 16 }]}>Cerrar Ventana</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ════ MODAL DE NOTIFICACIONES (ÉXITO / ERROR) ════ */}
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

        </View>
    );
}

const styles = StyleSheet.create({
    increasedLabelSpacing: {
        marginBottom: spacing.sm + 2, // Añade separación extra entre el título y el input/cuadro
    },
    dropdownSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.lightYellow,
        borderWidth: 1,
        borderColor: colors.darkGreen,
        borderRadius: 8,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        height: 48,
        marginTop: 2,
    },
    placeholderText: {
        fontFamily: 'Fredoka-Regular',
        fontSize: 15,
        color: colors.darkGreen,
    },
    vetSelectedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        marginBottom: 0,
        backgroundColor: colors.lightYellow,
        marginTop: 2,
    },
    swapButton: {
        padding: spacing.xs,
        backgroundColor: 'rgba(65, 100, 40, 0.1)',
        borderRadius: 6,
    },
    descriptionHelper: {
        fontFamily: 'Fredoka-Regular',
        fontSize: 12,
        color: colors.lightGreen,
        marginBottom: spacing.md, // Aumentado para dar más aire entre la descripción y los chips
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: spacing.xs,
    },
    dayChip: {
        backgroundColor: colors.lightYellow,
        borderWidth: 1,
        borderColor: colors.darkGreen,
        borderRadius: 20,
        paddingHorizontal: spacing.md,
        paddingVertical: 8,
        minWidth: '22%',
        alignItems: 'center',
    },
    dayChipSelected: {
        backgroundColor: colors.lightGreen,
        borderColor: colors.darkDGreen,
    },
    dayChipText: {
        fontFamily: 'Fredoka-Medium',
        fontSize: 13,
        color: colors.darkDGreen,
    },
    dayChipTextSelected: {
        fontFamily: 'Fredoka-Bold',
        color: colors.darkDGreen,
    },
    modalSelectionRow: {
        borderBottomColor: 'rgba(158, 181, 125, 0.15)',
        paddingVertical: spacing.md,
    },
    summaryBox: {
        width: '100%',
        backgroundColor: 'rgba(251, 239, 186, 0.08)',
        borderRadius: 12,
        padding: spacing.lg,
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: 'rgba(158, 181, 125, 0.3)',
    },
    summaryLabel: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 11,
        color: colors.lightGreen,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    summaryValueLarge: {
        fontFamily: 'Fredoka-Medium',
        fontSize: 17, // Incrementado el tamaño de la información en el resumen
        color: colors.white,
        marginBottom: spacing.md, // Da espacio antes de la siguiente etiqueta del resumen
    }
});
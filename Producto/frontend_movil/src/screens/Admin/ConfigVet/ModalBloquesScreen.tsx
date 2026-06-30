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

const MESES = [
    { id: 1, nombre: 'Enero' },
    { id: 2, nombre: 'Febrero' },
    { id: 3, nombre: 'Marzo' },
    { id: 4, nombre: 'Abril' },
    { id: 5, nombre: 'Mayo' },
    { id: 6, nombre: 'Junio' },
    { id: 7, nombre: 'Julio' },
    { id: 8, nombre: 'Agosto' },
    { id: 9, nombre: 'Septiembre' },
    { id: 10, nombre: 'Octubre' },
    { id: 11, nombre: 'Noviembre' },
    { id: 12, nombre: 'Diciembre' },
];

export default function GenerarBloquesScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    // Capturar dinámicamente el año actual del sistema
    const anioSistema = new Date().getFullYear().toString();

    // Estados del Formulario
    const [selectedVet, setSelectedVet] = useState<VeterinarioDTO | null>(null);
    const [mesSeleccionado, setMesSeleccionado] = useState<number | null>(null);
    const [duracionMinutos, setDuracionMinutos] = useState('30'); 

    // Estados de Interfaz
    const [loadingVets, setLoadingVets] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [vetsList, setVetsList] = useState<VeterinarioDTO[]>([]);
    
    // Modales de control de flujo
    const [showVetModal, setShowVetModal] = useState(false);
    const [showMesModal, setShowMesModal] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
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
            console.error("Error cargando veterinarios para bloques:", error);
        } finally {
            setLoadingVets(false);
        }
    };

    const validarFormulario = () => {
        if (!selectedVet) {
            showFeedback('Falta Información', 'Por favor, asigna un veterinario para el procesamiento.', false);
            return;
        }
        if (!mesSeleccionado) {
            showFeedback('Falta Información', 'Debes elegir un mes del calendario.', false);
            return;
        }
        
        const minutosNum = parseInt(duracionMinutos, 10);
        if (!duracionMinutos || isNaN(minutosNum) || minutosNum <= 0) {
            showFeedback('Configuración Errónea', 'Por favor, ingresa una duración válida en minutos (mayor a 0).', false);
            return;
        }

        setShowSummaryModal(true);
    };

    const ejecutarGeneracionBloques = async () => {
        setShowSummaryModal(false);
        try {
            setSubmitting(true);

            await api.post('/v1/agendas', null, {
                params: {
                    idVet: selectedVet!.idVeterinario,
                    anio: parseInt(anioSistema, 10),
                    mes: mesSeleccionado,
                    duracionMinutos: parseInt(duracionMinutos, 10)
                }
            });

            showFeedback(
                '¡Agenda Generada!',
                `Se han procesado y guardado correctamente los bloques médicos para el Dr(a). ${selectedVet!.nombreCompleto}.`,
                true
            );
        } catch (error: any) {
            console.error("Error al generar bloques horarios:", error);
            const backendError = typeof error.response?.data === 'string' ? error.response.data : error.response?.data?.message;
            showFeedback(
                'Fallo en Generación',
                backendError || 'El veterinario no posee jornadas base configuradas para mapear este mes.',
                false
            );
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

    const getNombreMes = (id: number | null): string => {
        if (!id) return '';
        return MESES.find(m => m.id === id)?.nombre || '';
    };

    return (
        <View style={[globalStyles.container, { backgroundColor: colors.darkDGreen }]}>
            <DashboardHeader showBackButton onBackPress={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={globalStyles.scrollContainer} showsVerticalScrollIndicator={false}>
                
                <View style={[globalStyles.sectionHeaderRow, { justifyContent: 'center', marginBottom: spacing.lg }]}>
                    <Text style={[globalStyles.sectionTitle, { color: colors.lightYellow, textAlign: 'center', marginBottom: 0 }]}>
                        Generación de Bloques Médicos
                    </Text>
                </View>

                {/* CAMPO 1: Veterinario */}
                <View style={globalStyles.inputGroup}>
                    <Text style={[globalStyles.label, styles.increasedLabelSpacing]}>Veterinario Seleccionado *</Text>
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

                {/* CONFIGURACIÓN TEMPORAL (Mes y Año Fijo del Sistema) */}
                <View style={globalStyles.row}>
                    <View style={globalStyles.halfColumn}>
                        <View style={globalStyles.inputGroup}>
                            <Text style={[globalStyles.label, styles.increasedLabelSpacing]}>Mes Planificación *</Text>
                            <TouchableOpacity style={styles.dropdownSelector} onPress={() => setShowMesModal(true)}>
                                <Text style={[styles.placeholderText, mesSeleccionado ? { color: colors.darkDGreen } : null]}>
                                    {mesSeleccionado ? getNombreMes(mesSeleccionado) : 'Elegir mes...'}
                                </Text>
                                <Ionicons name="calendar-outline" size={18} color={colors.darkGreen} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    <View style={[globalStyles.halfColumn, { marginLeft: spacing.md }]}>
                        <View style={globalStyles.inputGroup}>
                            <Text style={[globalStyles.label, styles.increasedLabelSpacing]}>Año Vigente</Text>
                            <TextInput
                                style={[globalStyles.input, styles.readOnlyInput]}
                                value={anioSistema}
                                editable={false}
                            />
                        </View>
                    </View>
                </View>

                {/* CAMPO 4: Duración del Bloque Horario Manual y Compacto */}
                <View style={globalStyles.inputGroup}>
                    <Text style={[globalStyles.label, styles.increasedLabelSpacing]}>Duración de cada Bloque (Minutos) *</Text>
                    <Text style={styles.descriptionHelper}>Ingrese los minutos asignados para cada bloque de atención médica.</Text>
                    
                    <View style={styles.compactInputWrapper}>
                        <TextInput
                            style={styles.durationTimeInput}
                            placeholder="30"
                            placeholderTextColor={colors.disabled}
                            value={duracionMinutos}
                            onChangeText={(text) => setDuracionMinutos(text.replace(/\D/g, ''))} // Solo permite números
                            keyboardType="number-pad"
                            maxLength={3} // Restringido para 2 o 3 dígitos máximo
                        />
                        <Text style={styles.durationUnitText}>minutos</Text>
                    </View>
                </View>

                <View style={[globalStyles.divider, { marginTop: spacing.md, marginBottom: spacing.lg }]} />

                {/* BOTÓN DISPARADOR PRINCIPAL */}
                <View style={globalStyles.bottomSection}>
                    <TouchableOpacity
                        style={[
                            globalStyles.primaryButton,
                            { width: '100%', flexDirection: 'row', justifyContent: 'center' },
                            submitting && globalStyles.primaryButtonDisabled
                        ]}
                        onPress={validarFormulario}
                        disabled={submitting}
                    >
                        {submitting && (
                            <ActivityIndicator size="small" color={colors.darkDGreen} style={{ marginRight: spacing.sm }} />
                        )}
                        <Text style={globalStyles.primaryButtonText}>
                            {submitting ? 'Procesando...' : 'Generar'}
                        </Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            {/* ════ MODAL DETALLE / RESUMEN CON TEXTO GRANDE AMPLIFICADO ════ */}
            <Modal visible={showSummaryModal} animationType="fade" transparent={true} onRequestClose={() => setShowSummaryModal(false)}>
                <View style={globalStyles.modalOverlay}>
                    <View style={[globalStyles.modalContent, { width: '85%' }]}>
                        <Ionicons name="options-outline" size={44} color={colors.lightGreen} style={{ marginBottom: spacing.xs }} />
                        <Text style={globalStyles.modalTitle}>Confirmación de Agenda</Text>
                        <Text style={[styles.descriptionHelper, { textAlign: 'center', marginBottom: spacing.lg, color: colors.lightGreen }]}>
                            Verifica la escala de automatización antes de impactar la base de datos.
                        </Text>

                        <View style={styles.summaryBox}>
                            <Text style={styles.summaryLabel}>Profesional Médico</Text>
                            <Text style={styles.summaryValueLarge}>{selectedVet?.nombreCompleto}</Text>

                            <Text style={styles.summaryLabel}>Período de Bloques</Text>
                            <Text style={styles.summaryValueLarge}>{getNombreMes(mesSeleccionado)} de {anioSistema}</Text>

                            <Text style={styles.summaryLabel}>Intervalo Clínico</Text>
                            <Text style={styles.summaryValueLarge}>Cada {duracionMinutos} minutos continuos</Text>
                        </View>

                        <TouchableOpacity style={[globalStyles.modalButton, { marginBottom: spacing.sm }]} onPress={ejecutarGeneracionBloques}>
                            <Text style={globalStyles.primaryButtonText}>Confirmar y Generar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[globalStyles.modalButton, { backgroundColor: colors.error }]} onPress={() => setShowSummaryModal(false)}>
                            <Text style={[globalStyles.primaryButtonText, { color: colors.white }]}>Cancelar Ajustes</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ════ MODAL SELECTOR DE MESES (AHORA CENTRADO Y SIN FLECHA) ════ */}
            <Modal visible={showMesModal} animationType="slide" transparent={true} onRequestClose={() => setShowMesModal(false)}>
                <View style={globalStyles.modalOverlay}>
                    <View style={[globalStyles.modalContent, { width: '85%', maxHeight: '60%' }]}>
                        <Text style={globalStyles.modalTitle}>Seleccionar Mes</Text>
                        <FlatList
                            data={MESES}
                            keyExtractor={(item) => item.id.toString()}
                            style={{ width: '100%', marginTop: spacing.md, marginBottom: spacing.md }}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalSelectionRow}
                                    onPress={() => {
                                        setMesSeleccionado(item.id);
                                        setShowMesModal(false);
                                    }}
                                >
                                    <Text style={styles.modalSelectionText}>{item.nombre}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity style={[globalStyles.modalButton, { backgroundColor: colors.error }]} onPress={() => setShowMesModal(false)}>
                            <Text style={[globalStyles.primaryButtonText, { color: colors.white, fontSize: 16 }]}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ════ MODAL SELECTOR DE VETERINARIOS ════ */}
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
                                    style={[adminStyles.adminListItem, styles.modalSelectionRowLayout]}
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
                                    <Ionicons name="checkmark-circle-outline" size={22} color={colors.lightGreen} />
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity style={[globalStyles.modalButton, { backgroundColor: colors.error }]} onPress={() => setShowVetModal(false)}>
                            <Text style={[globalStyles.primaryButtonText, { color: colors.white, fontSize: 16 }]}>Cancelar Ventana</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ════ MODAL FINAL DE FEEDBACK (ÉXITO / ERROR) ════ */}
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
        marginBottom: spacing.sm + 4,
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
    readOnlyInput: {
        backgroundColor: 'rgba(251, 239, 186, 0.6)',
        borderColor: 'rgba(65, 100, 40, 0.4)',
        color: 'rgba(0, 27, 13, 0.6)',
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
        marginBottom: spacing.md,
    },
    compactInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    durationTimeInput: {
        backgroundColor: colors.lightYellow,
        borderWidth: 1,
        borderColor: colors.darkGreen,
        borderRadius: 8,
        height: 48,
        width: 90, 
        textAlign: 'center',
        fontFamily: 'Fredoka-Medium',
        fontSize: 16,
        color: colors.darkDGreen,
    },
    durationUnitText: {
        fontFamily: 'Fredoka-Medium',
        fontSize: 15,
        color: colors.lightYellow,
        marginLeft: spacing.md,
    },
    modalSelectionRowLayout: {
        borderBottomColor: 'rgba(158, 181, 125, 0.15)',
        paddingVertical: spacing.md,
    },
    modalSelectionRow: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(158, 181, 125, 0.15)',
    },
    modalSelectionText: {
        fontFamily: 'Fredoka-Medium',
        fontSize: 20, // 👈 Tamaño de letra agrandado
        color: colors.lightYellow,
        textAlign: 'center',
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
        fontSize: 17,
        color: colors.white,
        marginBottom: spacing.md,
    }
});
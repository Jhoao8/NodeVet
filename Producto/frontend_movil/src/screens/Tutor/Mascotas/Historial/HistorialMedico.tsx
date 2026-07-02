import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '@/src/api/axiosInstance';
import { globalStyles } from '@/src/style/GlobalStyle';
import { dashboardStyles } from '@/src/style/DashboardStyle'; 
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';
import DashboardHeader from '@/src/components/DashboardHeader';

// ════════ ESTRUCTURA DE DATOS ENRIQUECIDA ════════
interface RegistroMedico {
    id: number;
    tipo: 'consulta' | 'vacuna' | 'examen' | 'cirugia'; 
    detalle: string; 
    fecha: string;
    hora?: string;
    profesional?: string;
    motivo?: string;
    diagnostico?: string;
    laboratorio?: string;
    lote?: string;
    serie?: string;
    qr?: string;
    fechaResultados?: string;
    resultados?: string;
    observaciones?: string;
    fechaAlta?: string;
}

interface HistorialData {
    ultimaConsulta: RegistroMedico | null;
    ultimaVacuna: RegistroMedico | null;
    ultimoExamen: RegistroMedico | null;
    ultimaCirugia: RegistroMedico | null;
}

interface ConsultaResumenDTO {
    idConsulta: number;
    fecha?: string;
    profesional?: string;
    diagnostico?: string;
    indicacionReceta?: string;
}

export default function HistorialMedicoScreen({ route, navigation }: any) {
    const idMascota = route.params?.idMascota || 1;
    const nombreMascota = route.params?.nombreMascota || 'Mascota sin nombre';

    const [historial, setHistorial] = useState<HistorialData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<RegistroMedico | null>(null);

    // ════════ LÓGICA DE CARGA ════════
    useEffect(() => {
        const fetchHistorial = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/v1/consultas/mascota/${idMascota}`);
                const consultas: ConsultaResumenDTO[] = Array.isArray(response.data) ? response.data : [];

                const parseFecha = (fecha?: string) => {
                    if (!fecha) return 0;
                    const [fechaParte, horaParte = '00:00'] = fecha.split(' ');
                    const [dia, mes, anio] = fechaParte.split('/').map(Number);
                    const [hora, minuto] = horaParte.split(':').map(Number);
                    return new Date(anio, (mes || 1) - 1, dia || 1, hora || 0, minuto || 0).getTime();
                };

                const ultimaConsulta = [...consultas]
                    .sort((a, b) => parseFecha(b.fecha) - parseFecha(a.fecha))[0];

                setHistorial({
                    ultimaConsulta: ultimaConsulta
                        ? {
                            id: ultimaConsulta.idConsulta,
                            tipo: 'consulta',
                            detalle: ultimaConsulta.profesional || 'Profesional no informado',
                            fecha: (() => {
                                const valor = ultimaConsulta.fecha || 'Sin fecha';
                                return valor.includes(' ') ? valor.split(' ')[0] : valor;
                            })(),
                            hora: (() => {
                                const valor = ultimaConsulta.fecha || '';
                                return valor.includes(' ') ? valor.split(' ')[1] : '';
                            })(),
                            profesional: ultimaConsulta.profesional || 'Profesional no informado',
                            motivo: ultimaConsulta.diagnostico || 'Sin diagnóstico registrado',
                            diagnostico: ultimaConsulta.indicacionReceta || 'Sin indicación registrada',
                        }
                        : null,
                    ultimaVacuna: null,
                    ultimoExamen: null,
                    ultimaCirugia: null,
                });
            } catch (error) {
                console.error("Error al cargar el historial:", error);
                setHistorial({
                    ultimaConsulta: null,
                    ultimaVacuna: null,
                    ultimoExamen: null,
                    ultimaCirugia: null,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchHistorial();
    }, [idMascota]);

    // ════════ COMPONENTE REUTILIZABLE ════════
    const SectionBlock = ({ title, data, rutaDestino, disabled }: { title: string, data: RegistroMedico | null, rutaDestino?: string, disabled?: boolean }) => (
        <View style={{ marginBottom: spacing.sm }}>
            <Text style={[globalStyles.listSectionTitle, { marginBottom: spacing.xs }]}>{title}</Text>
            
            <View style={globalStyles.tableRowItem}>
                {data ? (
                    <>
                        <Text style={globalStyles.tableRowTextLeft} numberOfLines={1}>{data.detalle}</Text>
                        <Text style={globalStyles.tableRowTextCenter} numberOfLines={1}>{data.fecha}</Text>
                        <TouchableOpacity 
                            style={globalStyles.tableEyeIcon} 
                            activeOpacity={0.7} 
                            onPress={() => setSelectedItem(data)}
                        >
                            <Ionicons name="eye-outline" size={22} color={colors.darkDGreen} />
                        </TouchableOpacity>
                    </>
                ) : (
                    <Text style={[globalStyles.emptyListText, { flex: 1, marginTop: 0 }]}>Sin datos</Text>
                )}
            </View>

            <View style={[globalStyles.actionButtonsRow, { marginTop: spacing.xs }]}>
                <TouchableOpacity 
                    style={[styles.solidButtonSm, disabled && styles.solidButtonSmDisabled]} 
                    activeOpacity={0.8}
                    disabled={disabled}
                    onPress={() => {
                        if (!disabled && rutaDestino) {
                            navigation.navigate(rutaDestino, { idMascota, nombreMascota });
                        }
                    }}
                >
                    <Text style={styles.solidButtonTextSm}>Ver todo</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    // ════════ RENDER PRINCIPAL ════════
    return (
        <View style={[globalStyles.container, { backgroundColor: colors.lightYellow }]}>
            <View style={globalStyles.innerHeaderRow}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={globalStyles.innerBackButton}>
                    <Ionicons name="chevron-back" size={28} color={colors.lightYellow} />
                </TouchableOpacity>
                <View style={globalStyles.innerHeaderFlex}>
                    <DashboardHeader /> 
                </View>
            </View>

            <ScrollView contentContainerStyle={[globalStyles.scrollContainer, { paddingTop: spacing.md }]} showsVerticalScrollIndicator={false}>
                <View style={dashboardStyles.greetingContainer}>
                    <Text style={[dashboardStyles.greetingText, dashboardStyles.darkText, { textAlign: 'center' }]}>Resumen Historial</Text>
                    <View style={[dashboardStyles.greetingDivider, dashboardStyles.darkDivider]} />
                </View>

                <View style={globalStyles.petTitleContainer}>
                    <Text style={globalStyles.petTitleText}>{nombreMascota}</Text>
                </View>

                {loading ? (
                    <View style={globalStyles.loadingCenterContainer}>
                        <ActivityIndicator size="large" color={colors.darkGreen} />
                        <Text style={globalStyles.loadingMessageText}>Buscando historial...</Text>
                    </View>
                ) : (
                    <View style={{ paddingHorizontal: spacing.xs }}>
                        <SectionBlock title="Última consulta:" data={historial?.ultimaConsulta || null} rutaDestino="Consultas" />
                        <SectionBlock title="Última Vacuna:" data={historial?.ultimaVacuna || null} rutaDestino="Vacunas" disabled={true} />
                        <SectionBlock title="Último exámen:" data={historial?.ultimoExamen || null} rutaDestino="Examenes" disabled={true} />
                        <SectionBlock title="Última cirugía:" data={historial?.ultimaCirugia || null} rutaDestino="Cirugias" disabled={true} />
                    </View>
                )}
            </ScrollView>

            {/* ════════ MODAL DINÁMICO DE DETALLES ════════ */}
            <Modal visible={!!selectedItem} transparent={true} animationType="fade" onRequestClose={() => setSelectedItem(null)}>
                <View style={globalStyles.detailModalOverlay}>
                    <View style={globalStyles.detailModalContainer}>
                        <View style={globalStyles.detailModalHeader}>
                            <Text style={globalStyles.detailModalDate}>
                                {selectedItem?.fecha}{selectedItem?.hora ? `    ${selectedItem.hora}` : ''}
                            </Text>
                            <TouchableOpacity onPress={() => setSelectedItem(null)}>
                                <Ionicons name="close" size={26} color={colors.lightYellow} />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView contentContainerStyle={globalStyles.detailModalBody}>
                            {/* RENDERIZADO CONDICIONAL SEGÚN EL TIPO DE REGISTRO */}
                            
                            {selectedItem?.tipo === 'consulta' && (
                                <>
                                    <View style={globalStyles.detailRow}><Text style={globalStyles.detailLabel}>Profesional:</Text><Text style={globalStyles.detailValue}>{selectedItem.profesional}</Text></View>
                                    <View style={globalStyles.detailTextBlock}><Text style={globalStyles.detailLabel}>Diagnóstico:</Text><Text style={globalStyles.detailParagraph}>{selectedItem.motivo}</Text></View>
                                    <View style={globalStyles.detailTextBlock}><Text style={globalStyles.detailLabel}>Indicaciones:</Text><Text style={globalStyles.detailParagraph}>{selectedItem.diagnostico}</Text></View>
                                </>
                            )}

                            {selectedItem?.tipo === 'vacuna' && (
                                <>
                                    <View style={globalStyles.detailRow}><Text style={globalStyles.detailLabel}>Vacuna:</Text><Text style={globalStyles.detailValue}>{selectedItem.detalle}</Text></View>
                                    <View style={globalStyles.detailRow}><Text style={globalStyles.detailLabel}>Laboratorio:</Text><Text style={globalStyles.detailValue}>{selectedItem.laboratorio}</Text></View>
                                    <View style={globalStyles.detailRow}><Text style={globalStyles.detailLabel}>Lote:</Text><Text style={globalStyles.detailValue}>{selectedItem.lote}</Text></View>
                                    <View style={[globalStyles.detailRow, { marginTop: spacing.md }]}><Text style={globalStyles.detailLabel}>Serie:</Text><Text style={globalStyles.detailValue}>{selectedItem.serie}</Text></View>
                                    <View style={[globalStyles.detailRow, { marginTop: spacing.md }]}><Text style={globalStyles.detailLabel}>QR*:</Text><Text style={globalStyles.detailValue}>{selectedItem.qr}</Text></View>
                                </>
                            )}

                            {selectedItem?.tipo === 'examen' && (
                                <>
                                    <View style={globalStyles.detailRow}><Text style={globalStyles.detailLabel}>Exámen:</Text><Text style={globalStyles.detailValue}>{selectedItem.detalle}</Text></View>
                                    <View style={globalStyles.detailRow}><Text style={globalStyles.detailLabel}>Fecha resultados:</Text><Text style={globalStyles.detailValue}>{selectedItem.fechaResultados}</Text></View>
                                    <View style={globalStyles.detailRow}><Text style={globalStyles.detailLabel}>Resultados:</Text><Text style={globalStyles.detailValue}>{selectedItem.resultados}</Text></View>
                                    <View style={globalStyles.detailTextBlock}><Text style={globalStyles.detailLabel}>Observaciones:</Text><Text style={globalStyles.detailParagraph}>{selectedItem.observaciones}</Text></View>
                                </>
                            )}

                            {selectedItem?.tipo === 'cirugia' && (
                                <>
                                    <View style={globalStyles.detailRow}><Text style={globalStyles.detailLabel}>Lugar:</Text><Text style={globalStyles.detailValue}>{selectedItem.detalle}</Text></View>
                                    <View style={globalStyles.detailRow}><Text style={globalStyles.detailLabel}>Fecha de alta:</Text><Text style={globalStyles.detailValue}>{selectedItem.fechaAlta}</Text></View>
                                    <View style={globalStyles.detailRow}><Text style={globalStyles.detailLabel}>Profesional:</Text><Text style={globalStyles.detailValue}>{selectedItem.profesional}</Text></View>
                                    <View style={globalStyles.detailTextBlock}><Text style={globalStyles.detailLabel}>Motivo:</Text><Text style={globalStyles.detailParagraph}>{selectedItem.motivo}</Text></View>
                                    <View style={globalStyles.detailTextBlock}><Text style={globalStyles.detailLabel}>Observaciones:</Text><Text style={globalStyles.detailParagraph}>{selectedItem.observaciones}</Text></View>
                                </>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    solidButtonSm: {
        backgroundColor: colors.darkGreen,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: spacing.md,
        elevation: 2, 
        shadowColor: colors.black, 
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
    },
    solidButtonTextSm: {
        fontFamily: typography.family.main.semiBold,
        fontSize: typography.size.sm,
        color: colors.lightYellow,
    },
    solidButtonSmDisabled: {
        opacity: 0.45,
    }
});
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
                setTimeout(() => {
                    setHistorial({
                        ultimaConsulta: { id: 101, tipo: 'consulta', detalle: 'Clínica Vet Central', fecha: '10/05/2026', profesional: 'Dr. Roberto Sánchez', motivo: 'Letargo y vómitos nocturnos.', diagnostico: 'Gastritis aguda leve. Reposo y dieta.' },
                        ultimaVacuna: { id: 205, tipo: 'vacuna', detalle: 'Antirrábica', fecha: '15/01/2026', laboratorio: 'Zoetis', lote: 'A-10293', serie: '001-92', qr: 'Generado' },
                        ultimoExamen: { id: 302, tipo: 'examen', detalle: 'Perfil Bioquímico', fecha: '20/11/2025', fechaResultados: '21/11/2025', resultados: '(Imágenes por definir)', observaciones: 'Parámetros normales.' },
                        // AHORA SÍ TIENE DATOS LA CIRUGÍA 👇
                        ultimaCirugia: { id: 401, tipo: 'cirugia', detalle: 'Pabellón Central', fecha: '05/04/2026', fechaAlta: '06/04/2026', profesional: 'Dra. Ana Gómez', motivo: 'Ovariohisterectomía (Esterilización)', observaciones: 'Procedimiento sin complicaciones. Reposo y uso de collar isabelino.' }
                    });
                    setLoading(false);
                }, 800);
            } catch (error) {
                console.error("Error al cargar el historial:", error);
                setLoading(false);
            }
        };

        fetchHistorial();
    }, [idMascota]);

    // ════════ COMPONENTE REUTILIZABLE ════════
    const SectionBlock = ({ title, data, rutaDestino }: { title: string, data: RegistroMedico | null, rutaDestino?: string }) => (
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
                    <Text style={[globalStyles.emptyListText, { flex: 1, marginTop: 0 }]}>Sin registro reciente</Text>
                )}
            </View>

            <View style={[globalStyles.actionButtonsRow, { marginTop: spacing.xs }]}>
                <TouchableOpacity 
                    style={styles.solidButtonSm} 
                    activeOpacity={0.8}
                    onPress={() => {
                        if (rutaDestino) {
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
                        <SectionBlock title="Última Vacuna:" data={historial?.ultimaVacuna || null} rutaDestino="Vacunas" />
                        <SectionBlock title="Último exámen:" data={historial?.ultimoExamen || null} rutaDestino="Examenes" />
                        <SectionBlock title="Última cirugía:" data={historial?.ultimaCirugia || null} rutaDestino="Cirugias" />
                    </View>
                )}
            </ScrollView>

            {/* ════════ MODAL DINÁMICO DE DETALLES ════════ */}
            <Modal visible={!!selectedItem} transparent={true} animationType="fade" onRequestClose={() => setSelectedItem(null)}>
                <View style={globalStyles.detailModalOverlay}>
                    <View style={globalStyles.detailModalContainer}>
                        <View style={globalStyles.detailModalHeader}>
                            <Text style={globalStyles.detailModalDate}>{selectedItem?.fecha}</Text>
                            <TouchableOpacity onPress={() => setSelectedItem(null)}>
                                <Ionicons name="close" size={26} color={colors.lightYellow} />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView contentContainerStyle={globalStyles.detailModalBody}>
                            {/* RENDERIZADO CONDICIONAL SEGÚN EL TIPO DE REGISTRO */}
                            
                            {selectedItem?.tipo === 'consulta' && (
                                <>
                                    <View style={globalStyles.detailRow}><Text style={globalStyles.detailLabel}>Lugar:</Text><Text style={globalStyles.detailValue}>{selectedItem.detalle}</Text></View>
                                    <View style={globalStyles.detailRow}><Text style={globalStyles.detailLabel}>Profesional:</Text><Text style={globalStyles.detailValue}>{selectedItem.profesional}</Text></View>
                                    <View style={globalStyles.detailTextBlock}><Text style={globalStyles.detailLabel}>Motivo:</Text><Text style={globalStyles.detailParagraph}>{selectedItem.motivo}</Text></View>
                                    <View style={globalStyles.detailTextBlock}><Text style={globalStyles.detailLabel}>Diagnóstico:</Text><Text style={globalStyles.detailParagraph}>{selectedItem.diagnostico}</Text></View>
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
    }
});
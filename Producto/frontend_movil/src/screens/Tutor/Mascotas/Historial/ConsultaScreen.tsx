import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '@/src/api/axiosInstance';
import { globalStyles } from '@/src/style/GlobalStyle';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import DashboardHeader from '@/src/components/DashboardHeader';

interface Consulta {
    id: number;
    fecha: string;
    fechaSolo: string;
    hora?: string;
    profesional: string;
    diagnostico: string;
    indicaciones: string;
    notas?: string;
}

export default function ConsultasScreen({ route, navigation }: any) {
    const { idMascota, nombreMascota } = route.params || { idMascota: 1, nombreMascota: 'Mascota' };

    const [consultas, setConsultas] = useState<Consulta[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<Consulta | null>(null);

    useEffect(() => {
        const fetchConsultas = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/v1/consultas/mascota/${idMascota}`);
                const historial = Array.isArray(response.data) ? response.data : [];

                const consultasMapeadas = historial.map((consulta: any) => {
                    const fechaCompleta = String(consulta.fecha || 'Sin fecha');
                    const [fechaSolo, hora = ''] = fechaCompleta.split(' ');

                    return {
                        id: consulta.idConsulta,
                        fecha: fechaCompleta,
                        fechaSolo: fechaSolo || 'Sin fecha',
                        hora,
                        profesional: consulta.profesional || 'Profesional no informado',
                        diagnostico: consulta.diagnostico || 'Sin diagnóstico registrado',
                        indicaciones: consulta.indicacionReceta || 'Sin indicaciones registradas',
                        notas: consulta.notas || '',
                    };
                });

                setConsultas(consultasMapeadas);
            } catch (error) {
                console.error('Error al cargar consultas:', error);
                setConsultas([]);
            } finally {
                setLoading(false);
            }
        };
        fetchConsultas();
    }, [idMascota]);

    const renderItem = ({ item }: { item: Consulta }) => (
        <View style={globalStyles.tableRowItem}>
            <Text style={globalStyles.tableRowTextLeft} numberOfLines={1}>{item.profesional}</Text>
            <Text style={globalStyles.tableRowTextCenter}>{item.fechaSolo}</Text>
            <TouchableOpacity style={globalStyles.tableEyeIcon} activeOpacity={0.7} onPress={() => setSelectedItem(item)}>
                <Ionicons name="eye-outline" size={22} color={colors.darkDGreen} />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[globalStyles.container, { backgroundColor: colors.lightYellow }]}>
            <View style={globalStyles.innerHeaderRow}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={globalStyles.innerBackButton}>
                    <Ionicons name="chevron-back" size={28} color={colors.lightYellow} />
                </TouchableOpacity>
                <View style={globalStyles.innerHeaderFlex}><DashboardHeader /></View>
            </View>

            <View style={[globalStyles.container, { paddingHorizontal: spacing.md, paddingTop: spacing.md, backgroundColor: 'transparent' }]}>
                <View style={globalStyles.petTitleContainer}>
                    <Text style={globalStyles.petTitleText}>{nombreMascota}</Text>
                </View>

                <View style={globalStyles.filterBar}>
                    <Text style={globalStyles.listSectionTitle}>Consultas:</Text>
                    <TouchableOpacity style={globalStyles.filterButton}>
                        <Text style={globalStyles.filterButtonText}>Filtro</Text>
                        <Ionicons name="chevron-down" size={16} color={colors.darkDGreen} />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={globalStyles.loadingCenterContainer}>
                        <ActivityIndicator size="large" color={colors.darkGreen} />
                        <Text style={globalStyles.loadingMessageText}>Cargando consultas...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={consultas}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: spacing.xxl }}
                        ListEmptyComponent={<Text style={globalStyles.emptyListText}>No hay consultas registradas.</Text>}
                    />
                )}
            </View>

            {/* ════════ MODAL DE DETALLES DE CONSULTA ════════ */}
            <Modal visible={!!selectedItem} transparent={true} animationType="fade" onRequestClose={() => setSelectedItem(null)}>
                <View style={globalStyles.detailModalOverlay}>
                    <View style={globalStyles.detailModalContainer}>
                        <View style={globalStyles.detailModalHeader}>
                            <Text style={globalStyles.detailModalDate}>
                                {selectedItem?.fechaSolo}{selectedItem?.hora ? `    ${selectedItem.hora}` : ''}
                            </Text>
                            <TouchableOpacity onPress={() => setSelectedItem(null)}>
                                <Ionicons name="close" size={26} color={colors.lightYellow} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView contentContainerStyle={globalStyles.detailModalBody}>
                            <View style={globalStyles.detailRow}><Text style={globalStyles.detailLabel}>Profesional:</Text><Text style={globalStyles.detailValue}>{selectedItem?.profesional}</Text></View>
                            
                            <View style={globalStyles.detailTextBlock}>
                                <Text style={globalStyles.detailLabel}>Diagnóstico:</Text>
                                <Text style={globalStyles.detailParagraph}>{selectedItem?.diagnostico}</Text>
                            </View>
                            
                            <View style={globalStyles.detailTextBlock}>
                                <Text style={globalStyles.detailLabel}>Indicaciones:</Text>
                                <Text style={globalStyles.detailParagraph}>{selectedItem?.indicaciones}</Text>
                            </View>

                            {selectedItem?.notas ? (
                                <View style={globalStyles.detailTextBlock}>
                                    <Text style={globalStyles.detailLabel}>Notas:</Text>
                                    <Text style={globalStyles.detailParagraph}>{selectedItem.notas}</Text>
                                </View>
                            ) : null}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '@/src/style/GlobalStyle';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import DashboardHeader from '@/src/components/DashboardHeader';

interface Examen { id: number; tipoExamen: string; fechaToma: string; fechaResultados: string; resultados: string; observaciones: string; }

export default function ExamenScreen({ route, navigation }: any) {
    const { idMascota, nombreMascota } = route.params || { idMascota: 1, nombreMascota: 'Mascota' };

    const [examenes, setExamenes] = useState<Examen[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<Examen | null>(null);

    useEffect(() => {
        const fetchExamenes = async () => {
            setLoading(true);
            setTimeout(() => {
                setExamenes([
                    { id: 1, tipoExamen: 'Perfil Bioquímico', fechaToma: '20/11/2025', fechaResultados: '21/11/2025', resultados: '(Imágenes por definir)', observaciones: 'Todos los niveles se encuentran dentro de los rangos normales. Función hepática y renal operando correctamente. No se requieren acciones adicionales.' },
                ]);
                setLoading(false);
            }, 500);
        };
        fetchExamenes();
    }, [idMascota]);

    const renderItem = ({ item }: { item: Examen }) => (
        <View style={globalStyles.tableRowItem}>
            <Text style={globalStyles.tableRowTextLeft} numberOfLines={1}>{item.tipoExamen}</Text>
            <Text style={globalStyles.tableRowTextCenter}>{item.fechaToma}</Text>
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
                    <Text style={globalStyles.listSectionTitle}>Exámenes:</Text>
                    <TouchableOpacity style={globalStyles.filterButton}>
                        <Text style={globalStyles.filterButtonText}>Filtro</Text>
                        <Ionicons name="chevron-down" size={16} color={colors.darkDGreen} />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={globalStyles.loadingCenterContainer}>
                        <ActivityIndicator size="large" color={colors.darkGreen} />
                        <Text style={globalStyles.loadingMessageText}>Cargando exámenes...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={examenes}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: spacing.xxl }}
                        ListEmptyComponent={<Text style={globalStyles.emptyListText}>No hay exámenes registrados.</Text>}
                    />
                )}
            </View>

            {/* ════════ MODAL DE DETALLES DE EXÁMEN ════════ */}
            <Modal visible={!!selectedItem} transparent={true} animationType="fade" onRequestClose={() => setSelectedItem(null)}>
                <View style={globalStyles.detailModalOverlay}>
                    <View style={globalStyles.detailModalContainer}>
                        <View style={globalStyles.detailModalHeader}>
                            <Text style={globalStyles.detailModalDate}>{selectedItem?.fechaToma}</Text>
                            <TouchableOpacity onPress={() => setSelectedItem(null)}>
                                <Ionicons name="close" size={26} color={colors.lightYellow} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView contentContainerStyle={globalStyles.detailModalBody}>
                            <View style={globalStyles.detailRow}><Text style={globalStyles.detailLabel}>Tipo de exámen:</Text><Text style={globalStyles.detailValue}>{selectedItem?.tipoExamen}</Text></View>
                            <View style={globalStyles.detailRow}><Text style={globalStyles.detailLabel}>Fecha de toma:</Text><Text style={globalStyles.detailValue}>{selectedItem?.fechaToma}</Text></View>
                            <View style={globalStyles.detailRow}><Text style={globalStyles.detailLabel}>Fecha resultados:</Text><Text style={globalStyles.detailValue}>{selectedItem?.fechaResultados}</Text></View>
                            <View style={globalStyles.detailRow}><Text style={globalStyles.detailLabel}>Resultados:</Text><Text style={globalStyles.detailValue}>{selectedItem?.resultados}</Text></View>
                            
                            <View style={globalStyles.detailTextBlock}>
                                <Text style={globalStyles.detailLabel}>Observaciones:</Text>
                                <Text style={globalStyles.detailParagraph}>{selectedItem?.observaciones}</Text>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
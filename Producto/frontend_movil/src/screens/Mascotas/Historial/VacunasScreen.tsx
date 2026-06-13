import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '@/src/style/GlobalStyle';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import DashboardHeader from '@/src/components/DashboardHeader';

interface Vacuna { id: number; nombre: string; fecha: string; laboratorio: string; lote: string; serie: string; qr: string; }

export default function VacunaScreen({ route, navigation }: any) {
    const { idMascota, nombreMascota } = route.params || { idMascota: 1, nombreMascota: 'Mascota' };

    const [vacunas, setVacunas] = useState<Vacuna[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<Vacuna | null>(null);

    useEffect(() => {
        const fetchVacunas = async () => {
            setLoading(true);
            setTimeout(() => {
                setVacunas([
                    { id: 1, nombre: 'Antirrábica', fecha: '15/01/2026', laboratorio: 'Zoetis', lote: 'A-10293', serie: '001-92', qr: 'Generado' },
                    { id: 2, nombre: 'Séxtuple', fecha: '10/01/2025', laboratorio: 'MSD Animal Health', lote: 'B-9921', serie: '002-11', qr: 'Generado' },
                ]);
                setLoading(false);
            }, 500);
        };
        fetchVacunas();
    }, [idMascota]);

    const renderItem = ({ item }: { item: Vacuna }) => (
        <View style={globalStyles.tableRowItem}>
            <Text style={globalStyles.tableRowTextLeft} numberOfLines={1}>{item.nombre}</Text>
            <Text style={globalStyles.tableRowTextCenter}>{item.fecha}</Text>
            {/* 👇 Al presionar el ojito, abrimos el modal pasándole el item 👇 */}
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
                    <Text style={globalStyles.listSectionTitle}>Vacunas:</Text>
                    <TouchableOpacity style={globalStyles.filterButton}>
                        <Text style={globalStyles.filterButtonText}>Filtro</Text>
                        <Ionicons name="chevron-down" size={16} color={colors.darkDGreen} />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={globalStyles.loadingCenterContainer}>
                        <ActivityIndicator size="large" color={colors.darkGreen} />
                        <Text style={globalStyles.loadingMessageText}>Cargando vacunas...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={vacunas}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: spacing.xxl }}
                        ListEmptyComponent={<Text style={globalStyles.emptyListText}>No hay vacunas registradas.</Text>}
                    />
                )}
            </View>

            {/* ════════ MODAL DE DETALLES DE VACUNA ════════ */}
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
                            <View style={globalStyles.detailRow}><Text style={globalStyles.detailLabel}>Nombre de la vacuna:</Text><Text style={globalStyles.detailValue}>{selectedItem?.nombre}</Text></View>
                            <View style={globalStyles.detailRow}><Text style={globalStyles.detailLabel}>Fecha de aplicación:</Text><Text style={globalStyles.detailValue}>{selectedItem?.fecha}</Text></View>
                            <View style={globalStyles.detailRow}><Text style={globalStyles.detailLabel}>Laboratorio:</Text><Text style={globalStyles.detailValue}>{selectedItem?.laboratorio}</Text></View>
                            <View style={globalStyles.detailRow}><Text style={globalStyles.detailLabel}>Lote:</Text><Text style={globalStyles.detailValue}>{selectedItem?.lote}</Text></View>
                            <View style={[globalStyles.detailRow, { marginTop: spacing.md }]}><Text style={globalStyles.detailLabel}>Serie:</Text><Text style={globalStyles.detailValue}>{selectedItem?.serie}</Text></View>
                            <View style={[globalStyles.detailRow, { marginTop: spacing.md }]}><Text style={globalStyles.detailLabel}>QR*:</Text><Text style={globalStyles.detailValue}>{selectedItem?.qr}</Text></View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
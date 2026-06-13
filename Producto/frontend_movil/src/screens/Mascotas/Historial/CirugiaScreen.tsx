import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '@/src/style/GlobalStyle';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import DashboardHeader from '@/src/components/DashboardHeader';

interface Cirugia { id: number; lugar: string; fechaOperacion: string; fechaAlta: string; profesional: string; motivo: string; observaciones: string; }

export default function CirugiaScreen({ route, navigation }: any) {
    const { idMascota, nombreMascota } = route.params || { idMascota: 1, nombreMascota: 'Mascota' };

    const [cirugias, setCirugias] = useState<Cirugia[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<Cirugia | null>(null);

    useEffect(() => {
        const fetchCirugias = async () => {
            setLoading(true);
            setTimeout(() => {
                setCirugias([
                    { id: 1, lugar: 'Hospital Vet Sur', fechaOperacion: '14/03/2024', fechaAlta: '16/03/2024', profesional: 'Dra. María Fernández', motivo: 'Esterilización preventiva electiva. El paciente se encuentra en edad óptima para el procedimiento. Exámenes prequirúrgicos dentro de los parámetros normales.', observaciones: 'Cirugía exitosa sin complicaciones. Se administraron analgésicos y antibióticos. El paciente debe guardar reposo estricto por 7 días y utilizar collar isabelino. Retirar puntos en 10 días.' },
                ]);
                setLoading(false);
            }, 500);
        };
        fetchCirugias();
    }, [idMascota]);

    const renderItem = ({ item }: { item: Cirugia }) => (
        <View style={globalStyles.tableRowItem}>
            <Text style={globalStyles.tableRowTextLeft} numberOfLines={1}>{item.lugar}</Text>
            <Text style={globalStyles.tableRowTextCenter}>{item.fechaOperacion}</Text>
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
                    <Text style={globalStyles.listSectionTitle}>Operaciones:</Text>
                    <TouchableOpacity style={globalStyles.filterButton}>
                        <Text style={globalStyles.filterButtonText}>Filtro</Text>
                        <Ionicons name="chevron-down" size={16} color={colors.darkDGreen} />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={globalStyles.loadingCenterContainer}>
                        <ActivityIndicator size="large" color={colors.darkGreen} />
                        <Text style={globalStyles.loadingMessageText}>Cargando operaciones...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={cirugias}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: spacing.xxl }}
                        ListEmptyComponent={<Text style={globalStyles.emptyListText}>No hay operaciones registradas.</Text>}
                    />
                )}
            </View>

            {/* ════════ MODAL DE DETALLES DE CIRUGÍA ════════ */}
            <Modal visible={!!selectedItem} transparent={true} animationType="fade" onRequestClose={() => setSelectedItem(null)}>
                <View style={globalStyles.detailModalOverlay}>
                    <View style={globalStyles.detailModalContainer}>
                        <View style={globalStyles.detailModalHeader}>
                            <Text style={globalStyles.detailModalDate}>{selectedItem?.fechaOperacion}</Text>
                            <TouchableOpacity onPress={() => setSelectedItem(null)}>
                                <Ionicons name="close" size={26} color={colors.lightYellow} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView contentContainerStyle={globalStyles.detailModalBody}>
                            <View style={globalStyles.detailRow}><Text style={globalStyles.detailLabel}>Lugar:</Text><Text style={globalStyles.detailValue}>{selectedItem?.lugar}</Text></View>
                            <View style={globalStyles.detailRow}><Text style={globalStyles.detailLabel}>Fecha de operación:</Text><Text style={globalStyles.detailValue}>{selectedItem?.fechaOperacion}</Text></View>
                            <View style={globalStyles.detailRow}><Text style={globalStyles.detailLabel}>Fecha de alta:</Text><Text style={globalStyles.detailValue}>{selectedItem?.fechaAlta}</Text></View>
                            <View style={globalStyles.detailRow}><Text style={globalStyles.detailLabel}>Profesional que realiza la operación:</Text><Text style={globalStyles.detailValue}>{selectedItem?.profesional}</Text></View>
                            
                            <View style={globalStyles.detailTextBlock}>
                                <Text style={globalStyles.detailLabel}>Motivo:</Text>
                                <Text style={globalStyles.detailParagraph}>{selectedItem?.motivo}</Text>
                            </View>
                            
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
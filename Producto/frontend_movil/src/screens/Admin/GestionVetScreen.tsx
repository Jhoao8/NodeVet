import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import api from '@/src/api/axiosInstance';

import { globalStyles } from '@/src/style/GlobalStyle';
import { dashboardStyles } from '@/src/style/DashboardStyle';
import { adminStyles } from '@/src/style/AdminStyle';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import DashboardHeader from '@/src/components/DashboardHeader';

// ════ TIPOS según los DTOs del backend ════
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
    runVet: number;
    dvVet: string;
    especialidades: EspecialidadDTO[];
    estadoUsr: number;
}

export default function GestionVetScreen() {
    const navigation = useNavigation<any>();
    const [searchQuery, setSearchQuery] = useState('');
    const [vets, setVets] = useState<VeterinarioDTO[]>([]);
    const [loading, setLoading] = useState(true);

    // ════ LÓGICA DE CARGA DESDE BD ════
    const fetchVeterinarios = async () => {
        try {
            setLoading(true);
            const response = await api.get('/v1/veterinarios');
            setVets(response.data);
        } catch (error) {
            console.error("Error al cargar veterinarios:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchVeterinarios();
        }, [])
    );

    // ════ HELPERS ════
    const formatEspecialidades = (especialidades: EspecialidadDTO[]): string => {
        if (!especialidades || especialidades.length === 0) return 'Sin especialidad';
        return especialidades.map(e => e.nombre).join(', ');
    };

    const getIniciales = (nombreCompleto: string): string => {
        if (!nombreCompleto) return '?';
        const partes = nombreCompleto.trim().split(' ');
        if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
        return (partes[0].charAt(0) + partes[1].charAt(0)).toUpperCase();
    };

    // ════ LÓGICA DE BÚSQUEDA ════
    const filteredVets = vets.filter(vet => {
        const nombre = vet.nombreCompleto?.toLowerCase() || '';
        const especialidades = formatEspecialidades(vet.especialidades).toLowerCase();
        const query = searchQuery.toLowerCase();
        return nombre.includes(query) || especialidades.includes(query);
    });

    const renderVetItem = ({ item, index }: { item: VeterinarioDTO, index: number }) => (
        <TouchableOpacity
            style={[adminStyles.adminListItem, index === filteredVets.length - 1 && adminStyles.adminListItemNoBorder]}
            onPress={() => navigation.navigate('DetalleVet', { vet: item })}
        >
            <View style={adminStyles.adminItemAvatar}>
                <Text style={{ color: colors.darkDGreen, fontWeight: 'bold' }}>
                    {getIniciales(item.nombreCompleto)}
                </Text>
            </View>

            <View style={adminStyles.adminItemInfo}>
                <Text style={adminStyles.adminItemTitle}>{item.nombreCompleto}</Text>
                <Text style={adminStyles.adminItemSub}>{formatEspecialidades(item.especialidades)}</Text>
            </View>

            <View style={[adminStyles.badgeContainer, item.estadoUsr === 1 ? adminStyles.badgeActive : adminStyles.badgeInactive]}>
                <Text style={item.estadoUsr === 1 ? adminStyles.badgeTextActive : adminStyles.badgeTextInactive}>
                    {item.estadoUsr === 1 ? 'Activo' : 'Inactivo'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[globalStyles.container, dashboardStyles.lightBackground]}>
            <DashboardHeader />

            <View style={{ flex: 1, paddingHorizontal: spacing.xl }}>

                <View style={[globalStyles.sectionHeaderRow, { marginTop: spacing.md }]}>
                    <View style={globalStyles.sectionTitleLeft}>
                        <FontAwesome5 name="user-md" size={18} color={colors.darkGreen} />
                        <Text style={[globalStyles.sectionTitle, dashboardStyles.darkText]}>Gestión de Veterinarios</Text>
                    </View>
                </View>

                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={colors.darkGreen} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar por nombre o especialidad..."
                        placeholderTextColor={colors.darkGreen}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={colors.darkGreen} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={[adminStyles.adminListCard, { flex: 1, marginBottom: 100, marginTop: spacing.md }]}>
                    {loading ? (
                        <ActivityIndicator size="large" color={colors.darkGreen} style={{ marginTop: 20 }} />
                    ) : (
                        <FlatList
                            data={filteredVets}
                            keyExtractor={item => item.idUsuario.toString()}
                            renderItem={renderVetItem}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <Ionicons name="medkit-outline" size={48} color={colors.lightGreen} />
                                    <Text style={styles.emptyText}>No se encontraron resultados.</Text>
                                </View>
                            }
                        />
                    )}
                </View>
            </View>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('CrearVet')}
            >
                <Ionicons name="add" size={32} color={colors.lightYellow} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 12,
        paddingHorizontal: spacing.md,
        marginTop: spacing.sm,
        borderWidth: 1,
        borderColor: colors.lightGreen,
        height: 48,
    },
    searchIcon: {
        marginRight: spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontFamily: 'Fredoka-Regular',
        fontSize: 14,
        color: colors.darkDGreen,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontFamily: 'Fredoka-Regular',
        color: colors.darkGreen,
        marginTop: spacing.md,
    },
    fab: {
        position: 'absolute',
        bottom: spacing.xl,
        right: spacing.xl,
        backgroundColor: colors.darkDGreen,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.darkDGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    }
});
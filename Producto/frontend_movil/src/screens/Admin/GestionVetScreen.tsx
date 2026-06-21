import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { globalStyles } from '@/src/style/GlobalStyle';
import { dashboardStyles } from '@/src/style/DashboardStyle';
import { adminStyles } from '@/src/style/AdminStyle';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';

import DashboardHeader from '@/src/components/DashboardHeader';

// ════ MOCK DE DATOS ════
const mockVets = [
    { id: '1', nombre: 'Carlos', apellidos: 'Pérez Silva', especialidad: 'Medicina General', activo: true, correo: 'caperezs@nodevet.com' },
    { id: '2', nombre: 'Ana', apellidos: 'Gómez Rojas', especialidad: 'Cardiología', activo: true, correo: 'angomezr@nodevet.com' },
    { id: '3', nombre: 'Luis', apellidos: 'Martínez Soto', especialidad: 'Cirugía', activo: false, correo: 'lumartinezs@nodevet.com' },
    { id: '4', nombre: 'María', apellidos: 'López Vega', especialidad: 'Dermatología', activo: true, correo: 'malopezv@nodevet.com' },
];

export default function GestionVetScreen() {
    const navigation = useNavigation<any>();
    const [searchQuery, setSearchQuery] = useState('');
    const [vets, setVets] = useState(mockVets);

    // ════ LÓGICA DE BÚSQUEDA ════
    const filteredVets = vets.filter(vet => {
        const fullName = `${vet.nombre} ${vet.apellidos}`.toLowerCase();
        const specialty = vet.especialidad.toLowerCase();
        const query = searchQuery.toLowerCase();
        return fullName.includes(query) || specialty.includes(query);
    });

    // ════ RENDERIZADO USANDO TUS ADMIN STYLES ════
    const renderVetItem = ({ item, index }: { item: any, index: number }) => (
        <TouchableOpacity 
            style={[adminStyles.adminListItem, index === filteredVets.length - 1 && adminStyles.adminListItemNoBorder]}
            onPress={() => navigation.navigate('DetalleVet', { vet: item })}
        >
            <View style={adminStyles.adminItemAvatar}>
                <Text style={{ color: colors.darkDGreen, fontWeight: 'bold' }}>
                    {item.nombre.charAt(0)}{item.apellidos.charAt(0)}
                </Text>
            </View>
            
            <View style={adminStyles.adminItemInfo}>
                <Text style={adminStyles.adminItemTitle}>{item.nombre} {item.apellidos}</Text>
                <Text style={adminStyles.adminItemSub}>{item.especialidad}</Text>
            </View>

            <View style={[adminStyles.badgeContainer, item.activo ? adminStyles.badgeActive : adminStyles.badgeInactive]}>
                <Text style={item.activo ? adminStyles.badgeTextActive : adminStyles.badgeTextInactive}>
                    {item.activo ? 'Activo' : 'Inactivo'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[globalStyles.container, dashboardStyles.lightBackground]}>
            {/* Cabecera oficial */}
            <DashboardHeader />

            <View style={{ flex: 1, paddingHorizontal: spacing.xl }}>
                
                {/* Título de Sección y Buscador */}
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

                {/* Lista encapsulada en la tarjeta de Admin */}
                <View style={[adminStyles.adminListCard, { flex: 1, marginBottom: 100, marginTop: spacing.md }]}>
                    <FlatList
                        data={filteredVets}
                        keyExtractor={item => item.id}
                        renderItem={renderVetItem}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="medkit-outline" size={48} color={colors.lightGreen} />
                                <Text style={styles.emptyText}>No se encontraron resultados.</Text>
                            </View>
                        }
                    />
                </View>
            </View>

            {/* Botón Flotante (FAB) adaptado a tu estética */}
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
        backgroundColor: colors.darkDGreen, // Color principal oscuro
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
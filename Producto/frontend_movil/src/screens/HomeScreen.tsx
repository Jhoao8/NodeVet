import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    SafeAreaView,
    StatusBar,
    ScrollView,
    Image
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { globalStyles } from '../style/GlobalStyle'; // <-- Ajusta la ruta

const HomeScreen = () => {
    // Variable para el nombre del dueño (Próximamente vendrá del Backend / Contexto / AsyncStorage)
    const [userName, setUserName] = useState('[Nombre del Dueño]');

    return (
        <SafeAreaView style={globalStyles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.darkDGreen} />
            
            {/* Cabecera (Ajustada para Dashboard, no usamos la global porque es muy grande) */}
            <View style={styles.topBar}>
                <View style={styles.topBarLeft}>
                    <View style={styles.miniLogoPlaceholder}>
                        <Image 
                            source={require('../../assets/images/Logo.png')} 
                            style={globalStyles.logo}
                            resizeMode="contain" 
                        />
                    </View>
                    <Text style={styles.topBarTitle}>NodeVet</Text>
                </View>
                <TouchableOpacity>
                    <Ionicons name="notifications-outline" size={28} color={colors.lightYellow} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={globalStyles.scrollContainer} showsVerticalScrollIndicator={false}>
                
                {/* Saludo dinámico */}
                <Text style={styles.greetingText}>Bienvenido, {userName}</Text>
                
                {/* Reutilizamos el divider del globalStyle */}
                <View style={globalStyles.divider} />

                {/* ─── SECCIÓN: PRÓXIMAS CITAS ─── */}
                <View style={globalStyles.sectionHeaderRow}>
                    <View style={globalStyles.sectionTitleLeft}>
                        <Ionicons name="calendar-outline" size={24} color={colors.lightYellow} />
                        <Text style={globalStyles.sectionTitle}>Próximas citas:</Text>
                    </View>
                </View>

                <View style={globalStyles.card}>
                    <Text style={globalStyles.cardEmptyText}>Sin citas registradas</Text>
                </View>
                
                <View style={globalStyles.actionButtonsRow}>
                    <TouchableOpacity style={globalStyles.outlineButtonSm}>
                        <Text style={globalStyles.outlineButtonTextSm}>Agendar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={globalStyles.outlineButtonSm}>
                        <Text style={globalStyles.outlineButtonTextSm}>Ver Citas</Text>
                    </TouchableOpacity>
                </View>

                {/* ─── SECCIÓN: MIS MASCOTAS ─── */}
                <View style={globalStyles.sectionHeaderRow}>
                    <View style={globalStyles.sectionTitleLeft}>
                        <Ionicons name="paw-outline" size={24} color={colors.lightYellow} />
                        <Text style={globalStyles.sectionTitle}>Mis mascotas</Text>
                    </View>
                    <Text style={globalStyles.sectionSubtitle}>Últ. chequeo</Text>
                </View>

                <View style={globalStyles.card}>
                    {/* Mascota 1 */}
                    <View style={styles.petRow}>
                        <View style={styles.petInfoLeft}>
                            <MaterialCommunityIcons name="dog" size={28} color={colors.lightYellow} />
                            <Text style={styles.petName}>Max</Text>
                            <MaterialCommunityIcons name="gender-male" size={20} color={colors.lightYellow} />
                        </View>
                        <Text style={styles.petDate}>12/04/2023</Text>
                    </View>
                    
                    <View style={styles.innerDivider} />

                    {/* Mascota 2 */}
                    <View style={styles.petRow}>
                        <View style={styles.petInfoLeft}>
                            <MaterialCommunityIcons name="cat" size={28} color={colors.lightYellow} />
                            <Text style={styles.petName}>Luna</Text>
                            <MaterialCommunityIcons name="gender-female" size={20} color={colors.lightYellow} />
                        </View>
                        <Text style={styles.petDate}>05/11/2023</Text>
                    </View>
                </View>

                <View style={globalStyles.actionButtonsRow}>
                    <TouchableOpacity style={globalStyles.outlineButtonSm}>
                        <Text style={globalStyles.outlineButtonTextSm}>Ver todos</Text>
                    </TouchableOpacity>
                </View>

                {/* ─── SECCIÓN: ORDENES MÉDICAS ─── */}
                <View style={globalStyles.sectionHeaderRow}>
                    <View style={globalStyles.sectionTitleLeft}>
                        <Ionicons name="document-text-outline" size={24} color={colors.lightYellow} />
                        <Text style={globalStyles.sectionTitle}>Ordenes Médicas</Text>
                    </View>
                </View>

                <View style={[globalStyles.card, { padding: 0 }]}>
                    {/* Header de la Tabla */}
                    <View style={styles.tableHeaderRow}>
                        <Text style={styles.tableHeaderText}>Veterinaria</Text>
                        <Text style={styles.tableHeaderText}>Profesional</Text>
                        <Text style={styles.tableHeaderText}>Tipo</Text>
                        <Text style={styles.tableHeaderText}>Fecha</Text>
                    </View>
                    {/* Fila de Datos */}
                    <View style={styles.tableDataRow}>
                        <Text style={styles.tableDataText} numberOfLines={1}>VetSur</Text>
                        <Text style={styles.tableDataText} numberOfLines={1}>Dr. Soto</Text>
                        <Text style={styles.tableDataText} numberOfLines={1}>Exámen</Text>
                        <Text style={styles.tableDataText}>20/12/23</Text>
                    </View>
                </View>

                <View style={globalStyles.actionButtonsRow}>
                    <TouchableOpacity style={globalStyles.outlineButtonSm}>
                        <Text style={globalStyles.outlineButtonTextSm}>Ver todo</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            {/* ─── BOTTOM TAB BAR ─── */}
            <View style={styles.bottomTabBar}>
                <TouchableOpacity style={styles.tabItem}>
                    <Ionicons name="paw-outline" size={28} color={colors.darkGreen} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}>
                    <Ionicons name="document-text-outline" size={28} color={colors.darkGreen} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}>
                    {/* Home Activo */}
                    <Ionicons name="home" size={32} color={colors.lightYellow} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}>
                    <MaterialCommunityIcons name="calendar-plus" size={28} color={colors.darkGreen} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}>
                    <Ionicons name="person-outline" size={28} color={colors.darkGreen} />
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
};

// ─── Estilos locales para detalles muy específicos del HomeScreen ───
const styles = StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.xxl,
        paddingBottom: spacing.sm,
    },
    topBarLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    miniLogoPlaceholder: {
        width: 35,
        height: 35,
    },
    topBarTitle: {
        fontFamily: typography.family.main.semiBold,
        fontSize: typography.size.lg,
        color: colors.lightYellow,
    },
    greetingText: {
        fontFamily: typography.family.main.bold,
        fontSize: 26,
        color: colors.lightYellow,
        textAlign: 'center',
        marginTop: spacing.md,
    },
    
    // Lista de Mascotas
    petRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.xs,
    },
    petInfoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        flex: 1,
    },
    petName: {
        fontFamily: typography.family.main.semiBold,
        fontSize: typography.size.md,
        color: colors.lightYellow,
    },
    petDate: {
        fontFamily: typography.family.main.regular,
        fontSize: typography.size.sm,
        color: colors.lightYellow,
    },
    innerDivider: {
        height: 1,
        backgroundColor: colors.lightGreen,
        opacity: 0.3,
        marginVertical: spacing.sm,
    },
    
    // Tabla Ordenes Médicas
    tableHeaderRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.darkGreen,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xs,
    },
    tableHeaderText: {
        flex: 1,
        fontFamily: typography.family.main.semiBold,
        fontSize: 12,
        color: colors.darkGreen, // Texto sutil para cabecera
        textAlign: 'center',
    },
    tableDataRow: {
        flexDirection: 'row',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xs,
    },
    tableDataText: {
        flex: 1,
        fontFamily: typography.family.main.regular,
        fontSize: 12,
        color: colors.lightYellow,
        textAlign: 'center',
    },

    // Bottom Navigation Bar
    bottomTabBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: colors.darkDGreen, // Fondo oscuro
        borderTopWidth: 1,
        borderTopColor: colors.darkGreen,
        paddingVertical: spacing.md,
        paddingBottom: 25, 
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
    }
});

export default HomeScreen;
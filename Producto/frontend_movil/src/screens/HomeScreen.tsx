import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    StatusBar,
    ScrollView,
    Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { globalStyles } from '../style/GlobalStyle'; // IMPORTANTE: Agregado esto
import { useAuth } from '../context/AuthContext';

const HomeScreen = () => {
    const { signOut } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut();
            console.log('Sesión cerrada correctamente');
        } catch (e) {
            console.error("Error al cerrar sesión", e);
        }
    };

    return (
        <SafeAreaView style={styles.mainContainer}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Cabecera */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.welcomeLabel}>Panel de Control</Text>
                        <Text style={styles.brandTitle}>NodeVet</Text>
                    </View>
                    {/* Agregué el botón de logout que faltaba en tu código */}
                    <TouchableOpacity onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={28} color={colors.red} />
                    </TouchableOpacity>
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

                {/* SECCIÓN: MIS MASCOTAS */}
                <View style={globalStyles.sectionHeaderRow}>
                    <View style={globalStyles.sectionTitleLeft}>
                        <Ionicons name="paw-outline" size={24} color={colors.lightYellow} />
                        <Text style={globalStyles.sectionTitle}>Mis mascotas</Text>
                    </View>
                    <View style={styles.statusTextContainer}>
                        <Text style={styles.statusTitle}>Servidor Backend</Text>
                        <Text style={styles.statusSubtitle}>
                            IP: {process.env.EXPO_PUBLIC_DEVELOPER_IP || 'Conectado'}
                        </Text>
                    </View>
                    <View style={styles.activeDot} />
                </View>

                <Text style={styles.sectionHeading}>Gestión Médica</Text>
                
                <View style={styles.grid}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => alert('Navegando a Mascotas...')}>
                        <View style={[styles.iconBox, { backgroundColor: colors.lightGreen }]}>
                            <Ionicons name="paw" size={28} color={colors.darkDGreen} />
                        </View>
                        <Text style={styles.petDate}>05/11/2023</Text>
                    </TouchableOpacity>
                </View>

                <View style={globalStyles.actionButtonsRow}>
                    <TouchableOpacity style={globalStyles.outlineButtonSm}>
                        <Text style={globalStyles.outlineButtonTextSm}>Ver todos</Text>
                    </TouchableOpacity>
                </View>

                {/* SECCIÓN: ORDENES MÉDICAS */}
                <View style={globalStyles.sectionHeaderRow}>
                    <View style={globalStyles.sectionTitleLeft}>
                        <Ionicons name="document-text-outline" size={24} color={colors.lightYellow} />
                        <Text style={globalStyles.sectionTitle}>Ordenes Médicas</Text>
                    </View>
                </View>

                <View style={[globalStyles.card, { padding: 0 }]}>
                    <View style={styles.tableHeaderRow}>
                        <Text style={styles.tableHeaderText}>Veterinaria</Text>
                        <Text style={styles.tableHeaderText}>Profesional</Text>
                        <Text style={styles.tableHeaderText}>Tipo</Text>
                        <Text style={styles.tableHeaderText}>Fecha</Text>
                    </View>
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

                {/* Banner de Soporte */}
                <TouchableOpacity style={styles.supportBanner}>
                    <Ionicons name="help-buoy-outline" size={22} color={colors.white} />
                    <Text style={styles.supportText}>¿Necesitas ayuda técnica?</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.white,
    },
    scrollContainer: {
        padding: spacing.md,
        paddingBottom: spacing.xxl,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xl,
        paddingBottom: spacing.sm,
    },
    welcomeLabel: {
        fontFamily: typography.family.main.medium,
        fontSize: typography.size.sm,
        color: colors.lightGreen,
    },
    brandTitle: {
        fontFamily: typography.family.main.bold,
        fontSize: 24,
        color: colors.darkDGreen,
    },
    statusTextContainer: {
        flex: 1,
        marginLeft: 10,
    },
    statusTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.darkGreen,
    },
    statusSubtitle: {
        fontSize: 10,
        color: colors.darkGreen,
    },
    activeDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#4CAF50',
    },
    sectionHeading: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    grid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    menuItem: {
        width: '47%',
        backgroundColor: '#F9FBF9',
        padding: spacing.md,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    iconBox: {
        padding: 10,
        borderRadius: 10,
        marginBottom: 5,
    },
    petDate: {
        fontSize: 12,
        color: colors.darkGreen,
    },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    tableHeaderText: {
        flex: 1,
        fontWeight: 'bold',
        fontSize: 12,
        textAlign: 'center',
    },
    tableDataRow: {
        flexDirection: 'row',
        padding: 10,
    },
    tableDataText: {
        flex: 1,
        fontSize: 12,
        textAlign: 'center',
    },
    supportBanner: {
        flexDirection: 'row',
        backgroundColor: colors.darkGreen,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    supportText: {
        color: colors.white,
        marginLeft: 10,
        fontWeight: 'bold',
    }
});

export default HomeScreen;
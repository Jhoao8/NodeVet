import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    SafeAreaView,
    StatusBar,
    ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const HomeScreen = () => {
    const navigation = useNavigation<any>();

    const handleLogout = () => {
        // En una integración real, aquí limpiarías el storage (JWT/Sesión)
        navigation.replace('Login'); 
    };

    return (
        <SafeAreaView style={styles.mainContainer}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Cabecera */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.welcomeLabel}>Panel de Control</Text>
                        <Text style={styles.brandTitle}>NodeVet</Text>
                    </View>
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutCircle}>
                        <Ionicons name="power" size={24} color={colors.red} />
                    </TouchableOpacity>
                </View>

                {/* Card de Estado de Conexión */}
                <View style={styles.statusCard}>
                    <View style={styles.statusIconContainer}>
                        <Ionicons name="server-outline" size={30} color={colors.darkGreen} />
                    </View>
                    <View style={styles.statusTextContainer}>
                        <Text style={styles.statusTitle}>Servidor Backend</Text>
                        <Text style={styles.statusSubtitle}>
                            IP: {process.env.EXPO_PUBLIC_DEVELOPER_IP || 'No definida'}
                        </Text>
                    </View>
                    <View style={styles.activeDot} />
                </View>

                {/* Sección de Acciones Rápidas */}
                <Text style={styles.sectionHeading}>Gestión Médica</Text>
                
                <View style={styles.grid}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => alert('Próximamente')}>
                        <View style={[styles.iconBox, { backgroundColor: colors.lightGreen }]}>
                            <Ionicons name="paw" size={28} color={colors.darkDGreen} />
                        </View>
                        <Text style={styles.menuLabel}>Mascotas</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => alert('Próximamente')}>
                        <View style={[styles.iconBox, { backgroundColor: colors.lightYellow }]}>
                            <Ionicons name="calendar" size={28} color={colors.lightBrown} />
                        </View>
                        <Text style={styles.menuLabel}>Citas</Text>
                    </TouchableOpacity>
                </View>

                {/* Sugerencia "Wildcard": Botón de Soporte Rápido */}
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
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.xxl,
        marginBottom: spacing.lg,
    },
    welcomeLabel: {
        fontFamily: typography.family.main.medium,
        fontSize: typography.size.sm,
        color: colors.lightGreen,
        textTransform: 'uppercase',
    },
    brandTitle: {
        fontFamily: typography.family.main.bold,
        fontSize: typography.size.xxl,
        color: colors.darkDGreen,
    },
    logoutCircle: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#FFF0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: spacing.md,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.lightYellow,
        marginBottom: spacing.xl,
        // Sombra suave para elevación
        elevation: 3,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statusIconContainer: {
        padding: spacing.sm,
        backgroundColor: colors.lightYellow,
        borderRadius: 12,
    },
    statusTextContainer: {
        flex: 1,
        marginLeft: spacing.md,
    },
    statusTitle: {
        fontFamily: typography.family.main.semiBold,
        fontSize: typography.size.md,
        color: colors.darkGreen,
    },
    statusSubtitle: {
        fontFamily: typography.family.main.regular,
        fontSize: typography.size.xs,
        color: colors.lightBrown,
    },
    activeDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.green,
    },
    sectionHeading: {
        fontFamily: typography.family.main.bold,
        fontSize: typography.size.lg,
        color: colors.darkDGreen,
        marginBottom: spacing.md,
    },
    grid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
    },
    menuItem: {
        width: '47%',
        backgroundColor: '#F9FBF9',
        padding: spacing.md,
        borderRadius: 20,
        alignItems: 'center',
    },
    iconBox: {
        width: 60,
        height: 60,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    menuLabel: {
        fontFamily: typography.family.main.medium,
        fontSize: typography.size.md,
        color: colors.darkGreen,
    },
    supportBanner: {
        backgroundColor: colors.darkGreen,
        flexDirection: 'row',
        padding: spacing.md,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.md,
    },
    supportText: {
        fontFamily: typography.family.main.medium,
        fontSize: typography.size.md,
        color: colors.white,
        marginLeft: spacing.sm,
    }
});

export default HomeScreen;
import React, { useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity 
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { globalStyles } from '@/src/style/GlobalStyle';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import DashboardHeader from '@/src/components/DashboardHeader';
import { useAuth } from '@/src/context/AuthContext'; 

export default function VetHomeScreen() {
    const navigation = useNavigation<any>();
    
    const { userData, fetchUserData } = useAuth(); 

    // Nos aseguramos de tener los datos del perfil cargados
    useEffect(() => {
        if (!userData) {
            fetchUserData();
        }
    }, [userData]);

    // Extraemos el nombre o usamos un valor por defecto
    const doctorName = userData?.nombreCompleto || 'Veterinario';

    return (
        <View style={[globalStyles.container, { backgroundColor: colors.darkDGreen }]}>
            {/* Header principal sin botón de retroceso por ser pantalla de inicio */}
            <DashboardHeader />

            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
            >
                {/* ════ SECCIÓN DE BIENVENIDA ════ */}
                <View style={styles.welcomeSection}>
                    <Text style={styles.greetingText}>Hola, Dr(a).</Text>
                    <Text style={styles.nameText}>{doctorName}</Text>
                    <Text style={styles.subtitleText}>¿Qué tenemos para hoy?</Text>
                </View>

                {/* ════ PANEL DE RESUMEN (ESTADÍSTICAS DEL DÍA) ════ */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <View style={styles.statIconWrapper}>
                            <Ionicons name="calendar" size={24} color={colors.darkDGreen} />
                        </View>
                        <Text style={styles.statNumber}>0</Text>
                        <Text style={styles.statLabel}>Citas Hoy</Text>
                    </View>

                    <View style={styles.statBox}>
                        <View style={styles.statIconWrapper}>
                            <Ionicons name="checkmark-done-circle" size={24} color={colors.darkDGreen} />
                        </View>
                        <Text style={styles.statNumber}>0</Text>
                        <Text style={styles.statLabel}>Atendidos</Text>
                    </View>
                </View>

                {/* ════ ACCIONES RÁPIDAS ════ */}
                <Text style={styles.sectionHeader}>Acciones Rápidas</Text>

                <View style={styles.actionsGrid}>
                    <TouchableOpacity 
                        style={styles.actionCard}
                        onPress={() => console.log('Navegar a Agenda')}
                    >
                        <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(251, 239, 186, 0.15)' }]}>
                            <Ionicons name="calendar-outline" size={28} color={colors.lightYellow} />
                        </View>
                        <Text style={styles.actionCardTitle}>Mi Agenda</Text>
                        <Text style={styles.actionCardDesc}>Revisa tus bloques y disponibilidad.</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.actionCard}
                        onPress={() => console.log('Navegar a Pacientes')}
                    >
                        <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(158, 181, 125, 0.15)' }]}>
                            <FontAwesome5 name="paw" size={24} color={colors.lightGreen} />
                        </View>
                        <Text style={styles.actionCardTitle}>Pacientes</Text>
                        <Text style={styles.actionCardDesc}>Busca fichas e historiales médicos.</Text>
                    </TouchableOpacity>
                </View>

                {/* ════ PRÓXIMA CITA (PLACEHOLDER) ════ */}
                <Text style={styles.sectionHeader}>Próxima Atención</Text>
                
                <View style={styles.nextAppointmentCard}>
                    <Ionicons name="time-outline" size={40} color={colors.lightGreen} style={{ opacity: 0.5 }} />
                    <Text style={styles.emptyMainText}>Sin citas agendadas</Text>
                    <Text style={styles.emptySubText}>
                        No tienes pacientes programados en los próximos bloques de tu jornada.
                    </Text>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xxl * 2,
        paddingTop: spacing.md,
    },
    welcomeSection: {
        marginBottom: spacing.xl,
    },
    greetingText: {
        fontFamily: 'Fredoka-Medium',
        fontSize: 18,
        color: colors.lightGreen,
    },
    nameText: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 28,
        color: colors.lightYellow,
        marginBottom: 4,
    },
    subtitleText: {
        fontFamily: 'Fredoka-Regular',
        fontSize: 15,
        color: colors.white,
        opacity: 0.8,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
        gap: spacing.md,
    },
    statBox: {
        flex: 1,
        backgroundColor: colors.lightYellow,
        borderRadius: 16,
        padding: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.darkGreen,
    },
    statIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(65, 100, 40, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    statNumber: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 26,
        color: colors.darkDGreen,
    },
    statLabel: {
        fontFamily: 'Fredoka-Medium',
        fontSize: 13,
        color: colors.darkGreen,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sectionHeader: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 18,
        color: colors.lightYellow,
        marginBottom: spacing.md,
        marginTop: spacing.sm,
    },
    actionsGrid: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    actionCard: {
        flex: 1,
        backgroundColor: 'rgba(251, 239, 186, 0.05)',
        borderRadius: 16,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(158, 181, 125, 0.3)',
    },
    actionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    actionCardTitle: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 16,
        color: colors.white,
        marginBottom: spacing.xs,
    },
    actionCardDesc: {
        fontFamily: 'Fredoka-Regular',
        fontSize: 12,
        color: colors.lightGreen,
        lineHeight: 16,
    },
    nextAppointmentCard: {
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        borderRadius: 16,
        padding: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(158, 181, 125, 0.2)',
        borderStyle: 'dashed',
    },
    emptyMainText: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 17,
        color: colors.lightYellow,
        marginTop: spacing.md,
        marginBottom: 4,
    },
    emptySubText: {
        fontFamily: 'Fredoka-Regular',
        fontSize: 14,
        color: colors.lightGreen,
        textAlign: 'center',
        paddingHorizontal: spacing.md,
        lineHeight: 20,
    }
});
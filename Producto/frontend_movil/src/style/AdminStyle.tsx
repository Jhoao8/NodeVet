import { StyleSheet, Platform } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const adminStyles = StyleSheet.create({
    // ════ GRID DE MÉTRICAS ════
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: spacing.xl,
    },
    metricCard: {
        width: '48%', // Dos columnas
        backgroundColor: colors.lightYellow,
        borderRadius: 12,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.lightGreen,
        ...Platform.select({
            ios: { shadowColor: colors.darkGreen, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
            android: { elevation: 2 },
        }),
    },
    metricHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    metricValue: {
        fontFamily: typography.family.main.bold,
        fontSize: 24,
        color: colors.darkDGreen,
    },
    metricLabel: {
        fontFamily: typography.family.main.medium,
        fontSize: 12,
        color: colors.darkGreen,
    },

    // ════ LISTAS ADMINISTRATIVAS ════
    adminListCard: {
        backgroundColor: colors.lightYellow,
        borderRadius: 12,
        padding: spacing.sm,
        borderWidth: 1,
        borderColor: colors.lightGreen,
        marginBottom: spacing.md,
    },
    adminListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(56, 102, 65, 0.1)', // Línea muy sutil
    },
    adminListItemNoBorder: {
        borderBottomWidth: 0,
    },
    adminItemAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.lightGreen,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    adminItemInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    adminItemTitle: {
        fontFamily: typography.family.main.bold,
        fontSize: 15,
        color: colors.darkDGreen,
    },
    adminItemSub: {
        fontFamily: typography.family.main.regular,
        fontSize: 13,
        color: colors.darkGreen,
    },

    // ════ BADGES (ESTADOS) ════
    badgeContainer: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeActive: {
        backgroundColor: 'rgba(56, 102, 65, 0.15)', // Verde claro
    },
    badgeInactive: {
        backgroundColor: 'rgba(231, 76, 60, 0.15)', // Rojo claro
    },
    badgeTextActive: {
        fontFamily: typography.family.main.bold,
        fontSize: 10,
        color: colors.darkDGreen,
        textTransform: 'uppercase',
    },
    badgeTextInactive: {
        fontFamily: typography.family.main.bold,
        fontSize: 10,
        color: '#c0392b', // Rojo oscuro
        textTransform: 'uppercase',
    },

    // ════ ALERTAS (AUDITORÍA) ════
    alertItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0', // Tono advertencia muy suave que combina con tu amarillo
        padding: spacing.md,
        borderRadius: 8,
        marginBottom: spacing.sm,
        borderLeftWidth: 4,
        borderLeftColor: '#E67E22', // Naranja/Warning
    },
    alertTextContainer: {
        marginLeft: spacing.sm,
        flex: 1,
    },
    alertMessage: {
        fontFamily: typography.family.main.medium,
        fontSize: 13,
        color: '#D35400',
    },
    alertTime: {
        fontFamily: typography.family.main.regular,
        fontSize: 11,
        color: '#E67E22',
        marginTop: 2,
    }
});
import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const dashboardStyles = StyleSheet.create({
// ─── Contenedores Principales ──────────────────────────────────────────────
mainContainer: {
    flex: 1,
    backgroundColor: colors.white, // Fondo claro para el dashboard
},
scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
},

// ─── Header Principal (Top) ────────────────────────────────────────────────
headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
},
headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
},
logoPlaceholder: {
    width: 40,
    height: 40,
},
logo: {
    width: '100%',
    height: '100%',
},
headerTitle: {
    fontFamily: typography.family.main.bold,
    fontSize: typography.size.lg,
    color: colors.darkDGreen,
},

// ─── Saludo ────────────────────────────────────────────────────────────────
greetingText: {
    fontFamily: typography.family.main.medium,
    fontSize: 22,
    color: colors.darkDGreen,
    textAlign: 'center',
    marginTop: spacing.md,
},
greetingDivider: {
    height: 1,
    backgroundColor: colors.darkGreen,
    opacity: 0.3,
    marginVertical: spacing.md,
    marginHorizontal: spacing.xl,
},

// ─── Títulos de Sección ────────────────────────────────────────────────────
sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
},
sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
},
sectionTitle: {
    fontFamily: typography.family.main.bold,
    fontSize: 20,
    color: colors.darkDGreen,
},
sectionSubtitle: {
    fontFamily: typography.family.main.medium,
    fontSize: typography.size.sm,
    color: '#8A9A8A', // Gris verdoso claro
},

// ─── Tarjetas (Cards) ──────────────────────────────────────────────────────
card: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.darkGreen,
    borderRadius: 8,
    padding: spacing.md,
},
emptyCardText: {
    fontFamily: typography.family.main.regular,
    fontSize: typography.size.md,
    color: '#B0C0B0', // Texto grisáceo para estados vacíos
    textAlign: 'center',
    paddingVertical: spacing.sm,
},

// ─── Botones de Acción (Pequeños, delineados) ──────────────────────────────
actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
},
outlineButton: {
    borderWidth: 1.5,
    borderColor: colors.darkDGreen,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
},
outlineButtonText: {
    fontFamily: typography.family.main.semiBold,
    fontSize: typography.size.sm,
    color: colors.darkDGreen,
},

// ─── Mockup del Bottom Tab Bar ─────────────────────────────────────────────
bottomTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E0EAE0',
    paddingVertical: spacing.md,
    paddingBottom: 25, // Ajuste para área segura en iOS
},
tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
}
});
import { StyleSheet, Platform } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const dashboardStyles = StyleSheet.create({
    
// ════════ HEADER DEL DASHBOARD ════════
header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 60 : 40, 
    paddingBottom: spacing.lg,
    backgroundColor: colors.darkDGreen,
},
headerLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
},
headerLogo: {
    width: 35,
    height: 35,
},
headerTitle: {
    fontFamily: typography.family.main.bold,
    fontSize: 24,
    color: colors.lightYellow,
},
bellIcon: {
    padding: spacing.xs,
},

// ════════ SALUDO (GREETING) ════════
greetingContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
},
greetingText: {
    fontFamily: typography.family.main.semiBold,
    fontSize: typography.size.xl, 
    color: colors.lightYellow,
    textAlign: 'center',
    marginBottom: spacing.sm,
},
greetingDivider: {
    height: 1,
    backgroundColor: colors.lightGreen,
    width: '100%',
    opacity: 0.5,
},

// ════════ TARJETAS VACÍAS (EMPTY STATES) ════════
emptyCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm, 
},

// ════════ BARRA DE NAVEGACIÓN (FOOTER) ════════
bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.darkDGreen,
    borderTopWidth: 1,
    borderTopColor: colors.lightGreen,
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 30 : spacing.md, 
},
navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
},

// ════════ FONDOS Y TEXTOS (TEMA CLARO INVERTIDO) ════════
lightBackground: {
    backgroundColor: colors.lightYellow, 
},
darkText: {
    color: colors.darkDGreen, 
    marginBottom: 0, 
},
darkSubText: {
    color: colors.darkGreen, 
    fontWeight: '500', 
},
darkDivider: {
    backgroundColor: colors.darkGreen,
    opacity: 0.3, 
},

// ════════ TARJETAS FLAT (SIN SOMBRAS) ════════
flatCard: {
    backgroundColor: 'transparent', 
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1.5, 
    borderColor: colors.darkGreen,
    alignItems: 'center', 
},

// ════════ BOTONES FLAT (SIN SOMBRAS) ════════
flatFilledButtonSm: {
    backgroundColor: colors.lightGreen, 
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1, 
    borderColor: colors.darkGreen,
},
filledButtonTextSm: {
    fontFamily: typography.family.main.bold, 
    fontSize: typography.size.sm,
    color: colors.darkDGreen, 
}

});
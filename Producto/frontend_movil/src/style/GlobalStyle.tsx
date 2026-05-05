import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors'
import { spacing } from '../theme/spacing'
import { typography } from '../theme/typography'

export const globalStyles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: '#0A2A22', // colors.darkDGreen (reemplaza con tu variable)
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24, // spacing.xl
    paddingTop: 16, // spacing.lg
    paddingBottom: 60,
  },

  // ==============================
  // CABECERA (HEADER)
  // ==============================
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32, // spacing.xxl
    marginTop: 24, // spacing.xl
  },
  headerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16, // spacing.md
  },
  iconButton: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightSpacer: {
    width: 50,
  },
  logoPlaceholder: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },

  // ==============================
  // TIPOGRAFÍA
  // ==============================
  mainTitle: {
    // fontFamily: typography.family.main.bold,
    fontSize: 40,
    color: '#F4D03F', // colors.lightYellow
  },
  sectionTitle: {
    // fontFamily: typography.family.main.semiBold,
    fontSize: 24,
    color: '#F4D03F', // colors.lightYellow
    textAlign: 'center',
    marginBottom: 24, // spacing.xl
  },

  // ==============================
  // FORMULARIOS (INPUTS)
  // ==============================
  inputGroup: {
    marginBottom: 16, // spacing.md
  },
  labelWithIcon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 4, // spacing.xs
  },
  label: {
    // fontFamily: typography.family.main.medium,
    fontSize: 16, // typography.size.md
    color: '#F4D03F', // colors.lightYellow
    marginBottom: 4, // spacing.xs
  },
  input: {
    backgroundColor: '#F4D03F', // colors.lightYellow
    borderWidth: 1,
    borderColor: '#117A65', // colors.darkGreen
    borderRadius: 8,
    paddingHorizontal: 16, // spacing.md
    paddingVertical: 10,
    // fontFamily: typography.family.main.regular,
    fontSize: 16, // typography.size.md
    color: '#0A2A22', // colors.darkDGreen
  },
  
  // Estilos específicos para el input de teléfono
  phoneInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#F4D03F', // colors.lightYellow
    borderWidth: 1,
    borderColor: '#117A65', // colors.darkGreen
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 12, // spacing.sm
  },
  phonePrefix: {
    // fontFamily: typography.family.main.semiBold,
    fontSize: 14, // typography.size.sm
    color: '#0A2A22', // colors.darkDGreen
    marginRight: 4, // spacing.xs
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 10,
    // fontFamily: typography.family.main.regular,
    fontSize: 14, // typography.size.sm
    color: '#0A2A22', // colors.darkDGreen
  },

  // ==============================
  // BOTONES
  // ==============================
  primaryButton: {
    backgroundColor: '#58D68D', // colors.lightGreen
    paddingVertical: 16, // spacing.md
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  primaryButtonText: {
    // fontFamily: typography.family.main.bold,
    color: '#0A2A22', // colors.darkDGreen
    fontSize: 18, // typography.size.lg
  },
});
import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const globalStyles = StyleSheet.create({

//════════════════════════════════════════════//
//                 Containers                 //
//════════════════════════════════════════════//

  /* Contenedor con fondo verde oscuro **/
  container: {
    flex: 1,
    backgroundColor: colors.darkDGreen,
  },

  /* ScrollView interior — permite padding y crecimiento vertical */
  scrollContainer: {
    flexGrow: 1,
    padding: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },

//════════════════════════════════════════════//
//           Header (Logo y título)           //
//════════════════════════════════════════════//

  /* Botón atrás + logo y título + espaciador */
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xxl,
    marginTop: spacing.xl,
  },

  /* Logo + "NodeVet" */
  headerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.darkDGreen,
    paddingBottom: 32, // spacing.xxl
    paddingTop: 24, // spacing.xl
    marginBottom: 20
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

  /* Imagen del logo — ocupa todo el logoPlaceholder */
  logo: {
    width: '100%',
    height: '100%',
  },

  /* Título "NodeVet" en el header */
  mainTitle: {
    fontFamily: typography.family.main.bold,
    fontSize: 40,
    color: colors.lightYellow,
  },

//════════════════════════════════════════════//
//             Botón de retroceso             //
//════════════════════════════════════════════//

  /* Icono chevron-back (Ionicons 32px · lightYellow) */
  backButton: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Espaciador derecho que equilibra el backButton */
  rightSpacer: {
    width: 50,
  },

//════════════════════════════════════════════//
//             Títulos de sección             //
//════════════════════════════════════════════//

  /* Título de formulario / paso ("Iniciar sesión", "Crear cuenta", etc.) */
  sectionTitle: {
    fontFamily: typography.family.main.semiBold,
    fontSize: 24,
    color: colors.lightYellow,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },

//════════════════════════════════════════════//
//                 Formularios                //
//════════════════════════════════════════════//

  /* Agrupación de label + input con separación inferior */
  inputGroup: {
    marginBottom: spacing.lg,
  },

  /* Fila label + icono (ej. mostrar/ocultar contraseña) */
  labelWithIcon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.xs,
  },

  /* Texto de etiqueta de cada campo */
  label: {
    fontFamily: typography.family.main.medium,
    fontSize: typography.size.md,
    color: colors.lightYellow,
    marginBottom: spacing.xs,
  },

  /* Campo de texto */
  input: {
    backgroundColor: colors.lightYellow,
    borderWidth: 1,
    borderColor: colors.darkGreen,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,   // spacing.sm = 8px (antes 10 hardcodeado)
    fontFamily: typography.family.main.regular,
    fontSize: typography.size.md,
    color: colors.darkDGreen,
  },

  /* Contenedor de input de teléfono con prefijo */
  phoneInputContainer: {
    flexDirection: 'row',
    backgroundColor: colors.lightYellow,
    borderWidth: 1,
    borderColor: colors.darkGreen,
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },

  /* Texto del prefijo telefónico (+56) */
  phonePrefix: {
    fontFamily: typography.family.main.semiBold,
    fontSize: typography.size.sm,
    color: colors.darkDGreen,
    marginRight: spacing.xs,
  },

  /* Input de texto específico para el teléfono */
  phoneInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontFamily: typography.family.main.regular,
    fontSize: typography.size.sm,
    color: colors.darkDGreen,
  },

//════════════════════════════════════════════//
//              Botón Principal               //
//════════════════════════════════════════════//

  /* Botón de acción principal (ancho completo — WelcomeScreen / RegisterScreen) */
  primaryButton: {
    backgroundColor: colors.lightGreen,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },

  /* Botón de acción principal centrado con ancho reducido (Login, ForgotPassword, ResetPassword) */
  primaryButtonCentered: {
    backgroundColor: colors.lightGreen,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: 12,
    alignItems: 'center',
    width: '65%',
    elevation: 2,
  },

  /* Texto del botón primario */
  primaryButtonText: {
    fontFamily: typography.family.main.bold,
    color: colors.darkDGreen,
    fontSize: typography.size.lg,
  },

  /* Estilo para botón deshabilitado (opacidad + sin sombra) */
  primaryButtonDisabled: {
    backgroundColor: colors.disabled,
    elevation: 0,
  },

//════════════════════════════════════════════//
//              Botón secundario              //
//════════════════════════════════════════════//

  /* Botón con solo borde, sin fondo */
  secondaryButton: {
    borderWidth: 2,
    borderColor: colors.lightGreen,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },

  /* Texto del botón secundario */
  secondaryButtonText: {
    fontFamily: typography.family.main.semiBold,
    color: colors.lightGreen,
    fontSize: typography.size.md,
  },

//════════════════════════════════════════════//
//            Links de navegación             //
//════════════════════════════════════════════//

  /* Contenedor de enlaces inferiores */
  linksContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },

  /* Enlace de texto simple (ej. "He olvidado mi contraseña") */
  linkText: {
    fontFamily: typography.family.main.regular,
    fontSize: typography.size.sm,
    color: colors.lightGreen,
    textDecorationLine: 'underline',
  },

  /* Enlace destacado (ej. "Crear Cuenta") */
  linkTextBold: {
    fontFamily: typography.family.main.semiBold,
    fontSize: typography.size.md,
    color: colors.lightYellow,
    textDecorationLine: 'underline',
    marginTop: spacing.xs,
  },

//════════════════════════════════════════════//
//                Espaciadores                //
//════════════════════════════════════════════//

  /* Wrapper que centra el botón principal y los enlaces */
  bottomSection: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },

  /* Sección central para formularios (usado en Login, Forgot, Reset) */
  middleSection: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
  },

  /* Fila para dividir inputs en dos columnas (usado en Registro) */
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },

  /* Columna mitad de ancho (usado en Registro) */
  halfColumn: {
    width: '48%',
  },

//════════════════════════════════════════════//
//                   Modal                    //
//════════════════════════════════════════════//

  /* Overlay semitransparente del modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Tarjeta del modal */
  modalContent: {
    width: '80%',
    backgroundColor: colors.darkDGreen,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lightGreen,
    elevation: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  /* Título dentro del modal */
  modalTitle: {
    fontFamily: typography.family.main.bold,
    fontSize: typography.size.lg,
    color: colors.lightYellow,
    marginTop: spacing.md,
    textAlign: 'center',
  },

  /* Mensaje descriptivo del modal */
  modalMessage: {
    fontFamily: typography.family.main.regular,
    fontSize: typography.size.md,
    color: colors.lightYellow,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    textAlign: 'center',
    opacity: 0.9,
  },

  /* Botón de cierre del modal */
  modalButton: {
    backgroundColor: colors.lightGreen,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },

//════════════════════════════════════════════//
//                  Divisor                   //
//════════════════════════════════════════════//

  /* Línea divisora sutil (usado en ForgotPassword entre pasos) */
  divider: {
    height: 1,
    backgroundColor: colors.lightGreen,
    opacity: 0.3,
    marginBottom: spacing.xl,
    marginHorizontal: spacing.lg,
  },

//════════════════════════════════════════════//
//          Componentes de Dashboard          //
//════════════════════════════════════════════//

  /** Fila de título de sección con espacio para subtítulo a la derecha */
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },

  /** Agrupación de Ícono + Título a la izquierda */
  sectionTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  /** Subtítulo grisáceo/verde oscuro para la derecha (ej. "Últ. chequeo") */
  sectionSubtitle: {
    fontFamily: typography.family.main.regular,
    fontSize: typography.size.sm,
    color: colors.darkGreen, 
  },

  /** Tarjeta principal (Fondo oscuro, borde verde claro) */
  card: {
    backgroundColor: 'transparent', // Se funde con el fondo
    borderWidth: 1,
    borderColor: colors.lightGreen,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },

  /** Texto para cuando la tarjeta está vacía */
  cardEmptyText: {
    fontFamily: typography.family.main.regular,
    fontSize: typography.size.md,
    color: colors.lightGreen,
    textAlign: 'center',
    opacity: 0.7,
    paddingVertical: spacing.sm,
  },

  /** Contenedor para alinear los botones pequeños a la derecha */
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginBottom: spacing.xl, // Da espacio antes de la siguiente sección
  },

  /** Botón secundario pequeño (Agendar, Ver Citas, etc.) */
  outlineButtonSm: {
    borderWidth: 1,
    borderColor: colors.lightGreen,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },

  /** Texto del botón secundario pequeño */
  outlineButtonTextSm: {
    fontFamily: typography.family.main.semiBold,
    fontSize: typography.size.sm,
    color: colors.lightGreen,
  },

});
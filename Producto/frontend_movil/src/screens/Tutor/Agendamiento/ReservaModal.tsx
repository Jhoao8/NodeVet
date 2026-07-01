import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { globalStyles } from '../../../style/GlobalStyle';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';

interface ReservaModalsProps {
    step: number; 
    setStep: (step: number) => void;
    selectedPet: any;
    bloqueSeleccionado: any;
    profesionalSeleccionado: any;
    selectedDate: string;
    isProcessingPago: boolean;
    onConfirmPayment: () => void;
}

export default function ReservaModals({
    step,
    setStep,
    selectedPet,
    bloqueSeleccionado,
    profesionalSeleccionado,
    selectedDate,
    isProcessingPago,
    onConfirmPayment
}: ReservaModalsProps) {
    
    if (step === 0) return null;

    const formatearHora = (fechaIso: string) => {
        if (!fechaIso) return '';
        return fechaIso.split('T')[1].substring(0, 5); 
    };

    const formatFechaEsp = (fechaIso: string) => {
        if (!fechaIso) return '';
        const [anio, mes, dia] = fechaIso.split('-');
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return `${dia} de ${meses[parseInt(mes) - 1]} del ${anio}`;
    };

    return (
        <Modal visible={step > 0} transparent={true} animationType="slide">
            <View style={globalStyles.detailModalOverlay}>
                <View style={[globalStyles.detailModalContainer, { backgroundColor: colors.white }]}>
                    
                    <View style={globalStyles.detailModalHeader}>
                        <Text style={globalStyles.detailModalDate}>
                            {step === 1 ? 'Resumen de tu Cita' : 'Confirmación de Pago'}
                        </Text>
                        {step === 1 && (
                            <TouchableOpacity onPress={() => setStep(0)}>
                                <Ionicons name="close" size={24} color={colors.lightYellow} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={globalStyles.detailModalBody}>
                        {/* ════════ PASO 1: RESUMEN DE CITA ════════ */}
                        {step === 1 && (
                            <>
                                <View style={styles.resumenContainer}>
                                    
                                    <View style={styles.infoBlock}>
                                        <View style={styles.labelRow}>
                                            <Ionicons name="paw" size={14} color={colors.darkGreen} />
                                            <Text style={styles.infoLabel}>Paciente:</Text>
                                        </View>
                                        <Text style={styles.infoValue}>{selectedPet?.nomMascota}</Text>
                                    </View>
                                    
                                    <View style={styles.infoBlock}>
                                        <View style={styles.labelRow}>
                                            <FontAwesome5 name="user-md" size={13} color={colors.darkGreen} />
                                            <Text style={styles.infoLabel}>Profesional:</Text>
                                        </View>
                                        <Text style={styles.infoValue}>{profesionalSeleccionado?.nombreCompleto}</Text>
                                    </View>

                                    <View style={styles.infoBlock}>
                                        <View style={styles.labelRow}>
                                            <Ionicons name="calendar" size={14} color={colors.darkGreen} />
                                            <Text style={styles.infoLabel}>Fecha:</Text>
                                        </View>
                                        <Text style={styles.infoValue}>{formatFechaEsp(selectedDate)}</Text>
                                    </View>

                                    <View style={[styles.infoBlock, { marginBottom: 0 }]}>
                                        <View style={styles.labelRow}>
                                            <Ionicons name="time" size={14} color={colors.darkGreen} />
                                            <Text style={styles.infoLabel}>Hora:</Text>
                                        </View>
                                        <Text style={styles.infoValue}>{formatearHora(bloqueSeleccionado?.fecHrInicio || '')} hrs</Text>
                                    </View>
                                </View>

                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity 
                                        style={styles.confirmButton} 
                                        onPress={() => setStep(2)}
                                    >
                                        <Text style={styles.confirmButtonText}>Confirmar</Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity 
                                        style={styles.cancelButton} 
                                        onPress={() => setStep(0)} 
                                    >
                                        <Text style={styles.cancelButtonText}>Cancelar reserva</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}

                        {/* ════════ PASO 2: CONFIRMACIÓN / PAGO ════════ */}
                        {step === 2 && (
                            <>
                                <View style={styles.iconCenter}>
                                    <Ionicons name="card" size={50} color={colors.darkGreen} />
                                </View>
                                
                                <Text style={styles.paymentExplanation}>
                                    Al confirmar, si el pago obligatorio está activo serás redirigido de forma segura a la pasarela de pago Flow.
                                </Text>

                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity 
                                        style={[styles.confirmButton, isProcessingPago && { opacity: 0.7 }]} 
                                        onPress={onConfirmPayment}
                                        disabled={isProcessingPago}
                                    >
                                        {isProcessingPago ? (
                                            <ActivityIndicator color={colors.lightYellow} />
                                        ) : (
                                            <Text style={styles.confirmButtonText}>Confirmar reserva</Text>
                                        )}
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity 
                                        onPress={() => setStep(1)} 
                                        style={styles.backButton}
                                        disabled={isProcessingPago}
                                    >
                                        <Text style={styles.backButtonText}>Volver</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    resumenContainer: { 
        backgroundColor: colors.lightYellow, 
        borderRadius: 12, 
        padding: spacing.lg, 
        marginBottom: spacing.xl, 
        borderWidth: 1, 
        borderColor: colors.lightBrown 
    },
    
    // Jerarquía de texto paso 1
    infoBlock: {
        marginBottom: spacing.md,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    infoLabel: {
        fontFamily: typography.family.main.medium,
        fontSize: 12, 
        color: colors.darkGreen,
        marginLeft: spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoValue: {
        fontFamily: typography.family.main.bold,
        fontSize: 20, 
        color: colors.darkDGreen,
        marginLeft: 20, 
    },

    // Estilos de explicación Paso 2 (Destacada)
    paymentExplanation: {
        fontFamily: typography.family.main.semiBold,
        fontSize: 16,
        color: colors.darkDGreen,
        textAlign: 'center',
        marginBottom: spacing.xl,
        paddingHorizontal: spacing.sm,
        lineHeight: 24, // Mejora la legibilidad
    },

    // Botones (compartidos y específicos)
    buttonContainer: {
        alignItems: 'center', 
        gap: spacing.md,
        width: '100%',
    },
    confirmButton: {
        backgroundColor: colors.darkGreen,
        paddingVertical: spacing.md,
        borderRadius: 8,
        width: '75%', 
        alignItems: 'center',
        elevation: 2, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    confirmButtonText: {
        fontFamily: typography.family.main.bold,
        fontSize: typography.size.md,
        color: colors.lightYellow,
    },
    cancelButton: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.red || '#e74c3c', 
        paddingVertical: spacing.md,
        borderRadius: 8,
        width: '75%', 
        alignItems: 'center',
    },
    cancelButtonText: {
        fontFamily: typography.family.main.bold,
        fontSize: typography.size.md,
        color: colors.red || '#e74c3c', 
    },
    backButton: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.darkGreen, 
        paddingVertical: spacing.md,
        borderRadius: 8,
        width: '75%', 
        alignItems: 'center',
    },
    backButtonText: {
        fontFamily: typography.family.main.bold,
        fontSize: typography.size.md,
        color: colors.darkGreen, 
    },

    iconCenter: { 
        alignItems: 'center', 
        marginBottom: spacing.md 
    }
});
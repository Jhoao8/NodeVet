import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import api from '@/src/api/axiosInstance';
import { globalStyles } from '@/src/style/GlobalStyle';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import DashboardHeader from '@/src/components/DashboardHeader';

export default function RegistrarConsultaScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { idReserva } = route.params;
    const asistio = route.params?.asistio ?? true;

    const [diagnostico, setDiagnostico] = useState('');
    const [receta, setReceta] = useState('');
    const [notas, setNotas] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [feedbackModal, setFeedbackModal] = useState({ visible: false, title: '', message: '', isSuccess: false });

    const handleGuardarConsulta = async () => {
        if (!diagnostico.trim() || !receta.trim()) {
            showFeedback('Campos Obligatorios', 'Por favor, complete al menos el diagnóstico y la receta médica.', false);
            return;
        }

        try {
            setSubmitting(true);
            await api.post('/v1/consultas', {
                idReserva,
                asistio,
                diagnostico,
                indicacionReceta: receta,
                notas
            });
            showFeedback('Ficha Clínica Guardada', 'La consulta médica ha sido guardada de forma exitosa en el historial del paciente.', true);
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const backendMessage = String(error.response?.data?.error || error.response?.data?.mensaje || '').trim();
                showFeedback('Error de Registro', backendMessage || 'Ocurrió un problema al subir los datos al servidor.', false);
                return;
            }

            showFeedback('Error de Registro', 'Ocurrió un problema al subir los datos al servidor.', false);
        } finally {
            setSubmitting(false);
        }
    };

    const showFeedback = (title: string, message: string, isSuccess: boolean) => {
        setFeedbackModal({ visible: true, title, message, isSuccess });
    };

    return (
        <View style={[globalStyles.container, { backgroundColor: colors.darkDGreen }]}>
            <DashboardHeader showBackButton onBackPress={() => navigation.goBack()} />
            <ScrollView contentContainerStyle={styles.scrollWrapper} showsVerticalScrollIndicator={false}>
                <View style={styles.titleWrapper}>
                    <Text style={[globalStyles.sectionTitle, { color: colors.lightYellow }]}>Registrar Atención Médica</Text>
                </View>

                <View style={globalStyles.inputGroup}>
                    <Text style={[globalStyles.label, styles.increasedLabelSpacing]}>Diagnóstico Clínico *</Text>
                    <TextInput style={[globalStyles.input, styles.textArea]} multiline numberOfLines={4} value={diagnostico} onChangeText={setDiagnostico} placeholder="Ingrese la patología u observaciones del examen físico..." placeholderTextColor={colors.disabled} />
                </View>

                <View style={globalStyles.inputGroup}>
                    <Text style={[globalStyles.label, styles.increasedLabelSpacing]}>Indicación de Receta *</Text>
                    <TextInput style={[globalStyles.input, styles.textArea]} multiline numberOfLines={4} value={receta} onChangeText={setReceta} placeholder="Medicamentos, posología, dosis y duración del tratamiento..." placeholderTextColor={colors.disabled} />
                </View>

                <View style={globalStyles.inputGroup}>
                    <Text style={[globalStyles.label, styles.increasedLabelSpacing]}>Notas Adicionales / Privadas</Text>
                    <TextInput style={[globalStyles.input, styles.textArea]} multiline numberOfLines={3} value={notas} onChangeText={setNotas} placeholder="Comentarios internos del box médico..." placeholderTextColor={colors.disabled} />
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleGuardarConsulta} disabled={submitting}>
                    {submitting ? <ActivityIndicator color={colors.darkDGreen} /> : <Text style={styles.submitButtonText}>Finalizar Consulta Médica</Text>}
                </TouchableOpacity>
            </ScrollView>

            <Modal visible={feedbackModal.visible} transparent animationType="fade">
                <View style={globalStyles.modalOverlay}>
                    <View style={globalStyles.modalContent}>
                        <Ionicons name={feedbackModal.isSuccess ? "checkmark-circle" : "close-circle"} size={54} color={feedbackModal.isSuccess ? colors.green : colors.error} />
                        <Text style={globalStyles.modalTitle}>{feedbackModal.title}</Text>
                        <Text style={globalStyles.modalMessage}>{feedbackModal.message}</Text>
                        <TouchableOpacity style={globalStyles.modalButton} onPress={() => { setFeedbackModal(prev => ({ ...prev, visible: false })); if(feedbackModal.isSuccess) navigation.goBack(); }}>
                            <Text style={globalStyles.primaryButtonText}>Entendido</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    scrollWrapper: { paddingHorizontal: spacing.xl, paddingBottom: 60 },
    titleWrapper: { alignItems: 'center', marginBottom: spacing.md },
    increasedLabelSpacing: { marginBottom: spacing.xs + 2 },
    textArea: { height: 100, textAlignVertical: 'top', paddingTop: spacing.sm, backgroundColor: colors.lightYellow },
    submitButton: { backgroundColor: colors.lightGreen, borderRadius: 12, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.lg, width: '100%' },
    submitButtonText: { fontFamily: 'Fredoka-Bold', fontSize: 16, color: colors.darkDGreen }
});
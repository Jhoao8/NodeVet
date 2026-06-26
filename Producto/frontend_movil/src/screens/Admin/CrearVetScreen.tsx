import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, KeyboardAvoidingView, Platform, SafeAreaView,
    ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '@/src/api/axiosInstance';
import { globalStyles } from '@/src/style/GlobalStyle';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';

// ════ TIPOS ════
interface EspecialidadDTO {
    id: number;
    nombre: string;
}

export default function CrearVetScreen() {
    const navigation = useNavigation<any>();

    // ════ ESTADO FORMULARIO ════
    const [nombres, setNombres] = useState('');
    const [apellidoPaterno, setApellidoPaterno] = useState('');
    const [apellidoMaterno, setApellidoMaterno] = useState('');
    const [telefono, setTelefono] = useState('');
    const [runVet, setRunVet] = useState('');
    const [dvVet, setDvVet] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [correoGenerado, setCorreoGenerado] = useState('');
    const [nivelColision, setNivelColision] = useState(0);

    // ════ ESTADO ESPECIALIDADES ════
    // Selección múltiple: guardamos los IDs seleccionados
    const [especialidades, setEspecialidades] = useState<EspecialidadDTO[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [loadingEsp, setLoadingEsp] = useState(true);

    // ════ ESTADO ENVÍO ════
    const [submitting, setSubmitting] = useState(false);

    // ════ CARGA DE ESPECIALIDADES DESDE BD ════
    useEffect(() => {
        const fetchEspecialidades = async () => {
            try {
                const response = await api.get('/v1/especialidades');
                setEspecialidades(response.data);
            } catch (error) {
                Alert.alert('Error', 'No se pudieron cargar las especialidades.');
            } finally {
                setLoadingEsp(false);
            }
        };
        fetchEspecialidades();
    }, []);

    // ════ ALGORITMO GENERADOR DE CORREO INSTITUCIONAL ════
    useEffect(() => {
        if (nombres.length >= 2 && apellidoPaterno.length >= 2) {
            let base = nombres.substring(0, 2).toLowerCase();
            base += apellidoPaterno.toLowerCase().replace(/\s/g, '');

            if (apellidoMaterno.length > 0) {
                const letrasMaterno = Math.min(1 + nivelColision, apellidoMaterno.length);
                base += apellidoMaterno.substring(0, letrasMaterno).toLowerCase();
            } else if (nivelColision > 0) {
                base += nivelColision;
            }

            const cleanBase = base.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
            setCorreoGenerado(`${cleanBase}@nodevet.com`);
        } else {
            setCorreoGenerado('');
        }
    }, [nombres, apellidoPaterno, apellidoMaterno, nivelColision]);

    // ════ TOGGLE SELECCIÓN DE ESPECIALIDAD ════
    const toggleEspecialidad = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    // ════ VALIDACIÓN ════
    const isValid =
        nombres.length >= 2 &&
        apellidoPaterno.length >= 2 &&
        telefono.length >= 8 &&
        runVet.length >= 7 &&
        dvVet.length === 1 &&
        selectedIds.length > 0 &&
        password.length >= 8 &&
        password === confirmPassword;

    // ════ ENVÍO AL BACKEND ════
    const handleCrear = async () => {
        if (!isValid || submitting) return;
        setSubmitting(true);
        try {
            await api.post('/v1/veterinarios', {
                nombreUsr: nombres,
                apellidoUsr: `${apellidoPaterno}${apellidoMaterno ? ' ' + apellidoMaterno : ''}`,
                correoUsr: correoGenerado,
                passUsr: password,
                telefonoUsr: telefono,
                fotoUsr: null,
                runVet: parseInt(runVet),
                dvVet: dvVet,
                especialidadesIds: selectedIds,
            });

            Alert.alert(
                '¡Veterinario creado!',
                `La cuenta de ${nombres} ${apellidoPaterno} fue registrada exitosamente.`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error: any) {
            const status = error?.response?.status;
            if (status === 409) {
                Alert.alert('Error', error.response.data.message || 'El correo o RUN ya está registrado.');
            } else {
                Alert.alert('Error', 'No se pudo crear el veterinario. Intenta nuevamente.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.darkDGreen }}>
            <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#F5F7F5' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

                {/* ════ CABECERA ════ */}
                <View style={styles.customHeader}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={26} color={colors.lightYellow} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Nuevo Veterinario</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* ════ DATOS PERSONALES ════ */}
                    <Text style={globalStyles.sectionTitle}>Datos Personales</Text>

                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.label}>Nombres *</Text>
                        <TextInput style={globalStyles.input} value={nombres} onChangeText={setNombres} placeholder="Ej. Juan Andrés" placeholderTextColor={colors.darkGreen} />
                    </View>

                    <View style={{ flexDirection: 'row', gap: spacing.md }}>
                        <View style={[globalStyles.inputGroup, { flex: 1 }]}>
                            <Text style={globalStyles.label}>Ap. Paterno *</Text>
                            <TextInput style={globalStyles.input} value={apellidoPaterno} onChangeText={setApellidoPaterno} placeholder="Ej. Pérez" placeholderTextColor={colors.darkGreen} />
                        </View>
                        <View style={[globalStyles.inputGroup, { flex: 1 }]}>
                            <Text style={globalStyles.label}>Ap. Materno</Text>
                            <TextInput style={globalStyles.input} value={apellidoMaterno} onChangeText={setApellidoMaterno} placeholder="Ej. Soto" placeholderTextColor={colors.darkGreen} />
                        </View>
                    </View>

                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.label}>Teléfono de Contacto *</Text>
                        <TextInput style={globalStyles.input} value={telefono} onChangeText={setTelefono} placeholder="+56 9 1234 5678" keyboardType="phone-pad" placeholderTextColor={colors.darkGreen} />
                    </View>

                    {/* ════ RUN ════ */}
                    <View style={{ flexDirection: 'row', gap: spacing.md }}>
                        <View style={[globalStyles.inputGroup, { flex: 3 }]}>
                            <Text style={globalStyles.label}>RUN (sin dígito) *</Text>
                            <TextInput style={globalStyles.input} value={runVet} onChangeText={setRunVet} placeholder="Ej. 12345678" keyboardType="numeric" placeholderTextColor={colors.darkGreen} maxLength={8} />
                        </View>
                        <View style={[globalStyles.inputGroup, { flex: 1 }]}>
                            <Text style={globalStyles.label}>DV *</Text>
                            <TextInput style={[globalStyles.input, { textAlign: 'center' }]} value={dvVet} onChangeText={t => setDvVet(t.toUpperCase())} placeholder="K" placeholderTextColor={colors.darkGreen} maxLength={1} autoCapitalize="characters" />
                        </View>
                    </View>

                    {/* ════ CORREO INSTITUCIONAL ════ */}
                    <Text style={[globalStyles.sectionTitle, { marginTop: spacing.lg }]}>Cuenta Institucional</Text>

                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.label}>Correo @nodevet.com</Text>
                        <View style={styles.emailMockContainer}>
                            <Ionicons name="mail" size={20} color={colors.darkGreen} style={{ marginRight: 10 }} />
                            <Text style={correoGenerado ? styles.emailTextActive : styles.emailTextInactive}>
                                {correoGenerado || 'El correo se generará automáticamente'}
                            </Text>
                        </View>
                        {correoGenerado && (
                            <TouchableOpacity onPress={() => setNivelColision(prev => prev + 1)}>
                                <Text style={styles.simulateCollisionText}>Simular Colisión de Correo</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* ════ ESPECIALIDADES DESDE BD ════ */}
                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.label}>Especialidades * (puedes elegir varias)</Text>
                        {loadingEsp ? (
                            <ActivityIndicator size="small" color={colors.darkGreen} style={{ marginTop: spacing.sm }} />
                        ) : (
                            <View style={styles.specialtyContainer}>
                                {especialidades.map(esp => (
                                    <TouchableOpacity
                                        key={esp.id}
                                        style={[styles.specialtyChip, selectedIds.includes(esp.id) && styles.specialtyChipActive]}
                                        onPress={() => toggleEspecialidad(esp.id)}
                                    >
                                        <Text style={[styles.specialtyText, selectedIds.includes(esp.id) && styles.specialtyTextActive]}>
                                            {esp.nombre}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* ════ SEGURIDAD ════ */}
                    <Text style={[globalStyles.sectionTitle, { marginTop: spacing.lg }]}>Seguridad</Text>

                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.label}>Contraseña * (mín. 8 caracteres)</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={[globalStyles.input, { flex: 1, marginBottom: 0 }]}
                                value={password} onChangeText={setPassword} secureTextEntry={!showPass} placeholderTextColor={colors.darkGreen}
                            />
                            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeIcon}>
                                <Ionicons name={showPass ? "eye-off" : "eye"} size={22} color={colors.darkGreen} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.label}>Confirmar Contraseña *</Text>
                        <TextInput
                            style={[globalStyles.input, password !== confirmPassword && confirmPassword.length > 0 && { borderColor: '#E74C3C' }]}
                            value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPass} placeholderTextColor={colors.darkGreen}
                        />
                        {password !== confirmPassword && confirmPassword.length > 0 && (
                            <Text style={styles.errorText}>Las contraseñas no coinciden</Text>
                        )}
                    </View>

                    {/* ════ BOTÓN CREAR ════ */}
                    <TouchableOpacity
                        style={[globalStyles.primaryButtonCentered, { marginTop: spacing.xl, opacity: isValid && !submitting ? 1 : 0.5 }]}
                        disabled={!isValid || submitting}
                        onPress={handleCrear}
                    >
                        {submitting
                            ? <ActivityIndicator color={colors.white} />
                            : <Text style={globalStyles.primaryButtonText}>Crear Cuenta Médico</Text>
                        }
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    customHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.darkDGreen,
        paddingVertical: 16,
        paddingHorizontal: spacing.md,
    },
    backBtn: { padding: spacing.xs, width: 40 },
    headerTitle: { fontFamily: 'Fredoka-Bold', fontSize: 20, color: colors.lightYellow },
    scrollContent: { padding: spacing.xl, paddingBottom: 100 },
    emailMockContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', padding: spacing.md, borderRadius: 12, borderWidth: 1, borderColor: colors.lightGreen },
    emailTextActive: { fontFamily: 'Fredoka-Bold', color: colors.darkDGreen, fontSize: 15 },
    emailTextInactive: { fontFamily: 'Fredoka-Regular', color: '#A5D6A7', fontSize: 14, fontStyle: 'italic' },
    simulateCollisionText: { fontFamily: 'Fredoka-Medium', color: '#E67E22', fontSize: 11, marginTop: 6, textAlign: 'right' },
    specialtyContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.sm },
    specialtyChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lightGreen },
    specialtyChipActive: { backgroundColor: colors.darkGreen, borderColor: colors.darkDGreen },
    specialtyText: { fontFamily: 'Fredoka-Medium', fontSize: 13, color: colors.darkGreen },
    specialtyTextActive: { color: colors.white },
    passwordContainer: { flexDirection: 'row', alignItems: 'center' },
    eyeIcon: { position: 'absolute', right: 15 },
    errorText: { fontFamily: 'Fredoka-Regular', color: '#E74C3C', fontSize: 12, marginTop: 4 },
});
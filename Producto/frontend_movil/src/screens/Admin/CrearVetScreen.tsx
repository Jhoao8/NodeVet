import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, KeyboardAvoidingView, Platform, FlatList,
    ActivityIndicator, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '@/src/api/axiosInstance';
import { globalStyles } from '@/src/style/GlobalStyle';
import { dashboardStyles } from '@/src/style/DashboardStyle';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import DashboardHeader from '@/src/components/DashboardHeader'; // <-- Agregado
import { useCustomAlert } from '@/src/components/CustomAlert';

interface EspecialidadDTO {
    id: number;
    nombre: string;
}

export default function CrearVetScreen() {
    const navigation = useNavigation<any>();
    const { showAlert, AlertComponent } = useCustomAlert();

    const [nombreCompleto, setNombreCompleto] = useState('');
    const [telefono, setTelefono] = useState('');
    const [runVet, setRunVet] = useState('');
    const [dvVet, setDvVet] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmTouched, setConfirmTouched] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [correoGenerado, setCorreoGenerado] = useState('');
    const [correoVisible, setCorreoVisible] = useState(false);
    const [nivelColision, setNivelColision] = useState(0);

    const [especialidades, setEspecialidades] = useState<EspecialidadDTO[]>([]);
    const [selectedEsps, setSelectedEsps] = useState<EspecialidadDTO[]>([]);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [loadingEsp, setLoadingEsp] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const nombreValido = nombreCompleto.trim().length >= 3;
    const telefonoSanitizado = telefono.replace(/\D/g, '');
    const telefonoEmpiezaCon9 = telefonoSanitizado.startsWith('9');
    const telefonoCompleto = telefonoSanitizado.length === 9;
    const telefonoValido = /^9\d{8}$/.test(telefonoSanitizado);
    const especialidadesValidas = selectedEsps.length > 0;

    useEffect(() => {
        const fetchEspecialidades = async () => {
            try {
                const response = await api.get('/v1/especialidades');
                setEspecialidades(response.data);
            } catch {
                showAlert('Error', 'No se pudieron cargar las especialidades.');
            } finally {
                setLoadingEsp(false);
            }
        };
        fetchEspecialidades();
    }, []);

    // ════ GENERADOR DE CORREO ════
    const generarCorreo = (nivel = nivelColision) => {
        const partes = nombreCompleto.trim().split(' ').filter(Boolean);
        if (partes.length < 2) {
            showAlert('Atención', 'Ingresa al menos nombre y apellido para generar el correo.');
            return;
        }
        const nombre = partes[0];
        const apellidoP = partes[1];
        const apellidoM = partes[2] || '';

        let base = nombre.substring(0, 2).toLowerCase();
        base += apellidoP.toLowerCase().replace(/\s/g, '');
        if (apellidoM.length > 0) {
            const letras = Math.min(1 + nivel, apellidoM.length);
            base += apellidoM.substring(0, letras).toLowerCase();
        } else if (nivel > 0) {
            base += nivel;
        }
        const clean = base.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
        setCorreoGenerado(`${clean}@nodevet.com`);
        setCorreoVisible(true);
    };

    const simularColision = () => {
        const nuevoNivel = nivelColision + 1;
        setNivelColision(nuevoNivel);
        generarCorreo(nuevoNivel);
    };

    // ════ ESPECIALIDADES ════
    const toggleEspecialidad = (esp: EspecialidadDTO) => {
        setSelectedEsps(prev =>
            prev.find(e => e.id === esp.id)
                ? prev.filter(e => e.id !== esp.id)
                : [...prev, esp]
        );
    };

    const removeEspecialidad = (id: number) => {
        setSelectedEsps(prev => prev.filter(e => e.id !== id));
    };

    const passwordRules = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecialChar: /[^A-Za-z0-9]/.test(password),
    };

    const isPasswordValid = Object.values(passwordRules).every(Boolean);
    const passwordsMatch = password === confirmPassword;

    const isValid =
        nombreValido &&
        telefonoValido &&
        runVet.length >= 7 &&
        dvVet.length === 1 &&
        especialidadesValidas &&
        correoVisible &&
        isPasswordValid &&
        passwordsMatch;

    const handleCrear = async () => {
        if (!isValid || submitting) return;
        setSubmitting(true);
        const partes = nombreCompleto.trim().split(' ').filter(Boolean);
        const nombreUsr = partes[0];
        const apellidoUsr = partes.slice(1).join(' ');
        try {
            await api.post('/v1/veterinarios', {
                nombreUsr,
                apellidoUsr,
                correoUsr: correoGenerado,
                passUsr: password,
                telefonoUsr: `+56${telefono}`,
                fotoUsr: null,
                runVet: parseInt(runVet),
                dvVet,
                especialidadesIds: selectedEsps.map(e => e.id),
            });
            showAlert(
                '¡Veterinario creado!',
                `La cuenta de ${nombreCompleto} fue registrada exitosamente.`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error: any) {
            const status = error?.response?.status;
            if (status === 409) {
                showAlert('Datos duplicados', error.response.data.message || 'El correo o RUN ya está registrado.');
            } else {
                showAlert('Error', 'No se pudo crear el veterinario. Intenta nuevamente.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[globalStyles.container, { backgroundColor: colors.darkDGreen }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            
            <DashboardHeader showBackButton onBackPress={() => navigation.goBack()} />

            <View style={styles.contentWrapper}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                >
                    <Text style={styles.formTitle}>Añadir Veterinario</Text>
                    <View style={styles.titleDivider} />

                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.label}>Nombre *</Text>
                        <TextInput
                            style={[globalStyles.input, nombreCompleto.length > 0 && !nombreValido && { borderColor: colors.error }]}
                            value={nombreCompleto}
                            onChangeText={t => { setNombreCompleto(t); setCorreoVisible(false); setNivelColision(0); }}
                            placeholder="Ej. Juan Pérez Soto"
                            placeholderTextColor={colors.lightGreen}
                        />
                        {nombreCompleto.length > 0 && !nombreValido && (
                            <Text style={styles.errorText}>El nombre debe tener al menos 3 caracteres</Text>
                        )}
                    </View>

                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.label}>Teléfono de Contacto *</Text>
                        <View style={styles.phoneRow}>
                            <View style={styles.phonePrefix}>
                                <Text style={styles.phonePrefixText}>+56</Text>
                            </View>
                            <TextInput
                                style={[globalStyles.input, styles.phoneInput, telefono.length > 0 && !telefonoValido && { borderColor: colors.error }]}
                                value={telefonoSanitizado}
                                onChangeText={(text) => {
                                    const soloDigitos = text.replace(/\D/g, '');
                                    setTelefono(soloDigitos.slice(0, 9));
                                }}
                                placeholder="9 12345678"
                                keyboardType="phone-pad"
                                placeholderTextColor={colors.lightGreen}
                            />
                        </View>
                        {telefonoSanitizado.length > 0 && !telefonoEmpiezaCon9 && (
                            <Text style={styles.errorText}>El teléfono debe iniciar con 9</Text>
                        )}
                        {telefonoSanitizado.length > 0 && telefonoEmpiezaCon9 && !telefonoCompleto && (
                            <Text style={styles.errorText}>Debe completar el número (8 dígitos después del 9)</Text>
                        )}
                    </View>

                    <View style={{ flexDirection: 'row', gap: spacing.md }}>
                        <View style={[globalStyles.inputGroup, { flex: 3 }]}>
                            <Text style={globalStyles.label}>RUN (sin dígito) *</Text>
                            <TextInput
                                style={globalStyles.input}
                                value={runVet}
                                onChangeText={setRunVet}
                                placeholder="Ej. 12345678"
                                keyboardType="numeric"
                                placeholderTextColor={colors.lightGreen}
                                maxLength={8}
                            />
                        </View>
                        <View style={[globalStyles.inputGroup, { flex: 1 }]}>
                            <Text style={globalStyles.label}>DV *</Text>
                            <TextInput
                                style={[globalStyles.input, { textAlign: 'center' }]}
                                value={dvVet}
                                onChangeText={t => setDvVet(t.toUpperCase())}
                                placeholder="K"
                                placeholderTextColor={colors.lightGreen}
                                maxLength={1}
                                autoCapitalize="characters"
                            />
                        </View>
                    </View>

                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.label}>Correo @nodevet.com</Text>

                        <TouchableOpacity style={styles.generateBtn} onPress={() => generarCorreo()}>
                            <Ionicons name="mail" size={18} color={colors.darkDGreen} style={{ marginRight: spacing.sm }} />
                            <Text style={styles.generateBtnText}>Generar correo institucional</Text>
                        </TouchableOpacity>

                        {correoVisible && (
                            <>
                                <TextInput
                                    style={[globalStyles.input, styles.emailReadOnly, { marginTop: spacing.sm }]}
                                    value={correoGenerado}
                                    editable={false}
                                />
                                <TouchableOpacity style={styles.collisionBtn} onPress={simularColision}>
                                    <Ionicons name="refresh" size={14} color={colors.lightBrown} />
                                    <Text style={styles.collisionText}>¿Correo ya existe? Generar variante</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

                    {/* ── Especialidades ── */}
                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.label}>Especialidades *</Text>

                        <TouchableOpacity
                            style={styles.comboBox}
                            onPress={() => setDropdownVisible(true)}
                            disabled={loadingEsp}
                        >
                            {loadingEsp
                                ? <ActivityIndicator size="small" color={colors.darkGreen} />
                                : <>
                                    <Text style={styles.comboBoxText}>Seleccionar especialidades...</Text>
                                    <Ionicons name="chevron-down" size={18} color={colors.darkGreen} />
                                </>
                            }
                        </TouchableOpacity>

                        {selectedEsps.length > 0 && (
                            <View style={styles.tagsContainer}>
                                {selectedEsps.map(esp => (
                                    <View key={esp.id} style={styles.tag}>
                                        <Text style={styles.tagText}>{esp.nombre}</Text>
                                        <TouchableOpacity onPress={() => removeEspecialidad(esp.id)} style={{ marginLeft: spacing.xs }}>
                                            <Ionicons name="close-circle" size={16} color={colors.darkDGreen} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        {!especialidadesValidas && (
                            <Text style={styles.errorText}>Debes seleccionar al menos 1 especialidad</Text>
                        )}
                    </View>

                    {/* ── Contraseña ── */}
                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.label}>Contraseña *</Text>
                        <View style={styles.passwordRow}>
                            <TextInput
                                style={[globalStyles.input, { flex: 1, marginBottom: 0 }]}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPass}
                                placeholderTextColor={colors.lightGreen}
                            />
                            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeIcon}>
                                <Ionicons name={showPass ? "eye-off" : "eye"} size={22} color={colors.darkGreen} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.passwordRulesContainer}>
                            {!passwordRules.minLength && (
                                <Text style={styles.ruleText}>• Mínimo 8 caracteres</Text>
                            )}
                            {!passwordRules.hasUppercase && (
                                <Text style={styles.ruleText}>• Mínimo 1 mayúscula</Text>
                            )}
                            {!passwordRules.hasLowercase && (
                                <Text style={styles.ruleText}>• Mínimo 1 minúscula</Text>
                            )}
                            {!passwordRules.hasNumber && (
                                <Text style={styles.ruleText}>• Mínimo 1 número</Text>
                            )}
                            {!passwordRules.hasSpecialChar && (
                                <Text style={styles.ruleText}>• Mínimo 1 carácter especial</Text>
                            )}
                        </View>
                    </View>

                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.label}>Confirmar Contraseña *</Text>
                        <TextInput
                            style={[globalStyles.input, confirmTouched && !passwordsMatch && { borderColor: colors.error }]}
                            value={confirmPassword}
                            onChangeText={(text) => {
                                if (!confirmTouched) setConfirmTouched(true);
                                setConfirmPassword(text);
                            }}
                            secureTextEntry={!showPass}
                            placeholderTextColor={colors.lightGreen}
                        />
                        {confirmTouched && !passwordsMatch && (
                            <Text style={styles.errorText}>Las contraseñas no coinciden</Text>
                        )}
                    </View>

                        <TouchableOpacity
                            style={[styles.createButton, { marginTop: spacing.xl, opacity: isValid && !submitting ? 1 : 0.5 }]}
                            disabled={!isValid || submitting}
                            onPress={handleCrear}
                        >
                            {submitting
                                ? <ActivityIndicator color={colors.darkDGreen} />
                                : <Text style={globalStyles.primaryButtonText}>Crear Cuenta Médico</Text>
                            }
                        </TouchableOpacity>

                </ScrollView>
            </View>

            {/* ════ MODAL DROPDOWN DE ESPECIALIDADES ════ */}
            <Modal
                visible={dropdownVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setDropdownVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setDropdownVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Seleccionar Especialidades</Text>
                        <FlatList
                            data={especialidades}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({ item }) => {
                                const selected = selectedEsps.find(e => e.id === item.id);
                                return (
                                    <TouchableOpacity
                                        style={styles.modalItem}
                                        onPress={() => toggleEspecialidad(item)}
                                    >
                                        <Text style={styles.modalItemText}>{item.nombre}</Text>
                                        {selected && (
                                            <Ionicons name="checkmark" size={20} color={colors.darkGreen} />
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                            ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
                        />
                        <TouchableOpacity
                            style={styles.modalCloseBtn}
                            onPress={() => setDropdownVisible(false)}
                        >
                            <Text style={styles.modalCloseBtnText}>Listo</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            <AlertComponent />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    contentWrapper: {
        flex: 1,
        paddingHorizontal: spacing.xl,
    },
    scrollContent: {
        flexGrow: 1,
        paddingTop: spacing.md,
        paddingHorizontal: 0,
        paddingBottom: spacing.xxl,
    },
    formTitle: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 24,
        color: colors.lightYellow,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    titleDivider: {
        height: 1,
        backgroundColor: colors.lightGreen,
        opacity: 0.5,
        marginBottom: spacing.xl,
    },
    createButton: {
        backgroundColor: colors.lightGreen,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xxl,
        borderRadius: 12,
        alignItems: 'center',
        alignSelf: 'center',
        elevation: 2,
    },
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    phonePrefix: {
        backgroundColor: colors.lightYellow,
        borderWidth: 1,
        borderColor: colors.darkGreen,
        borderRadius: 8,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        justifyContent: 'center',
    },
    phonePrefixText: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 16,
        color: colors.darkDGreen,
    },
    phoneInput: {
        flex: 1,
        marginBottom: 0,
    },
    generateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.lightYellow,
        borderRadius: 10,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        alignSelf: 'flex-start',
    },
    generateBtnText: {
        fontFamily: 'Fredoka-Medium',
        fontSize: 14,
        color: colors.darkDGreen,
    },
    emailReadOnly: {
        color: colors.lightGreen,
        backgroundColor: 'rgba(158,181,125,0.15)',
        borderColor: colors.lightGreen,
    },
    collisionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.xs,
    },
    collisionText: {
        fontFamily: 'Fredoka-Regular',
        fontSize: 11,
        color: colors.lightBrown,
    },
    comboBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.lightYellow,
        borderWidth: 1,
        borderColor: colors.darkGreen,
        borderRadius: 8,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    comboBoxText: {
        fontFamily: 'Fredoka-Regular',
        fontSize: 14,
        color: colors.darkGreen,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: spacing.sm,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.lightGreen,
        borderRadius: 20,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
    },
    tagText: {
        fontFamily: 'Fredoka-Medium',
        fontSize: 13,
        color: colors.darkDGreen,
    },
    passwordRow: { flexDirection: 'row', alignItems: 'center' },
    eyeIcon: { position: 'absolute', right: 15 },
    errorText: {
        fontFamily: 'Fredoka-Regular',
        color: colors.error,
        fontSize: 12,
        marginTop: spacing.xs,
    },
    passwordRulesContainer: {
        marginTop: spacing.sm,
        gap: 2,
    },
    ruleText: {
        fontFamily: 'Fredoka-Regular',
        fontSize: 12,
        color: colors.lightBrown,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    modalContent: {
        backgroundColor: colors.lightYellow,
        borderRadius: 16,
        width: '100%',
        maxHeight: '60%',
        padding: spacing.lg,
    },
    modalTitle: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 18,
        color: colors.darkDGreen,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    modalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xs,
    },
    modalItemText: {
        fontFamily: 'Fredoka-Regular',
        fontSize: 15,
        color: colors.darkDGreen,
    },
    modalSeparator: {
        height: 1,
        backgroundColor: colors.lightGreen,
        opacity: 0.4,
    },
    modalCloseBtn: {
        marginTop: spacing.md,
        backgroundColor: colors.darkGreen,
        borderRadius: 10,
        paddingVertical: spacing.sm,
        alignItems: 'center',
    },
    modalCloseBtnText: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 16,
        color: colors.lightYellow,
    },
});
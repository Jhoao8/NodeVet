import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Modal
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '@/src/api/axiosInstance';

import { globalStyles } from '@/src/style/GlobalStyle';
import { adminStyles } from '@/src/style/AdminStyle';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import DashboardHeader from '@/src/components/DashboardHeader';

interface VeterinarioRefDTO {
    idUsuario: number;
}

interface AdminRefDTO {
    idUsuario: number;
    nivelAcceso?: string;
    nivel_acceso?: string;
}

interface UsuarioDTO {
    idUsuario: number;
    nombreCompleto: string;
    correoUsr: string;
    telefonoUsr: string | null;
    fotoUsr: string | null;
    estadoUsr: number;
    rol?: string;
    nivelAcceso?: string;
    nivel_acceso?: string;
}

interface ResumenReservasTutorDTO {
    idUsuario: number;
    nombreCompleto: string;
    reservasRealizadas: number;
    reservasAsistidas: number;
    reservasAusentadas: number;
}

export default function GestionUsrScreen() {
    // Estados de datos
    const [usuarios, setUsuarios] = useState<UsuarioDTO[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Estados para Modales Explícitos
    const [selectedUser, setSelectedUser] = useState<UsuarioDTO | null>(null);
    const [showResumenModal, setShowResumenModal] = useState(false);
    const [showActionModal, setShowActionModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [loadingResumen, setLoadingResumen] = useState(false);
    const [resumenReservas, setResumenReservas] = useState<ResumenReservasTutorDTO | null>(null);
    const [feedbackModal, setFeedbackModal] = useState({ visible: false, title: '', message: '', isSuccess: false });

    // Carga de usuarios desde el backend de Spring Boot
    const fetchUsuariosSistema = async () => {
        try {
            setLoading(true);
            const [usuariosResponse, veterinariosResponse, adminsResponse] = await Promise.all([
                api.get('/v1/usuarios?incluirInactivos=true'),
                api.get('/v1/veterinarios').catch(() => ({ data: [] })),
                api.get('/v1/admins').catch(() => ({ data: [] })),
            ]);

            const todosUsuarios: UsuarioDTO[] = Array.isArray(usuariosResponse.data) ? usuariosResponse.data : [];
            const vets: VeterinarioRefDTO[] = Array.isArray(veterinariosResponse.data) ? veterinariosResponse.data : [];
            const admins: AdminRefDTO[] = Array.isArray(adminsResponse.data) ? adminsResponse.data : [];

            const vetIds = new Set<number>(
                vets
                    .map(v => Number(v.idUsuario))
                    .filter(id => Number.isFinite(id))
            );

            const adminIds = new Set<number>(
                admins
                    .map(a => Number(a.idUsuario))
                    .filter(id => Number.isFinite(id))
            );

            const superAdminIds = new Set<number>(
                admins
                    .filter(a => {
                        const nivel = String(a.nivelAcceso || a.nivel_acceso || '').toUpperCase();
                        return nivel === 'SUPER_ADMIN' || nivel === 'SUPERADMIN';
                    })
                    .map(a => Number(a.idUsuario))
                    .filter(id => Number.isFinite(id))
            );

            // Mantener únicamente TUTORES: excluir ADMIN, SUPERADMIN y VET.
            const tutores = todosUsuarios.filter(u => {
                const id = Number(u.idUsuario);
                const rolNormalizado = String(u.rol || '').toUpperCase();
                const nivelAccesoNormalizado = String(u.nivelAcceso || u.nivel_acceso || '').toUpperCase();
                const esAdminPorRol = rolNormalizado === 'ADMIN' || rolNormalizado === 'SUPER_ADMIN' || rolNormalizado === 'SUPERADMIN';
                const esVetPorRol = rolNormalizado === 'VET' || rolNormalizado === 'VETERINARIO';
                const esSuperAdminPorNivel = nivelAccesoNormalizado === 'SUPER_ADMIN' || nivelAccesoNormalizado === 'SUPERADMIN';

                return !adminIds.has(id)
                    && !superAdminIds.has(id)
                    && !vetIds.has(id)
                    && !esAdminPorRol
                    && !esVetPorRol
                    && !esSuperAdminPorNivel;
            });

            setUsuarios(tutores);
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
            showFeedback('Error de Servidor', 'No se pudo obtener el listado de usuarios registrados.', false);
        } finally {
            setLoading(false);
        }
    };

    // Recargar datos automáticamente cuando la pestaña vuelve a estar enfocada
    useFocusEffect(
        useCallback(() => {
            fetchUsuariosSistema();
        }, [])
    );

    // Helper para obtener las iniciales del avatar
    const getInicialesNombre = (nombreCompleto: string): string => {
        if (!nombreCompleto) return '?';
        const partes = nombreCompleto.trim().split(' ');
        if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
        return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
    };

    // Filtro en tiempo real por Nombre o Correo Electrónico
    const filteredUsuarios = usuarios.filter(usr => {
        const nombre = usr.nombreCompleto?.toLowerCase() || '';
        const correo = usr.correoUsr?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        return nombre.includes(query) || correo.includes(query);
    });

    // Acción: Ejecutar Soft Delete en Backend
    const ejecutarDesactivacionCuenta = async () => {
        if (!selectedUser) return;
        setShowDeleteConfirm(false);

        try {
            setSubmitting(true);
            // Llamada DELETE apuntando al endpoint mapeado en tu UsuarioController
            await api.delete(`/v1/usuarios/${selectedUser.idUsuario}`);
            
            // Actualizar lista local removiendo la cuenta desactivada
            setUsuarios(prev => prev.filter(u => u.idUsuario !== selectedUser.idUsuario));
            
            showFeedback(
                'Cuenta Inhabilitada',
                `El usuario ${selectedUser.nombreCompleto} ha sido suspendido (soft-delete) correctamente del sistema.`,
                true
            );
        } catch (error: any) {
            console.error("Error al desactivar usuario:", error);
            const backendError = typeof error.response?.data === 'string' ? error.response.data : error.response?.data?.message;
            showFeedback('Error de Solicitud', backendError || 'No se pudo procesar la desactivación de la cuenta.', false);
        } finally {
            setSubmitting(false);
            setSelectedUser(null);
        }
    };

    const ejecutarActivacionCuenta = async () => {
        if (!selectedUser) return;
        setShowActionModal(false);

        try {
            setSubmitting(true);
            await api.put(`/v1/usuarios/${selectedUser.idUsuario}/activar`);

            setUsuarios(prev => prev.map(u =>
                u.idUsuario === selectedUser.idUsuario
                    ? { ...u, estadoUsr: 1 }
                    : u
            ));

            showFeedback(
                'Cuenta Reactivada',
                `La cuenta de ${selectedUser.nombreCompleto} fue habilitada correctamente.`,
                true
            );
        } catch (error: any) {
            console.error('Error al activar usuario:', error);
            const backendError = typeof error.response?.data === 'string' ? error.response.data : error.response?.data?.message;
            showFeedback('Error de Solicitud', backendError || 'No se pudo reactivar la cuenta.', false);
        } finally {
            setSubmitting(false);
            setSelectedUser(null);
        }
    };

    const showFeedback = (title: string, message: string, isSuccess: boolean) => {
        setFeedbackModal({ visible: true, title, message, isSuccess });
    };

    const handleCloseFeedback = () => {
        setFeedbackModal(prev => ({ ...prev, visible: false }));
    };

    const abrirResumenTutor = async (usuario: UsuarioDTO) => {
        setSelectedUser(usuario);
        setShowResumenModal(true);
        setLoadingResumen(true);

        try {
            const response = await api.get(`/v1/usuarios/${usuario.idUsuario}/resumen-reservas`);
            setResumenReservas(response.data);
        } catch (error: any) {
            console.error('Error al cargar resumen de reservas:', error);
            const backendError = typeof error.response?.data === 'string' ? error.response.data : error.response?.data?.message;
            showFeedback('Error de Solicitud', backendError || 'No se pudo cargar el resumen de reservas del tutor.', false);
            setShowResumenModal(false);
        } finally {
            setLoadingResumen(false);
        }
    };

    const abrirAccionesCuenta = (usuario: UsuarioDTO) => {
        setSelectedUser(usuario);
        setShowActionModal(true);
    };

    const renderUsuarioCard = ({ item, index }: { item: UsuarioDTO, index: number }) => (
        <View style={[adminStyles.adminListItem, index === filteredUsuarios.length - 1 && adminStyles.adminListItemNoBorder, styles.cardSpacing]}>
            <TouchableOpacity
                style={styles.userMainPressArea}
                activeOpacity={0.8}
                onPress={() => abrirResumenTutor(item)}
            >
                <View style={adminStyles.adminItemAvatar}>
                    <Text style={styles.avatarText}>
                        {getInicialesNombre(item.nombreCompleto)}
                    </Text>
                </View>

                <View style={adminStyles.adminItemInfo}>
                    <Text style={styles.userCardTitle}>{item.nombreCompleto}</Text>
                    <Text style={styles.userCardSub}>{item.correoUsr}</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => abrirAccionesCuenta(item)}
            >
                <View style={[adminStyles.badgeContainer, item.estadoUsr === 1 ? adminStyles.badgeActive : adminStyles.badgeInactive]}>
                    <Text style={item.estadoUsr === 1 ? adminStyles.badgeTextActive : adminStyles.badgeTextInactive}>
                        {item.estadoUsr === 1 ? 'Activo' : 'Inactivo'}
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[globalStyles.container, { backgroundColor: colors.darkDGreen }]}>
            <DashboardHeader />

            <View style={styles.mainWrapper}>
                
                {/* Cabecera de la Pantalla */}
                <View style={styles.titleWrapper}>
                    <Text style={[globalStyles.sectionTitle, { color: colors.lightYellow, marginBottom: 0 }]}>
                        Gestión de Usuarios
                    </Text>
                </View>

                {/* Barra de Búsqueda Interactiva */}
                <View style={styles.searchBarWrapper}>
                    <Ionicons name="search" size={20} color={colors.darkGreen} style={{ marginRight: spacing.sm }} />
                    <TextInput
                        style={styles.searchBarInput}
                        placeholder="Buscar tutor por nombre o correo..."
                        placeholderTextColor={colors.darkGreen}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={colors.darkGreen} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Contenedor Listado de Cuentas */}
                <View style={[adminStyles.adminListCard, styles.listCardContainer]}>
                    {loading ? (
                        <ActivityIndicator size="large" color={colors.darkGreen} style={{ marginTop: spacing.xl }} />
                    ) : (
                        <FlatList
                            data={filteredUsuarios}
                            keyExtractor={(item) => item.idUsuario.toString()}
                            renderItem={renderUsuarioCard}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <Ionicons name="people-outline" size={54} color={colors.lightGreen} />
                                    <Text style={styles.emptyTextText}>No se encontraron tutores registrados.</Text>
                                </View>
                            }
                        />
                    )}
                </View>
            </View>

            {/* ════ MODAL: RESUMEN DE RESERVAS DEL TUTOR ════ */}
            <Modal visible={showResumenModal} animationType="fade" transparent={true} onRequestClose={() => setShowResumenModal(false)}>
                <View style={globalStyles.modalOverlay}>
                    <View style={[globalStyles.modalContent, { width: '85%' }]}>
                        <Ionicons name="analytics-outline" size={40} color={colors.lightGreen} style={{ marginBottom: spacing.sm }} />
                        <Text style={globalStyles.modalTitle}>Resumen de Reservas</Text>

                        {selectedUser && (
                            <Text style={[styles.descriptionHelperText, { marginBottom: spacing.md, textAlign: 'center' }]}>
                                Tutor: {selectedUser.nombreCompleto}
                            </Text>
                        )}

                        {loadingResumen ? (
                            <ActivityIndicator size="large" color={colors.lightGreen} style={{ marginVertical: spacing.lg }} />
                        ) : (
                            <View style={styles.userSummaryBox}>
                                <Text style={styles.summaryLabel}>Reservas realizadas</Text>
                                <Text style={styles.summaryValueLarge}>{resumenReservas?.reservasRealizadas ?? 0}</Text>

                                <Text style={styles.summaryLabel}>Asistencias</Text>
                                <Text style={styles.summaryValueLarge}>{resumenReservas?.reservasAsistidas ?? 0}</Text>

                                <Text style={styles.summaryLabel}>Ausencias</Text>
                                <Text style={styles.summaryValueLarge}>{resumenReservas?.reservasAusentadas ?? 0}</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={globalStyles.modalButton}
                            onPress={() => {
                                setShowResumenModal(false);
                                setResumenReservas(null);
                            }}
                        >
                            <Text style={globalStyles.primaryButtonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ════ MODAL NATIVO EXPLÍCITO: OPCIONES DE GESTIÓN DE TUTOR ════ */}
            <Modal visible={showActionModal} animationType="fade" transparent={true} onRequestClose={() => setShowActionModal(false)}>
                <View style={globalStyles.modalOverlay}>
                    <View style={[globalStyles.modalContent, { width: '85%' }]}>
                        <FontAwesome5 name="user-cog" size={40} color={colors.lightGreen} style={{ marginBottom: spacing.sm }} />
                        <Text style={globalStyles.modalTitle}>Acciones de Cuenta</Text>
                        
                        {selectedUser && (
                            <View style={styles.userSummaryBox}>
                                <Text style={styles.summaryLabel}>Nombre Completo</Text>
                                <Text style={styles.summaryValueLarge}>{selectedUser.nombreCompleto}</Text>

                                <Text style={styles.summaryLabel}>Correo Electrónico</Text>
                                <Text style={styles.summaryValueLarge}>{selectedUser.correoUsr}</Text>

                                <Text style={styles.summaryLabel}>Teléfono de Contacto</Text>
                                <Text style={styles.summaryValueLarge}>{selectedUser.telefonoUsr || 'No registrado'}</Text>

                                <Text style={styles.summaryLabel}>Estado de Cuenta</Text>
                                <Text style={styles.summaryValueLarge}>{selectedUser.estadoUsr === 1 ? 'Activo' : 'Inactivo'}</Text>
                            </View>
                        )}

                        {selectedUser?.estadoUsr === 1 ? (
                            <>
                                {/* Botón: Eliminar Cuenta (Soft Delete) */}
                                <TouchableOpacity 
                                    style={[globalStyles.modalButton, { backgroundColor: colors.error, marginBottom: spacing.sm }]} 
                                    onPress={() => { setShowActionModal(false); setShowDeleteConfirm(true); }}
                                >
                                    <Text style={[globalStyles.primaryButtonText, { color: colors.white }]}>Inhabilitar Tutor</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <Text style={[styles.descriptionHelperText, { marginBottom: spacing.md, textAlign: 'center' }]}>Cuenta inhabilitada. Si corresponde, puede apelarse y reactivarse.</Text>

                                <TouchableOpacity
                                    style={[globalStyles.modalButton, { backgroundColor: colors.darkGreen, marginBottom: spacing.sm }]}
                                    onPress={ejecutarActivacionCuenta}
                                    disabled={submitting}
                                >
                                    <Ionicons name="refresh" size={20} color={colors.white} style={{ marginRight: 6 }} />
                                    <Text style={[globalStyles.primaryButtonText, { color: colors.white }]}>Reactivar Tutor</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        <TouchableOpacity style={[globalStyles.modalButton, { marginTop: spacing.xs }]} onPress={() => { setShowActionModal(false); setSelectedUser(null); }}>
                            <Text style={globalStyles.primaryButtonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ════ MODAL NATIVO EXPLÍCITO: CONFIRMACIÓN DE SOFT DELETE ════ */}
            <Modal visible={showDeleteConfirm} animationType="fade" transparent={true} onRequestClose={() => setShowDeleteConfirm(false)}>
                <View style={globalStyles.modalOverlay}>
                    <View style={[globalStyles.modalContent, { width: '85%' }]}>
                        <Ionicons name="warning-outline" size={48} color={colors.error} style={{ marginBottom: spacing.xs }} />
                        <Text style={globalStyles.modalTitle}>¿Inhabilitar Cuenta?</Text>
                        <Text style={[styles.descriptionHelperText, { textAlign: 'center', marginBottom: spacing.lg }]}>
                            El tutor ya no podrá iniciar sesión en la aplicación móvil, pero sus registros históricos se conservarán intactos.
                        </Text>

                        <TouchableOpacity 
                            style={[globalStyles.modalButton, { backgroundColor: colors.error, marginBottom: spacing.sm }]} 
                            onPress={ejecutarDesactivacionCuenta}
                            disabled={submitting}
                        >
                            <Text style={[globalStyles.primaryButtonText, { color: colors.white }]}>Confirmar Suspensión</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={globalStyles.modalButton} onPress={() => { setShowDeleteConfirm(false); setShowActionModal(true); }}>
                            <Text style={globalStyles.primaryButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ════ MODAL NATIVO EXPLÍCITO: FEEDBACK FINAL ════ */}
            <Modal visible={feedbackModal.visible} transparent animationType="fade" onRequestClose={handleCloseFeedback}>
                <View style={globalStyles.modalOverlay}>
                    <View style={globalStyles.modalContent}>
                        <Ionicons 
                            name={feedbackModal.isSuccess ? "checkmark-circle" : "close-circle"} 
                            size={54} 
                            color={feedbackModal.isSuccess ? colors.green : colors.error} 
                        />
                        <Text style={globalStyles.modalTitle}>{feedbackModal.title}</Text>
                        <Text style={globalStyles.modalMessage}>{feedbackModal.message}</Text>
                        <TouchableOpacity style={globalStyles.modalButton} onPress={handleCloseFeedback}>
                            <Text style={globalStyles.primaryButtonText}>Entendido</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    mainWrapper: {
        flex: 1,
        paddingHorizontal: spacing.xl,
    },
    titleWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm + 4, // Espaciado amplio solicitado entre títulos y cajas
    },
    searchBarWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 12,
        paddingHorizontal: spacing.md,
        height: 48,
        borderWidth: 1,
        borderColor: colors.lightGreen,
        marginBottom: spacing.lg, // Separación estricta antes del bloque de lista
    },
    searchBarInput: {
        flex: 1,
        fontFamily: 'Fredoka-Regular',
        fontSize: 14,
        color: colors.darkDGreen,
    },
    listCardContainer: {
        flex: 1,
        marginBottom: 30,
        padding: spacing.md,
    },
    cardSpacing: {
        paddingVertical: spacing.md, // Espaciado interno ampliado para las tarjetas
        borderBottomColor: 'rgba(56, 102, 65, 0.15)',
    },
    userMainPressArea: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarText: {
        color: colors.darkDGreen, 
        fontFamily: 'Fredoka-Bold', 
        fontSize: 14
    },
    userCardTitle: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 16, // Letras más grandes tal como te gustó en pantallas previas
        color: colors.darkDGreen,
        marginBottom: 2,
    },
    userCardSub: {
        fontFamily: 'Fredoka-Regular',
        fontSize: 13,
        color: colors.darkGreen,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyTextText: {
        fontFamily: 'Fredoka-Regular',
        color: colors.darkGreen,
        marginTop: spacing.md,
        fontSize: 15,
    },
    userSummaryBox: {
        width: '100%',
        backgroundColor: 'rgba(251, 239, 186, 0.08)',
        borderRadius: 12,
        padding: spacing.lg,
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: 'rgba(158, 181, 125, 0.3)',
    },
    summaryLabel: {
        fontFamily: 'Fredoka-Bold',
        fontSize: 11,
        color: colors.lightGreen,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    summaryValueLarge: {
        fontFamily: 'Fredoka-Medium',
        fontSize: 17, // Amplificación tipográfica consistente para el resumen
        color: colors.white,
        marginBottom: spacing.md,
    },
    descriptionHelperText: {
        fontFamily: 'Fredoka-Regular',
        fontSize: 14,
        color: colors.lightYellow,
        lineHeight: 20,
    }
});
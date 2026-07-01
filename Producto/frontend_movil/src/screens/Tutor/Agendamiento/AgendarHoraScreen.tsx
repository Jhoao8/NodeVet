import React, { useState, useCallback, useEffect } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, ScrollView, 
    ActivityIndicator, Modal, Image, Alert, Linking 
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';

// Importaciones del sistema de diseño corporativo
import { globalStyles } from '../../../style/GlobalStyle';
import { dashboardStyles } from '../../../style/DashboardStyle';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { customCalendarTheme } from '../../../theme/calendarTheme';
import DashboardHeader from '../../../components/DashboardHeader';
import ReservaModals from '@/src/screens/Tutor/Agendamiento/ReservaModal';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axiosInstance';


// ════════ INTERFACES DEFINIDAS PARA TYPESCRIPT ════════
interface Mascota {
    idMascota: number;
    nomMascota: string;
    especie: string;
    raza?: string;
    imagenMascota?: string;
}

interface BloqueHorarioDTO {
    idBloque: number;
    idVet: number;
    fecHrInicio: string; 
    fecHrFin: string;
}

interface VetDispDTO {
    idVet: number;
    nombreCompleto: string;
    especialidad: string;
    bloquesDisponibles: BloqueHorarioDTO[];
}

const getTodayString = () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().split('T')[0]; 
};

export default function AgendarHoraScreen({ navigation }: any) {
    const { userToken } = useAuth();
    
    // Estados principales
    const [pets, setPets] = useState<Mascota[]>([]);
    const [loadingPets, setLoadingPets] = useState(true);
    const [showPetModal, setShowPetModal] = useState(false);
    const [selectedPet, setSelectedPet] = useState<Mascota | null>(null);

    const todayString = getTodayString();
    const [selectedDate, setSelectedDate] = useState(todayString); 

    const [profesionales, setProfesionales] = useState<VetDispDTO[]>([]);
    const [loadingAgenda, setLoadingAgenda] = useState(false);
    const [profesionalExpandido, setProfesionalExpandido] = useState<number | null>(null);
    const [bloqueSeleccionado, setBloqueSeleccionado] = useState<BloqueHorarioDTO | null>(null);
    const [profesionalSeleccionado, setProfesionalSeleccionado] = useState<VetDispDTO | null>(null);

    // Estado del paso del flujo (0 = oculto, 1 = resumen, 2 = aviso flow)
    const [reservaStep, setReservaStep] = useState<number>(0);
    const [isProcessingPago, setIsProcessingPago] = useState(false);

    const formatearHora = (fechaIso: string) => {
        if (!fechaIso) return '';
        return fechaIso.split('T')[1].substring(0, 5); 
    };

    // Descarga asíncrona de pacientes activos
    useFocusEffect(
        useCallback(() => {
            if (!userToken) return;
            const fetchTutorPets = async () => {
                try {
                    setLoadingPets(true);
                    const response = await api.get('/v1/mascotas'); 
                    setPets(response.data);
                } catch (error) {
                    console.error("Error al obtener mascotas:", error);
                } finally {
                    setLoadingPets(false);
                }
            };
            fetchTutorPets();
        }, [userToken])
    );

    // Consulta de la disponibilidad reactiva al cambiar el calendario
    useEffect(() => {
        const fetchDisponibilidad = async () => {
            try {
                setLoadingAgenda(true);
                setBloqueSeleccionado(null); 
                
                const response = await api.get(`/v1/agendas/disponibilidad?fecha=${selectedDate}`);
                setProfesionales(response.data);
            } catch (error) {
                console.error("Error al obtener la agenda diaria:", error);
                setProfesionales([]); 
            } finally {
                setLoadingAgenda(false);
            }
        };
        fetchDisponibilidad();
    }, [selectedDate]);

    const handleContinuarFlujo = () => {
        if (!selectedPet || !bloqueSeleccionado) return;
        setReservaStep(1); 
    };

    const handleEjecutarReservaYFlow = async () => {
        try {
            setIsProcessingPago(true);
            const payload = {
                idMascota: selectedPet!.idMascota,
                idVet: bloqueSeleccionado!.idVet,
                idBloque: bloqueSeleccionado!.idBloque,
                idValor: 1 
            };

            // ════════ RUTA CORREGIDA: Restaurada a /v1/reservas ════════
            const response = await api.post('/v1/reservas', payload);
            const { urlPago, pagoObligatorio } = response.data;

            if (urlPago) {
                const supported = await Linking.canOpenURL(urlPago);
                if (supported) {
                    setReservaStep(0); 
                    await Linking.openURL(urlPago);
                    navigation.navigate('Home'); 
                } else {
                    Alert.alert("Error de enlace", "No se pudo abrir la pasarela en el dispositivo.");
                }
            } else {
                setReservaStep(0);
                Alert.alert(
                    'Reserva confirmada',
                    pagoObligatorio === false
                        ? 'Tu reserva fue creada sin pago obligatorio.'
                        : 'Tu reserva fue creada correctamente.'
                );
                navigation.navigate('Home');
            }
        } catch (error: any) {
            console.error("Error al generar reserva transaccional:", error);
            const mensaje = error.response?.data || "El bloque horario fue seleccionado por otro usuario o error en validación de pago.";
            Alert.alert("Atención", mensaje);
            setReservaStep(0); 
        } finally {
            setIsProcessingPago(false);
        }
    };

    return (
        <View style={[globalStyles.container, dashboardStyles.lightBackground]}>
            <DashboardHeader />

            <ScrollView contentContainerStyle={globalStyles.scrollContainer} showsVerticalScrollIndicator={false}>
                
                <View style={dashboardStyles.greetingContainer}>
                    <Text style={[dashboardStyles.greetingText, dashboardStyles.darkText, { textAlign: 'center' }]}>
                        Agendar Hora
                    </Text>
                    <View style={[dashboardStyles.greetingDivider, dashboardStyles.darkDivider]} />
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionLabel}>Paciente:</Text>
                    <TouchableOpacity 
                        style={globalStyles.dateSelector} 
                        activeOpacity={0.7}
                        onPress={() => !loadingPets && pets.length > 0 && setShowPetModal(true)}
                        disabled={loadingPets || pets.length === 0}
                    >
                        <View style={{ flex: 1 }}>
                            {loadingPets ? (
                                <ActivityIndicator size="small" color={colors.darkGreen} />
                            ) : pets.length === 0 ? (
                                <Text style={[globalStyles.dateText, { color: colors.error }]}>Sin mascotas registradas</Text>
                            ) : (
                                <Text style={[globalStyles.dateText, selectedPet && { color: colors.darkDGreen, fontFamily: typography.family.main.semiBold }]}>
                                    {selectedPet ? selectedPet.nomMascota : 'Seleccionar mascota...'}
                                </Text>
                            )}
                        </View>
                        <Ionicons name="chevron-down" size={20} color={colors.darkGreen} />
                    </TouchableOpacity>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionLabel}>Seleccione día:</Text>
                    <View style={styles.calendarWrapper}>
                        <Calendar
                            current={todayString}
                            minDate={todayString}
                            disableAllTouchEventsForDisabledDays={true}
                            onDayPress={(day: any) => {
                                if (day.dateString >= todayString) {
                                    setSelectedDate(day.dateString);
                                    setBloqueSeleccionado(null);
                                    setProfesionalSeleccionado(null);
                                }
                            }}
                            markedDates={{
                                [selectedDate]: { selected: true, disableTouchEvent: true }
                            }}
                            theme={customCalendarTheme} 
                        />
                    </View>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionLabel}>Profesionales disponibles:</Text>

                    {loadingAgenda ? (
                        <View style={globalStyles.loadingCenterContainer}>
                            <ActivityIndicator size="large" color={colors.darkGreen} />
                            <Text style={globalStyles.loadingMessageText}>Buscando horarios...</Text>
                        </View>
                    ) : profesionales.length === 0 ? (
                        <Text style={globalStyles.emptyListText}>No hay profesionales disponibles para esta fecha.</Text>
                    ) : (
                        profesionales.map((prof) => {
                            const isExpanded = profesionalExpandido === prof.idVet;
                            return (
                                <View key={prof.idVet} style={styles.profesionalCard}>
                                    <TouchableOpacity 
                                        style={styles.profesionalHeader}
                                        onPress={() => setProfesionalExpandido(isExpanded ? null : prof.idVet)}
                                        activeOpacity={0.9}
                                    >
                                        <View style={styles.profesionalLeft}>
                                            <View style={styles.avatarCircle}>
                                                <FontAwesome5 name="user-md" size={30} color={colors.darkDGreen} />
                                            </View>
                                            <View>
                                                <Text style={styles.profesionalName}>{prof.nombreCompleto}</Text>
                                                <Text style={styles.profesionalSub}>{prof.especialidad}</Text>
                                            </View>
                                        </View>
                                        <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={24} color={colors.darkDGreen} />
                                    </TouchableOpacity>

                                    {isExpanded && (
                                        <View style={styles.horasGrid}>
                                            {prof.bloquesDisponibles.map((bloque: BloqueHorarioDTO) => {
                                                const isSelected = bloqueSeleccionado?.idBloque === bloque.idBloque;
                                                return (
                                                    <TouchableOpacity
                                                        key={bloque.idBloque.toString()}
                                                        style={[styles.horaButton, isSelected && styles.horaButtonSelected]}
                                                        onPress={() => {
                                                            setBloqueSeleccionado(isSelected ? null : bloque);
                                                            setProfesionalSeleccionado(isSelected ? null : prof);
                                                        }}
                                                    >
                                                        <Text style={[styles.horaButtonText, isSelected && styles.horaButtonTextSelected]}>
                                                            {formatearHora(bloque.fecHrInicio)}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    )}
                                </View>
                            );
                        })
                    )}
                </View>

                <View style={globalStyles.bottomSection}>
                    <TouchableOpacity 
                        style={[globalStyles.primaryButton, { width: '100%', marginBottom: spacing.xxl }, (!selectedPet || !bloqueSeleccionado) && globalStyles.primaryButtonDisabled]}
                        disabled={!selectedPet || !bloqueSeleccionado}
                        onPress={handleContinuarFlujo} 
                    >
                        <Text style={globalStyles.primaryButtonText}>Continuar</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            <Modal visible={showPetModal} transparent={true} animationType="fade">
                <TouchableOpacity style={globalStyles.detailModalOverlay} activeOpacity={1} onPress={() => setShowPetModal(false)}>
                    <View style={globalStyles.detailModalContainer}>
                        <View style={globalStyles.detailModalHeader}>
                            <Text style={globalStyles.detailModalDate}>Selecciona el paciente</Text>
                            <TouchableOpacity onPress={() => setShowPetModal(false)}>
                                <Ionicons name="close" size={24} color={colors.lightYellow} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={globalStyles.detailModalBody}>
                            {pets.map((item) => (
                                <TouchableOpacity 
                                    key={item.idMascota.toString()}
                                    style={globalStyles.tableRowItem}
                                    onPress={() => { setSelectedPet(item); setShowPetModal(false); }}
                                >
                                    {item.imagenMascota ? (
                                        <Image source={{ uri: item.imagenMascota }} style={styles.petAvatar} />
                                    ) : (
                                        <View style={[styles.petAvatar, { backgroundColor: colors.lightGreen, justifyContent: 'center', alignItems: 'center' }]}>
                                            <Ionicons name="paw" size={20} color={colors.darkDGreen} />
                                        </View>
                                    )}
                                    <View style={{ marginLeft: spacing.md }}>
                                        <Text style={globalStyles.listSectionTitle}>{item.nomMascota}</Text>
                                        <Text style={globalStyles.sectionSubtitle}>{item.especie} • {item.raza || 'Sin raza'}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

            <ReservaModals 
                step={reservaStep}
                setStep={setReservaStep}
                selectedPet={selectedPet}
                bloqueSeleccionado={bloqueSeleccionado}
                profesionalSeleccionado={profesionalSeleccionado}
                selectedDate={selectedDate}
                isProcessingPago={isProcessingPago}
                onConfirmPayment={handleEjecutarReservaYFlow}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    sectionContainer: { marginBottom: spacing.lg },
    sectionLabel: { fontFamily: typography.family.main.semiBold, fontSize: typography.size.md, color: colors.darkDGreen, marginBottom: spacing.sm, paddingHorizontal: spacing.xs },
    calendarWrapper: { borderWidth: 1.5, borderColor: colors.lightGreen, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.white },
    profesionalCard: { marginBottom: spacing.md, borderWidth: 1.5, borderColor: colors.lightGreen, backgroundColor: colors.white, borderRadius: 12, overflow: 'hidden' },
    profesionalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md },
    profesionalLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    avatarCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.lightYellow, borderWidth: 1, borderColor: colors.lightBrown },
    profesionalName: { fontFamily: typography.family.main.bold, fontSize: typography.size.md, color: colors.darkDGreen },
    profesionalSub: { fontFamily: typography.family.main.regular, fontSize: typography.size.sm, color: colors.darkGreen },
    horasGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.md, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.lightYellow, paddingTop: spacing.sm },
    horaButton: { width: '23%', borderWidth: 1, borderColor: colors.darkGreen, borderRadius: 8, paddingVertical: spacing.sm, alignItems: 'center', backgroundColor: colors.white },
    horaButtonSelected: { backgroundColor: colors.lightGreen, borderColor: colors.darkDGreen },
    horaButtonText: { fontFamily: typography.family.main.medium, fontSize: typography.size.sm, color: colors.darkGreen },
    horaButtonTextSelected: { fontFamily: typography.family.main.bold, color: colors.darkDGreen },
    petAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: colors.lightGreen }
});
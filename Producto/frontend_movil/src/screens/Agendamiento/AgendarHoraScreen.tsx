import React, { useState, useCallback } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, ScrollView, 
    ActivityIndicator, Modal, FlatList, Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

// Importaciones de tu sistema de diseño
import { globalStyles } from '../../style/GlobalStyle';
import { dashboardStyles } from '../../style/DashboardStyle';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { customCalendarTheme } from '../../theme/calendarTheme';
import DashboardHeader from '../../components/DashboardHeader';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';

// ════════ CONFIGURACIÓN DEL CALENDARIO EN ESPAÑOL ════════
LocaleConfig.locales['es'] = {
monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

interface Mascota {
    idMascota: number;
    nomMascota: string;
    especie: string;
    raza?: string;
    imagenMascota?: string;
}

// Función auxiliar a prueba de zonas horarias
const getTodayString = () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().split('T')[0]; 
};

export default function AgendarHoraScreen({ navigation }: any) {
    const { userToken } = useAuth();
    
    // ════════ ESTADOS ════════
    const [pets, setPets] = useState<Mascota[]>([]);
    const [loadingPets, setLoadingPets] = useState(true);
    const [showPetModal, setShowPetModal] = useState(false);
    const [selectedPet, setSelectedPet] = useState<Mascota | null>(null);

    const todayString = getTodayString();
    const [selectedDate, setSelectedDate] = useState(todayString); 

    const [profesionalExpandido, setProfesionalExpandido] = useState<number | null>(null);
    const [horaSeleccionada, setHoraSeleccionada] = useState<string | null>(null);

    // ════════ LÓGICA ════════
    const fetchTutorPets = async () => {
        if (!userToken) return;
        try {
            setLoadingPets(true);
            const response = await api.get('/v1/mascotas/listar'); 
            setPets(response.data);
        } catch (error) {
            console.error("Error al obtener mascotas para agendar:", error);
        } finally {
            setLoadingPets(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchTutorPets();
        }, [userToken])
    );

    const toggleProfesional = (id: number) => {
        setProfesionalExpandido(profesionalExpandido == id ? null : id);
    };

    const profesionalesMock = [
        { id: 1, nombre: 'Dr. Carlos Mendoza', especialidad: 'Veterinario General', horas: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00'] },
        { id: 2, nombre: 'Dra. Ana María Silva', especialidad: 'Cardiología', horas: ['15:00', '15:30', '16:00', '16:30', '17:00'] }
    ];

    // ════════ RENDER ════════
    return (
        <View style={[globalStyles.container, dashboardStyles.lightBackground]}>
            <DashboardHeader />

            <ScrollView 
                contentContainerStyle={globalStyles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* ════ TÍTULO ════ */}
                <View style={dashboardStyles.greetingContainer}>
                    <Text style={[dashboardStyles.greetingText, dashboardStyles.darkText, { textAlign: 'center' }]}>
                        Agendar Hora
                    </Text>
                    <View style={[dashboardStyles.greetingDivider, dashboardStyles.darkDivider]} />
                </View>

                {/* ════ SECCIÓN: PACIENTE ════ */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionLabel}>Paciente:</Text>
                    <TouchableOpacity 
                        style={styles.dropdownSelector} 
                        activeOpacity={0.7}
                        onPress={() => !loadingPets && pets.length > 0 && setShowPetModal(true)}
                        disabled={loadingPets || pets.length === 0}
                    >
                        {loadingPets ? (
                            <ActivityIndicator size="small" color={colors.darkGreen} />
                        ) : pets.length === 0 ? (
                            <Text style={[styles.dropdownText, { color: '#EF4444' }]}>Sin mascotas registradas</Text>
                        ) : (
                            <Text style={[styles.dropdownText, selectedPet && { color: colors.darkDGreen }]}>
                                {selectedPet ? selectedPet.nomMascota : 'Seleccionar mascota...'}
                            </Text>
                        )}
                        <Ionicons name="chevron-down" size={20} color={colors.darkGreen} />
                    </TouchableOpacity>
                </View>

                {/* ════ SECCIÓN: CALENDARIO PERSONALIZADO ════ */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionLabel}>Seleccione día:</Text>
                    
                    <Calendar
                        current={todayString}
                        minDate={todayString}
                        disableAllTouchEventsForDisabledDays={true}
                        onDayPress={(day: any) => {
                            if (day.dateString >= todayString) {
                                setSelectedDate(day.dateString);
                            }
                        }}
                        markedDates={{
                            [selectedDate]: { selected: true, disableTouchEvent: true }
                        }}
                        theme={customCalendarTheme} 
                        style={{
                            borderWidth: 1.5,
                            borderColor: colors.darkDGreen,
                            borderRadius: 8,
                            overflow: 'hidden'
                        }}
                    />
                </View>

                {/* ════ SECCIÓN: PROFESIONALES ════ */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionLabel}>Profesionales disponibles:</Text>

                    {profesionalesMock.map((profesional) => {
                        const isExpanded = profesionalExpandido === profesional.id;
                        return (
                            <View key={profesional.id} style={styles.profesionalCardContainer}>
                                <TouchableOpacity 
                                    style={styles.profesionalHeaderBar}
                                    onPress={() => toggleProfesional(profesional.id)}
                                    activeOpacity={0.9}
                                >
                                    <View style={styles.profesionalLeft}>
                                        <View style={styles.avatarCircle}>
                                            <Ionicons name="medical" size={20} color={colors.darkGreen} />
                                        </View>
                                        <View>
                                            <Text style={styles.profesionalName}>{profesional.nombre}</Text>
                                            <Text style={styles.profesionalSub}>{profesional.especialidad}</Text>
                                        </View>
                                    </View>
                                    <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={24} color={colors.darkDGreen} />
                                </TouchableOpacity>

                                {isExpanded && (
                                    <View style={styles.horasGrid}>
                                        {profesional.horas.map((hora) => {
                                            const isSelected = horaSeleccionada === `${profesional.id}-${hora}`;
                                            return (
                                                <TouchableOpacity
                                                    key={hora}
                                                    style={[styles.horaButton, isSelected && styles.horaButtonSelected]}
                                                    onPress={() => setHoraSeleccionada(isSelected ? null : `${profesional.id}-${hora}`)}
                                                >
                                                    <Text style={[styles.horaButtonText, isSelected && styles.horaButtonTextSelected]}>
                                                        {hora}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* ════ BOTÓN CONTINUAR ════ */}
                <TouchableOpacity 
                    style={[styles.continueButton, (!selectedPet || !horaSeleccionada) && styles.continueButtonDisabled]}
                    disabled={!selectedPet || !horaSeleccionada}
                    onPress={() => navigation.navigate('ResumenCita')} 
                >
                    <Text style={styles.continueButtonText}>Continuar</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* ════ MODAL SELECTOR DE MASCOTAS ════ */}
            <Modal visible={showPetModal} transparent={true} animationType="fade">
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowPetModal(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Selecciona el paciente</Text>
                        
                        <FlatList
                            data={pets}
                            keyExtractor={(item) => item.idMascota.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={styles.petItem}
                                    onPress={() => {
                                        setSelectedPet(item);
                                        setShowPetModal(false);
                                    }}
                                >
                                    {item.imagenMascota ? (
                                        <Image source={{ uri: item.imagenMascota }} style={styles.petAvatar} />
                                    ) : (
                                        <View style={[styles.petAvatar, styles.petAvatarPlaceholder]}>
                                            <Ionicons name="paw" size={20} color={colors.white} />
                                        </View>
                                    )}
                                    <View>
                                        <Text style={styles.petName}>{item.nomMascota}</Text>
                                        <Text style={styles.petBreed}>{item.especie} • {item.raza || 'Sin raza'}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={<Text style={{textAlign:'center', marginTop:20}}>No tienes mascotas registradas</Text>}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

// ════════ ESTILOS LOCALES ════════
const styles = StyleSheet.create({
    sectionContainer: {
        marginBottom: spacing.lg,
        paddingHorizontal: spacing.sm,
    },
    sectionLabel: {
        fontFamily: typography.family.main.semiBold,
        fontSize: typography.size.md,
        color: colors.darkDGreen,
        marginBottom: spacing.xs,
    },
    dropdownSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.white,
        borderWidth: 1.5,
        borderColor: colors.darkDGreen,
        borderRadius: 8,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
    },
    dropdownText: {
        fontFamily: typography.family.main.regular,
        fontSize: typography.size.md,
        color: '#A0A0A0',
    },
    profesionalCardContainer: {
        marginBottom: spacing.sm,
        borderWidth: 1.5,
        borderColor: colors.darkDGreen,
        backgroundColor: colors.white,
        borderRadius: 4,
        overflow: 'hidden',
    },
    profesionalHeaderBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
    },
    profesionalLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    avatarCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.darkGreen,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.lightYellow,
    },
    profesionalName: {
        fontFamily: typography.family.main.bold,
        fontSize: typography.size.md,
        color: colors.darkDGreen,
    },
    profesionalSub: {
        fontFamily: typography.family.main.regular,
        fontSize: typography.size.xs,
        color: colors.darkGreen,
    },
    horasGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
        backgroundColor: '#FCFAF2',
    },
    horaButton: {
        width: '22%', 
        borderWidth: 1.5,
        borderColor: colors.darkDGreen,
        borderRadius: 8,
        paddingVertical: 8,
        alignItems: 'center',
        backgroundColor: colors.white,
    },
    horaButtonSelected: {
        backgroundColor: colors.darkGreen,
        borderColor: colors.darkGreen,
    },
    horaButtonText: {
        fontFamily: typography.family.main.medium,
        fontSize: typography.size.sm,
        color: colors.darkDGreen,
    },
    horaButtonTextSelected: {
        fontFamily: typography.family.main.bold,
        color: colors.lightYellow,
    },
    continueButton: {
        marginTop: spacing.xl,
        marginHorizontal: spacing.sm,
        paddingVertical: spacing.md,
        backgroundColor: colors.darkGreen,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    continueButtonDisabled: {
        opacity: 0.5,
    },
    continueButtonText: {
        fontFamily: typography.family.main.bold,
        fontSize: typography.size.md,
        color: colors.lightYellow,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        maxHeight: '75%',
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: spacing.lg,
    },
    modalTitle: {
        fontFamily: typography.family.main.bold,
        fontSize: typography.size.lg,
        color: colors.darkDGreen,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    petItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderColor: colors.lightGreen,
        gap: spacing.md,
    },
    petAvatar: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
    },
    petAvatarPlaceholder: {
        backgroundColor: colors.darkGreen,
        justifyContent: 'center',
        alignItems: 'center',
    },
    petName: {
        fontFamily: typography.family.main.semiBold,
        fontSize: typography.size.md,
        color: colors.darkDGreen,
    },
    petBreed: {
        fontFamily: typography.family.main.regular,
        fontSize: typography.size.xs,
        color: colors.darkGreen,
    },
});
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '@/src/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '@/src/style/GlobalStyle';
import api from '@/src/api/axiosInstance';

const DetailItem = ({ icon, label, value }: any) => (
    <View style={styles.item}>
        <Ionicons name={icon} size={20} color={colors.lightGreen} />
        <Text style={styles.itemLabel}>{label}</Text>
        <Text style={styles.itemValue}>{value}</Text>
    </View>
);

export default function DetalleMascotaScreen({ route, navigation }: any) {
    const { mascota } = route.params;
    const [ultimaConsulta, setUltimaConsulta] = useState('Sin registro');
    const [loadingConsulta, setLoadingConsulta] = useState(true);

    useEffect(() => {
        const cargarUltimaConsulta = async () => {
            try {
                setLoadingConsulta(true);
                const response = await api.get(`/v1/consultas/mascota/${mascota.idMascota}`);
                const consultas = Array.isArray(response.data) ? response.data : [];

                const parseFecha = (fecha?: string) => {
                    if (!fecha) return 0;
                    const [fechaParte, horaParte = '00:00'] = String(fecha).split(' ');
                    const [dia, mes, anio] = fechaParte.split('/').map(Number);
                    const [hora, minuto] = horaParte.split(':').map(Number);
                    return new Date(anio, (mes || 1) - 1, dia || 1, hora || 0, minuto || 0).getTime();
                };

                const ultima = [...consultas].sort((a, b) => parseFecha(b.fecha) - parseFecha(a.fecha))[0];
                setUltimaConsulta(ultima?.fecha ? String(ultima.fecha).split(' ')[0] : 'Sin registro');
            } catch (error) {
                console.error('Error cargando última consulta de mascota:', error);
                setUltimaConsulta('Sin registro');
            } finally {
                setLoadingConsulta(false);
            }
        };

        cargarUltimaConsulta();
    }, [mascota.idMascota]);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.imageContainer}>
                {mascota.imagenMascota ? (
                    <Image 
                        source={{ uri: mascota.imagenMascota }} 
                        style={styles.fullImage} 
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.placeholder}>
                        <Ionicons name="paw" size={80} color={colors.darkGreen} />
                    </View>
                )}
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.mainTitle}>{mascota.nomMascota}</Text>
                <Text style={styles.subtitle}>{mascota.especie} - {mascota.raza}</Text>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                    <DetailItem 
                        icon={mascota.sexo === 1 ? 'male' : 'female'}
                        label="Sexo" 
                        value={mascota.sexo === 1 ? 'Macho' : 'Hembra'}
                    />
                    <DetailItem 
                        icon="fitness" 
                        label="Peso" 
                        value={`${mascota.peso} Kg`} 
                    />
                </View>

                <View style={styles.detailRow}>
                    <DetailItem 
                        icon="calendar" 
                        label="Nacimiento" 
                        value={mascota.fecNac} 
                    />
                    <DetailItem 
                        icon="medical" // Cambié el icono por uno médico, puedes usar "clipboard" si prefieres
                        label="Ult. Consulta" 
                        value={loadingConsulta ? 'Cargando...' : ultimaConsulta} 
                    />
                </View>

            </View>

            <View style={{ alignItems: 'center', marginVertical: 10 }}>
                <TouchableOpacity 
                    style={[globalStyles.primaryButton, { width: '60%' }]}
                    onPress={() => navigation.navigate('HistorialMedico', { 
                        idMascota: mascota.idMascota, 
                        nombreMascota: mascota.nomMascota })}
                >
                    <Text style={globalStyles.primaryButtonText}>Ver historial</Text>
                </TouchableOpacity>
            </View>


            <View style={{position: 'absolute', top: 10, right: 10}}>
                <TouchableOpacity style={globalStyles.iconButton} onPress={() => navigation.navigate('EditarMascota', { mascota })}>
                    <Ionicons name='pencil' color={colors.lightYellow} size={20}/>
                </TouchableOpacity>
            </View>

            
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: colors.darkDGreen 
    },
    imageContainer: {
        height: 300,
        backgroundColor: colors.lightYellow,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    fullImage: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    infoCard: {
        backgroundColor: colors.white,
        margin: 20,
        borderRadius: 20,
        padding: 20,
        marginTop: -30,
    },
    mainTitle: { 
        fontSize: 32, 
        fontWeight: 'bold', 
        color: colors.darkDGreen, 
        textAlign: 'center' 
    },
    subtitle: { 
        fontSize: 18, 
        color: colors.darkGreen, 
        textAlign: 'center', 
        marginBottom: 20 
    },
    divider: { 
        height: 1, 
        backgroundColor: '#EEE', 
        marginVertical: 10 
    },
    detailRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 20 
    },
    item: { 
        flex: 1, 
        alignItems: 'center' 
    },
    itemLabel: { 
        color: '#888', 
        fontSize: 12, 
        marginTop: 5 
    },
    itemValue: { 
        color: colors.darkDGreen, 
        fontSize: 16, 
        fontWeight: '600' 
    },
});
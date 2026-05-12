import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { colors } from '@/src/theme/colors';
import { Ionicons } from '@expo/vector-icons';

export default function DetalleMascotaScreen({ route }: any) {
    const { mascota } = route.params;

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
                        icon="male-female" 
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
                        icon="help-circle" 
                        label="Tipo Fecha" 
                        value={mascota.fecNacEst === 1 ? 'Estimada' : 'Exacta'} 
                    />
                </View>
            </View>
        </ScrollView>
    );
}

const DetailItem = ({ icon, label, value }: any) => (
    <View style={styles.item}>
        <Ionicons name={icon} size={20} color={colors.lightGreen} />
        <Text style={styles.itemLabel}>{label}</Text>
        <Text style={styles.itemValue}>{value}</Text>
    </View>
);

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
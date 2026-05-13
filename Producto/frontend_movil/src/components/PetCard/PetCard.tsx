import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import { styles } from './PetCard.styles';
import { PetCardProps } from './PetCard.types';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { globalStyles } from '@/src/style/GlobalStyle';
import api from '@/src/api/axiosInstance';

const PetCard: React.FC<PetCardProps> = ({ id, nombreMasc, fotoUrl, sexo, especie, onPress }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Convertimos el número a texto
  const sexoTexto = sexo === 1 ? 'Macho' : 'Hembra';

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/v1/mascotas/eliminar/${id}`);
      setModalVisible(false);
      Alert.alert("Éxito", `${nombreMasc} ha sido borrada correctamente.`);
    } catch (error) {
      console.error("Error al borrar la mascota:", error);
      Alert.alert("Error", "No se pudo borrar la mascota.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.imageContainer}>
            {fotoUrl ? (
            <Image 
            source={{ uri: fotoUrl }} 
            style={styles.image} 
            resizeMode="cover" 
            />
            ) : (
            <View style={styles.placeholder}>
                <Text style={{ color: '#9CA3AF' }}>Sin foto</Text>
            </View>
            )}
        </View>

        <TouchableOpacity
            onPress={() => setModalVisible(true)} 
            style={{ 
                position: 'absolute', 
                top: 5, 
                right: 5, 
                zIndex: 10, 
                backgroundColor: colors.darkDGreen,
                opacity: 0.8,
                padding: 6, 
                borderRadius: 20 
            }}
        >
            <Ionicons name='close' color={colors.lightGreen} size={15} />
        </TouchableOpacity>

        <Text style={styles.name} numberOfLines={1}>{nombreMasc || 'Sin nombre'}</Text>
        <Text style={styles.gender}>{especie ? `${especie} • ` : ''}{sexoTexto}</Text>

        {/* Modal de confirmación para Borrar Mascotas */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: '80%', backgroundColor: colors.white, borderRadius: 12, padding: 20, alignItems: 'center' }}>
              <Text style={[globalStyles.darkLabel, { textAlign: 'center', fontSize: 18, marginBottom: 15 }]}>
                ¿Seguro que quieres borrar a {nombreMasc}?
              </Text>
              
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <TouchableOpacity 
                  style={[globalStyles.secondaryButton, { flex: 1, paddingVertical: 10 }]} 
                  onPress={() => setModalVisible(false)}
                  disabled={isDeleting}
                >
                  <Text style={globalStyles.secondaryButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[globalStyles.primaryButton, { flex: 1, backgroundColor: '#EF4444', paddingVertical: 10 }]} 
                  onPress={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={[globalStyles.primaryButtonText, { color: colors.white }]}>Confirmar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

    </TouchableOpacity>
  );
};

export default PetCard;
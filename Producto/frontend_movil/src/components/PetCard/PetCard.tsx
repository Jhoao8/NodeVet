import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { styles } from './PetCard.styles';
import { PetCardProps } from './PetCard.types';

const PetCard: React.FC<PetCardProps> = ({ id, nombreMasc, fotoUrl, sexo, especie, onPress }) => {
  // Convertimos el número a texto
  const sexoTexto = sexo === 1 ? 'Macho' : 'Hembra';

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
      
      <Text style={styles.name} numberOfLines={1}>{nombreMasc || 'Sin nombre'}</Text>
      <Text style={styles.gender}>{especie ? `${especie} • ` : ''}{sexoTexto}</Text>
    </TouchableOpacity>
  );
};

export default PetCard;
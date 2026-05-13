import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './PetSummaryCard.styles';
import { PetSummaryCardProps } from './PetSummaryCard.types';
import { colors } from '../../theme/colors';

const PetSummaryCard: React.FC<PetSummaryCardProps> = ({ 
    id, 
    nombreMasc, 
    fotoUrl, 
    sexo, 
    ultChequeo, 
    onPress, 
    isLast 
}) => {
    const sexoIcon = sexo === 1 ? 'male' : 'female';
    const sexoColor = sexo === 1 ? '#4C8EEA' : '#E85B81';

    return (
        <TouchableOpacity 
            style={[styles.container, !isLast && styles.separator]} 
            onPress={onPress} 
            activeOpacity={0.8}
        >
            <View style={styles.leftSection}>
                {fotoUrl ? (
                    <Image source={{ uri: fotoUrl }} style={styles.avatar} resizeMode="cover" />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Ionicons name="paw" size={20} color={colors.white} />
                    </View>
                )}
                <Text style={styles.nameText} numberOfLines={1}>{nombreMasc}</Text>
                <Ionicons name={sexoIcon} size={16} color={sexoColor} style={{ marginLeft: 6 }} />
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.rightSection}>
                <Text style={styles.dateText}>{ultChequeo || 'Sin registro'}</Text>
            </View>
        </TouchableOpacity>
    );
};

export default PetSummaryCard;